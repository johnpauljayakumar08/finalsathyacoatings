const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const db = require('../config/db');

const uploadDirectory = path.join(__dirname, '..', 'uploads', 'purchase-orders');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const hasPdfExtension = path.extname(file.originalname).toLowerCase() === '.pdf';
    const acceptedMimeTypes = ['application/pdf', 'application/octet-stream', ''];
    if (!acceptedMimeTypes.includes(file.mimetype) || !hasPdfExtension) {
      return callback(new Error('Only PDF purchase orders are accepted'));
    }
    callback(null, true);
  }
});

const normalizeDate = (value) => {
  if (!value) return null;
  const dateValue = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateValue) ? dateValue : null;
};

const toNonNegativeNumber = (value, fieldName) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) {
    throw new Error(`${fieldName} must be a non-negative number`);
  }
  return number;
};

const cleanItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one purchase order line item is required');
  }
  return items.map((item, index) => {
    const description = typeof item.description === 'string' ? item.description.trim() : '';
    if (!description) throw new Error(`Description is required for line ${index + 1}`);
    const rate = toNonNegativeNumber(item.rate, `Rate on line ${index + 1}`);
    const quantity = toNonNegativeNumber(item.quantity, `Quantity on line ${index + 1}`);
    const lineTotal = Number((rate * quantity).toFixed(2));
    return {
      description,
      rate,
      uom: typeof item.uom === 'string' ? item.uom.trim() || null : null,
      quantity,
      line_total: lineTotal
    };
  });
};

const parsePdfNumber = (value) => Number(String(value || '').replace(/,/g, ''));

const parsePdfDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const extractPurchaseOrder = (text) => {
  const normalizedText = text.replace(/\u00a0/g, ' ').replace(/\r/g, '');
  const lines = normalizedText.split('\n').map((line) => line.trim()).filter(Boolean);
  const vendorLabelIndex = lines.findIndex((line) => /vendor\s+details\s*:/i.test(line));
  let supplierName = null;
  if (vendorLabelIndex >= 0) {
    const vendorLines = [];
    for (const line of lines.slice(vendorLabelIndex + 1)) {
      if (/^GSTIN\s*:/i.test(line) || /^vendor\s+billing/i.test(line)) break;
      if (
        line.length > 1 &&
        !/^\d+$/.test(line) &&
        !/^(?:mobile|email|website|pan|cin|lut|purchase order|place of supply)\b/i.test(line)
      ) {
        vendorLines.push(line);
      }
    }
    supplierName = vendorLines[vendorLines.length - 1] || null;
  }

  const poNumberMatch = normalizedText.match(/Purchase\s+Order\s*#\s*:?\s*(?:\n\s*)?([A-Z0-9][A-Z0-9/-]*)/i);
  const poDateMatch = normalizedText.match(/Purchase\s+Order\s+Date\s*:\s*(?:\n\s*)?([^\n]+)/i);
  const items = [];
  const itemPattern = /^\s*\d+\s*(.+?)\s*(\d{8})\s*((?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2})\s*((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d+)?)\s*([A-Z]{1,10})\s*((?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2})\s*((?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2})\s*(?:\(\s*\d+(?:\.\d+)?%\s*\))?\s*((?:\d{1,3}(?:,\d{3})*|\d+)\.\d{2})\s*$/i;
  for (const line of lines) {
    const match = line.match(itemPattern);
    if (!match) continue;
    items.push({
      description: match[1].trim(),
      rate: parsePdfNumber(match[3]),
      quantity: parsePdfNumber(match[4]),
      uom: match[5].trim(),
      lineTax: parsePdfNumber(match[7])
    });
  }

  const gstAmounts = [];
  for (const line of lines) {
    const match = line.match(/^(?:IGST|CGST|SGST)\s*(?:[\d.]+\s*%)?\s*₹?\s*([\d,]+\.\d{2})/i);
    if (match) gstAmounts.push(parsePdfNumber(match[1]));
  }
  const totalMatch = normalizedText.match(/\bTotal\s*[\n ]+\s*₹?\s*((?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?)/i);
  const extractedGst = gstAmounts.length
    ? gstAmounts.reduce((sum, value) => sum + value, 0)
    : items.reduce((sum, item) => sum + item.lineTax, 0);

  return {
    supplier_name: supplierName,
    po_number: poNumberMatch?.[1] || null,
    transaction_date: poDateMatch ? parsePdfDate(poDateMatch[1]) : null,
    items: items.map(({ lineTax, ...item }) => item),
    gst: Number(extractedGst.toFixed(2)),
    grand_total: totalMatch ? parsePdfNumber(totalMatch[1]) : null
  };
};

exports.parsePurchaseOrderText = extractPurchaseOrder;

exports.extractPurchaseOrderPdf = (req, res) => {
  upload.single('pdf')(req, res, async (uploadError) => {
    if (uploadError) {
      const tooLarge = uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        status: 'error',
        message: tooLarge ? 'Purchase order PDF must be 10 MB or smaller' : uploadError.message
      });
    }
    if (!req.file || req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
      return res.status(400).json({ status: 'error', message: 'A valid PDF purchase order is required' });
    }
    try {
      const parsedDocument = await pdfParse(req.file.buffer);
      if (!parsedDocument.text.trim()) {
        return res.status(422).json({
          status: 'error',
          message: 'No selectable text was found in this PDF. Enter the PO values manually or upload a searchable PDF.'
        });
      }
      const extracted = extractPurchaseOrder(parsedDocument.text);
      const missingFields = [];
      if (!extracted.supplier_name) missingFields.push('Supplier');
      if (!extracted.po_number) missingFields.push('PO Number');
      if (!extracted.transaction_date) missingFields.push('PO Date');
      if (!extracted.items.length) missingFields.push('line items');
      if (extracted.grand_total === null) missingFields.push('Grand Total');
      return res.status(200).json({
        status: 'success',
        message: missingFields.length
          ? `Some values could not be read (${missingFields.join(', ')}); review and complete the form.`
          : 'Purchase order values extracted. Review them before saving.',
        data: {
          ...extracted,
          extraction_complete: missingFields.length === 0,
          missing_fields: missingFields
        }
      });
    } catch (error) {
      console.error('Error extracting purchase order PDF:', error);
      return res.status(422).json({
        status: 'error',
        message: 'Could not read the purchase order PDF. Enter the PO values manually or upload a searchable PDF.'
      });
    }
  });
};

const getSnapshot = async (connection, id) => {
  const [records] = await connection.query(
    'SELECT * FROM finance_purchase_register WHERE id = ?',
    [id]
  );
  if (!records.length) return null;
  const [items] = await connection.query(
    'SELECT id, description, rate, uom, quantity, line_total FROM finance_purchase_register_items WHERE purchase_register_id = ? ORDER BY id',
    [id]
  );
  return { ...records[0], items };
};

const recordHistory = async (connection, id, action, changedBy) => {
  const snapshot = await getSnapshot(connection, id);
  if (!snapshot) return;
  await connection.query(
    'INSERT INTO finance_purchase_register_workflow_history (purchase_register_id, action, snapshot_json, changed_by) VALUES (?, ?, ?, ?)',
    [id, action, JSON.stringify(snapshot), changedBy || null]
  );
};

const replaceItems = async (connection, id, items) => {
  await connection.query(
    'DELETE FROM finance_purchase_register_items WHERE purchase_register_id = ?',
    [id]
  );
  for (const item of items) {
    await connection.query(
      `INSERT INTO finance_purchase_register_items
        (purchase_register_id, description, rate, uom, quantity, line_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, item.description, item.rate, item.uom, item.quantity, item.line_total]
    );
  }
};

exports.listPurchaseRegisters = async (req, res) => {
  try {
    const { finance_year_id: yearId, purchase_type: requestedType = 'G' } = req.query;
    const purchaseType = requestedType === 'WG' ? 'WG' : 'G';
    const conditions = [];
    const params = [purchaseType];
    conditions.push('pr.purchase_type = ?');
    if (yearId) {
      conditions.push('pr.finance_year_id = ?');
      params.push(yearId);
    }

    const [records] = await db.query(
      `SELECT pr.*, CONCAT(fy.start_year, ' - ', fy.end_year) AS financial_year
       FROM finance_purchase_register pr
       LEFT JOIN finance_financial_year fy ON fy.id = pr.finance_year_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY pr.transaction_date DESC, pr.created_at DESC`,
      params
    );

    if (records.length) {
      const ids = records.map((record) => record.id);
      const placeholders = ids.map(() => '?').join(',');
      const [items] = await db.query(
        `SELECT id, purchase_register_id, description, rate, uom, quantity, line_total
         FROM finance_purchase_register_items
         WHERE purchase_register_id IN (${placeholders})
         ORDER BY id`,
        ids
      );
      const itemsByRecord = new Map();
      for (const item of items) {
        const recordItems = itemsByRecord.get(item.purchase_register_id) || [];
        recordItems.push(item);
        itemsByRecord.set(item.purchase_register_id, recordItems);
      }
      for (const record of records) record.items = itemsByRecord.get(record.id) || [];
    }

    const summary = records.reduce((result, record) => {
      const total = Number(record.grand_total ?? record.total_value ?? 0);
      result.grand_total += total;
      result.gst += Number(record.gst || 0);
      result.records += 1;
      if (record.master_approval === 'pending') result.pending_approval += 1;
      if (record.material_status !== 'received') result.material_not_received += 1;
      if (record.payment_status !== 'paid') result.unpaid += total;
      return result;
    }, { grand_total: 0, gst: 0, records: 0, pending_approval: 0, material_not_received: 0, unpaid: 0 });

    res.status(200).json({ status: 'success', data: { summary, records } });
  } catch (error) {
    console.error('Error listing purchase registers:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve purchase registers' });
  }
};

exports.getPurchaseRegister = async (req, res) => {
  try {
    const [records] = await db.query(
      `SELECT pr.*, CONCAT(fy.start_year, ' - ', fy.end_year) AS financial_year
       FROM finance_purchase_register pr
       LEFT JOIN finance_financial_year fy ON fy.id = pr.finance_year_id
       WHERE pr.id = ?`,
      [req.params.id]
    );
    if (!records.length) {
      return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
    }
    const [items] = await db.query(
      'SELECT id, description, rate, uom, quantity, line_total FROM finance_purchase_register_items WHERE purchase_register_id = ? ORDER BY id',
      [req.params.id]
    );
    res.status(200).json({ status: 'success', data: { ...records[0], items } });
  } catch (error) {
    console.error('Error retrieving purchase register record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve purchase register record' });
  }
};

exports.createPurchaseRegister = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const {
      finance_year_id,
      transaction_date,
      supplier_name,
      po_number,
      gst,
      grand_total,
      items,
      created_by
    } = req.body;
    const date = normalizeDate(transaction_date);
    const supplier = typeof supplier_name === 'string' ? supplier_name.trim() : '';
    const poNumber = typeof po_number === 'string' ? po_number.trim() : '';
    if (!finance_year_id || !date || !supplier || !poNumber || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'Financial year, PO date, supplier, PO number and creator are required'
      });
    }
    const purchaseType = 'G';
    const lineItems = cleanItems(items);
    const gstValue = toNonNegativeNumber(gst || 0, 'GST');
    const grandTotal = toNonNegativeNumber(grand_total, 'Grand total');
    const firstItem = lineItems[0];

    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO finance_purchase_register
        (finance_year_id, purchase_type, transaction_date, supplier_name, po_number,
         invoice_description, rate, uom, quantity, gst, total_value, grand_total,
         master_approval, material_status, payment_status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'not_received', 'pending', ?)`,
      [
        finance_year_id,
        purchaseType,
        date,
        supplier,
        poNumber,
        lineItems.map((item) => item.description).join('; '),
        firstItem.rate,
        firstItem.uom,
        lineItems.reduce((total, item) => total + item.quantity, 0),
        gstValue,
        grandTotal,
        grandTotal,
        created_by
      ]
    );
    await replaceItems(connection, result.insertId, lineItems);
    await recordHistory(connection, result.insertId, 'created', created_by);
    await connection.commit();
    res.status(201).json({
      status: 'success',
      message: 'Purchase order registered and submitted for approval',
      data: { id: result.insertId }
    });
  } catch (error) {
    await connection.rollback();
    if (error.message?.includes('required') || error.message?.includes('non-negative') || error.message?.includes('line ')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    console.error('Error creating purchase register record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create purchase register record' });
  } finally {
    connection.release();
  }
};

exports.updatePurchaseRegister = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;
    const {
      finance_year_id,
      transaction_date,
      supplier_name,
      po_number,
      gst,
      grand_total,
      items,
      updated_by
    } = req.body;
    const date = normalizeDate(transaction_date);
    const supplier = typeof supplier_name === 'string' ? supplier_name.trim() : '';
    const poNumber = typeof po_number === 'string' ? po_number.trim() : '';
    if (!finance_year_id || !date || !supplier || !poNumber || !updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'Financial year, PO date, supplier, PO number and updater are required'
      });
    }
    const purchaseType = 'G';
    const lineItems = cleanItems(items);
    const gstValue = toNonNegativeNumber(gst || 0, 'GST');
    const grandTotal = toNonNegativeNumber(grand_total, 'Grand total');
    const firstItem = lineItems[0];

    await connection.beginTransaction();
    const [records] = await connection.query(
      'SELECT master_approval, material_status, purchase_type FROM finance_purchase_register WHERE id = ? FOR UPDATE',
      [id]
    );
    if (!records.length) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
    }
    if (records[0].purchase_type !== 'G') {
      await connection.rollback();
      return res.status(403).json({ status: 'error', message: 'Use the Purchase Register - WG workflow to edit this record' });
    }
    if (records[0].master_approval === 'yes' || records[0].material_status === 'received') {
      await connection.rollback();
      return res.status(409).json({
        status: 'error',
        message: 'Purchase order details cannot be edited after approval or material receipt'
      });
    }
    await recordHistory(connection, id, 'purchase_order_updated', updated_by);
    await connection.query(
      `UPDATE finance_purchase_register
       SET finance_year_id = ?, purchase_type = ?, transaction_date = ?, supplier_name = ?,
           po_number = ?, po_work_order_no = ?, invoice_description = ?, rate = ?, uom = ?,
           quantity = ?, gst = ?, total_value = ?, grand_total = ?,
           master_approval = 'pending', master_approval_at = NULL, updated_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        finance_year_id,
        purchaseType,
        date,
        supplier,
        poNumber,
        poNumber,
        lineItems.map((item) => item.description).join('; '),
        firstItem.rate,
        firstItem.uom,
        lineItems.reduce((total, item) => total + item.quantity, 0),
        gstValue,
        grandTotal,
        grandTotal,
        updated_by,
        id
      ]
    );
    await replaceItems(connection, id, lineItems);
    await connection.commit();
    res.status(200).json({ status: 'success', message: 'Purchase order updated' });
  } catch (error) {
    await connection.rollback();
    if (error.message?.includes('required') || error.message?.includes('non-negative') || error.message?.includes('line ')) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    console.error('Error updating purchase register record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update purchase register record' });
  } finally {
    connection.release();
  }
};

exports.setPurchaseApproval = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { approval, updated_by } = req.body;
    if (!['yes', 'no'].includes(approval) || !updated_by) {
      return res.status(400).json({ status: 'error', message: 'Approval yes/no and approver are required' });
    }
    await connection.beginTransaction();
    const [records] = await connection.query(
      'SELECT master_approval, po_pdf_path, purchase_type FROM finance_purchase_register WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (!records.length) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
    }
    if (records[0].purchase_type !== 'G') {
      await connection.rollback();
      return res.status(403).json({ status: 'error', message: 'Use the Purchase Register - WG approval workflow for this record' });
    }
    if (records[0].master_approval !== 'pending') {
      await connection.rollback();
      return res.status(409).json({ status: 'error', message: 'This purchase order has already been decided' });
    }
    if (!records[0].po_pdf_path) {
      await connection.rollback();
      return res.status(409).json({ status: 'error', message: 'Upload the Purchase Order PDF before sending it for approval' });
    }
    await recordHistory(connection, req.params.id, `approval_${approval}`, updated_by);
    await connection.query(
      `UPDATE finance_purchase_register
       SET master_approval = ?, master_approval_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE id = ?`,
      [approval, updated_by, req.params.id]
    );
    await connection.commit();
    res.status(200).json({ status: 'success', message: `Purchase order ${approval === 'yes' ? 'approved' : 'rejected'}` });
  } catch (error) {
    await connection.rollback();
    console.error('Error setting purchase approval:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save approval' });
  } finally {
    connection.release();
  }
};

exports.setMaterialReceipt = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { material_status, invoice_no, invoice_date, credit_period_days, updated_by } = req.body;
    if (!['received', 'not_received'].includes(material_status) || !updated_by) {
      return res.status(400).json({ status: 'error', message: 'Material status and updater are required' });
    }
    const normalizedInvoiceDate = normalizeDate(invoice_date);
    const invoiceNumber = typeof invoice_no === 'string' ? invoice_no.trim() : '';
    const creditDays = Number(credit_period_days);
    if (material_status === 'received' &&
        (!invoiceNumber || !normalizedInvoiceDate || !Number.isInteger(creditDays) || creditDays < 0)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invoice number, valid invoice date and non-negative credit period days are required when material is received'
      });
    }

    await connection.beginTransaction();
    const [records] = await connection.query(
      'SELECT master_approval, purchase_type FROM finance_purchase_register WHERE id = ? FOR UPDATE',
      [req.params.id]
    );
    if (!records.length) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
    }
    if (records[0].purchase_type !== 'G') {
      await connection.rollback();
      return res.status(403).json({ status: 'error', message: 'Use the Purchase Register - WG material workflow for this record' });
    }
    if (records[0].master_approval !== 'yes') {
      await connection.rollback();
      return res.status(409).json({ status: 'error', message: 'The purchase order must be approved before material receipt can be recorded' });
    }
    await recordHistory(connection, req.params.id, `material_${material_status}`, updated_by);
    if (material_status === 'received') {
      await connection.query(
        `UPDATE finance_purchase_register
         SET material_status = 'received', material_receipt_at = COALESCE(material_receipt_at, CURRENT_TIMESTAMP),
             invoice_no = ?, invoice_date = ?, credit_period_days = ?,
             payment_due_date = DATE_ADD(?, INTERVAL ? DAY), updated_by = ?
         WHERE id = ?`,
        [invoiceNumber, normalizedInvoiceDate, creditDays, normalizedInvoiceDate, creditDays, updated_by, req.params.id]
      );
    } else {
      await connection.query(
        `UPDATE finance_purchase_register
         SET material_status = 'not_received', material_receipt_at = NULL,
             invoice_no = NULL, invoice_date = NULL, credit_period_days = NULL,
             payment_due_date = NULL, updated_by = ?
         WHERE id = ?`,
        [updated_by, req.params.id]
      );
    }
    await connection.commit();
    res.status(200).json({ status: 'success', message: 'Material receipt details updated' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating material receipt:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update material receipt details' });
  } finally {
    connection.release();
  }
};

exports.syncPurchasePayments = async (req, res) => {
  try {
    const { finance_year_id: yearId } = req.query;
    if (!yearId) {
      return res.status(400).json({ status: 'error', message: 'finance_year_id is required' });
    }
    const [rows] = await db.query(
      `SELECT pr.id, pr.supplier_name, pr.invoice_no,
              COALESCE(NULLIF(pr.grand_total, 0), pr.total_value, 0) AS grand_total,
              COALESCE(SUM(CASE WHEN bs.transaction_type = 'debit' THEN bs.amount ELSE 0 END), 0) AS paid_amount,
              MAX(CASE WHEN bs.transaction_type = 'debit' THEN bs.transaction_date END) AS payment_date,
              GROUP_CONCAT(DISTINCT CASE WHEN bs.transaction_type = 'debit' THEN bs.utr_details END
                           ORDER BY bs.transaction_date SEPARATOR ', ') AS utr_details
       FROM finance_purchase_register pr
       LEFT JOIN finance_bank_statement_consolidation bs
         ON bs.finance_year_id = pr.finance_year_id
        AND LOWER(TRIM(bs.invoice_no)) COLLATE utf8mb4_general_ci =
            LOWER(TRIM(pr.invoice_no)) COLLATE utf8mb4_general_ci
        AND bs.payment_category IN ('purchase', 'purchase_advance')
        AND bs.is_active = 1
       WHERE pr.finance_year_id = ?
         AND pr.purchase_type = 'G'
         AND pr.invoice_no IS NOT NULL
         AND TRIM(pr.invoice_no) <> ''
       GROUP BY pr.id, pr.supplier_name, pr.invoice_no, pr.grand_total, pr.total_value`,
      [yearId]
    );

    let synced = 0;
    for (const row of rows) {
      const paidAmount = Number(row.paid_amount || 0);
      const grandTotal = Number(row.grand_total || 0);
      const paymentStatus = paidAmount <= 0
        ? 'pending'
        : paidAmount >= grandTotal
          ? 'paid'
          : 'partial';
      await db.query(
        `UPDATE finance_purchase_register
         SET date_of_payment = ?, payment_status = ?, utr_details = ?
         WHERE id = ?`,
        [row.payment_date, paymentStatus, row.utr_details, row.id]
      );
      if (paidAmount > 0) synced += 1;
    }
    res.status(200).json({
      status: 'success',
      message: 'Purchase payment details synchronized from bank statements',
      data: { updated: rows.length, with_payment: synced }
    });
  } catch (error) {
    console.error('Error synchronizing purchase payments:', error);
    res.status(500).json({ status: 'error', message: 'Failed to synchronize purchase payments' });
  }
};

exports.uploadPurchaseOrderPdf = (req, res) => {
  upload.single('pdf')(req, res, async (uploadError) => {
    if (uploadError) {
      const tooLarge = uploadError instanceof multer.MulterError && uploadError.code === 'LIMIT_FILE_SIZE';
      return res.status(tooLarge ? 413 : 400).json({
        status: 'error',
        message: tooLarge ? 'Purchase order PDF must be 10 MB or smaller' : uploadError.message
      });
    }
    let filePath;
    try {
      if (!req.file || req.file.buffer.subarray(0, 5).toString() !== '%PDF-') {
        return res.status(400).json({ status: 'error', message: 'A valid PDF purchase order is required' });
      }
      const [records] = await db.query(
        'SELECT id, po_pdf_path, master_approval FROM finance_purchase_register WHERE id = ?',
        [req.params.id]
      );
      if (!records.length) {
        return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
      }
      if (records[0].master_approval === 'yes') {
        return res.status(409).json({ status: 'error', message: 'Purchase order PDFs cannot be changed after approval' });
      }
      await fs.promises.mkdir(uploadDirectory, { recursive: true });
      const safeName = `${randomUUID()}.pdf`;
      filePath = path.join(uploadDirectory, safeName);
      await fs.promises.writeFile(filePath, req.file.buffer, { flag: 'wx' });
      await db.query(
        'UPDATE finance_purchase_register SET po_pdf_path = ?, po_pdf_name = ? WHERE id = ?',
        [safeName, path.basename(req.file.originalname).slice(0, 255), req.params.id]
      );
      if (records[0].po_pdf_path && records[0].po_pdf_path !== safeName) {
        const oldPath = path.join(uploadDirectory, path.basename(records[0].po_pdf_path));
        await fs.promises.rm(oldPath, { force: true });
      }
      res.status(200).json({ status: 'success', message: 'Purchase order PDF uploaded' });
    } catch (error) {
      if (filePath) await fs.promises.rm(filePath, { force: true });
      console.error('Error uploading purchase order PDF:', error);
      res.status(500).json({ status: 'error', message: 'Failed to upload purchase order PDF' });
    }
  });
};

exports.downloadPurchaseOrderPdf = async (req, res) => {
  try {
    const [records] = await db.query(
      'SELECT po_pdf_path, po_pdf_name FROM finance_purchase_register WHERE id = ?',
      [req.params.id]
    );
    if (!records.length || !records[0].po_pdf_path) {
      return res.status(404).json({ status: 'error', message: 'Purchase order PDF not found' });
    }
    const safeName = path.basename(records[0].po_pdf_path);
    const filePath = path.join(uploadDirectory, safeName);
    await fs.promises.access(filePath, fs.constants.R_OK);
    res.download(filePath, records[0].po_pdf_name || safeName);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ status: 'error', message: 'Purchase order PDF file is missing from storage' });
    }
    console.error('Error downloading purchase order PDF:', error);
    res.status(500).json({ status: 'error', message: 'Failed to download purchase order PDF' });
  }
};

exports.deletePurchaseRegister = async (req, res) => {
  try {
    const [records] = await db.query(
      'SELECT po_pdf_path FROM finance_purchase_register WHERE id = ?',
      [req.params.id]
    );
    if (!records.length) {
      return res.status(404).json({ status: 'error', message: 'Purchase register record not found' });
    }
    await db.query('DELETE FROM finance_purchase_register WHERE id = ?', [req.params.id]);
    if (records[0].po_pdf_path) {
      const filePath = path.join(uploadDirectory, path.basename(records[0].po_pdf_path));
      await fs.promises.rm(filePath, { force: true });
    }
    res.status(200).json({ status: 'success', message: 'Purchase register record deleted' });
  } catch (error) {
    console.error('Error deleting purchase register record:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete purchase register record' });
  }
};
