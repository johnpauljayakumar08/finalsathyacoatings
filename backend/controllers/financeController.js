const db = require('../config/db');

exports.test = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Finance Test API is working',
      data: null
    });
  } catch (error) {
    console.error('Error in test:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create a new creditor client
exports.createCreditorsClient = async (req, res) => {
  try {
    const { client_name, created_by } = req.body;
    if (!client_name) {
      return res.status(400).json({
        status: 'error',
        message: 'client_name is required'
      });
    }

    const effectiveCreatedBy = created_by || null;

    const sql = 'INSERT INTO finance_creditors_client (client_name, created_by) VALUES (?, ?)';
    const [result] = await db.query(sql, [client_name, effectiveCreatedBy]);

    res.status(201).json({
      status: 'success',
      message: 'Creditor client created successfully',
      data: { id: result.insertId, client_name }
    });
  } catch (error) {
    console.error('Error in createCreditorsClient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all existing invoice numbers
exports.getExistingInvoiceNumbers = async (req, res) => {
  try {
    const sql = 'SELECT DISTINCT inv_number FROM finance_creditors WHERE inv_number IS NOT NULL AND inv_number != "" ORDER BY inv_number';
    const [rows] = await db.query(sql);

    const invoiceNumbers = rows.map(row => row.inv_number);

    res.status(200).json({
      status: 'success',
      data: invoiceNumbers
    });
  } catch (error) {
    console.error('Error fetching invoice numbers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch invoice numbers'
    });
  }
};

// View all creditor clients
exports.viewCreditorsClient = async (req, res) => {
  try {
    const sql = 'SELECT id, client_name, created_at, created_by, updated_at, updated_by FROM finance_creditors_client ORDER BY created_at DESC';
    const [rows] = await db.query(sql);

    res.status(200).json({
      status: 'success',
      message: 'Creditor clients retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in viewCreditorsClient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a creditor client
exports.updateCreditorsClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { client_name, updated_by } = req.body;
    if (!client_name || !updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'client_name and updated_by are required'
      });
    }

    const updateSql = 'UPDATE finance_creditors_client SET client_name = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    const [result] = await db.query(updateSql, [client_name, updated_by, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Creditor client not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Creditor client updated successfully',
      data: { id, client_name }
    });
  } catch (error) {
    console.error('Error in updateCreditorsClient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a creditor client
exports.deleteCreditorsClient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM finance_creditors_client WHERE id = ?';
    const [result] = await db.query(deleteSql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Creditor client not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Creditor client deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error in deleteCreditorsClient:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.createCreditors = async (req, res) => {
  try {
    const {
      client_id,
      finance_bank_id,        // ← NEW
      po_date,
      po_sent_through,
      inv_number,
      bill_date,
      pdc_date,
      item_code,
      qty,
      rate,
      sale_amount,
      gst_amount,
      total_payment_due,
      amount_paid,
      balance_amount,
      date_of_payment,
      due_date,
      remarks,
      is_gst,
      created_by
    } = req.body;

    if (!client_id || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'client_id and created_by are required'
      });
    }

    const formattedPoDate = formatDate(po_date);
    const formattedBillDate = formatDate(bill_date);
    const formattedPdcDate = formatDate(pdc_date);
    const formattedDateOfPayment = formatDate(date_of_payment);
    const formattedDueDate = formatDate(due_date);

    const sql = `
      INSERT INTO finance_creditors (
        client_id, finance_bank_id, po_date, po_sent_through, inv_number, bill_date, pdc_date,
        item_code, qty, rate, sale_amount, gst_amount, total_payment_due,
        amount_paid, balance_amount, date_of_payment, due_date, remarks,
        is_gst, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      client_id,
      finance_bank_id || null,                    // ← NEW: allow null
      formattedPoDate,
      po_sent_through || null,
      inv_number || null,
      formattedBillDate,
      formattedPdcDate,
      item_code || null,
      qty || null,
      rate || null,
      sale_amount || null,
      gst_amount || null,
      total_payment_due || null,
      amount_paid || null,
      balance_amount || null,
      formattedDateOfPayment,
      formattedDueDate,
      remarks || null,
      is_gst ?? null,
      created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Creditor created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createCreditors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};
// Get creditor by ID
exports.getCreditorById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = `
      SELECT 
        fc.*,
        fcc.client_name
      FROM finance_creditors fc
      LEFT JOIN finance_creditors_client fcc ON fc.client_id = fcc.id
      WHERE fc.id = ?
    `;
    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Creditor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Creditor retrieved successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error in getCreditorById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// View creditors with optional filters
exports.viewCreditors = async (req, res) => {
  try {
    let sql = `
      SELECT 
        fc.*,
        fcc.client_name
      FROM finance_creditors fc
      LEFT JOIN finance_creditors_client fcc ON fc.client_id = fcc.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.client_id) {
      sql += ' AND fc.client_id = ?';
      params.push(req.query.client_id);
    }

    if (req.query.is_gst !== undefined) {
      sql += ' AND fc.is_gst = ?';
      params.push(req.query.is_gst);
    }

    sql += ' ORDER BY fc.created_at DESC';
    const [rows] = await db.query(sql, params);

    res.status(200).json({
      status: 'success',
      message: 'Creditors retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in viewCreditors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


// Helper function to format date strings to YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return null;
  if (typeof dateStr === 'string' && dateStr.includes('T')) {
    return dateStr.split('T')[0];
  }
  return dateStr;
};

exports.updateCreditors = async (req, res) => {
  try {
    const {
      id,
      finance_bank_id,        // ← NEW: allow update
      po_date,
      po_sent_through,
      inv_number,
      bill_date,
      pdc_date,
      item_code,
      qty,
      rate,
      sale_amount,
      gst_amount,
      total_payment_due,
      amount_paid,
      balance_amount,
      date_of_payment,
      due_date,
      remarks,
      is_gst,
      updated_by
    } = req.body;

    if (!id || !updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'id and updated_by are required'
      });
    }

    // Fetch current record
    const [currentRows] = await db.query('SELECT * FROM finance_creditors WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Creditor not found' });
    }
    const current = currentRows[0];

    // Save to history (including finance_bank_id)
    const historySql = `
      INSERT INTO finance_creditors_edit_history (
        finance_creditors_id, client_id, finance_bank_id, po_date, po_sent_through,
        inv_number, bill_date, pdc_date, item_code, qty, rate, sale_amount,
        gst_amount, total_payment_due, amount_paid, balance_amount, date_of_payment,
        due_date, remarks, is_gst, created_at, created_by, updated_at, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(historySql, [
      id, current.client_id, current.finance_bank_id, current.po_date, current.po_sent_through,
      current.inv_number, current.bill_date, current.pdc_date, current.item_code,
      current.qty, current.rate, current.sale_amount, current.gst_amount,
      current.total_payment_due, current.amount_paid, current.balance_amount,
      current.date_of_payment, current.due_date, current.remarks, current.is_gst,
      current.created_at, current.created_by, current.updated_at, current.updated_by
    ]);

    // Format dates
    const formattedPoDate = formatDate(po_date);
    const formattedBillDate = formatDate(bill_date);
    const formattedPdcDate = formatDate(pdc_date);
    const formattedDateOfPayment = formatDate(date_of_payment);
    const formattedDueDate = formatDate(due_date);

    // Update main record
    const updateSql = `
      UPDATE finance_creditors SET
        finance_bank_id = ?,
        po_date = ?, po_sent_through = ?, inv_number = ?,
        bill_date = ?, pdc_date = ?, item_code = ?, qty = ?, rate = ?,
        sale_amount = ?, gst_amount = ?, total_payment_due = ?,
        amount_paid = ?, balance_amount = ?, date_of_payment = ?,
        due_date = ?, remarks = ?, is_gst = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      finance_bank_id || null,
      formattedPoDate, po_sent_through || null, inv_number || null,
      formattedBillDate, formattedPdcDate, item_code || null, qty || null, rate || null,
      sale_amount || null, gst_amount || null, total_payment_due || null,
      amount_paid || null, balance_amount || null, formattedDateOfPayment,
      formattedDueDate, remarks || null, is_gst ?? null, updated_by, id
    ];

    const [result] = await db.query(updateSql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Creditor not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Creditor updated successfully (history saved)',
      data: { id }
    });
  } catch (error) {
    console.error('Error in updateCreditors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};
// Delete a creditor
exports.deleteCreditors = async (req, res) => {
  try {
    const { id } = req.params;

    const deleteSql = 'DELETE FROM finance_creditors WHERE id = ?';
    const [result] = await db.query(deleteSql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Creditor not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Creditor deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error in deleteCreditors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Fetch overall creditors balance
exports.fetchOverallCreditorsBalance = async (req, res) => {
  try {
    const sql = `
      SELECT 
        COALESCE(SUM(CASE WHEN is_gst = 1 THEN balance_amount ELSE 0 END), 0) as gst_creditors_balance,
        COALESCE(SUM(CASE WHEN is_gst = 0 THEN balance_amount ELSE 0 END), 0) as other_creditors_balance,
        COALESCE(SUM(balance_amount), 0) as total_balance
      FROM finance_creditors
    `;
    const [rows] = await db.query(sql);

    res.status(200).json({
      status: 'success',
      message: 'Overall creditors balance retrieved successfully',
      data: {
        gst_creditors_balance: parseFloat(rows[0].gst_creditors_balance) || 0,
        other_creditors_balance: parseFloat(rows[0].other_creditors_balance) || 0,
        total_balance: parseFloat(rows[0].total_balance) || 0
      }
    });
  } catch (error) {
    console.error('Error in fetchOverallCreditorsBalance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Updated controller function in financeController.js for getCompaniesWithProjects
exports.getCompaniesWithProjects = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.company_id,
        c.company_name,
        pd.pd_id as pd_id,
        pd.project_name
      FROM company c
      LEFT JOIN project_details pd ON c.company_id = pd.company_id
      ORDER BY c.company_id, pd.project_name
    `;
    const [rows] = await db.query(sql);

    // Group by company to include multiple projects with pd_id
    const grouped = rows.reduce((acc, row) => {
      if (!acc[row.company_id]) {
        acc[row.company_id] = {
          company_id: row.company_id,
          company_name: row.company_name,
          projects: []
        };
      }
      if (row.project_name && row.pd_id) {
        acc[row.company_id].projects.push({
          pd_id: row.pd_id,
          project_name: row.project_name
        });
      }
      return acc;
    }, {});

    const data = Object.values(grouped);

    res.status(200).json({
      status: 'success',
      message: 'Companies with projects retrieved successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in getCompaniesWithProjects:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Updated controller function in financeController.js
exports.getSiteInchargesByPdId = async (req, res) => {
  try {
    const { pd_id } = req.query;
    if (!pd_id) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id is required'
      });
    }

    const sql = `
      SELECT 
        sia.id, sia.pd_id, sia.site_id, sia.desc_id, sia.emp_id, em.full_name,
        sia.from_date, sia.to_date, sia.created_by, sia.created_at, 
        sia.updated_by, sia.updated_at, em.approved_salary
      FROM siteincharge_assign sia
      LEFT JOIN employee_master em ON sia.emp_id = em.emp_id
      WHERE sia.pd_id = ?
      ORDER BY sia.created_at DESC
    `;
    const [rows] = await db.query(sql, [pd_id]);

    res.status(200).json({
      status: 'success',
      message: 'Site incharges retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in getSiteInchargesByPdId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Updated controller function in financeController.js (replaces createSiteInchargeAttendance)
exports.upsertSiteInchargeAttendance = async (req, res) => {
  try {
    const { attendances, created_by } = req.body;

    if (!Array.isArray(attendances) || attendances.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'attendances array is required and must not be empty'
      });
    }

    if (!created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'created_by is required'
      });
    }

    const results = [];
    for (const att of attendances) {
      const { siteincharge_assign_id, shift, entry_date, remarks } = att;

      if (!siteincharge_assign_id || !shift || !entry_date) {
        continue; // Skip invalid entries
      }

      const formattedEntryDate = formatDate(entry_date);

      // Check if entry already exists for this siteincharge_assign_id and entry_date
      const checkSql = `
        SELECT id FROM finance_siteincharge_attendance 
        WHERE siteincharge_assign_id = ? AND entry_date = ?
      `;
      const [existingRows] = await db.query(checkSql, [siteincharge_assign_id, formattedEntryDate]);

      if (existingRows.length > 0) {
        // Update existing (log to history first)
        const existingId = existingRows[0].id;

        // Fetch current record for history
        const fetchSql = 'SELECT * FROM finance_siteincharge_attendance WHERE id = ?';
        const [currentRows] = await db.query(fetchSql, [existingId]);
        const currentRecord = currentRows[0];

        // Insert into history
        const historySql = `
          INSERT INTO finance_siteincharge_attendance_history (
            finance_siteincharge_attendance_id, siteincharge_assign_id, entry_date, 
            shift, remarks, created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const historyParams = [
          existingId, siteincharge_assign_id, formattedEntryDate, currentRecord.shift, 
          currentRecord.remarks, currentRecord.created_by, created_by
        ];
        await db.query(historySql, historyParams);

        // Update main record
        const updateSql = `
          UPDATE finance_siteincharge_attendance 
          SET shift = ?, remarks = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `;
        const updateParams = [shift, remarks || null, created_by, existingId];
        const [updateResult] = await db.query(updateSql, updateParams);

        if (updateResult.affectedRows > 0) {
          results.push({ id: existingId, siteincharge_assign_id, action: 'updated' });
        }
      } else {
        // Create new
        const sql = `
          INSERT INTO finance_siteincharge_attendance (
            siteincharge_assign_id, shift, created_by, entry_date, remarks
          ) VALUES (?, ?, ?, ?, ?)
        `;
        const params = [siteincharge_assign_id, shift, created_by, formattedEntryDate, remarks || null];
        const [result] = await db.query(sql, params);

        results.push({ id: result.insertId, siteincharge_assign_id, action: 'created' });
      }
    }

    if (results.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'No valid attendance entries to process'
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Site incharge attendance processed successfully',
      data: results
    });
  } catch (error) {
    console.error('Error in upsertSiteInchargeAttendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// New controller function to fetch existing attendance for a date (for frontend prefill)
exports.getSiteInchargeAttendanceByDate = async (req, res) => {
  try {
    const { pd_id, entry_date } = req.query;
    if (!pd_id || !entry_date) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id and entry_date are required'
      });
    }

    const formattedEntryDate = formatDate(entry_date);

    const sql = `
      SELECT 
        fsa.id, fsa.siteincharge_assign_id, fsa.shift, fsa.remarks, fsa.entry_date
      FROM finance_siteincharge_attendance fsa
      INNER JOIN siteincharge_assign sia ON fsa.siteincharge_assign_id = sia.id
      WHERE sia.pd_id = ? AND fsa.entry_date = ?
      ORDER BY sia.created_at DESC
    `;
    const [rows] = await db.query(sql, [pd_id, formattedEntryDate]);

    res.status(200).json({
      status: 'success',
      message: 'Attendance retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in getSiteInchargeAttendanceByDate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// New controller function in financeController.js
exports.getSiteInchargeAttendanceHistory = async (req, res) => {
  try {
    const { siteincharge_assign_id, entry_date } = req.query;
    if (!siteincharge_assign_id || !entry_date) {
      return res.status(400).json({
        status: 'error',
        message: 'siteincharge_assign_id and entry_date are required'
      });
    }

    const formattedEntryDate = formatDate(entry_date);

    // Find current attendance record
    const checkSql = `
      SELECT id, shift, remarks, created_by, updated_by, created_at, updated_at
      FROM finance_siteincharge_attendance 
      WHERE siteincharge_assign_id = ? AND entry_date = ?
    `;
    const [currentRows] = await db.query(checkSql, [siteincharge_assign_id, formattedEntryDate]);

    let history = [];
    let current = null;

    if (currentRows.length > 0) {
      const attendanceId = currentRows[0].id;
      current = {
        type: 'current',
        shift: currentRows[0].shift,
        remarks: currentRows[0].remarks,
        by: currentRows[0].updated_by || currentRows[0].created_by,
        date: currentRows[0].updated_at || currentRows[0].created_at
      };

      // Fetch history
      const historySql = `
        SELECT shift, remarks, created_by, updated_by, created_at, updated_at
        FROM finance_siteincharge_attendance_history 
        WHERE finance_siteincharge_attendance_id = ?
        ORDER BY created_at DESC
      `;
      const [historyRows] = await db.query(historySql, [attendanceId]);

      history = historyRows.map(row => ({
        type: 'history',
        shift: row.shift,
        remarks: row.remarks,
        by: row.updated_by,
        date: row.updated_at || row.created_at
      }));
    }

    const allVersions = [...history, current].filter(Boolean); // Filter out null if no current

    res.status(200).json({
      status: 'success',
      message: 'Attendance history retrieved successfully',
      data: allVersions
    });
  } catch (error) {
    console.error('Error in getSiteInchargeAttendanceHistory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


// New controller function in financeController.js
exports.getSiteInchargeSalarySummaryByAttendance = async (req, res) => {
  try {
    const { pd_id, month } = req.query;
    if (!pd_id || !month) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id and month (YYYY-MM) are required'
      });
    }

    const sql = `
      SELECT 
        em.emp_id,
        em.full_name,
        em.approved_salary,
        COALESCE(SUM(fsa.shift), 0) as total_shifts
      FROM employee_master em
      INNER JOIN siteincharge_assign sia ON em.emp_id = sia.emp_id
      LEFT JOIN finance_siteincharge_attendance fsa ON sia.id = fsa.siteincharge_assign_id 
        AND fsa.entry_date LIKE ?
      WHERE sia.pd_id = ?
      GROUP BY em.emp_id, em.full_name, em.approved_salary
      ORDER BY em.full_name
    `;
    const [rows] = await db.query(sql, [`${month}%`, pd_id]);

    const summaryData = rows.map(row => {
      const monthlySalary = parseFloat(row.approved_salary) || 0;
      const totalShifts = parseFloat(row.total_shifts) || 0;
      const dailyRate = monthlySalary / 30;
      const totalPaid = dailyRate * totalShifts;
      const balance = monthlySalary - totalPaid;

      return {
        emp_id: row.emp_id,
        full_name: row.full_name,
        approved_salary: monthlySalary,
        total_shifts: totalShifts,
        total_paid: parseFloat(totalPaid.toFixed(2)),
        balance: parseFloat(balance.toFixed(2))
      };
    });

    // Calculate overall totals
    const overallApproved = summaryData.reduce((sum, item) => sum + item.approved_salary, 0);
    const overallShifts = summaryData.reduce((sum, item) => sum + item.total_shifts, 0);
    const overallPaid = summaryData.reduce((sum, item) => sum + item.total_paid, 0);
    const overallBalance = summaryData.reduce((sum, item) => sum + item.balance, 0);

    const overall = {
      overall_approved_salary: parseFloat(overallApproved.toFixed(2)),
      overall_total_shifts: parseFloat(overallShifts.toFixed(2)),
      overall_total_paid: parseFloat(overallPaid.toFixed(2)),
      overall_balance: parseFloat(overallBalance.toFixed(2))
    };

    const finalData = [overall, ...summaryData];

    res.status(200).json({
      status: 'success',
      message: 'Site incharge salary summary retrieved successfully',
      data: finalData
    });
  } catch (error) {
    console.error('Error in getSiteInchargeSalarySummary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.getSalaryPayablesSummary = async (req, res) => {
  try {
    const { pd_id, month, bank_id } = req.query;

    if (!pd_id || !month || !bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id, month, and bank_id are required'
      });
    }

    // Accept both YYYYMM and YYYY-MM
    let cleanMonth = month.toString().replace('-', '');
    if (cleanMonth.length !== 6 || isNaN(cleanMonth)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid month format. Use YYYYMM or YYYY-MM'
      });
    }

    const year = cleanMonth.substring(0, 4);
    const mon = cleanMonth.substring(4, 6);
    const startDate = `${year}-${mon}-01`;

    const sql = `
      SELECT 
        em.emp_id,
        em.full_name,
        em.approved_salary,
        fsp.id AS transaction_id,
        fsp.entry_date,
        fsp.paid_amount,
        fsp.balance AS recorded_balance,
        fsp.created_at,
        fsp.created_by,
        fsp.updated_at,
        fsp.updated_by
      FROM employee_master em
      INNER JOIN siteincharge_assign sia 
        ON em.emp_id = sia.emp_id
      LEFT JOIN finance_salary_payable fsp 
        ON em.emp_id = fsp.emp_id 
        AND sia.pd_id = fsp.pd_id
        AND fsp.finance_bank_id = ?
        AND fsp.entry_date >= ?
        AND fsp.entry_date <= LAST_DAY(?)
      WHERE sia.pd_id = ?
      ORDER BY em.full_name ASC, fsp.created_at ASC
    `;

    const [rows] = await db.query(sql, [bank_id, startDate, startDate, pd_id]);

    // Group payments by employee
    const employeeMap = {};

    rows.forEach(row => {
      const empId = row.emp_id;

      if (!employeeMap[empId]) {
        employeeMap[empId] = {
          emp_id: empId,
          full_name: row.full_name,
          approved_salary: parseFloat(row.approved_salary || 0),
          transactions: [],
          total_paid: 0
        };
      }

      if (row.transaction_id) {
        const transaction = {
          id: row.transaction_id,
          entry_date: row.entry_date,
          paid_amount: parseFloat(row.paid_amount || 0),
          recorded_balance: parseFloat(row.recorded_balance || 0),
          created_at: row.created_at,
          created_by: row.created_by,
          updated_at: row.updated_at,
          updated_by: row.updated_by
        };

        employeeMap[empId].transactions.push(transaction);
        employeeMap[empId].total_paid += transaction.paid_amount;
      }
    });

    const employees = Object.values(employeeMap).map(emp => {
      const balance = emp.approved_salary - emp.total_paid;
      return {
        emp_id: emp.emp_id,
        full_name: emp.full_name,
        approved_salary: Number(emp.approved_salary.toFixed(2)),
        total_paid: Number(emp.total_paid.toFixed(2)),
        balance: Number(balance.toFixed(2)),
        transactions: emp.transactions.map(t => ({
          ...t,
          paid_amount: Number(t.paid_amount.toFixed(2)),
          recorded_balance: Number(t.recorded_balance.toFixed(2))
        }))
      };
    });

    const overall = {
      overall_approved_salary: Number(employees.reduce((sum, e) => sum + e.approved_salary, 0).toFixed(2)),
      overall_total_paid: Number(employees.reduce((sum, e) => sum + e.total_paid, 0).toFixed(2)),
      overall_balance: Number(employees.reduce((sum, e) => sum + e.balance, 0).toFixed(2))
    };

    const responseData = employees.length > 0 ? [overall, ...employees] : [overall];

    res.json({
      status: 'success',
      message: 'Salary payments loaded successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error in getSalaryPayablesSummary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};

exports.updateSalaryPayable = async (req, res) => {
  try {
    const {
      emp_id,
      pd_id,
      paid_amount,
      finance_bank_id,
      entry_date,                // ← now coming from frontend
      created_by = 'admin',
      updated_by = created_by
    } = req.body;

    if (!emp_id || !pd_id || !paid_amount || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'emp_id, pd_id, paid_amount, finance_bank_id required'
      });
    }

    const paid = parseFloat(paid_amount);
    if (isNaN(paid) || paid <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'paid_amount must be positive number'
      });
    }

    // 1. Get approved salary
    const [emp] = await db.query(
      'SELECT approved_salary FROM employee_master WHERE emp_id = ?',
      [emp_id]
    );

    if (emp.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }

    const approved = parseFloat(emp[0].approved_salary) || 0;

    // 2. Determine entry date
    let useDate = entry_date && /^\d{4}-\d{2}-\d{2}$/.test(entry_date)
      ? entry_date
      : new Date().toISOString().slice(0, 10);

    // 3. Calculate current monthly total paid (for correct balance)
    const year = useDate.substring(0, 4);
    const month = useDate.substring(5, 7);

    const [monthSumRow] = await db.query(`
      SELECT COALESCE(SUM(paid_amount), 0) AS total
      FROM finance_salary_payable
      WHERE emp_id = ?
        AND pd_id = ?
        AND YEAR(entry_date) = ?
        AND MONTH(entry_date) = ?
    `, [emp_id, pd_id, year, month]);

    const alreadyPaidThisMonth = parseFloat(monthSumRow[0].total) || 0;
    const newMonthlyTotal = alreadyPaidThisMonth + paid;
    const newBalance = approved - newMonthlyTotal;

    // 4. Insert the new payment record
    const [insertResult] = await db.query(`
      INSERT INTO finance_salary_payable
      (emp_id, pd_id, entry_date, paid_amount, balance, finance_bank_id, created_by, created_at, updated_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW())
    `, [
      emp_id,
      pd_id,
      useDate,
      paid,
      newBalance,           // snapshot of monthly balance at insert time
      finance_bank_id,
      created_by,
      updated_by
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Payment recorded successfully',
      data: {
        id: insertResult.insertId,
        entry_date: useDate,
        paid_amount: paid,
        monthly_balance_after: newBalance,
        total_paid_this_month: newMonthlyTotal
      }
    });

  } catch (err) {
    console.error('Error in updateSalaryPayable:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        status: 'error',
        message: 'Duplicate entry error – unique constraint still exists on (emp_id, pd_id, entry_date)',
        hint: 'Run: ALTER TABLE finance_salary_payable DROP INDEX unique_emp_pd_datetime;'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Failed to record payment',
      error: err.message
    });
  }
};



exports.getSalaryTransactionLogs = async (req, res) => {
  try {
    let { emp_id, pd_id, month } = req.query;

    if (!emp_id || !pd_id || !month) {
      return res.status(400).json({
        status: 'error',
        message: 'emp_id, pd_id and month are required'
      });
    }

    // Trim and normalize
    emp_id = String(emp_id).trim();
    pd_id = String(pd_id).trim();
    month = month.replace(/-/g, ''); // remove any dashes → YYYYMM

    if (month.length !== 6 || isNaN(Number(month))) {
      return res.status(400).json({
        status: 'error',
        message: 'month should be in format YYYYMM or YYYY-MM'
      });
    }

    const year = month.substring(0, 4);
    const mon = month.substring(4, 6);

    const sql = `
      SELECT 
        fsp.id,
        fsp.emp_id,
        fsp.pd_id,
        fsp.entry_date,
        fsp.paid_amount,
        fsp.finance_bank_id,
        fsp.balance,
        fsp.created_at,
        fsp.created_by,
        fsp.updated_at,
        fsp.updated_by,
        fbm.bank_name AS finance_bank_name
      FROM finance_salary_payable fsp
      LEFT JOIN finance_bank_master fbm 
        ON fsp.finance_bank_id = fbm.id
      WHERE fsp.emp_id = ?
        AND fsp.pd_id = ?
        AND YEAR(fsp.entry_date) = ?
        AND MONTH(fsp.entry_date) = ?
      ORDER BY fsp.created_at ASC, fsp.id ASC
    `;

    const [rows] = await db.query(sql, [emp_id, pd_id, year, mon]);

    // Debug log in server console
    console.log(`[salary-transaction-logs] emp=${emp_id} pd=${pd_id} month=${year}-${mon} → found ${rows.length} rows`);

    const formatted = rows.map(row => ({
      id: row.id,
      entry_date: row.entry_date,
      paid_amount: Number(row.paid_amount).toFixed(2),
      balance: Number(row.balance).toFixed(2),
      created_at: row.created_at,
      created_by: row.created_by || 'System',
      updated_at: row.updated_at,
      updated_by: row.updated_by,
      finance_bank_id: row.finance_bank_id,
      finance_bank_name: row.finance_bank_name || 'N/A'   // ← added
    }));

    res.json({
      status: 'success',
      message: `Found ${formatted.length} transaction${formatted.length === 1 ? '' : 's'}`,
      data: formatted
    });

  } catch (err) {
    console.error('Error in getSalaryTransactionLogs:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction logs',
      error: err.message
    });
  }
};


exports.getCostCategories = async (req, res) => {
  try {
    const sql = 'SELECT id, category_name FROM finance_cost_category ORDER BY category_name';
    const [rows] = await db.query(sql);
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error in getCostCategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// CREATE
exports.createTransportPayable = async (req, res) => {
  try {
    const {
      pd_id, cost_category_id, dc_number, item_name, description,
      sale_amount, total_payment_due, date_of_payment, paid_amount, finance_bank_id
    } = req.body;

    if (!pd_id || !cost_category_id || !item_name || !date_of_payment || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id, cost_category_id, item_name, date_of_payment, finance_bank_id are required'
      });
    }

    const parsedDate = date_of_payment.split('T')[0];
    const sale = parseFloat(sale_amount) || 0;
    const total = parseFloat(total_payment_due) || sale;
    const paid = parseFloat(paid_amount) || 0;
    const balance = total - paid;

    const sql = `
      INSERT INTO finance_transport_payable 
      (pd_id, cost_category_id, dc_number, item_name, description, sale_amount, 
       total_payment_due, date_of_payment, paid_amount, balance_amount, finance_bank_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')
    `;

    const [result] = await db.query(sql, [
      pd_id, cost_category_id, dc_number || null, item_name, description || null,
      sale, total, parsedDate, paid, balance, finance_bank_id
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Transport payable created',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Create Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};




// Get all existing distinct DC numbers
exports.getExistingMaterialDcNo = async (req, res) => {
  try {
    const sql = `
      SELECT DISTINCT dc_no 
      FROM material_dispatch 
      WHERE dc_no IS NOT NULL AND dc_no != '' 
      ORDER BY dc_no DESC
    `;
    const [rows] = await db.query(sql);

    const dcNumbers = rows.map(row => row.dc_no);

    res.status(200).json({
      status: 'success',
      data: dcNumbers
    });
  } catch (error) {
    console.error('Error fetching DC numbers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch DC numbers'
    });
  }
};

// UPDATE - with history logging
exports.updateTransportPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cost_category_id, dc_number, item_name, description,
      sale_amount, total_payment_due, date_of_payment, paid_amount, finance_bank_id
    } = req.body;

    if (!cost_category_id || !item_name || !date_of_payment || !finance_bank_id) {
      return res.status(400).json({ status: 'error', message: 'Required fields missing' });
    }

    // Fetch current record
    const [existing] = await db.query('SELECT * FROM finance_transport_payable WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });

    // Save to history
    const oldData = existing[0];
    await db.query(
      `INSERT INTO finance_transport_payable_edit_history 
       (finance_transport_payable_id, pd_id, cost_category_id, dc_number, item_name, description,
        sale_amount, total_payment_due, date_of_payment, paid_amount, balance_amount, finance_bank_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'admin')`,
      [
        id, oldData.pd_id, oldData.cost_category_id, oldData.dc_number, oldData.item_name,
        oldData.description, oldData.sale_amount, oldData.total_payment_due,
        oldData.date_of_payment, oldData.paid_amount, oldData.balance_amount,
        oldData.finance_bank_id
      ]
    );

    // Update main table
    const sale = parseFloat(sale_amount) || oldData.sale_amount;
    const total = parseFloat(total_payment_due) || sale;
    const paid = parseFloat(paid_amount) || oldData.paid_amount;
    const balance = total - paid;

    await db.query(`
      UPDATE finance_transport_payable SET
        cost_category_id=?, dc_number=?, item_name=?, description=?,
        sale_amount=?, total_payment_due=?, date_of_payment=?,
        paid_amount=?, balance_amount=?, finance_bank_id=?, updated_by='admin', updated_at=NOW()
      WHERE id=?
    `, [
      cost_category_id, dc_number || null, item_name, description || null,
      sale, total, date_of_payment.split('T')[0], paid, balance, finance_bank_id, id
    ]);

    res.json({ status: 'success', message: 'Updated successfully' });

  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// GET with bank filter
exports.getTransportPayablesByPdId = async (req, res) => {
  try {
    const { pd_id, bank_id } = req.query;
    if (!pd_id) return res.status(400).json({ status: 'error', message: 'pd_id required' });

    let sql = `
      SELECT ftp.*, fcc.category_name, fbm.bank_name,
             COALESCE(fbm.available_balance, 0) AS available_balance
      FROM finance_transport_payable ftp
      INNER JOIN finance_cost_category fcc ON ftp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      WHERE ftp.pd_id = ?
    `;
    const params = [pd_id];

    if (bank_id) {
      sql += ` AND ftp.finance_bank_id = ?`;
      params.push(bank_id);
    }

    sql += ` ORDER BY ftp.created_at DESC`;

    const [rows] = await db.query(sql, params);

    const overall = {
      overall_sale_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.sale_amount) || 0), 0).toFixed(2)),
      overall_total_payment_due: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.total_payment_due) || 0), 0).toFixed(2)),
      overall_paid_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0).toFixed(2)),
      overall_balance_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0).toFixed(2))
    };

    res.json({ status: 'success', data: [overall, ...rows] });

  } catch (error) {
    console.error('Get Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};


exports.updateTransportPayable = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const {
      pd_id,
      cost_category_id,
      dc_number,
      item_name,
      description,
      sale_amount,
      gst = 0,
      total_payment_due,
      date_of_payment,
      paid_amount,
      finance_bank_id,
      updated_by = 'admin' // you can pass from frontend, fallback to 'admin'
    } = req.body;

    // Validation
    if (!cost_category_id || !item_name || !date_of_payment || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Required fields: cost_category_id, item_name, date_of_payment, finance_bank_id'
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Get current record
    const [rows] = await connection.query(
      'SELECT * FROM finance_transport_payable WHERE id = ? FOR UPDATE',
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const oldRecord = rows[0];

    // 2. Insert into history table (DO NOT copy `id`!)
    await connection.query(
      `INSERT INTO finance_transport_payable_edit_history 
        (finance_transport_payable_id, pd_id, cost_category_id, dc_number, item_name, description,
         sale_amount, gst, total_payment_due, date_of_payment, paid_amount, balance_amount,
         finance_bank_id, created_at, created_by, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        oldRecord.pd_id,
        oldRecord.cost_category_id,
        oldRecord.dc_number || null,
        oldRecord.item_name,
        oldRecord.description || null,
        oldRecord.sale_amount,
        oldRecord.gst || 0,
        oldRecord.total_payment_due,
        oldRecord.date_of_payment,
        oldRecord.paid_amount,
        oldRecord.balance_amount,
        oldRecord.finance_bank_id,
        oldRecord.created_at,
        oldRecord.created_by || 'admin',
        new Date(), // updated_at for history
        oldRecord.updated_by || 'admin'
      ]
    );

    // 3. Calculate new values
    const sale = parseFloat(sale_amount) || oldRecord.sale_amount || 0;
    const gstAmount = parseFloat(gst) || oldRecord.gst || 0;
    const totalDue = parseFloat(total_payment_due) || (sale + gstAmount);
    const paid = parseFloat(paid_amount) || oldRecord.paid_amount || 0;
    const balance = totalDue - paid;

    // 4. Update main record
    await connection.query(
      `UPDATE finance_transport_payable SET
         pd_id = ?,
         cost_category_id = ?,
         dc_number = ?,
         item_name = ?,
         description = ?,
         sale_amount = ?,
         gst = ?,
         total_payment_due = ?,
         date_of_payment = ?,
         paid_amount = ?,
         balance_amount = ?,
         finance_bank_id = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        pd_id || oldRecord.pd_id,
        cost_category_id,
        dc_number || null,
        item_name,
        description || null,
        sale,
        gstAmount,
        totalDue,
        date_of_payment.split('T')[0],
        paid,
        balance,
        finance_bank_id,
        updated_by,
        id
      ]
    );

    await connection.commit();

    res.json({
      status: 'success',
      message: 'Transport payable updated successfully',
      data: { id, balance_amount: balance }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in updateTransportPayable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      details: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};
// GET - Returns bank name
exports.getTransportPayablesByPdId = async (req, res) => {
  try {
    const { pd_id } = req.query;
    if (!pd_id) return res.status(400).json({ status: 'error', message: 'pd_id required' });

    const sql = `
      SELECT 
        ftp.*, 
        fcc.category_name,
        fbm.bank_name, 
        COALESCE(fbm.available_balance, 0) AS available_balance
      FROM finance_transport_payable ftp
      INNER JOIN finance_cost_category fcc ON ftp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      WHERE ftp.pd_id = ?
      ORDER BY ftp.created_at DESC
    `;

    const [rows] = await db.query(sql, [pd_id]);

    const overall = {
      overall_sale_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.sale_amount) || 0), 0).toFixed(2)),
      overall_total_payment_due: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.total_payment_due) || 0), 0).toFixed(2)),
      overall_paid_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0).toFixed(2)),
      overall_balance_amount: parseFloat(rows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0).toFixed(2))
    };

    res.json({ status: 'success', data: [overall, ...rows] });

  } catch (error) {
    console.error('Error in getTransportPayablesByPdId:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};


exports.createScaffoldingPayable = async (req, res) => {
  try {
    const { 
      finance_creditors_client_id, 
      pd_id, 
      cost_category_id, 
      period, 
      qty, 
      rate, 
      sale_amount = 0, 
      gst = 0, 
      total_payment_due,
      date_of_payment, 
      paid_amount = 0,
      finance_bank_id,
      created_by   // Must come from authenticated frontend (decoded from URL)
    } = req.body;

    // Critical: Validate created_by
    if (!created_by || isNaN(created_by) || parseInt(created_by) <= 0) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: Invalid or missing user ID (created_by)'
      });
    }

    // Validate required fields
    if (!finance_creditors_client_id || !pd_id || !cost_category_id || !date_of_payment) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields: client, project, category, or payment date'
      });
    }

    let parsedDate = date_of_payment;
    if (typeof date_of_payment === 'string' && date_of_payment.includes('T')) {
      parsedDate = date_of_payment.split('T')[0];
    }

    const sale = parseFloat(sale_amount) || 0;
    const g = parseFloat(gst) || 0;
    const totalDue = total_payment_due ? parseFloat(total_payment_due) : (sale + g);
    const paid = parseFloat(paid_amount) || 0;
    const balance = totalDue - paid;

    const sql = `
      INSERT INTO finance_scaffolding_payable (
        finance_creditors_client_id, pd_id, cost_category_id, period, qty, rate,
        sale_amount, gst, total_payment_due, date_of_payment, paid_amount, balance_amount,
        finance_bank_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      finance_creditors_client_id, pd_id, cost_category_id, period || null, qty || null, rate || null,
      sale, g, totalDue, parsedDate, paid, balance,
      finance_bank_id || null, created_by
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Scaffolding payable created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating scaffolding payable:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error',
      details: error.message 
    });
  }
};
// updateScaffoldingPayable
exports.updateScaffoldingPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      finance_creditors_client_id, cost_category_id, period, qty, rate,
      sale_amount, gst, total_payment_due, date_of_payment, paid_amount,
      finance_bank_id,
      updated_by   // ← Real decoded user ID from frontend
    } = req.body;

    if (!updated_by) {
      return res.status(400).json({ status: 'error', message: 'User ID is required for update' });
    }

    // Fetch old record
    const [rows] = await db.query('SELECT * FROM finance_scaffolding_payable WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ status: 'error', message: 'Record not found' });
    const old = rows[0];

    // Save to history
    await db.query(`
      INSERT INTO finance_scaffolding_payable_edit_history (
        finance_scaffolding_payable_id, finance_creditors_client_id, pd_id, cost_category_id,
        period, qty, rate, sale_amount, gst, total_payment_due, date_of_payment,
        paid_amount, balance_amount, finance_bank_id, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      old.id, old.finance_creditors_client_id, old.pd_id, old.cost_category_id,
      old.period, old.qty, old.rate, old.sale_amount, old.gst, old.total_payment_due,
      old.date_of_payment, old.paid_amount, old.balance_amount,
      old.finance_bank_id, updated_by
    ]);

    // Calculate new values
    const sale = parseFloat(sale_amount) || old.sale_amount;
    const g = parseFloat(gst) || old.gst;
    const totalDue = total_payment_due ? parseFloat(total_payment_due) : (sale + g);
    const paid = parseFloat(paid_amount) || old.paid_amount;
    const balance = totalDue - paid;

    let parsedDate = date_of_payment || old.date_of_payment;
    if (typeof parsedDate === 'string' && parsedDate.includes('T')) {
      parsedDate = parsedDate.split('T')[0];
    }

    await db.query(`
      UPDATE finance_scaffolding_payable SET
        finance_creditors_client_id = ?, cost_category_id = ?, period = ?, qty = ?, rate = ?,
        sale_amount = ?, gst = ?, total_payment_due = ?, date_of_payment = ?,
        paid_amount = ?, balance_amount = ?, finance_bank_id = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      finance_creditors_client_id || old.finance_creditors_client_id,
      cost_category_id || old.cost_category_id,
      period || old.period,
      qty || old.qty,
      rate || old.rate,
      sale, g, totalDue, parsedDate, paid, balance,
      finance_bank_id !== undefined ? finance_bank_id : old.finance_bank_id,
      updated_by, id
    ]);

    res.json({ status: 'success', message: 'Updated successfully' });
  } catch (error) {
    console.error('Error updating scaffolding payable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Get scaffolding payables by project ID + bank filter (with bank name)
exports.getScaffoldingPayablesByPdId = async (req, res) => {
  try {
    const { pd_id, finance_bank_id } = req.query;

    if (!pd_id) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id is required'
      });
    }

    let sql = `
      SELECT 
        fsp.*,
        fcc.category_name,
        fcc2.client_name,
        fbm.bank_name
      FROM finance_scaffolding_payable fsp
      INNER JOIN finance_cost_category fcc ON fsp.cost_category_id = fcc.id
      LEFT JOIN finance_creditors_client fcc2 ON fsp.finance_creditors_client_id = fcc2.id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      WHERE fsp.pd_id = ?
    `;

    const params = [pd_id];

    // Add bank filter if provided
    if (finance_bank_id && finance_bank_id !== 'null' && finance_bank_id !== 'undefined') {
      sql += ` AND fsp.finance_bank_id = ?`;
      params.push(finance_bank_id);
    } else {
      // Optional: allow showing entries with no bank too
      sql += ` AND (fsp.finance_bank_id IS NULL OR fsp.finance_bank_id = 0)`;
    }

    sql += ` ORDER BY fsp.created_at DESC`;

    const [rows] = await db.query(sql, params);

    // Calculate overall totals
    const overallSale = rows.reduce((sum, row) => sum + parseFloat(row.sale_amount || 0), 0);
    const overallTotalDue = rows.reduce((sum, row) => sum + parseFloat(row.total_payment_due || 0), 0);
    const overallPaid = rows.reduce((sum, row) => sum + parseFloat(row.paid_amount || 0), 0);
    const overallBalance = rows.reduce((sum, row) => sum + parseFloat(row.balance_amount || 0), 0);

    const overall = {
      overall_sale_amount: parseFloat(overallSale.toFixed(2)),
      overall_total_payment_due: parseFloat(overallTotalDue.toFixed(2)),
      overall_paid_amount: parseFloat(overallPaid.toFixed(2)),
      overall_balance_amount: parseFloat(overallBalance.toFixed(2)),
      bank_name: rows.length > 0 ? rows[0].bank_name || '—' : '—'
    };

    const finalData = [overall, ...rows];

    res.status(200).json({
      status: 'success',
      data: finalData
    });
  } catch (error) {
    console.error('Error in getScaffoldingPayablesByPdId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


// ==================== SITE ACCOMMODATION PAYABLE ====================

// Create Site Accommodation Payable + Bank
exports.createSiteAccommodationPayable = async (req, res) => {
  try {
    const {
      pd_id,
      finance_creditors_client_id,
      finance_bank_id,        // NEW
      advance_amount,
      due_date,
      due_period,
      due_amount,
      payment,
      payment_date,
      balance_due,
      created_by
    } = req.body;

    if (!pd_id || !finance_creditors_client_id || !finance_bank_id || !due_period || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id, client, bank, due_period and created_by are required'
      });
    }

    const formattedDueDate = formatDate(due_date);
    const formattedPaymentDate = formatDate(payment_date);

    const sql = `
      INSERT INTO finance_site_accomodation_payable (
        pd_id, finance_creditors_client_id, finance_bank_id,
        advance_amount, due_date, due_period, due_amount, payment,
        payment_date, balance_due, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      pd_id, finance_creditors_client_id, finance_bank_id,
      advance_amount || null, formattedDueDate, due_period,
      due_amount || null, payment || null, formattedPaymentDate,
      balance_due || null, created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Site accommodation payable created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createSiteAccommodationPayable:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

exports.getSiteAccommodationPayablesByPdId = async (req, res) => {
  try {
    const { pd_id, finance_bank_id } = req.query;
    if (!pd_id) return res.status(400).json({ status: 'error', message: 'pd_id is required' });

    let sql = `
      SELECT 
        fsa.*,
        pd.project_name,
        fcc.client_name,
        fbm.bank_name
      FROM finance_site_accomodation_payable fsa
      LEFT JOIN project_details pd ON fsa.pd_id = pd.pd_id
      LEFT JOIN finance_creditors_client fcc ON fsa.finance_creditors_client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fsa.finance_bank_id = fbm.id
      WHERE fsa.pd_id = ?
    `;

    const params = [pd_id];

    if (finance_bank_id && finance_bank_id !== 'null') {
      sql += ` AND fsa.finance_bank_id = ?`;
      params.push(finance_bank_id);
    }

    sql += ` ORDER BY fsa.created_at DESC`;

    const [rows] = await db.query(sql, params);

    // Overall totals
    const overall = {
      overall_advance: rows.reduce((s, r) => s + parseFloat(r.advance_amount || 0), 0).toFixed(2),
      overall_due: rows.reduce((s, r) => s + parseFloat(r.due_amount || 0), 0).toFixed(2),
      overall_payment: rows.reduce((s, r) => s + parseFloat(r.payment || 0), 0).toFixed(2),
      overall_balance: rows.reduce((s, r) => s + parseFloat(r.balance_due || 0), 0).toFixed(2),
      bank_name: rows.length > 0 ? (rows[0].bank_name || '—') : '—'
    };

    res.status(200).json({
      status: 'success',
      data: [overall, ...rows]
    });
  } catch (error) {
    console.error('Error in getSiteAccommodationPayablesByPdId:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

// Update with Bank + History
exports.updateSiteAccommodationPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finance_bank_id,
      advance_amount, due_date, due_period, due_amount,
      payment, payment_date, balance_due, updated_by
    } = req.body;

    if (!due_period || !updated_by) {
      return res.status(400).json({ status: 'error', message: 'due_period and updated_by are required' });
    }

    const [current] = await db.query('SELECT * FROM finance_site_accomodation_payable WHERE id = ?', [id]);
    if (current.length === 0) return res.status(404).json({ status: 'error', message: 'Record not found' });

    // Save to history (include bank)
    const historySql = `
      INSERT INTO finance_site_accomodation_payable_history (
        finance_site_accomodation_payable_id, pd_id, finance_creditors_client_id, finance_bank_id,
        advance_amount, due_date, due_period, due_amount, payment, payment_date,
        balance_due, created_at, created_by, updated_at, updated_by, changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.query(historySql, [
      id, current[0].pd_id, current[0].finance_creditors_client_id, current[0].finance_bank_id,
      current[0].advance_amount, current[0].due_date, current[0].due_period,
      current[0].due_amount, current[0].payment, current[0].payment_date,
      current[0].balance_due, current[0].created_at, current[0].created_by,
      current[0].updated_at, current[0].updated_by, updated_by
    ]);

    const formattedDueDate = formatDate(due_date);
    const formattedPaymentDate = formatDate(payment_date);

    const updateSql = `
      UPDATE finance_site_accomodation_payable SET
        finance_bank_id = ?, advance_amount = ?, due_date = ?, due_period = ?, 
        due_amount = ?, payment = ?, payment_date = ?, balance_due = ?, 
        updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(updateSql, [
      finance_bank_id || null, advance_amount || null, formattedDueDate, due_period,
      due_amount || null, payment || null, formattedPaymentDate, balance_due || null,
      updated_by, id
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Updated successfully (history saved)'
    });
  } catch (error) {
    console.error('Error in updateSiteAccommodationPayable:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};



// ==================== COMMISSION PAYABLE ====================
// Get all marketing persons for dropdown
exports.getMarketingPersons = async (req, res) => {
  try {
    const sql = 'SELECT id, person_name FROM finance_marketing_persons ORDER BY person_name';
    const [rows] = await db.query(sql);

    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error in getMarketingPersons:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.createCommissionPayable = async (req, res) => {
  try {
    const {
      pd_id,
      finance_bank_id,
      cost_category_id,
      marketing_person_id,
      commission_amount_due,
      date_of_payment,
      paid_amount,
      created_by
    } = req.body;

    if (!pd_id || !finance_bank_id || !cost_category_id || !marketing_person_id) {
      return res.status(400).json({ status: 'error', message: 'Project, Bank, Category & Person required' });
    }

    const balance = (parseFloat(commission_amount_due || 0) - parseFloat(paid_amount || 0)).toFixed(2);

    const sql = `
      INSERT INTO finance_commission_payable 
      (pd_id, finance_bank_id, cost_category_id, marketing_person_id, 
       commission_amount_due, date_of_payment, paid_amount, balance_amount, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      pd_id, finance_bank_id, cost_category_id, marketing_person_id,
      commission_amount_due || null, date_of_payment || null,
      paid_amount || null, balance, created_by
    ]);

    res.status(201).json({ status: 'success', data: { id: result.insertId } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.getCommissionPayablesByPdId = async (req, res) => {
  try {
    const { pd_id, bank_id } = req.query;
    if (!pd_id || !bank_id) {
      return res.status(400).json({ status: 'error', message: 'pd_id and bank_id required' });
    }

    const sql = `
      SELECT fcp.*, fcc.category_name, fmp.person_name, fb.bank_name
      FROM finance_commission_payable fcp
      LEFT JOIN finance_cost_category fcc ON fcp.cost_category_id = fcc.id
      LEFT JOIN finance_marketing_persons fmp ON fcp.marketing_person_id = fmp.id
      LEFT JOIN finance_bank_master fb ON fcp.finance_bank_id = fb.id
      WHERE fcp.pd_id = ? AND fcp.finance_bank_id = ?
      ORDER BY fcp.created_at DESC
    `;

    const [rows] = await db.query(sql, [pd_id, bank_id]);

    const overall = {
      overall_commission_due: rows.reduce((s, r) => s + parseFloat(r.commission_amount_due || 0), 0).toFixed(2),
      overall_paid: rows.reduce((s, r) => s + parseFloat(r.paid_amount || 0), 0).toFixed(2),
      overall_balance: rows.reduce((s, r) => s + parseFloat(r.balance_amount || 0), 0).toFixed(2)
    };

    res.json({ status: 'success', data: [overall, ...rows] });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

exports.updateCommissionPayable = async (req, res) => {
  const connection = await db.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = req.params;
    const {
      cost_category_id,
      marketing_person_id,
      commission_amount_due,
      date_of_payment,
      paid_amount,
      finance_bank_id,
      updated_by = 'unknown'
    } = req.body;

    const formattedDate = date_of_payment ? date_of_payment.split('T')[0] : null;
    const balance_amount = (parseFloat(commission_amount_due || 0) - parseFloat(paid_amount || 0)).toFixed(2);

    // Fetch old record with lock
    const [currentRows] = await connection.query(
      `SELECT * FROM finance_commission_payable WHERE id = ? FOR UPDATE`, [id]
    );

    if (currentRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const oldRecord = currentRows[0];

    // Insert into history - NOW 16 columns + 16 values
    const historySql = `
      INSERT INTO finance_commission_payable_edit_history 
      (
        finance_commission_payable_id,
        finance_bank_id,
        pd_id,
        cost_category_id,
        marketing_person_id,
        commission_amount_due,
        date_of_payment,
        paid_amount,
        balance_amount,
        created_at,
        created_by,
        updated_at,
        updated_by,
        changed_at,
        changed_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    await connection.query(historySql, [
      oldRecord.id,
      oldRecord.finance_bank_id,
      oldRecord.pd_id,
      oldRecord.cost_category_id,
      oldRecord.marketing_person_id,
      oldRecord.commission_amount_due,
      oldRecord.date_of_payment,
      oldRecord.paid_amount,
      oldRecord.balance_amount,
      oldRecord.created_at,
      oldRecord.created_by,
      oldRecord.updated_at,
      oldRecord.updated_by,
      updated_by  // ← This is changed_by
    ]);

    // Update main table
    const updateSql = `
      UPDATE finance_commission_payable SET
        finance_bank_id = ?,
        cost_category_id = ?,
        marketing_person_id = ?,
        commission_amount_due = ?,
        date_of_payment = ?,
        paid_amount = ?,
        balance_amount = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [updateResult] = await connection.query(updateSql, [
      finance_bank_id || null,
      cost_category_id || null,
      marketing_person_id || null,
      commission_amount_due ? parseFloat(commission_amount_due) : null,
      formattedDate,
      paid_amount ? parseFloat(paid_amount) : null,
      balance_amount,
      updated_by,
      id
    ]);

    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(500).json({ status: 'error', message: 'Failed to update record' });
    }

    await connection.commit();
    res.json({ status: 'success', message: 'Commission updated and history logged successfully' });

  } catch (error) {
    await connection.rollback();
    console.error('Error in updateCommissionPayable:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error', 
      details: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};


// exports.createTdsPayable = async (req, res) => {
//   try {
//     const { pd_id, month, payable, returnable, non_returnable, finance_bank_id, created_by = 'admin' } = req.body;
    
//     if (!pd_id || !month) {
//       return res.status(400).json({ status: 'error', message: 'pd_id and month required' });
//     }

//     const sql = `INSERT INTO finance_tds_payable 
//       (pd_id, month, payable, returnable, non_returnable, finance_bank_id, created_by) 
//       VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
//     const [result] = await db.query(sql, [
//       pd_id, month, payable || 0, returnable || 0, non_returnable || 0, finance_bank_id || null, created_by
//     ]);

//     res.status(201).json({ status: 'success', message: 'TDS record created', data: { id: result.insertId } });
//   } catch (error) {
//     console.error('Error in createTdsPayable:', error);
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// };


exports.createTdsPayable = async (req, res) => {
  try {
    const { month, payable, returnable, non_returnable, finance_bank_id, created_by = 'admin' } = req.body;
    
    if (!month) {
      return res.status(400).json({ status: 'error', message: 'month required' });
    }

    const pd_id = null; // Set to null to avoid foreign key constraint

    const sql = `INSERT INTO finance_tds_payable 
      (pd_id, month, payable, returnable, non_returnable, finance_bank_id, created_by) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    const [result] = await db.query(sql, [
      pd_id, month, payable || 0, returnable || 0, non_returnable || 0, finance_bank_id || null, created_by
    ]);

    res.status(201).json({ status: 'success', message: 'TDS record created', data: { id: result.insertId } });
  } catch (error) {
    console.error('Error in createTdsPayable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


// exports.getTdsPayablesByPdId = async (req, res) => {
//   try {
//     const { pd_id } = req.query;
//     if (!pd_id) return res.status(400).json({ status: 'error', message: 'pd_id required' });

//     const sql = `
//       SELECT ftp.*, pd.project_name, fbm.bank_name AS bank_name
//       FROM finance_tds_payable ftp
//       LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
//       LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
//       WHERE ftp.pd_id = ?
//       ORDER BY ftp.month DESC
//     `;
//     const [rows] = await db.query(sql, [pd_id]);

//     const overall = {
//       overall_payable: rows.reduce((s, r) => s + parseFloat(r.payable || 0), 0).toFixed(2),
//       overall_returnable: rows.reduce((s, r) => s + parseFloat(r.returnable || 0), 0).toFixed(2),
//       overall_non_returnable: rows.reduce((s, r) => s + parseFloat(r.non_returnable || 0), 0).toFixed(2)
//     };

//     res.status(200).json({ status: 'success', data: [overall, ...rows] });
//   } catch (error) {
//     console.error('Error in getTdsPayablesByPdId:', error);
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// };





exports.getAllTdsPayables = async (req, res) => {
  try {
    const { finance_bank_id } = req.query; // Optional filter by bank

    let sql = `
      SELECT ftp.*, pd.project_name, fbm.bank_name AS bank_name
      FROM finance_tds_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
    `;
    const params = [];

    if (finance_bank_id) {
      sql += ` WHERE ftp.finance_bank_id = ?`;
      params.push(finance_bank_id);
    }

    sql += ` ORDER BY ftp.month DESC`;

    const [rows] = await db.query(sql, params);

    const overall = {
      overall_payable: rows.reduce((s, r) => s + parseFloat(r.payable || 0), 0).toFixed(2),
      overall_returnable: rows.reduce((s, r) => s + parseFloat(r.returnable || 0), 0).toFixed(2),
      overall_non_returnable: rows.reduce((s, r) => s + parseFloat(r.non_returnable || 0), 0).toFixed(2)
    };

    res.status(200).json({ status: 'success', data: [overall, ...rows] });
  } catch (error) {
    console.error('Error in getAllTdsPayables:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};
exports.updateTdsPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const { payable, returnable, non_returnable, finance_bank_id, updated_by = 'admin' } = req.body;

    const [current] = await db.query('SELECT * FROM finance_tds_payable WHERE id = ?', [id]);
    if (current.length === 0) return res.status(404).json({ status: 'error', message: 'Record not found' });

    // Save history
    const historySql = `INSERT INTO finance_tds_payable_edit_history 
      (finance_tds_payable_id, pd_id, month, payable, returnable, non_returnable, finance_bank_id,
       created_at, created_by, updated_at, updated_by, changed_at, changed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`;
    
    await db.query(historySql, [
      id, current[0].pd_id, current[0].month, current[0].payable, current[0].returnable, current[0].non_returnable,
      current[0].finance_bank_id, current[0].created_at, current[0].created_by, current[0].updated_at, current[0].updated_by, updated_by
    ]);

    const updateSql = `UPDATE finance_tds_payable 
      SET payable = ?, returnable = ?, non_returnable = ?, finance_bank_id = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`;
    
    await db.query(updateSql, [
      payable || 0, returnable || 0, non_returnable || 0, finance_bank_id || null, updated_by, id
    ]);

    res.status(200).json({ status: 'success', message: 'TDS updated' });
  } catch (error) {
    console.error('Error in updateTdsPayable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


// GET: Fetch GST Payables with optional bank filter
exports.getGstPayables = async (req, res) => {
  try {
    const { finance_bank_id } = req.query;

    // Base query with all needed fields including bank info
    let detailSql = `
      SELECT 
        fgp.id,
        fgp.finance_gst_company_id,
        fgp.month,
        fgp.entry_type_id,
        fgp.input_amount,
        fgp.output_amount,
        fgp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fgp.created_at,
        fgc.company_name,
        fget.type_name AS entry_type_name
      FROM finance_gst_payable fgp
      LEFT JOIN finance_gst_company fgc ON fgp.finance_gst_company_id = fgc.id
      LEFT JOIN finance_gst_entry_type fget ON fgp.entry_type_id = fget.id
      LEFT JOIN finance_bank_master fbm ON fgp.finance_bank_id = fbm.id
    `;

    const params = [];

    // Apply filter only if finance_bank_id is provided and not "null" or empty
    if (finance_bank_id && finance_bank_id !== 'null' && finance_bank_id !== '') {
      detailSql += ` WHERE fgp.finance_bank_id = ?`;
      params.push(finance_bank_id);
    }

    detailSql += ` ORDER BY fgp.month DESC, fgc.company_name, fget.type_name`;

    // Summary query (filtered by bank if needed)
    let summarySql = `
      SELECT 
        COALESCE(SUM(input_amount), 0) AS overall_input_amount,
        COALESCE(SUM(output_amount), 0) AS overall_output_amount
      FROM finance_gst_payable
    `;

    const summaryParams = [];
    if (finance_bank_id && finance_bank_id !== 'null' && finance_bank_id !== '') {
      summarySql += ` WHERE finance_bank_id = ?`;
      summaryParams.push(finance_bank_id);
    }

    const [details] = await db.query(detailSql, params);
    const [summaryRows] = await db.query(summarySql, summaryParams);

    const overall = {
      overall_input_amount: parseFloat(summaryRows[0].overall_input_amount || 0).toFixed(2),
      overall_output_amount: parseFloat(summaryRows[0].overall_output_amount || 0).toFixed(2)
    };

    // Return: [overall, ...individual_records]
    res.status(200).json({
      status: 'success',
      data: [overall, ...details]
    });

  } catch (error) {
    console.error('Error in getGstPayables:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};


// PUT: Update GST Payable + Save History
exports.updateGstPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      input_amount,
      output_amount,
      finance_bank_id,
      updated_by = 1,
      change_reason = 'Updated via UI'
    } = req.body;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'ID is required' });
    }

    // Fetch current record
    const [currentRows] = await db.query(
      'SELECT * FROM finance_gst_payable WHERE id = ?',
      [id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const oldData = currentRows[0];

    // Save old data to history
    await db.query(`
      INSERT INTO finance_gst_payable_edit_history 
      (finance_gst_payable_id, finance_gst_company_id, month, entry_type_id, 
       input_amount, output_amount, finance_bank_id, changed_by, change_reason)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      oldData.id,
      oldData.finance_gst_company_id,
      oldData.month,
      oldData.entry_type_id,
      oldData.input_amount,
      oldData.output_amount,
      oldData.finance_bank_id,
      updated_by,
      change_reason
    ]);

    // Update main record
    await db.query(`
      UPDATE finance_gst_payable 
      SET input_amount = ?, output_amount = ?, finance_bank_id = ?, 
          updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [input_amount, output_amount, finance_bank_id || null, updated_by, id]);

    res.status(200).json({
      status: 'success',
      message: 'GST record updated successfully'
    });

  } catch (error) {
    console.error('Error updating GST payable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// CREATE / UPDATE GST Payable (with bank_id)
exports.createOrUpdateGstPayable = async (req, res) => {
  try {
    const {
      finance_gst_company_id,
      month,
      entry_type_id,
      input_amount = 0,
      output_amount = 0,
      finance_bank_id,
      created_by = 1,
      updated_by = 1
    } = req.body;

    if (!finance_gst_company_id || !month || !entry_type_id || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Company, Month, Entry Type, and Bank are required'
      });
    }

    const checkSql = `
      SELECT id FROM finance_gst_payable 
      WHERE finance_gst_company_id = ? AND month = ? AND entry_type_id = ? AND finance_bank_id = ?
    `;
    const [existing] = await db.query(checkSql, [finance_gst_company_id, month, entry_type_id, finance_bank_id]);

    if (existing.length > 0) {
      const oldId = existing[0].id;
      const [oldRow] = await db.query('SELECT * FROM finance_gst_payable WHERE id = ?', [oldId]);
      const oldData = oldRow[0];

      // Save to history
      await db.query(`
        INSERT INTO finance_gst_payable_edit_history 
        (finance_gst_payable_id, finance_gst_company_id, month, entry_type_id, input_amount, output_amount, finance_bank_id, changed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        oldId, oldData.finance_gst_company_id, oldData.month, oldData.entry_type_id,
        oldData.input_amount, oldData.output_amount, oldData.finance_bank_id, updated_by
      ]);

      // Update
      await db.query(`
        UPDATE finance_gst_payable SET
          input_amount = ?, output_amount = ?, finance_bank_id = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [input_amount, output_amount, finance_bank_id, updated_by, oldId]);

      return res.status(200).json({ status: 'success', message: 'GST updated', data: { id: oldId } });
    } else {
      // Insert new
      const insertSql = `
        INSERT INTO finance_gst_payable 
        (finance_gst_company_id, month, entry_type_id, input_amount, output_amount, finance_bank_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query(insertSql, [
        finance_gst_company_id, month, entry_type_id, input_amount, output_amount, finance_bank_id, created_by
      ]);

      return res.status(201).json({ status: 'success', message: 'GST created', data: { id: result.insertId } });
    }
  } catch (error) {
    console.error('Error in createOrUpdateGstPayable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Get all companies (for dropdown)
exports.getGstCompanies = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, company_name FROM finance_gst_company ORDER BY company_name');
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Create new company from frontend (called when "Add New" clicked)
exports.createGstCompany = async (req, res) => {
  try {
    const { company_name, created_by = 1 } = req.body;
    if (!company_name) return res.status(400).json({ status: 'error', message: 'company_name required' });

    const [result] = await db.query(
      'INSERT INTO finance_gst_company (company_name, created_by) VALUES (?, ?)',
      [company_name, created_by]
    );

    res.status(201).json({
      status: 'success',
      message: 'Company added',
      data: { id: result.insertId, company_name }
    });
  } catch (error) {
    console.error('Error creating GST company:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};


// exports.getCreditCardPayablesByPdId = async (req, res) => {
//   try {
//     const { pd_id, finance_bank_id } = req.query;
//     if (!pd_id) return res.status(400).json({ status: 'error', message: 'pd_id required' });

//     let sql = `
//       SELECT 
//         fcp.id,
//         fcp.pd_id,
//         fcp.cost_category_id,
//         fcp.due_date,
//         fcp.bill_date,
//         fcp.particulars,
//         fcp.amount_due,
//         fcp.finance_bank_id,
//         fbm.bank_name,
//         fcc.category_name
//       FROM finance_creditcard_payable fcp
//       LEFT JOIN finance_cost_category fcc ON fcp.cost_category_id = fcc.id
//       LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id
//       WHERE fcp.pd_id = ?
//     `;

//     const params = [pd_id];
//     if (finance_bank_id) {
//       sql += ` AND fcp.finance_bank_id = ?`;
//       params.push(finance_bank_id);
//     }

//     sql += ` ORDER BY fcp.due_date DESC, fcp.created_at DESC`;

//     const [rows] = await db.query(sql, params);

//     const overall = {
//       overall_amount_due: rows.reduce((sum, r) => sum + parseFloat(r.amount_due || 0), 0).toFixed(2)
//     };

//     res.status(200).json({
//       status: 'success',
//       data: [overall, ...rows]
//     });
//   } catch (error) {
//     console.error('Error in getCreditCardPayablesByPdId:', error);
//     res.status(500).json({ status: 'error', message: 'Server error' });
//   }
// };

// controllers/financeController.js

exports.getCreditCardPayablesByPdId = async (req, res) => {
  try {
    const { finance_bank_id } = req.query;

    if (!finance_bank_id) {
      return res.status(400).json({ status: 'error', message: 'finance_bank_id required' });
    }

    let sql = `
      SELECT 
        fcp.id,
        fcp.cost_category_id,
        fcp.due_date,
        fcp.bill_date,
        fcp.particulars,
        fcp.amount_due,
        fcp.finance_bank_id,
        fbm.bank_name,
        fcc.category_name
      FROM finance_creditcard_payable fcp
      LEFT JOIN finance_cost_category fcc ON fcp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id
      WHERE fcp.finance_bank_id = ?
      ORDER BY fcp.due_date DESC, fcp.created_at DESC
    `;

    const [rows] = await db.query(sql, [finance_bank_id]);

    const overall = {
      overall_amount_due: rows.reduce((sum, r) => sum + parseFloat(r.amount_due || 0), 0).toFixed(2)
    };

    res.status(200).json({
      status: 'success',
      data: [overall, ...rows]
    });
  } catch (error) {
    console.error('Error in getCreditCardPayablesByBank:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};



exports.createOrUpdateCreditCardPayable = async (req, res) => {
  try {
    const {
      id,
      cost_category_id,
      due_date,
      bill_date,
      particulars,
      amount_due,
      finance_bank_id,
      created_by = '1',
      updated_by = '1'
    } = req.body;

    if (!cost_category_id || !particulars || !amount_due || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields including Bank are required'
      });
    }

    const amountDueFloat = parseFloat(amount_due);
    if (isNaN(amountDueFloat) || amountDueFloat < 0) {
      return res.status(400).json({ status: 'error', message: 'Valid amount is required' });
    }

    if (id) {
      // UPDATE + Save History
      const [old] = await db.query('SELECT * FROM finance_creditcard_payable WHERE id = ?', [id]);
      if (old.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });

      await db.query(`
        INSERT INTO finance_creditcard_payable_edit_history 
        (finance_creditcard_payable_id, cost_category_id, due_date, bill_date, particulars, amount_due, finance_bank_id, changed_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, old[0].cost_category_id, old[0].due_date, old[0].bill_date, old[0].particulars, old[0].amount_due, old[0].finance_bank_id, updated_by]);

      await db.query(`
        UPDATE finance_creditcard_payable 
        SET cost_category_id=?, due_date=?, bill_date=?, particulars=?, amount_due=?, finance_bank_id=?, updated_by=?, updated_at=CURRENT_TIMESTAMP
        WHERE id=?
      `, [cost_category_id, due_date || null, bill_date || null, particulars.trim(), amountDueFloat, finance_bank_id, updated_by, id]);

      return res.status(200).json({ status: 'success', message: 'Updated' });
    } else {
      // CREATE – pd_id is NOT sent, so it will be NULL
      const [result] = await db.query(`
        INSERT INTO finance_creditcard_payable 
        (cost_category_id, due_date, bill_date, particulars, amount_due, finance_bank_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [cost_category_id, due_date || null, bill_date || null, particulars.trim(), amountDueFloat, finance_bank_id, created_by]);

      return res.status(201).json({ status: 'success', message: 'Created', data: { id: result.insertId } });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// controllers/financeController.js

exports.updateCreditCardPayable = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cost_category_id,
      due_date,
      bill_date,
      particulars,
      amount_due,
      finance_bank_id,
      updated_by = '1'
    } = req.body;

    if (!cost_category_id || !particulars || !amount_due || !finance_bank_id) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields including Bank are required'
      });
    }

    const amountDueFloat = parseFloat(amount_due);
    if (isNaN(amountDueFloat) || amountDueFloat < 0) {
      return res.status(400).json({ status: 'error', message: 'Valid amount required' });
    }

    // Fetch old record
    const [oldRows] = await db.query(
      'SELECT * FROM finance_creditcard_payable WHERE id = ?',
      [id]
    );

    if (oldRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const old = oldRows[0];

    // Save to history
    await db.query(`
      INSERT INTO finance_creditcard_payable_edit_history 
      (finance_creditcard_payable_id, pd_id, cost_category_id, due_date, bill_date, particulars, amount_due, finance_bank_id, changed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, old.pd_id, old.cost_category_id, old.due_date, old.bill_date,
      old.particulars, old.amount_due, old.finance_bank_id, updated_by
    ]);

    // Update main record
    await db.query(`
      UPDATE finance_creditcard_payable 
      SET 
        cost_category_id = ?, 
        due_date = ?, 
        bill_date = ?, 
        particulars = ?, 
        amount_due = ?, 
        finance_bank_id = ?, 
        updated_by = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      cost_category_id,
      due_date || null,
      bill_date || null,
      particulars.trim(),
      amountDueFloat,
      finance_bank_id,
      updated_by,
      id
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Credit card entry updated successfully'
    });

  } catch (error) {
    console.error('Error updating credit card payable:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Create or Update Other Payable (Upsert)
exports.createOrUpdateOtherPayable = async (req, res) => {
  try {
    const {
      payable_name,
      payable_amount = 0,
      created_by = '1',
      updated_by = '1'
    } = req.body;

    if (!payable_name || !payable_name.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'payable_name is required'
      });
    }

    const name = payable_name.trim();
    const amount = parseFloat(payable_amount) || 0;

    // Check if exists (case-insensitive unique name)
    const [existing] = await db.query(
      'SELECT id FROM finance_other_payables WHERE LOWER(payable_name) = LOWER(?)',
      [name]
    );

    if (existing.length > 0) {
      const recordId = existing[0].id;

      // Fetch old record for history
      const [oldRows] = await db.query('SELECT * FROM finance_other_payables WHERE id = ?', [recordId]);
      const old = oldRows[0];

      // Save to history
      await db.query(`
        INSERT INTO finance_other_payables_edit_history 
        (finance_other_payables_id, payable_name, payable_amount, changed_by)
        VALUES (?, ?, ?, ?)
      `, [recordId, old.payable_name, old.payable_amount, updated_by]);

      // Update main record
      await db.query(`
        UPDATE finance_other_payables 
        SET payable_amount = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [amount, updated_by, recordId]);

      return res.status(200).json({
        status: 'success',
        message: 'Other payable updated',
        data: { id: recordId, payable_name: name, payable_amount: amount }
      });
    } else {
      // Insert new
      const [result] = await db.query(`
        INSERT INTO finance_other_payables 
        (payable_name, payable_amount, created_by)
        VALUES (?, ?, ?)
      `, [name, amount, created_by]);

      return res.status(201).json({
        status: 'success',
        message: 'Other payable created',
        data: { id: result.insertId, payable_name: name, payable_amount: amount }
      });
    }
  } catch (error) {
    console.error('Error in createOrUpdateOtherPayable:', error);
    res.status(500).json({ status: 'error', message: 'Server error', error: error.message });
  }
};

// Get all Other Payables with overall total
exports.getOtherPayables = async (req, res) => {
  try {
    const sql = `
      SELECT 
        id,
        payable_name,
        payable_amount,
        created_at,
        created_by,
        updated_at,
        updated_by
      FROM finance_other_payables
      ORDER BY payable_name
    `;
    const [rows] = await db.query(sql);

    const overall = {
      overall_payable_amount: rows.reduce((sum, r) => sum + parseFloat(r.payable_amount || 0), 0).toFixed(2)
    };

    res.status(200).json({
      status: 'success',
      data: [overall, ...rows]
    });
  } catch (error) {
    console.error('Error in getOtherPayables:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Fetch overall payables summary (global sum across all projects and months)
exports.fetchOverallPayable = async (req, res) => {
  try {
    // Salary Balance (sum of all balances across all records)
    const salarySql = `
      SELECT COALESCE(SUM(balance), 0) as total_balance
      FROM finance_salary_payable
    `;
    const [salaryRows] = await db.query(salarySql);
    const salaryBalance = parseFloat(salaryRows[0].total_balance || 0);

    // Transport Balance (global)
    const transportSql = `
      SELECT COALESCE(SUM(balance_amount), 0) as overall_balance_amount
      FROM finance_transport_payable
    `;
    const [transportRows] = await db.query(transportSql);
    const transportBalance = parseFloat(transportRows[0].overall_balance_amount || 0);

    // Scaffolding Balance (global)
    const scaffoldingSql = `
      SELECT COALESCE(SUM(balance_amount), 0) as overall_balance_amount
      FROM finance_scaffolding_payable
    `;
    const [scaffRows] = await db.query(scaffoldingSql);
    const scaffoldingBalance = parseFloat(scaffRows[0].overall_balance_amount || 0);

    // Site Accommodation Balance (global)
    const accSql = `
      SELECT COALESCE(SUM(balance_due), 0) as overall_balance
      FROM finance_site_accomodation_payable
    `;
    const [accRows] = await db.query(accSql);
    const accommodationBalance = parseFloat(accRows[0].overall_balance || 0);

    // Commission Balance (global)
    const commSql = `
      SELECT COALESCE(SUM(balance_amount), 0) as overall_balance
      FROM finance_commission_payable
    `;
    const [commRows] = await db.query(commSql);
    const commissionBalance = parseFloat(commRows[0].overall_balance || 0);

    // TDS Payable Balance (global sum of all payable)
    const tdsSql = `
      SELECT COALESCE(SUM(payable), 0) as overall_payable
      FROM finance_tds_payable
    `;
    const [tdsRows] = await db.query(tdsSql);
    const tdsPayableBalance = parseFloat(tdsRows[0].overall_payable || 0);

    // GST Input Credit (global)
    const gstSql = `
      SELECT COALESCE(SUM(input_amount), 0) as overall_input_amount
      FROM finance_gst_payable
    `;
    const [gstRows] = await db.query(gstSql);
    const gstInputCredit = parseFloat(gstRows[0].overall_input_amount || 0);

    // Other Payables Total (global)
    const otherSql = `
      SELECT COALESCE(SUM(payable_amount), 0) as overall_payable_amount
      FROM finance_other_payables
    `;
    const [otherRows] = await db.query(otherSql);
    const otherPayablesTotal = parseFloat(otherRows[0].overall_payable_amount || 0);

    // Grand Total Payable (sum of all project-specific payables: salary + transport + scaffolding + accommodation + commission + tds)
    const totalPayable = salaryBalance + transportBalance + scaffoldingBalance + accommodationBalance + commissionBalance + tdsPayableBalance;

    const data = {
      salary_balance: parseFloat(salaryBalance.toFixed(2)),
      transport_balance: parseFloat(transportBalance.toFixed(2)),
      scaffolding_balance: parseFloat(scaffoldingBalance.toFixed(2)),
      accommodation_balance: parseFloat(accommodationBalance.toFixed(2)),
      commission_balance: parseFloat(commissionBalance.toFixed(2)),
      tds_payable_balance: parseFloat(tdsPayableBalance.toFixed(2)),
      gst_input_credit: parseFloat(gstInputCredit.toFixed(2)),
      other_payables_total: parseFloat(otherPayablesTotal.toFixed(2)),
      total_payable: parseFloat(totalPayable.toFixed(2))
    };

    res.status(200).json({
      status: 'success',
      message: 'Overall payables summary retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Error in fetchOverallPayable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.fetchOverallReceivable = async (req, res) => {
  try {
    // Billed Debtors Receivables Balance (global sum of all balances)
    const billedSql = `
      SELECT COALESCE(SUM(balance_amount), 0) as total_balance
      FROM finance_billed_debtors_receivables
    `;
    const [billedRows] = await db.query(billedSql);
    const billedDebtorsBalance = parseFloat(billedRows[0].total_balance || 0);

    // TDS Returnable (global sum of all returnable)
    const tdsSql = `
      SELECT COALESCE(SUM(returnable), 0) as total_returnable
      FROM finance_tds_payable
    `;
    const [tdsRows] = await db.query(tdsSql);
    const tdsReturnable = parseFloat(tdsRows[0].total_returnable || 0);

    const data = {
      billed_debtors_balance: parseFloat(billedDebtorsBalance.toFixed(2)),
      tds_returnable: parseFloat(tdsReturnable.toFixed(2))
    };

    res.status(200).json({
      status: 'success',
      message: 'Overall receivables summary retrieved successfully',
      data
    });
  } catch (error) {
    console.error('Error in fetchOverallReceivable:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



// Get all finance items for dropdown
exports.getItems = async (req, res) => {
  try {
    const sql = 'SELECT id, item_name FROM finance_items ORDER BY item_name';
    const [rows] = await db.query(sql);
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error in getItems:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

// Create new finance item (for "Add" in dropdown)
exports.createItem = async (req, res) => {
  try {
    const { item_name, created_by } = req.body;
    if (!item_name || !created_by) {
      return res.status(400).json({ status: 'error', message: 'item_name and created_by are required' });
    }
    const sql = 'INSERT INTO finance_items (item_name, created_by) VALUES (?, ?)';
    const [result] = await db.query(sql, [item_name, created_by]);
    res.status(201).json({
      status: 'success',
      message: 'Item created successfully',
      data: { id: result.insertId, item_name }
    });
  } catch (error) {
    console.error('Error in createItem:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

// Get all finance parties for dropdown
exports.getParties = async (req, res) => {
  try {
    const sql = 'SELECT id, party_name FROM finance_party ORDER BY party_name';
    const [rows] = await db.query(sql);
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error in getParties:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

// Create new finance party (for "Add" in dropdown)
exports.createParty = async (req, res) => {
  try {
    const { party_name, created_by } = req.body;
    if (!party_name || !created_by) {
      return res.status(400).json({ status: 'error', message: 'party_name and created_by are required' });
    }
    const sql = 'INSERT INTO finance_party (party_name) VALUES (?)';
    const [result] = await db.query(sql, [party_name]);
    res.status(201).json({
      status: 'success',
      message: 'Party created successfully',
      data: { id: result.insertId, party_name }
    });
  } catch (error) {
    console.error('Error in createParty:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

exports.getUoms = async (req, res) => {
  try {
    const sql = 'SELECT uom_id as id, uom_name as name FROM uom_master ORDER BY uom_name';
    const [rows] = await db.query(sql);
    res.status(200).json({
      status: 'success',
      data: rows  // Will return: [{id:1, name:'LIT'}, {id:2, name:'KGS'}, ...]
    });
  } catch (error) {
    console.error('Error in getUoms:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};
// Helper for UOM ID (unchanged)
const getUomIdByName = async (uomName) => {
  if (!uomName) return null;
  const sql = 'SELECT uom_id FROM uom_master WHERE uom_name = ?';
  const [rows] = await db.query(sql, [uomName]);
  return rows.length > 0 ? rows[0].uom_id : null;
};

exports.createBilledDebtors = async (req, res) => {
  try {
    const {
      finance_party_id,
      finance_bank_id, // NEW
      po_details,
      inv_no,
      bill_date,
      due_date,
      finance_item_id,
      quantity,
      uom,
      rate,
      sale_amount,
      gst_amount,
      total_payment_due,
      date_of_receipt,
      amount_received,
      expected_dates,
      created_by
    } = req.body;

    if (!finance_party_id || !finance_bank_id || !created_by) {
      return res.status(400).json({ status: 'error', message: 'Party, Bank and created_by are required' });
    }
    if (!total_payment_due || parseFloat(total_payment_due) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Total payment due must be positive' });
    }

    const parsedTotalDue = parseFloat(total_payment_due);
    const parsedReceived = parseFloat(amount_received) || 0;
    const balance = parsedTotalDue - parsedReceived;

    const sql = `
      INSERT INTO finance_billed_debtors_receivables (
        finance_party_id, finance_bank_id, po_details, inv_no, bill_date, due_date,
        finance_item_id, quantity, uom, rate, sale_amount, gst_amount,
        total_payment_due, date_of_receipt, amount_received, balance_amount, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      finance_party_id, finance_bank_id, po_details || null, inv_no || null,
      bill_date || null, due_date, finance_item_id || null,
      parseFloat(quantity) || 0, uom || null, parseFloat(rate) || 0,
      parseFloat(sale_amount) || 0, parseFloat(gst_amount) || 0,
      parsedTotalDue, date_of_receipt || null, parsedReceived > 0 ? parsedReceived : null,
      balance, created_by
    ];

    const [result] = await db.query(sql, params);
    const id = result.insertId;

    // Insert expected dates
    if (Array.isArray(expected_dates) && expected_dates.length > 0) {
      const expSql = `INSERT INTO finance_expected_date_of_receipt 
        (finance_billed_debtors_receivables_id, expected_from_date, expected_to_date, amount, created_by) 
        VALUES (?, ?, ?, ?, ?)`;
      for (const e of expected_dates) {
        if (e.expected_from_date && e.expected_to_date && e.amount) {
          await db.query(expSql, [id, e.expected_from_date, e.expected_to_date, parseFloat(e.amount), created_by]);
        }
      }
    }

    res.status(201).json({ status: 'success', message: 'Created successfully', data: { id } });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
// View all billed debtors receivables — NOW WORKS EVEN WITHOUT finance_uom TABLE
exports.viewBilledDebtors = async (req, res) => {
  try {
    const sql = `
      SELECT 
        fbdr.id,
        fp.party_name,
        fbm.bank_name,
        fbdr.finance_bank_id,
        fbdr.po_details,
        fbdr.inv_no,
        fbdr.bill_date,
        fbdr.due_date,
        fi.item_name,
        fbdr.quantity,
        fbdr.uom,                    -- Keep as ID (no join if table missing)
        fbdr.rate,
        fbdr.sale_amount,
        fbdr.gst_amount,
        fbdr.total_payment_due,
        fbdr.date_of_receipt,
        fbdr.amount_received,
        fbdr.balance_amount,
        fbdr.created_at,
        fbdr.created_by
      FROM finance_billed_debtors_receivables fbdr
      LEFT JOIN finance_party fp ON fbdr.finance_party_id = fp.id
      LEFT JOIN finance_bank_master fbm ON fbdr.finance_bank_id = fbm.id
      LEFT JOIN finance_items fi ON fbdr.finance_item_id = fi.id
      ORDER BY fbdr.created_at DESC
    `;

    const [rows] = await db.query(sql);

    // Fetch expected dates safely
    for (let row of rows) {
      try {
        const expSql = `
          SELECT expected_from_date, expected_to_date, amount
          FROM finance_expected_date_of_receipt
          WHERE finance_billed_debtors_receivables_id = ?
          ORDER BY expected_from_date ASC
        `;
        const [expRows] = await db.query(expSql, [row.id]);
        row.expected_dates = expRows || [];
      } catch (expErr) {
        console.warn(`Expected dates not found for ID ${row.id}`);
        row.expected_dates = [];
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Billed debtors receivables retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in viewBilledDebtors:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: error.message
    });
  }
};  

// financeController.js
exports.updateBilledDebtors = async (req, res) => {
  try {
    const {
      id, // Now coming from body
      finance_bank_id,
      po_details, inv_no, bill_date, due_date, finance_item_id,
      quantity, uom, rate, sale_amount, gst_amount, total_payment_due,
      date_of_receipt, amount_received, expected_dates = [], updated_by = 1
    } = req.body;

    if (!id) {
      return res.status(400).json({ status: 'error', message: 'ID is required in request body' });
    }

    // Check if record exists
    const [current] = await db.query('SELECT * FROM finance_billed_debtors_receivables WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const old = current[0];

    // Save edit history
    await db.query(`
      INSERT INTO finance_billed_debtors_receivables_edit_history 
      (finance_billed_debtors_receivables_id, finance_party_id, finance_bank_id, po_details, inv_no, bill_date, due_date,
       finance_item_id, quantity, uom, rate, sale_amount, gst_amount, total_payment_due,
       date_of_receipt, amount_received, balance_amount, created_at, created_by, changed_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, old.finance_party_id, old.finance_bank_id, old.po_details, old.inv_no,
      old.bill_date, old.due_date, old.finance_item_id, old.quantity,
      old.uom, old.rate, old.sale_amount, old.gst_amount,
      old.total_payment_due, old.date_of_receipt, old.amount_received,
      old.balance_amount, old.created_at, old.created_by, updated_by
    ]);

    const balance_amount = parseFloat(total_payment_due || 0) - parseFloat(amount_received || 0);

    // Update main record
    await db.query(`
      UPDATE finance_billed_debtors_receivables SET
        finance_bank_id = ?, po_details = ?, inv_no = ?, bill_date = ?, due_date = ?,
        finance_item_id = ?, quantity = ?, uom = ?, rate = ?, sale_amount = ?,
        gst_amount = ?, total_payment_due = ?, date_of_receipt = ?, amount_received = ?,
        balance_amount = ?, updated_by = ?, updated_at = NOW()
      WHERE id = ?
    `, [
      finance_bank_id || null,
      po_details || null,
      inv_no || null,
      bill_date || null,
      due_date || null,
      finance_item_id || null,
      quantity ? parseFloat(quantity) : 0,
      uom || null,
      rate ? parseFloat(rate) : 0,
      sale_amount ? parseFloat(sale_amount) : 0,
      gst_amount ? parseFloat(gst_amount) : 0,
      parseFloat(total_payment_due) || 0,
      date_of_receipt || null,
      amount_received ? parseFloat(amount_received) : null,
      balance_amount,
      updated_by,
      id
    ]);

    // Delete old expected dates
    await db.query('DELETE FROM finance_expected_date_of_receipt WHERE finance_billed_debtors_receivables_id = ?', [id]);

    // Insert new expected dates
    if (Array.isArray(expected_dates) && expected_dates.length > 0) {
      const validDates = expected_dates.filter(e =>
        e.expected_from_date && e.expected_to_date && e.amount && parseFloat(e.amount) > 0
      );

      if (validDates.length > 0) {
        const values = validDates.map(e => [
          id,
          e.expected_from_date,
          e.expected_to_date,
          parseFloat(e.amount),
          updated_by
        ]);

        await db.query(`
          INSERT INTO finance_expected_date_of_receipt 
          (finance_billed_debtors_receivables_id, expected_from_date, expected_to_date, amount, updated_by)
          VALUES ?
        `, [values]);
      }
    }

    res.json({ status: 'success', message: 'Updated successfully' });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
};

// Get all banks with opening_balance
exports.getBankMasters = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id, 
        bank_name, 
        opening_balance,           -- NEW: Use opening_balance
        available_balance,         -- Keep for backward compatibility if needed
        remarks, 
        created_at, 
        created_by, 
        updated_at, 
        updated_by 
      FROM finance_bank_master 
      ORDER BY bank_name
    `);
    res.status(200).json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error in getBankMasters:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// CREATE bank
exports.createBankMaster = async (req, res) => {
  try {
    const { bank_name, available_balance = 0, remarks, created_by } = req.body;

    if (!bank_name?.trim() || !created_by) {
      return res.status(400).json({ status: 'error', message: 'bank_name and created_by are required' });
    }

    // If balance > 0, remarks required
    const balance = parseFloat(available_balance) || 0;
    if (balance > 0 && !remarks?.trim()) {
      return res.status(400).json({ status: 'error', message: 'Remarks is required when adding balance' });
    }

    const [result] = await db.query(
      `INSERT INTO finance_bank_master 
       (bank_name, available_balance, remarks, created_by) 
       VALUES (?, ?, ?, ?)`,
      [bank_name.trim(), balance, remarks?.trim() || null, created_by]
    );

    res.status(201).json({
      status: 'success',
      message: 'Bank created successfully',
      data: { id: result.insertId, bank_name: bank_name.trim() }
    });
  } catch (error) {
    console.error('Error in createBankMaster:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: 'error', message: 'Bank name already exists' });
    }
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Updated updateBankMaster - ADD new amount to existing opening_balance + log history
exports.updateBankMaster = async (req, res) => {
  try {
    const { id } = req.query;
    const { bank_name, opening_balance, remarks, updated_by } = req.body;

    if (!id) return res.status(400).json({ status: 'error', message: 'id is required' });
    if (!bank_name?.trim() || !updated_by) {
      return res.status(400).json({ status: 'error', message: 'bank_name and updated_by are required' });
    }

    // Fetch current record
    const [current] = await db.query(
      `SELECT bank_name, opening_balance, remarks FROM finance_bank_master WHERE id = ?`,
      [id]
    );

    if (current.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Bank not found' });
    }

    const oldData = current[0];
    const oldOpening = parseFloat(oldData.opening_balance) || 0;
    const addedAmount = parseFloat(opening_balance) || 0;

    // NEW LOGIC: ADD the entered amount to existing opening_balance
    const newOpeningBalance = oldOpening + addedAmount;

    // Remarks required if amount is being added or bank name changed
    if ((addedAmount !== 0 || editForm.bank_name.trim() !== oldData.bank_name.trim()) && !remarks?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Remarks is required when adding to opening balance or changing bank name'
      });
    }

    // Log to history (before update)
    await db.query(`
      INSERT INTO finance_bank_master_edit_history 
      (finance_bank_master_id, bank_name, opening_balance, available_balance, remarks, created_by, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      oldData.bank_name,
      oldOpening,
      newOpeningBalance,                    // new total after addition
      remarks?.trim() || `Added ₹${addedAmount.toFixed(2)} to opening balance`,
      oldData.created_by || updated_by,
      updated_by
    ]);

    // Update main table - ADD to existing opening_balance
    const [result] = await db.query(
      `UPDATE finance_bank_master 
       SET bank_name = ?, 
           opening_balance = ?, 
           remarks = ?, 
           updated_by = ?, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        bank_name.trim(), 
        newOpeningBalance,           // Final summed value
        remarks?.trim() || null, 
        updated_by, 
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Bank not found' });
    }

    res.status(200).json({ 
      status: 'success', 
      message: `Opening balance updated successfully. Added ₹${addedAmount.toFixed(2)} (New Total: ₹${newOpeningBalance.toFixed(2)})` 
    });

  } catch (error) {
    console.error('Error in updateBankMaster:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ status: 'error', message: 'Bank name already exists' });
    }
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// financeController.js → Final CFS Data with Commission Payable Added
exports.fetchCFSdata = async (req, res) => {
  try {
    // ────── 1. SALARY PAYABLE ──────
    const salarySql = `
      SELECT 
        fsp.id,
        fsp.emp_id,
        em.full_name AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        fsp.entry_date,
        fsp.paid_amount,
        fsp.balance AS balance_amount,
        fsp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fsp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email,
        fsp.created_at
      FROM finance_salary_payable fsp
      INNER JOIN employee_master em ON fsp.emp_id = em.emp_id
      LEFT JOIN project_details pd ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fsp.created_by = u.user_id
      ORDER BY fsp.entry_date DESC
    `;

    // ────── 2. TRANSPORT PAYABLE ──────
    const transportSql = `
      SELECT 
        ftp.id,
        ftp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        ftp.cost_category_id,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        ftp.description,
        ftp.paid_amount,
        ftp.balance_amount,
        ftp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        ftp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email,
        ftp.created_at
      FROM finance_transport_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON ftp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      ORDER BY ftp.created_at DESC
    `;

    // ────── 3. SCAFFOLDING PAYABLE ──────
    const scaffoldingSql = `
      SELECT 
        fsp.id,
        fsp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        fsp.cost_category_id,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        fsp.paid_amount,
        fsp.balance_amount,
        fsp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fsp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email,
        fsp.created_at
      FROM finance_scaffolding_payable fsp
      LEFT JOIN project_details pd ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON fsp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fsp.created_by = u.user_id
      ORDER BY fsp.created_at DESC
    `;

    // ────── 4. SITE ACCOMMODATION PAYABLE ──────
    const siteAccommodationSql = `
      SELECT 
        sap.id,
        sap.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        sap.finance_creditors_client_id,
        COALESCE(fcc.client_name, '—') AS creditor_client_name,
        sap.advance_amount,
        sap.due_date,
        sap.due_period,
        sap.due_amount,
        sap.payment AS paid_amount,
        sap.payment_date,
        sap.balance_due AS balance_amount,
        sap.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        sap.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email,
        sap.created_at
      FROM finance_site_accomodation_payable sap
      LEFT JOIN project_details pd ON sap.pd_id = pd.pd_id
      LEFT JOIN finance_creditors_client fcc ON sap.finance_creditors_client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON sap.finance_bank_id = fbm.id
      LEFT JOIN users u ON sap.created_by = u.user_id
      ORDER BY sap.created_at DESC
    `;

    // ────── 5. COMMISSION PAYABLE (NEW & PERFECT) ──────
    const commissionSql = `
      SELECT 
        fcp.id,
        fcp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        fcp.cost_category_id,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        fcp.marketing_person_id,
        COALESCE(fmp.person_name, '—') AS marketing_person_name,
        fcp.commission_amount_due,
        fcp.date_of_payment,
        fcp.paid_amount,
        fcp.balance_amount,
        fcp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fcp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email,
        fcp.created_at
      FROM finance_commission_payable fcp
      LEFT JOIN project_details pd ON fcp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON fcp.cost_category_id = fcc.id
      LEFT JOIN finance_marketing_persons fmp ON fcp.marketing_person_id = fmp.id
      LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fcp.created_by = u.user_id
      ORDER BY fcp.date_of_payment DESC, fcp.id DESC
    `;



    const gstSql = `
      SELECT 
        fgp.id,
        fgp.finance_gst_company_id,
        COALESCE(fgc.company_name, '—') AS company_name,
        fgp.month,
        fgp.entry_type_id,
        COALESCE(fget.type_name, '—') AS type_name,
        fgp.input_amount,
        fgp.output_amount,
        (fgp.input_amount - fgp.output_amount) AS net_gst_payable,
        fgp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fgp.created_at,
        fgp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_gst_payable fgp
      LEFT JOIN finance_gst_company fgc ON fgp.finance_gst_company_id = fgc.id
      LEFT JOIN finance_gst_entry_type fget ON fgp.entry_type_id = fget.id
      LEFT JOIN finance_bank_master fbm ON fgp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fgp.created_by = u.user_id
      ORDER BY fgp.month DESC, fgp.created_at DESC
    `;



    const tdsSql = `
      SELECT 
        ftp.id,
        ftp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        ftp.month,
        ftp.payable,
        ftp.returnable,
        ftp.non_returnable,
        (ftp.payable - COALESCE(ftp.returnable, 0)) AS net_tds_due,
        ftp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        ftp.created_at,
        ftp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_tds_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      ORDER BY ftp.month DESC, ftp.created_at DESC
    `;



    const creditCardSql = `
      SELECT 
        fcc.id,
        fcc.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        fcc.cost_category_id,
        COALESCE(fcat.category_name, '—') AS cost_category_name,
        fcc.due_date,
        fcc.bill_date,
        fcc.particulars,
        fcc.amount_due,
        fcc.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fcc.created_at,
        fcc.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_creditcard_payable fcc
      LEFT JOIN project_details pd ON fcc.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcat ON fcc.cost_category_id = fcat.id
      LEFT JOIN finance_bank_master fbm ON fcc.finance_bank_id = fbm.id
      LEFT JOIN users u ON fcc.created_by = u.user_id
      ORDER BY fcc.due_date ASC, fcc.created_at DESC
    `;


    const debtorsSql = `
      SELECT 
        fbdr.id,
        fbdr.finance_party_id,
        COALESCE(fp.party_name, '—') AS party_name,
        fbdr.inv_no,
        fbdr.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fbdr.date_of_receipt,
        fbdr.amount_received,
        fbdr.balance_amount,
        fbdr.created_at,
        fbdr.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_billed_debtors_receivables fbdr
      LEFT JOIN finance_party fp ON fbdr.finance_party_id = fp.id
      LEFT JOIN finance_bank_master fbm ON fbdr.finance_bank_id = fbm.id
      LEFT JOIN users u ON fbdr.created_by = u.user_id
      WHERE fbdr.balance_amount > 0  -- Only show pending receivables
      ORDER BY fbdr.due_date ASC, fbdr.created_at DESC
    `;

    const tdsReturnableSql = `
      SELECT 
        ftp.id,
        ftp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        ftp.month,
        ftp.returnable,
        ftp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        ftp.created_at,
        ftp.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_tds_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      WHERE ftp.returnable > 0
      ORDER BY ftp.month DESC, ftp.created_at DESC
    `;


    const creditorsSql = `
      SELECT 
        fc.id,
        fc.client_id,
        COALESCE(fcc.client_name, '—') AS client_name,
        fc.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fc.inv_number,
        fc.amount_paid,
        fc.date_of_payment,
        fc.remarks,
        fc.is_gst,
        CASE 
          WHEN fc.is_gst = 1 THEN 'GST'
          ELSE 'Others'
        END AS payable_type,
        fc.balance_amount,
        fc.created_at,
        fc.created_by AS created_by_id,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        COALESCE(u.user_email, '-') AS created_by_email
      FROM finance_creditors fc
      LEFT JOIN finance_creditors_client fcc ON fc.client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fc.finance_bank_id = fbm.id
      LEFT JOIN users u ON fc.created_by = u.user_id
      WHERE fc.balance_amount > 0
      ORDER BY fc.due_date ASC, fc.created_at DESC
    `;
    
// ────── EXECUTE ALL QUERIES ──────
    const [
      [salaryRows],
      [transportRows],
      [scaffoldingRows],
      [siteAccommodationRows],
      [commissionRows],
      [gstRows],
      [tdsRows],
      [tdsReturnableRows],
      [creditCardRows],
      [debtorsRows],
      [creditorsRows]
    ] = await Promise.all([
      db.query(salarySql),
      db.query(transportSql),
      db.query(scaffoldingSql),
      db.query(siteAccommodationSql),
      db.query(commissionSql),
      db.query(gstSql),
      db.query(tdsSql),
      db.query(tdsReturnableSql),
      db.query(creditCardSql),
      db.query(debtorsSql),
      db.query(creditorsSql)
    ]);
    // ────── TOTAL PAID (Money we have already paid out) ──────
 const totalPaid = 
      salaryRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      transportRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      scaffoldingRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      siteAccommodationRows.reduce((s, r) => s + (parseFloat(r.payment || r.paid_amount) || 0), 0) +
      commissionRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      gstRows.reduce((s, r) => s + (parseFloat(r.output_amount) || 0), 0) +
      tdsRows.reduce((s, r) => s + (parseFloat(r.returnable) || 0), 0) +
      creditCardRows.reduce(() => 0, 0) +
      creditorsRows.reduce((s, r) => s + (parseFloat(r.amount_paid) || 0), 0) +
      debtorsRows.reduce((s, r) => s + (parseFloat(r.amount_received) || 0), 0);

    // ────── TOTAL PAYABLE BALANCE (Updated with Creditors) ──────
    const totalPayableBalance = 
      salaryRows.reduce((s, r) => s + (parseFloat(r.balance_amount || r.balance) || 0), 0) +
      transportRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      scaffoldingRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      siteAccommodationRows.reduce((s, r) => s + (parseFloat(r.balance_due || r.balance_amount) || 0), 0) +
      commissionRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      gstRows.reduce((s, r) => s + (parseFloat(r.net_gst_payable) || 0), 0) +
      tdsRows.reduce((s, r) => s + (parseFloat(r.net_tds_due) || 0), 0) +
      creditCardRows.reduce((s, r) => s + (parseFloat(r.amount_due) || 0), 0) +
      creditorsRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0);  // ← NEW

    // ────── TOTAL RECEIVABLE BALANCE ──────
    const totalReceivableBalance = 
      debtorsRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      tdsReturnableRows.reduce((s, r) => s + (parseFloat(r.returnable) || 0), 0);

    // ────── OVERALL SUMMARY ──────
    const overall = {
      overall_paid: totalPaid.toFixed(2),
      overall_payable_balance: totalPayableBalance.toFixed(2),
      overall_receivable_balance: totalReceivableBalance.toFixed(2),
      net_cash_position: (totalReceivableBalance - totalPayableBalance).toFixed(2)
    };

      // ────── FINAL RESPONSE – ORGANIZED AS PER YOUR REQUIREMENT ──────
    res.status(200).json({
      // ────── 1. CREDITORS FIRST (Most Important Payable) ──────
      creditors_payable_data: creditorsRows,

      // ────── 2. ALL OTHER PAYABLES (In logical order) ──────
      salary_payable_data: salaryRows,
      transport_payable_data: transportRows,
      scaffolding_payable_data: scaffoldingRows,
      site_accommodation_payable_data: siteAccommodationRows,
      commission_payable_data: commissionRows,
      gst_payable_data: gstRows,
      tds_payable_data: tdsRows,
      creditcard_payable_data: creditCardRows,

      // ────── 3. RECEIVABLES – LAST (As Requested) ──────
      tds_returnable_receivable_data: tdsReturnableRows,     // Refundable TDS from Govt
      billed_debtors_receivable_data: debtorsRows,           // Client Dues

      // ────── OVERALL SUMMARY (Always at the end) ──────
      overall
    });

  } catch (error) {
    console.error('Error in fetchCFSdata:', error);
    res.status(500).json({
      salary_payable_data: [],
      transport_payable_data: [],
      scaffolding_payable_data: [],
      site_accommodation_payable_data: [],
      commission_payable_data: [],
      gst_payable_data: [],
      tds_payable_data: [],
      tds_returnable_receivable_data: [],
      creditcard_payable_data: [],
      billed_debtors_receivable_data: [],
      creditors_payable_data: [],
      overall: {
        overall_paid: "0.00",
        overall_payable_balance: "0.00",
        overall_receivable_balance: "0.00",
        net_cash_position: "0.00"
      }
    });
  }
};





// financeController.js → Final CPE Data (Clean, No IDs Exposed)
exports.fetchCPEdata = async (req, res) => {
  try {
    // ────── 1. SALARY PAYABLE ──────
    const salarySql = `
      SELECT 
        em.full_name AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        fsp.entry_date,
        fsp.paid_amount,
        fsp.balance AS balance_amount,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fsp.created_at
      FROM finance_salary_payable fsp
      INNER JOIN employee_master em ON fsp.emp_id = em.emp_id
      LEFT JOIN project_details pd ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fsp.created_by = u.user_id
      ORDER BY fsp.entry_date DESC
    `;

    // ────── 2. TRANSPORT PAYABLE ──────
    const transportSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        ftp.description,
        ftp.paid_amount,
        ftp.balance_amount,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        ftp.created_at
      FROM finance_transport_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON ftp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      ORDER BY ftp.created_at DESC
    `;

    // ────── 3. SCAFFOLDING PAYABLE ──────
    const scaffoldingSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        fsp.paid_amount,
        fsp.balance_amount,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fsp.created_at
      FROM finance_scaffolding_payable fsp
      LEFT JOIN project_details pd ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON fsp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fsp.created_by = u.user_id
      ORDER BY fsp.created_at DESC
    `;

    // ────── 4. SITE ACCOMMODATION PAYABLE ──────
    const siteAccommodationSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        COALESCE(fcc.client_name, '—') AS creditor_client_name,
        sap.advance_amount,
        sap.due_date,
        sap.due_period,
        sap.due_amount,
        sap.payment AS paid_amount,
        sap.payment_date,
        sap.balance_due AS balance_amount,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        sap.created_at
      FROM finance_site_accomodation_payable sap
      LEFT JOIN project_details pd ON sap.pd_id = pd.pd_id
      LEFT JOIN finance_creditors_client fcc ON sap.finance_creditors_client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON sap.finance_bank_id = fbm.id
      LEFT JOIN users u ON sap.created_by = u.user_id
      ORDER BY sap.created_at DESC
    `;

    // ────── 5. COMMISSION PAYABLE ──────
    const commissionSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        COALESCE(fcc.category_name, '—') AS cost_category_name,
        COALESCE(fmp.person_name, '—') AS marketing_person_name,
        fcp.commission_amount_due,
        fcp.date_of_payment,
        fcp.paid_amount,
        fcp.balance_amount,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fcp.created_at
      FROM finance_commission_payable fcp
      LEFT JOIN project_details pd ON fcp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON fcp.cost_category_id = fcc.id
      LEFT JOIN finance_marketing_persons fmp ON fcp.marketing_person_id = fmp.id
      LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fcp.created_by = u.user_id
      ORDER BY fcp.date_of_payment DESC, fcp.created_at DESC
    `;

    // ────── 6. GST PAYABLE ──────
    const gstSql = `
      SELECT 
        COALESCE(fgc.company_name, '—') AS company_name,
        fgp.month,
        COALESCE(fget.type_name, '—') AS type_name,
        fgp.input_amount,
        fgp.output_amount,
        (fgp.input_amount - fgp.output_amount) AS net_gst_payable,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fgp.created_at
      FROM finance_gst_payable fgp
      LEFT JOIN finance_gst_company fgc ON fgp.finance_gst_company_id = fgc.id
      LEFT JOIN finance_gst_entry_type fget ON fgp.entry_type_id = fget.id
      LEFT JOIN finance_bank_master fbm ON fgp.finance_bank_id = fbm.id
      LEFT JOIN users u ON fgp.created_by = u.user_id
      ORDER BY fgp.month DESC
    `;

    // ────── 7. TDS PAYABLE ──────
    const tdsSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        ftp.month,
        ftp.payable,
        ftp.returnable,
        ftp.non_returnable,
        (ftp.payable - COALESCE(ftp.returnable, 0)) AS net_tds_due,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        ftp.created_at
      FROM finance_tds_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      ORDER BY ftp.month DESC
    `;

    // ────── 8. CREDIT CARD PAYABLE ──────
    const creditCardSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        COALESCE(fcat.category_name, '—') AS cost_category_name,
        fcc.due_date,
        fcc.bill_date,
        fcc.particulars,
        fcc.amount_due,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fcc.created_at
      FROM finance_creditcard_payable fcc
      LEFT JOIN project_details pd ON fcc.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcat ON fcc.cost_category_id = fcat.id
      LEFT JOIN finance_bank_master fbm ON fcc.finance_bank_id = fbm.id
      LEFT JOIN users u ON fcc.created_by = u.user_id
      ORDER BY fcc.due_date ASC
    `;

    // ────── 9. BILLED DEBTORS (RECEIVABLES) ──────
    const debtorsSql = `
      SELECT 
        COALESCE(fp.party_name, '—') AS party_name,
        fbdr.inv_no,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fbdr.date_of_receipt,
        fbdr.amount_received,
        fbdr.balance_amount,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fbdr.created_at
      FROM finance_billed_debtors_receivables fbdr
      LEFT JOIN finance_party fp ON fbdr.finance_party_id = fp.id
      LEFT JOIN finance_bank_master fbm ON fbdr.finance_bank_id = fbm.id
      LEFT JOIN users u ON fbdr.created_by = u.user_id
      WHERE fbdr.balance_amount > 0
      ORDER BY fbdr.due_date ASC, fbdr.created_at DESC
    `;

    // ────── 10. TDS RETURNABLE (RECEIVABLE FROM GOVT) ──────
    const tdsReturnableSql = `
      SELECT 
        COALESCE(pd.project_name, '—') AS project_name,
        ftp.month,
        ftp.returnable,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        ftp.created_at
      FROM finance_tds_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      LEFT JOIN users u ON ftp.created_by = u.user_id
      WHERE ftp.returnable > 0
      ORDER BY ftp.month DESC
    `;

    // ────── 11. CREDITORS PAYABLE (MOST IMPORTANT) ──────
    const creditorsSql = `
      SELECT 
        COALESCE(fcc.client_name, '—') AS client_name,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fc.inv_number,
        fc.amount_paid,
        fc.date_of_payment,
        fc.remarks,
        CASE WHEN fc.is_gst = 1 THEN 'GST' ELSE 'Others' END AS payable_type,
        fc.balance_amount,
        COALESCE(u.user_name, 'Unknown User') AS created_by_name,
        fc.created_at
      FROM finance_creditors fc
      LEFT JOIN finance_creditors_client fcc ON fc.client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fc.finance_bank_id = fbm.id
      LEFT JOIN users u ON fc.created_by = u.user_id
      WHERE fc.balance_amount > 0
      ORDER BY fc.due_date ASC, fc.created_at DESC
    `;

    // ────── EXECUTE ALL QUERIES IN PARALLEL ──────
    const [
      [salaryRows],
      [transportRows],
      [scaffoldingRows],
      [siteAccommodationRows],
      [commissionRows],
      [gstRows],
      [tdsRows],
      [tdsReturnableRows],
      [creditCardRows],
      [debtorsRows],
      [creditorsRows]
    ] = await Promise.all([
      db.query(salarySql),
      db.query(transportSql),
      db.query(scaffoldingSql),
      db.query(siteAccommodationSql),
      db.query(commissionSql),
      db.query(gstSql),
      db.query(tdsSql),
      db.query(tdsReturnableSql),
      db.query(creditCardSql),
      db.query(debtorsSql),
      db.query(creditorsSql)
    ]);

    // ────── CALCULATE TOTALS (No IDs involved) ──────
    const totalPaid = 
      salaryRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      transportRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      scaffoldingRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      siteAccommodationRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      commissionRows.reduce((s, r) => s + (parseFloat(r.paid_amount) || 0), 0) +
      gstRows.reduce((s, r) => s + (parseFloat(r.output_amount) || 0), 0) +
      tdsRows.reduce((s, r) => s + (parseFloat(r.returnable) || 0), 0) +
      creditorsRows.reduce((s, r) => s + (parseFloat(r.amount_paid) || 0), 0) +
      debtorsRows.reduce((s, r) => s + (parseFloat(r.amount_received) || 0), 0);

    const totalPayableBalance = 
      salaryRows.reduce((s, r) => s + (parseFloat(r.balance_amount || r.balance) || 0), 0) +
      transportRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      scaffoldingRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      siteAccommodationRows.reduce((s, r) => s + (parseFloat(r.balance_due || r.balance_amount) || 0), 0) +
      commissionRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      gstRows.reduce((s, r) => s + (parseFloat(r.net_gst_payable) || 0), 0) +
      tdsRows.reduce((s, r) => s + (parseFloat(r.net_tds_due) || 0), 0) +
      creditCardRows.reduce((s, r) => s + (parseFloat(r.amount_due) || 0), 0) +
      creditorsRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0);

    const totalReceivableBalance = 
      debtorsRows.reduce((s, r) => s + (parseFloat(r.balance_amount) || 0), 0) +
      tdsReturnableRows.reduce((s, r) => s + (parseFloat(r.returnable) || 0), 0);

    const overall = {
      overall_paid: totalPaid.toFixed(2),
      overall_payable_balance: totalPayableBalance.toFixed(2),
      overall_receivable_balance: totalReceivableBalance.toFixed(2),
      net_cash_position: (totalReceivableBalance - totalPayableBalance).toFixed(2)
    };

    // ────── FINAL CLEAN RESPONSE (No IDs Exposed) ──────
    res.status(200).json({
      creditors_payable_data: creditorsRows,

      salary_payable_data: salaryRows,
      transport_payable_data: transportRows,
      scaffolding_payable_data: scaffoldingRows,
      site_accommodation_payable_data: siteAccommodationRows,
      commission_payable_data: commissionRows,
      gst_payable_data: gstRows,
      tds_payable_data: tdsRows,
      creditcard_payable_data: creditCardRows,

      tds_returnable_receivable_data: tdsReturnableRows,
      billed_debtors_receivable_data: debtorsRows,

      overall
    });

  } catch (error) {
    console.error('Error in fetchCPEdata:', error);
    res.status(500).json({
      creditors_payable_data: [],
      salary_payable_data: [],
      transport_payable_data: [],
      scaffolding_payable_data: [],
      site_accommodation_payable_data: [],
      commission_payable_data: [],
      gst_payable_data: [],
      tds_payable_data: [],
      creditcard_payable_data: [],
      tds_returnable_receivable_data: [],
      billed_debtors_receivable_data: [],
      overall: {
        overall_paid: "0.00",
        overall_payable_balance: "0.00",
        overall_receivable_balance: "0.00",
        net_cash_position: "0.00"
      }
    });
  }
};









// ─── CUSTOM / OTHER PAYMENT ───────────────────────────────────────────────


exports.createCustomCategory = async (req, res) => {
  try {
    const { category_name, created_by } = req.body;
    if (!category_name?.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'category_name is required'
      });
    }

    const trimmedName = category_name.trim();

    const [exists] = await db.query(
      `SELECT 1 FROM finance_custom_payment_category_master 
       WHERE LOWER(category_name) = LOWER(?) LIMIT 1`,
      [trimmedName]
    );

    if (exists.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: 'Category name already exists'
      });
    }

    const [result] = await db.query(`
      INSERT INTO finance_custom_payment_category_master
      (category_name, created_by, created_at)
      VALUES (?, ?, NOW())
    `, [trimmedName, created_by || null]);

    res.status(201).json({
      status: 'success',
      message: 'Custom category created successfully',
      data: {
        id: result.insertId,
        category_name: trimmedName
      }
    });
  } catch (error) {
    console.error('Error in createCustomCategory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create custom category',
      error: error.message
    });
  }
};
// Create multiple payment records (repeat main fields for each transaction)
exports.createCustomPayment = async (req, res) => {
  try {
    const {
      category_id,
      payment_type_id,
      date,
      amount,
      remarks,
      created_by,
      paymentLines = []
    } = req.body;

    if (!category_id) return res.status(400).json({ status: 'error', message: 'category_id is required' });
    if (!payment_type_id) return res.status(400).json({ status: 'error', message: 'payment_type_id is required' });
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid main amount is required' });
    }
    if (!created_by) return res.status(400).json({ status: 'error', message: 'created_by is required' });
    if (paymentLines.length === 0) {
      return res.status(400).json({ status: 'error', message: 'At least one payment line is required' });
    }

    const mainAmount = parseFloat(amount);
    let totalPaidReceived = 0;

    for (const line of paymentLines) {
      const amt = parseFloat(line.paid_receive_amount);
      if (amt > 0) totalPaidReceived += amt;
    }

    if (totalPaidReceived > mainAmount) {
      return res.status(400).json({
        status: 'error',
        message: `Total Paid/Received (${totalPaidReceived}) cannot exceed main amount (${mainAmount})`
      });
    }

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const insertedIds = [];

      for (const line of paymentLines) {
        const paidAmt = parseFloat(line.paid_receive_amount);
        if (!paidAmt || paidAmt <= 0) continue;

        const sql = `
          INSERT INTO finance_custom_payment_categories
          (category_id, payment_type_id, date, amount, paid_receive_amount, 
           paid_receive_date, receipt, bank_id, remarks, created_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const [result] = await connection.query(sql, [
          category_id,
          payment_type_id,
          date ? date.split('T')[0] : null,
          mainAmount,
          paidAmt,
          line.paid_receive_date ? line.paid_receive_date.split('T')[0] : null,
          line.receipt?.trim() || null,
          line.bank_id ? parseInt(line.bank_id) : null,
          remarks?.trim() || null,
          created_by
        ]);

        insertedIds.push(result.insertId);
      }

      await connection.commit();

      res.status(201).json({
        status: 'success',
        message: `${insertedIds.length} transaction(s) created successfully`,
        data: { ids: insertedIds, count: insertedIds.length }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error in createCustomPayment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create payment records',
      error: error.message
    });
  }
};

// Get payments by category with transaction count
exports.getCustomPaymentsByCategory = async (req, res) => {
  try {
    const { category_name } = req.query;

    if (!category_name?.trim()) {
      return res.status(400).json({ status: 'error', message: 'category_name is required' });
    }

    const [rows] = await db.query(`
      SELECT 
        c.id,
        cm.id AS category_id,
        cm.category_name,
        c.payment_type_id,
        pt.type_name AS payment_type,
        c.date,
        c.amount,
        c.paid_receive_amount,
        c.paid_receive_date,
        c.receipt,
        c.cash,
        c.bank_id,
        b.bank_name,
        c.remarks,
        c.created_at,
        c.created_by,
        c.updated_at,
        c.updated_by,
        (SELECT COUNT(*) FROM finance_custom_payment_categories c2 
         WHERE c2.category_id = c.category_id 
           AND c2.payment_type_id = c.payment_type_id 
           AND c2.date = c.date 
           AND c2.amount = c.amount) as transaction_count
      FROM finance_custom_payment_categories c
      JOIN finance_custom_payment_category_master cm ON c.category_id = cm.id
      LEFT JOIN finance_custom_payment_type pt ON c.payment_type_id = pt.id
      LEFT JOIN finance_bank_master b ON c.bank_id = b.id
      WHERE cm.category_name = ?
      ORDER BY c.created_at DESC, c.id DESC
    `, [category_name.trim()]);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Records fetched successfully' : 'No records found for this category',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error in getCustomPaymentsByCategory:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch records', error: error.message });
  }
};
// Update existing custom payment record
exports.updateCustomPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      payment_type_id,
      date,
      amount,
      remarks,
      updated_by,
      paymentLines = [],   // New or updated lines
      edit_reason = 'Updated from frontend'
    } = req.body;

    if (!id || !updated_by) {
      return res.status(400).json({ status: 'error', message: 'id and updated_by are required' });
    }

    // Fetch current main record
    const [currentRows] = await db.query('SELECT * FROM finance_custom_payment_categories WHERE id = ?', [id]);
    if (currentRows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    const current = currentRows[0];
    const mainAmount = parseFloat(amount || current.amount);

    // Validate total paid/received if new lines are provided
    let totalPaidReceived = 0;
    for (const line of paymentLines) {
      if (line.paid_receive_amount) {
        totalPaidReceived += parseFloat(line.paid_receive_amount) || 0;
      }
    }

    if (totalPaidReceived > mainAmount) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Total Paid/Received (${totalPaidReceived}) cannot exceed main amount (${mainAmount})` 
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Save current record to history
      await connection.query(`
        INSERT INTO finance_custom_payment_categories_edit_history 
        (finance_custom_payment_categories_id, category_id, payment_type_id, date, amount, 
         paid_receive_amount, paid_receive_date, receipt, cash, bank_id, remarks, 
         edited_by, edited_at, edit_reason)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)
      `, [
        id, current.category_id, current.payment_type_id, current.date, current.amount,
        current.paid_receive_amount, current.paid_receive_date, current.receipt,
        current.cash, current.bank_id, current.remarks, updated_by, edit_reason
      ]);

      // 2. If new paymentLines are provided, create new records (repeat main fields)
      if (paymentLines.length > 0) {
        for (const line of paymentLines) {
          if (!line.paid_receive_amount || parseFloat(line.paid_receive_amount) <= 0) continue;

          const sql = `
            INSERT INTO finance_custom_payment_categories 
            (category_id, payment_type_id, date, amount, paid_receive_amount, paid_receive_date,
             receipt, cash, bank_id, remarks, created_by, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
          `;

          await connection.query(sql, [
            category_id || current.category_id,
            payment_type_id || current.payment_type_id,
            date ? date.split('T')[0] : current.date,
            mainAmount,
            parseFloat(line.paid_receive_amount),
            line.paid_receive_date ? line.paid_receive_date.split('T')[0] : null,
            line.receipt?.trim() || null,
            null,
            line.bank_id ? parseInt(line.bank_id) : null,
            remarks?.trim() || current.remarks,
            updated_by
          ]);
        }
      } else {
        // If no new lines, just update the existing record
        await connection.query(`
          UPDATE finance_custom_payment_categories 
          SET category_id = ?, payment_type_id = ?, date = ?, amount = ?,
              paid_receive_amount = ?, paid_receive_date = ?, receipt = ?, 
              cash = ?, bank_id = ?, remarks = ?, updated_by = ?, updated_at = NOW()
          WHERE id = ?
        `, [
          category_id || current.category_id,
          payment_type_id || current.payment_type_id,
          date ? date.split('T')[0] : current.date,
          mainAmount,
          amount !== undefined ? parseFloat(amount) : current.amount, // fallback
          null, // You can pass paid_receive_date if needed for single update
          null,
          null,
          null,
          remarks?.trim() || current.remarks,
          updated_by,
          id
        ]);
      }

      await connection.commit();

      res.status(200).json({ 
        status: 'success', 
        message: paymentLines.length > 0 ? 'New transactions added successfully' : 'Record updated successfully' 
      });

    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error in updateCustomPayment:', error);
    res.status(500).json({ status: 'error', message: 'Update failed', error: error.message });
  }
};
// Delete custom payment record
exports.deleteCustomPayment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: 'error', message: 'id is required' });

    const [result] = await db.query('DELETE FROM finance_custom_payment_categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    res.status(200).json({ status: 'success', message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Delete failed', error: error.message });
  }
};

// Get custom categories
exports.getCustomCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, category_name 
      FROM finance_custom_payment_category_master 
      ORDER BY category_name ASC
    `);
    res.status(200).json({
      status: 'success',
      message: 'Custom categories retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in getCustomCategories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch custom categories',
      error: error.message
    });
  }
};


// Get payments by category (used in frontend)
// Get Custom Payments by Category Name - FIXED
exports.getCustomPaymentsByCategory = async (req, res) => {
  try {
    const { category_name } = req.query;

    if (!category_name?.trim()) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'category_name query parameter is required' 
      });
    }

    const [rows] = await db.query(`
      SELECT 
        c.id,
        cm.id AS category_id,
        cm.category_name,
        c.payment_type_id,
        pt.type_name AS payment_type,
        c.date,
        c.amount,
        c.total_amount,
        c.paid_receive_amount,
        c.receipt,
        c.cash,
        c.bank_id,
        b.bank_name,
        c.remarks,
        c.created_at,
        c.created_by,
        c.updated_at,
        c.updated_by
      FROM finance_custom_payment_categories c
      JOIN finance_custom_payment_category_master cm ON c.category_id = cm.id
      LEFT JOIN finance_custom_payment_type pt ON c.payment_type_id = pt.id
      LEFT JOIN finance_bank_master b ON c.bank_id = b.id
      WHERE cm.category_name = ?
      ORDER BY c.created_at DESC
    `, [category_name.trim()]);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Records fetched successfully' : 'No records found for this category',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error in getCustomPaymentsByCategory:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch records', 
      error: error.message 
    });
  }
};

// NEW: Fetch ALL Custom Payments (with category name) - Used by ViewPaymentEntry
exports.getAllCustomPayments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        cm.id AS category_id,
        cm.category_name,
        c.payment_type_id,
        pt.type_name AS payment_type,
        c.date,
        c.amount,
        c.paid_receive_amount,
        c.paid_receive_date,
        c.receipt,
        c.bank_id,
        b.bank_name,
        c.remarks,
        c.created_at,
        c.created_by
      FROM finance_custom_payment_categories c
      JOIN finance_custom_payment_category_master cm ON c.category_id = cm.id
      LEFT JOIN finance_custom_payment_type pt ON c.payment_type_id = pt.id
      LEFT JOIN finance_bank_master b ON c.bank_id = b.id
      ORDER BY c.created_at DESC
    `);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'All custom payments fetched successfully' : 'No custom payments found',
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error in getAllCustomPayments:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to fetch custom payments', 
      error: error.message 
    });
  }
};

 
exports.getSalaryPayableTransactions = async (req, res) => {
  try {
    const sql = `
      SELECT 
        fsp.id,
        fsp.emp_id,
        em.full_name,
        em.mobile,
        em.approved_salary,
        fsp.pd_id,
        COALESCE(pd.project_name, '—') AS project_name,
        fsp.entry_date,
        fsp.paid_amount,
        fsp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fsp.created_at,
        fsp.created_by,
        fsp.updated_at,
        fsp.updated_by
      FROM finance_salary_payable fsp
      LEFT JOIN employee_master em 
        ON fsp.emp_id = em.emp_id
      LEFT JOIN project_details pd
        ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm 
        ON fsp.finance_bank_id = fbm.id
      ORDER BY fsp.entry_date DESC, fsp.created_at DESC
    `;

    const [rows] = await db.query(sql);

    // Format numeric fields cleanly
    const formatted = rows.map(row => ({
      ...row,
      paid_amount:    Number(row.paid_amount || 0).toFixed(2),
      approved_salary: Number(row.approved_salary || 0).toFixed(2),
    }));

    // Summary (only paid-focused)
    const totals = {
      total_records: formatted.length,
      total_paid:    formatted.reduce((sum, r) => sum + Number(r.paid_amount), 0).toFixed(2),
      total_approved_salary: formatted.reduce((sum, r) => sum + Number(r.approved_salary), 0).toFixed(2)
    };

    return res.status(200).json({
      status: "success",
      message: formatted.length === 0 
        ? "No salary payment records found" 
        : "All salary payment transactions fetched successfully",
      summary: totals,
      data: formatted
    });

  } catch (error) {
    console.error("Error fetching salary payable transactions:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch salary payment records",
      error: error.message
    });
  }
};



// Updated getPaidReceivedDetails - Only uses Paid + Received + Opening Balance
exports.getPaidReceivedDetails = async (req, res) => {
  try {
    const sql = `
      SELECT 
        'Paid' as transaction_type,
        fsp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fsp.paid_amount as amount,
        'Salary Payment' as particulars,
        'salary' as source
      FROM finance_salary_payable fsp
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        fc.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fc.amount_paid as amount,
        'Creditor / Supplier Payment' as particulars,
        'creditors' as source
      FROM finance_creditors fc
      LEFT JOIN finance_bank_master fbm ON fc.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        ftp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        ftp.paid_amount as amount,
        'Transport Payment' as particulars,
        'transport' as source
      FROM finance_transport_payable ftp
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        fsp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fsp.paid_amount as amount,
        'Scaffolding Payment' as particulars,
        'scaffolding' as source
      FROM finance_scaffolding_payable fsp
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        sap.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        sap.payment as amount,
        'Site Accommodation Payment' as particulars,
        'site_accommodation' as source
      FROM finance_site_accomodation_payable sap
      LEFT JOIN finance_bank_master fbm ON sap.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        fcp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fcp.paid_amount as amount,
        'Commission Payment' as particulars,
        'commission' as source
      FROM finance_commission_payable fcp
      LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        fgp.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fgp.output_amount as amount,
        'GST Payment' as particulars,
        'gst' as source
      FROM finance_gst_payable fgp
      LEFT JOIN finance_bank_master fbm ON fgp.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Paid' as transaction_type,
        fcc.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fcc.amount_due as amount,
        'Credit Card Payment' as particulars,
        'creditcard' as source
      FROM finance_creditcard_payable fcc
      LEFT JOIN finance_bank_master fbm ON fcc.finance_bank_id = fbm.id

      UNION ALL

      SELECT 
        'Received' as transaction_type,
        fbdr.finance_bank_id,
        COALESCE(fbm.bank_name, '—') as bank_name,
        fbdr.amount_received as amount,
        'Amount Received from Debtors' as particulars,
        'debtors' as source
      FROM finance_billed_debtors_receivables fbdr
      LEFT JOIN finance_bank_master fbm ON fbdr.finance_bank_id = fbm.id

      ORDER BY transaction_type DESC;
    `;

    const [rows] = await db.query(sql);

    // Group by bank (Existing logic - unchanged)
    const bankMap = {};

    rows.forEach(row => {
      const bankId = row.finance_bank_id;
      if (!bankId) return;

      if (!bankMap[bankId]) {
        bankMap[bankId] = {
          bank_name: row.bank_name,
          total_paid: 0,
          total_received: 0
        };
      }

      if (row.transaction_type === 'Paid') {
        bankMap[bankId].total_paid += parseFloat(row.amount) || 0;
      } else {
        bankMap[bankId].total_received += parseFloat(row.amount) || 0;
      }
    });

    // Update each bank's available_balance (Existing logic - unchanged)
    for (const [bankId, data] of Object.entries(bankMap)) {
      const [bankRow] = await db.query(
        'SELECT opening_balance FROM finance_bank_master WHERE id = ?',
        [bankId]
      );

      if (bankRow.length === 0) continue;

      const openingBalance = parseFloat(bankRow[0].opening_balance) || 0;
      const newAvailableBalance = openingBalance + data.total_received - data.total_paid;

      // Log to history (Existing logic - unchanged)
      await db.query(`
        INSERT INTO finance_bank_master_edit_history 
        (finance_bank_master_id, bank_name, opening_balance, available_balance, remarks, created_by, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        bankId,
        data.bank_name,
        openingBalance,
        newAvailableBalance,
        `Auto updated: Opening ₹${openingBalance.toFixed(2)} + Received ₹${data.total_received.toFixed(2)} - Paid ₹${data.total_paid.toFixed(2)}`,
        1,
        1
      ]);

      // Update existing record only (Existing logic - unchanged)
      await db.query(
        'UPDATE finance_bank_master SET available_balance = ? WHERE id = ?',
        [newAvailableBalance, bankId]
      );
    }

    // Calculate overall totals (Existing logic - unchanged)
    const totalPaid = rows
      .filter(r => r.transaction_type === 'Paid')
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    const totalReceived = rows
      .filter(r => r.transaction_type === 'Received')
      .reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

    res.status(200).json({
      status: 'success',
      message: 'Paid & Received details retrieved and available balances updated successfully',
      data: {
        total_paid: parseFloat(totalPaid.toFixed(2)),
        total_received: parseFloat(totalReceived.toFixed(2)),
        transactions: rows
      }
    });

  } catch (error) {
    console.error('Error in getPaidReceivedDetails:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



// Get opening balance history for a bank
exports.getBankHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`
      SELECT 
        opening_balance,
        remarks,
        updated_at,
        updated_by
      FROM finance_bank_master_edit_history 
      WHERE finance_bank_master_id = ?
      ORDER BY updated_at DESC
    `, [id]);

    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error in getBankHistory:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch history' });
  }
};







// ====================== DETAILED PAID & RECEIVED API (FINAL FIXED VERSION) ======================
// All invalid pd_id joins removed. Works with your actual table structure.
exports.getPaidReceivedDetailed = async (req, res) => {
  try {
    const { from_date, to_date } = req.query;

    let dateCondition = '';
    const queryParams = [];

    if (from_date) {
      dateCondition += ` AND COALESCE(
        fsp.entry_date,
        fc.date_of_payment,
        ftp.date_of_payment,
        fsp2.date_of_payment,
        sap.payment_date,
        fcp.date_of_payment,
        fbdr.date_of_receipt
      ) >= ?`;
      queryParams.push(from_date);
    }
    if (to_date) {
      dateCondition += ` AND COALESCE(
        fsp.entry_date,
        fc.date_of_payment,
        ftp.date_of_payment,
        fsp2.date_of_payment,
        sap.payment_date,
        fcp.date_of_payment,
        fbdr.date_of_receipt
      ) <= ?`;
      queryParams.push(to_date);
    }

    const sql = `
      -- 1. Salary Payments
      SELECT 
        'Paid' AS transaction_type,
        em.full_name AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        'Salary Payment' AS particulars,
        fsp.paid_amount AS amount,
        fsp.balance AS balance_amount,
        fsp.entry_date AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fsp.finance_bank_id
      FROM finance_salary_payable fsp
      LEFT JOIN employee_master em ON fsp.emp_id = em.emp_id
      LEFT JOIN project_details pd ON fsp.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON fsp.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition}

      UNION ALL

      -- 2. Creditors Payments (No pd_id column)
      SELECT 
        'Paid' AS transaction_type,
        NULL AS employee_name,
        '—' AS project_name,
        CONCAT('Creditor Payment - ', COALESCE(fcc.client_name, 'Supplier')) AS particulars,
        fc.amount_paid AS amount,
        fc.balance_amount,
        fc.date_of_payment AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fc.finance_bank_id
      FROM finance_creditors fc
      LEFT JOIN finance_creditors_client fcc ON fc.client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON fc.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'fc.date_of_payment')}

      UNION ALL

      -- 3. Transport Payments
      SELECT 
        'Paid' AS transaction_type,
        NULL AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        CONCAT('Transport - ', COALESCE(fcc.category_name, 'Transport')) AS particulars,
        ftp.paid_amount AS amount,
        ftp.balance_amount,
        ftp.date_of_payment AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        ftp.finance_bank_id
      FROM finance_transport_payable ftp
      LEFT JOIN project_details pd ON ftp.pd_id = pd.pd_id
      LEFT JOIN finance_cost_category fcc ON ftp.cost_category_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON ftp.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'ftp.date_of_payment')}

      UNION ALL

      -- 4. Scaffolding Payments
      SELECT 
        'Paid' AS transaction_type,
        NULL AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        'Scaffolding Payment' AS particulars,
        fsp2.paid_amount AS amount,
        fsp2.balance_amount,
        fsp2.date_of_payment AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fsp2.finance_bank_id
      FROM finance_scaffolding_payable fsp2
      LEFT JOIN project_details pd ON fsp2.pd_id = pd.pd_id
      LEFT JOIN finance_bank_master fbm ON fsp2.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'fsp2.date_of_payment')}

      UNION ALL

      -- 5. Site Accommodation
      SELECT 
        'Paid' AS transaction_type,
        NULL AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        CONCAT('Site Accommodation - ', COALESCE(fcc.client_name, '')) AS particulars,
        sap.payment AS amount,
        sap.balance_due AS balance_amount,
        sap.payment_date AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        sap.finance_bank_id
      FROM finance_site_accomodation_payable sap
      LEFT JOIN project_details pd ON sap.pd_id = pd.pd_id
      LEFT JOIN finance_creditors_client fcc ON sap.finance_creditors_client_id = fcc.id
      LEFT JOIN finance_bank_master fbm ON sap.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'sap.payment_date')}

      UNION ALL

      -- 6. Commission Payments
      SELECT 
        'Paid' AS transaction_type,
        NULL AS employee_name,
        COALESCE(pd.project_name, '—') AS project_name,
        CONCAT('Commission - ', COALESCE(fmp.person_name, '')) AS particulars,
        fcp.paid_amount AS amount,
        fcp.balance_amount,
        fcp.date_of_payment AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fcp.finance_bank_id
      FROM finance_commission_payable fcp
      LEFT JOIN project_details pd ON fcp.pd_id = pd.pd_id
      LEFT JOIN finance_marketing_persons fmp ON fcp.marketing_person_id = fmp.id
      LEFT JOIN finance_bank_master fbm ON fcp.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'fcp.date_of_payment')}

      UNION ALL

      -- 7. Received from Debtors (No pd_id column in this table)
      SELECT 
        'Received' AS transaction_type,
        NULL AS employee_name,
        COALESCE(fp.party_name, '—') AS project_name,        -- Using party_name only
        'Amount Received from Debtors' AS particulars,
        fbdr.amount_received AS amount,
        fbdr.balance_amount,
        fbdr.date_of_receipt AS entry_date,
        COALESCE(fbm.bank_name, '—') AS bank_name,
        fbdr.finance_bank_id
      FROM finance_billed_debtors_receivables fbdr
      LEFT JOIN finance_party fp ON fbdr.finance_party_id = fp.id
      LEFT JOIN finance_bank_master fbm ON fbdr.finance_bank_id = fbm.id
      WHERE 1=1 ${dateCondition.replace(/COALESCE\(.*?\)/, 'fbdr.date_of_receipt')}

      ORDER BY transaction_type DESC, entry_date DESC, amount DESC;
    `;

    const [rows] = await db.query(sql, queryParams);

    // Calculate totals
    const totalPaid = rows
      .filter(r => r.transaction_type === 'Paid')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const totalReceived = rows
      .filter(r => r.transaction_type === 'Received')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    res.status(200).json({
      status: 'success',
      message: 'Detailed Paid & Received data retrieved successfully',
      data: {
        total_paid: parseFloat(totalPaid.toFixed(2)),
        total_received: parseFloat(totalReceived.toFixed(2)),
        transactions: rows
      }
    });

  } catch (error) {
    console.error('Error in getPaidReceivedDetailed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};









// Create Bill To Be Raise
exports.createBillToBeRaise = async (req, res) => {
  try {
    const {
      po_details, inv_no, work_completion_date, bill_date, due_date,
      party_name, remarks, sale_amount, gst, total_pyt_due, created_by
    } = req.body;

    if (!party_name || !total_pyt_due) {
      return res.status(400).json({ status: 'error', message: 'Party Name and Total Payment Due are required' });
    }

    const sql = `
      INSERT INTO finance_bill_to_be_raise
      (po_details, inv_no, work_completion_date, bill_date, due_date, party_name,
       remarks, sale_amount, gst, total_pyt_due, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      po_details || null,
      inv_no || null,
      work_completion_date || null,
      bill_date || null,
      due_date || null,
      party_name,
      remarks || null,
      parseFloat(sale_amount) || null,
      parseFloat(gst) || null,
      parseFloat(total_pyt_due),
      created_by || null
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Bill To Be Raise created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createBillToBeRaise:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

// Get all Bill To Be Raise (for future View if needed)
exports.getBillToBeRaise = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM finance_bill_to_be_raise 
      ORDER BY created_at DESC
    `);
    res.status(200).json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch records' });
  }
};



// Get Bill To Be Raise Summary - Only PO Details + Total Pyt Due + Grand Total
exports.getBillToBeRaiseSummary = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        po_details,
        inv_no,
        party_name,
        total_pyt_due,
        created_at
      FROM finance_bill_to_be_raise 
      ORDER BY created_at DESC
    `);

    // Calculate grand total
    const grandTotal = rows.reduce((sum, row) => {
      return sum + parseFloat(row.total_pyt_due || 0);
    }, 0);

    res.status(200).json({
      status: 'success',
      message: 'Bill To Be Raise summary fetched successfully',
      data: {
        records: rows,
        grand_total: parseFloat(grandTotal.toFixed(2)),
        total_records: rows.length
      }
    });
  } catch (error) {
    console.error('Error in getBillToBeRaiseSummary:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bill to be raise summary',
      error: error.message
    });
  }
};





// Update Bill To Be Raise
exports.updateBillToBeRaise = async (req, res) => {
  try {
    const { id } = req.params;
    const { po_details, inv_no, work_completion_date, bill_date, due_date, 
            party_name, remarks, sale_amount, gst, total_pyt_due, updated_by } = req.body;

    const [result] = await db.query(`
      UPDATE finance_bill_to_be_raise 
      SET po_details = ?, inv_no = ?, work_completion_date = ?, bill_date = ?, 
          due_date = ?, party_name = ?, remarks = ?, sale_amount = ?, 
          gst = ?, total_pyt_due = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      po_details || null, inv_no || null, work_completion_date || null,
      bill_date || null, due_date || null, party_name || null,
      remarks || null, sale_amount || null, gst || null, 
      total_pyt_due || null, updated_by || null, id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Bill To Be Raise updated successfully' 
    });
  } catch (error) {
    console.error('Error updating bill to be raise:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update record' });
  }
};

// Delete Bill To Be Raise
exports.deleteBillToBeRaise = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM finance_bill_to_be_raise WHERE id = ?', 
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: 'error', message: 'Record not found' });
    }

    res.status(200).json({ 
      status: 'success', 
      message: 'Bill To Be Raise record deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting bill to be raise:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete record' });
  }
};




































































































// ==================== BANK STATEMENT CONSOLIDATION ====================

// Get all financial years
exports.getFinancialYears = async (req, res) => {
  try {
    const sql = 'SELECT id, start_year, end_year, is_active FROM finance_financial_year ORDER BY start_year DESC';
    const [rows] = await db.query(sql);
    
    res.status(200).json({
      status: 'success',
      message: 'Financial years retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in getFinancialYears:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all cost centers
exports.getCostCenters = async (req, res) => {
  try {
    const sql = 'SELECT id, cost_center_name, is_active FROM finance_cost_center WHERE is_active = 1 ORDER BY cost_center_name';
    const [rows] = await db.query(sql);
    
    res.status(200).json({
      status: 'success',
      message: 'Cost centers retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error in getCostCenters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.createCostCenter = async (req, res) => {
  try {
    const costCenterName = typeof req.body.cost_center_name === 'string'
      ? req.body.cost_center_name.trim()
      : '';
    const createdBy = req.body.created_by || null;

    if (!costCenterName) {
      return res.status(400).json({
        status: 'error',
        message: 'Cost center or supplier name is required'
      });
    }
    if (costCenterName.length > 255) {
      return res.status(400).json({
        status: 'error',
        message: 'Cost center or supplier name must be 255 characters or fewer'
      });
    }

    const [result] = await db.query(
      `INSERT INTO finance_cost_center (cost_center_name, created_by)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [costCenterName, createdBy]
    );
    const [rows] = await db.query(
      'SELECT id, cost_center_name, is_active FROM finance_cost_center WHERE id = ?',
      [result.insertId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Cost center or supplier is ready to use',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error creating cost center:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create cost center or supplier'
    });
  }
};

// Create financial year
exports.createFinancialYear = async (req, res) => {
  try {
    const { start_year, end_year, is_active, created_by } = req.body;

    if (!start_year || !end_year) {
      return res.status(400).json({
        status: 'error',
        message: 'start_year and end_year are required'
      });
    }

    const [existing] = await db.query(
      'SELECT id FROM finance_financial_year WHERE start_year = ? AND end_year = ?',
      [start_year, end_year]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Financial year range already exists'
      });
    }

    if (parseInt(start_year) >= parseInt(end_year)) {
      return res.status(400).json({
        status: 'error',
        message: 'Start year must be less than end year'
      });
    }

    const sql = `
      INSERT INTO finance_financial_year 
      (start_year, end_year, is_active, created_by) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.query(sql, [
      start_year,
      end_year,
      is_active || 1,
      created_by || 1
    ]);

    res.status(201).json({
      status: 'success',
      message: 'Financial year created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createFinancialYear:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create Bank Statement
exports.createBankStatement = async (req, res) => {
  try {
    const {
      finance_year_id,
      transaction_date,
      expense_description,
      cost_center_id,
      po_status,
      po_number,
      cost_element,
      amount,
      transaction_type,
      bank_id,
      payment_category,
      classification,
      invoice_date,
      invoice_no,
      utr_details,
      created_by
    } = req.body;

    if (!finance_year_id || !transaction_date || !transaction_type || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'finance_year_id, transaction_date, transaction_type and created_by are required'
      });
    }
    const validClassifications = ['PR-G', 'PR-WG', 'SR', 'N/A'];
    if (classification && !validClassifications.includes(classification)) {
      return res.status(400).json({ status: 'error', message: 'Invalid classification' });
    }
    let selectedBank = null;
    if (bank_id !== undefined && bank_id !== null && bank_id !== '') {
      const [banks] = await db.query(
        'SELECT id, bank_name FROM finance_bank_master WHERE id = ?',
        [bank_id]
      );
      if (banks.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Selected bank does not exist in the bank master' });
      }
      selectedBank = banks[0];
    }

    const formattedTransactionDate = formatDate(transaction_date);
    const formattedInvoiceDate = formatDate(invoice_date);

    const sql = `
      INSERT INTO finance_bank_statement_consolidation (
        finance_year_id,
        transaction_date,
        expense_description,
        cost_center_id,
        po_status,
        po_number,
        cost_element,
        amount,
        transaction_type,
        bank_id,
        bank_name,
        payment_category,
        classification,
        invoice_date,
        invoice_no,
        utr_details,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      finance_year_id,
      formattedTransactionDate,
      expense_description || null,
      cost_center_id || null,
      po_status || 'not_available',
      po_status === 'available' ? po_number || null : null, // Only save if PO is available
      cost_element || null,
      amount || 0,
      transaction_type,
      selectedBank?.id || null,
      selectedBank?.bank_name || null,
      payment_category || 'na',
      classification || 'N/A',
      formattedInvoiceDate,
      invoice_no || null,
      utr_details || null,
      created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Bank statement created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createBankStatement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};
// Update Bank Statement with Edit History
exports.updateBankStatement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      finance_year_id,
      transaction_date,
      expense_description,
      cost_center_id,
      po_status,
      po_number,
      cost_element,
      amount,
      transaction_type,
      bank_id,
      payment_category,
      classification,
      invoice_date,
      invoice_no,
      utr_details,
      updated_by
    } = req.body;

    if (!finance_year_id || !transaction_date || !transaction_type || !updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'finance_year_id, transaction_date, transaction_type and updated_by are required'
      });
    }
    const validClassifications = ['PR-G', 'PR-WG', 'SR', 'N/A'];
    if (classification && !validClassifications.includes(classification)) {
      return res.status(400).json({ status: 'error', message: 'Invalid classification' });
    }
    let selectedBank = null;
    if (bank_id !== undefined && bank_id !== null && bank_id !== '') {
      const [banks] = await db.query(
        'SELECT id, bank_name FROM finance_bank_master WHERE id = ?',
        [bank_id]
      );
      if (banks.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Selected bank does not exist in the bank master' });
      }
      selectedBank = banks[0];
    }

    // First, get the current record to store in edit history
    const [currentRecord] = await db.query(
      'SELECT * FROM finance_bank_statement_consolidation WHERE id = ?',
      [id]
    );

    if (currentRecord.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank statement not found'
      });
    }

    // Insert current record into edit history before updating
    const historySql = `
      INSERT INTO finance_bank_statement_consolidation_edit_history (
        finance_bank_statement_consolidation_id,
        finance_year_id,
        transaction_date,
        expense_description,
        cost_center_id,
        po_status,
        po_number,
        cost_element,
        amount,
        transaction_type,
        bank_id,
        bank_name,
        payment_category,
        classification,
        invoice_date,
        invoice_no,
        supplier_customer_name,
        utr_details,
        created_by,
        changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const historyParams = [
      id,
      currentRecord[0].finance_year_id,
      currentRecord[0].transaction_date,
      currentRecord[0].expense_description,
      currentRecord[0].cost_center_id,
      currentRecord[0].po_status,
      currentRecord[0].po_number || null,
      currentRecord[0].cost_element,
      currentRecord[0].amount,
      currentRecord[0].transaction_type,
      currentRecord[0].bank_id,
      currentRecord[0].bank_name,
      currentRecord[0].payment_category,
      currentRecord[0].classification || 'N/A',
      currentRecord[0].invoice_date,
      currentRecord[0].invoice_no,
      currentRecord[0].supplier_customer_name,
      currentRecord[0].utr_details,
      currentRecord[0].created_by,
      updated_by
    ];

    await db.query(historySql, historyParams);

    // Now update the record
    const formattedTransactionDate = formatDate(transaction_date);
    const formattedInvoiceDate = formatDate(invoice_date);

    const updateSql = `
      UPDATE finance_bank_statement_consolidation SET
        finance_year_id = ?,
        transaction_date = ?,
        expense_description = ?,
        cost_center_id = ?,
        po_status = ?,
        po_number = ?,
        cost_element = ?,
        amount = ?,
        transaction_type = ?,
        bank_id = ?,
        bank_name = ?,
        payment_category = ?,
        classification = ?,
        invoice_date = ?,
        invoice_no = ?,
        utr_details = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const updateParams = [
      finance_year_id,
      formattedTransactionDate,
      expense_description || null,
      cost_center_id || null,
      po_status || 'not_available',
      po_status === 'available' ? po_number || null : null,
      cost_element || null,
      amount || 0,
      transaction_type,
      selectedBank?.id || null,
      selectedBank?.bank_name || null,
      payment_category || 'na',
      classification || 'N/A',
      formattedInvoiceDate,
      invoice_no || null,
      utr_details || null,
      updated_by,
      id
    ];

    const [result] = await db.query(updateSql, updateParams);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank statement not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Bank statement updated successfully',
      data: { id: id }
    });
  } catch (error) {
    console.error('Error in updateBankStatement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Bank Statements by Financial Year
exports.getBankStatements = async (req, res) => {
  try {
    const { finance_year_id } = req.query;

    let sql = `
      SELECT 
        fbs.*,
        fsbm.bank_name AS bank_master_name,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year,
        fcc.cost_center_name
      FROM finance_bank_statement_consolidation fbs
      LEFT JOIN finance_financial_year ffy ON fbs.finance_year_id = ffy.id
      LEFT JOIN finance_cost_center fcc ON fbs.cost_center_id = fcc.id
      LEFT JOIN finance_bank_master fsbm ON fbs.bank_id = fsbm.id
      WHERE 1=1
    `;
    const params = [];

    if (finance_year_id) {
      sql += ' AND fbs.finance_year_id = ?';
      params.push(finance_year_id);
    }

    sql += ' ORDER BY fbs.transaction_date DESC, fbs.created_at DESC';

    const [rows] = await db.query(sql, params);

    const totalCredit = rows
      .filter(r => r.transaction_type === 'credit')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const totalDebit = rows
      .filter(r => r.transaction_type === 'debit')
      .reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);

    const overall = {
      total_credit: parseFloat(totalCredit.toFixed(2)),
      total_debit: parseFloat(totalDebit.toFixed(2)),
      net_balance: parseFloat((totalCredit - totalDebit).toFixed(2)),
      total_records: rows.length
    };

    res.status(200).json({
      status: 'success',
      message: 'Bank statements retrieved successfully',
      data: {
        summary: overall,
        records: rows
      }
    });
  } catch (error) {
    console.error('Error in getBankStatements:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Bank Statement by ID
exports.getBankStatementById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        fbs.*,
        fsbm.bank_name AS bank_master_name,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year,
        fcc.cost_center_name
      FROM finance_bank_statement_consolidation fbs
      LEFT JOIN finance_financial_year ffy ON fbs.finance_year_id = ffy.id
      LEFT JOIN finance_cost_center fcc ON fbs.cost_center_id = fcc.id
      LEFT JOIN finance_bank_master fsbm ON fbs.bank_id = fsbm.id
      WHERE fbs.id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank statement not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error in getBankStatementById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Edit History for a Bank Statement
exports.getBankStatementHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        eh.*,
        fsbm.bank_name AS bank_master_name,
        CONCAT(u.first_name, ' ', u.last_name) as changed_by_name
      FROM finance_bank_statement_consolidation_edit_history eh
      LEFT JOIN users u ON eh.changed_by = u.id
      LEFT JOIN finance_bank_master fsbm ON eh.bank_id = fsbm.id
      WHERE eh.finance_bank_statement_consolidation_id = ?
      ORDER BY eh.changed_at DESC
    `;

    const [history] = await db.query(sql, [id]);

    res.status(200).json({
      status: 'success',
      data: history
    });
  } catch (error) {
    console.error('Error in getBankStatementHistory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Bank Statement (Soft Delete)
exports.deleteBankStatement = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const [record] = await db.query(
      'SELECT id FROM finance_bank_statement_consolidation WHERE id = ?',
      [id]
    );

    if (record.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank statement not found'
      });
    }

    // Soft delete - update is_active to 0
    const sql = `
      UPDATE finance_bank_statement_consolidation 
      SET is_active = 0, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await db.query(sql, [id]);

    res.status(200).json({
      status: 'success',
      message: 'Bank statement deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteBankStatement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};
// Delete Bank Statement
exports.deleteBankStatement = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM finance_bank_statement_consolidation WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Bank statement not found'
      });
    }

    const deleteSql = 'DELETE FROM finance_bank_statement_consolidation WHERE id = ?';
    await db.query(deleteSql, [id]);

    res.status(200).json({
      status: 'success',
      message: 'Bank statement deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteBankStatement:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};





// ==================== HELPER FUNCTION ====================
const fetchPaymentDetailsFromBank = async (invoiceNo, financeYearId) => {
  try {
    const [bankRecords] = await db.query(
      `SELECT 
        invoice_date as date_of_payment,
        utr_details,
        po_number as po_work_order_no
      FROM finance_bank_statement_consolidation 
      WHERE invoice_no = ? 
        AND finance_year_id = ?
        AND is_active = 1
        AND payment_category IN ('purchase', 'purchase_advance', 'sales', 'sales_advance')
      LIMIT 1`,
      [invoiceNo, financeYearId]
    );

    if (bankRecords.length > 0) {
      return {
        date_of_payment: bankRecords[0].date_of_payment,
        utr_details: bankRecords[0].utr_details,
        po_work_order_no: bankRecords[0].po_work_order_no
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching from bank statement:', error);
    return null;
  }
};

// ==================== PURCHASE REGISTER ====================

// Create Purchase Register with auto-fetch from bank statement
exports.createPurchaseRegister = async (req, res) => {
  try {
    const {
      transaction_date,
      supplier_name,
      invoice_no,
      invoice_description,
      rate,
      uom,
      quantity,
      gst,
      total_value,
      finance_year_id,
      created_by
    } = req.body;

    if (!transaction_date || !supplier_name || !invoice_no || !finance_year_id || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_date, supplier_name, invoice_no, finance_year_id and created_by are required'
      });
    }

    // Fetch payment details from bank statement
    const bankDetails = await fetchPaymentDetailsFromBank(invoice_no, finance_year_id);

    const formattedTransactionDate = formatDate(transaction_date);
    const formattedDateOfPayment = bankDetails ? formatDate(bankDetails.date_of_payment) : null;

    const sql = `
      INSERT INTO finance_purchase_register (
        transaction_date,
        supplier_name,
        invoice_no,
        invoice_description,
        rate,
        uom,
        quantity,
        gst,
        total_value,
        date_of_payment,
        utr_details,
        po_work_order_no,
        finance_year_id,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      formattedTransactionDate,
      supplier_name,
      invoice_no,
      invoice_description || null,
      rate || 0,
      uom || null,
      quantity || 0,
      gst || 0,
      total_value || 0,
      formattedDateOfPayment,
      bankDetails ? bankDetails.utr_details : null,
      bankDetails ? bankDetails.po_work_order_no : null,
      finance_year_id,
      created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Purchase register created successfully',
      data: { 
        id: result.insertId,
        bank_details_fetched: !!bankDetails
      }
    });
  } catch (error) {
    console.error('Error in createPurchaseRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Purchase Register with auto-fetch from bank statement
exports.updatePurchaseRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      supplier_name,
      invoice_no,
      invoice_description,
      rate,
      uom,
      quantity,
      gst,
      total_value,
      finance_year_id,
      updated_by
    } = req.body;

    if (!updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'updated_by is required'
      });
    }

    const [existing] = await db.query('SELECT * FROM finance_purchase_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase register not found'
      });
    }

    // Save to history
    const oldData = existing[0];
    const historySql = `
      INSERT INTO finance_purchase_register_edit_history (
        finance_purchase_register_id,
        transaction_date,
        supplier_name,
        invoice_no,
        invoice_description,
        rate,
        uom,
        quantity,
        gst,
        total_value,
        date_of_payment,
        utr_details,
        po_work_order_no,
        finance_year_id,
        created_by,
        changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(historySql, [
      id,
      oldData.transaction_date,
      oldData.supplier_name,
      oldData.invoice_no,
      oldData.invoice_description,
      oldData.rate,
      oldData.uom,
      oldData.quantity,
      oldData.gst,
      oldData.total_value,
      oldData.date_of_payment,
      oldData.utr_details,
      oldData.po_work_order_no,
      oldData.finance_year_id,
      oldData.created_by,
      updated_by
    ]);

    // Fetch latest payment details from bank statement
    const bankDetails = await fetchPaymentDetailsFromBank(invoice_no, finance_year_id || oldData.finance_year_id);

    const formattedTransactionDate = formatDate(transaction_date);
    const formattedDateOfPayment = bankDetails ? formatDate(bankDetails.date_of_payment) : null;

    const updateSql = `
      UPDATE finance_purchase_register SET
        transaction_date = ?,
        supplier_name = ?,
        invoice_no = ?,
        invoice_description = ?,
        rate = ?,
        uom = ?,
        quantity = ?,
        gst = ?,
        total_value = ?,
        date_of_payment = ?,
        utr_details = ?,
        po_work_order_no = ?,
        finance_year_id = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      formattedTransactionDate || oldData.transaction_date,
      supplier_name || oldData.supplier_name,
      invoice_no || oldData.invoice_no,
      invoice_description || null,
      rate || 0,
      uom || null,
      quantity || 0,
      gst || 0,
      total_value || 0,
      formattedDateOfPayment,
      bankDetails ? bankDetails.utr_details : null,
      bankDetails ? bankDetails.po_work_order_no : null,
      finance_year_id || oldData.finance_year_id,
      updated_by,
      id
    ];

    await db.query(updateSql, params);

    res.status(200).json({
      status: 'success',
      message: 'Purchase register updated successfully',
      data: {
        bank_details_fetched: !!bankDetails
      }
    });
  } catch (error) {
    console.error('Error in updatePurchaseRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Purchase Registers
exports.getPurchaseRegisters = async (req, res) => {
  try {
    const { finance_year_id } = req.query;

    let sql = `
      SELECT 
        fpr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_purchase_register fpr
      LEFT JOIN finance_financial_year ffy ON fpr.finance_year_id = ffy.id
      WHERE 1=1
    `;
    const params = [];

    if (finance_year_id) {
      sql += ' AND fpr.finance_year_id = ?';
      params.push(finance_year_id);
    }

    sql += ' ORDER BY fpr.transaction_date DESC, fpr.created_at DESC';

    const [rows] = await db.query(sql, params);

    const totalValue = rows.reduce((sum, r) => sum + parseFloat(r.total_value || 0), 0);
    const totalGst = rows.reduce((sum, r) => sum + parseFloat(r.gst || 0), 0);

    const overall = {
      total_value: parseFloat(totalValue.toFixed(2)),
      total_gst: parseFloat(totalGst.toFixed(2)),
      total_records: rows.length
    };

    res.status(200).json({
      status: 'success',
      message: 'Purchase registers retrieved successfully',
      data: {
        summary: overall,
        records: rows
      }
    });
  } catch (error) {
    console.error('Error in getPurchaseRegisters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Purchase Register by ID
exports.getPurchaseRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        fpr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_purchase_register fpr
      LEFT JOIN finance_financial_year ffy ON fpr.finance_year_id = ffy.id
      WHERE fpr.id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase register not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error in getPurchaseRegisterById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Purchase Register
exports.deletePurchaseRegister = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM finance_purchase_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Purchase register not found'
      });
    }

    await db.query('DELETE FROM finance_purchase_register WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Purchase register deleted successfully'
    });
  } catch (error) {
    console.error('Error in deletePurchaseRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== SALES REGISTER ====================

// Create Sales Register with auto-fetch from bank statement
exports.createSalesRegister = async (req, res) => {
  try {
    const {
      transaction_date,
      customer_name,
      invoice_no,
      invoice_description,
      rate,
      uom,
      quantity,
      gst,
      total_value,
      finance_year_id,
      created_by
    } = req.body;

    if (!transaction_date || !customer_name || !invoice_no || !finance_year_id || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_date, customer_name, invoice_no, finance_year_id and created_by are required'
      });
    }

    // Fetch payment details from bank statement
    const bankDetails = await fetchPaymentDetailsFromBank(invoice_no, finance_year_id);

    const formattedTransactionDate = formatDate(transaction_date);
    const formattedDateOfPayment = bankDetails ? formatDate(bankDetails.date_of_payment) : null;

    const sql = `
      INSERT INTO finance_sales_register (
        transaction_date,
        customer_name,
        invoice_no,
        invoice_description,
        rate,
        uom,
        quantity,
        gst,
        total_value,
        date_of_payment,
        utr_details,
        po_work_order_no,
        finance_year_id,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      formattedTransactionDate,
      customer_name,
      invoice_no,
      invoice_description || null,
      rate || 0,
      uom || null,
      quantity || 0,
      gst || 0,
      total_value || 0,
      formattedDateOfPayment,
      bankDetails ? bankDetails.utr_details : null,
      bankDetails ? bankDetails.po_work_order_no : null,
      finance_year_id,
      created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Sales register created successfully',
      data: { 
        id: result.insertId,
        bank_details_fetched: !!bankDetails
      }
    });
  } catch (error) {
    console.error('Error in createSalesRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Sales Register with auto-fetch from bank statement
exports.updateSalesRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      customer_name,
      invoice_no,
      invoice_description,
      rate,
      uom,
      quantity,
      gst,
      total_value,
      finance_year_id,
      updated_by
    } = req.body;

    if (!updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'updated_by is required'
      });
    }

    const [existing] = await db.query('SELECT * FROM finance_sales_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sales register not found'
      });
    }

    // Save to history
    const oldData = existing[0];
    const historySql = `
      INSERT INTO finance_sales_register_edit_history (
        finance_sales_register_id,
        transaction_date,
        customer_name,
        invoice_no,
        invoice_description,
        rate,
        uom,
        quantity,
        gst,
        total_value,
        date_of_payment,
        utr_details,
        po_work_order_no,
        finance_year_id,
        created_by,
        changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(historySql, [
      id,
      oldData.transaction_date,
      oldData.customer_name,
      oldData.invoice_no,
      oldData.invoice_description,
      oldData.rate,
      oldData.uom,
      oldData.quantity,
      oldData.gst,
      oldData.total_value,
      oldData.date_of_payment,
      oldData.utr_details,
      oldData.po_work_order_no,
      oldData.finance_year_id,
      oldData.created_by,
      updated_by
    ]);

    // Fetch latest payment details from bank statement
    const bankDetails = await fetchPaymentDetailsFromBank(invoice_no, finance_year_id || oldData.finance_year_id);

    const formattedTransactionDate = formatDate(transaction_date);
    const formattedDateOfPayment = bankDetails ? formatDate(bankDetails.date_of_payment) : null;

    const updateSql = `
      UPDATE finance_sales_register SET
        transaction_date = ?,
        customer_name = ?,
        invoice_no = ?,
        invoice_description = ?,
        rate = ?,
        uom = ?,
        quantity = ?,
        gst = ?,
        total_value = ?,
        date_of_payment = ?,
        utr_details = ?,
        po_work_order_no = ?,
        finance_year_id = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      formattedTransactionDate || oldData.transaction_date,
      customer_name || oldData.customer_name,
      invoice_no || oldData.invoice_no,
      invoice_description || null,
      rate || 0,
      uom || null,
      quantity || 0,
      gst || 0,
      total_value || 0,
      formattedDateOfPayment,
      bankDetails ? bankDetails.utr_details : null,
      bankDetails ? bankDetails.po_work_order_no : null,
      finance_year_id || oldData.finance_year_id,
      updated_by,
      id
    ];

    await db.query(updateSql, params);

    res.status(200).json({
      status: 'success',
      message: 'Sales register updated successfully',
      data: {
        bank_details_fetched: !!bankDetails
      }
    });
  } catch (error) {
    console.error('Error in updateSalesRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Sales Registers
exports.getSalesRegisters = async (req, res) => {
  try {
    const { finance_year_id } = req.query;

    let sql = `
      SELECT 
        fsr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_sales_register fsr
      LEFT JOIN finance_financial_year ffy ON fsr.finance_year_id = ffy.id
      WHERE 1=1
    `;
    const params = [];

    if (finance_year_id) {
      sql += ' AND fsr.finance_year_id = ?';
      params.push(finance_year_id);
    }

    sql += ' ORDER BY fsr.transaction_date DESC, fsr.created_at DESC';

    const [rows] = await db.query(sql, params);

    const totalValue = rows.reduce((sum, r) => sum + parseFloat(r.total_value || 0), 0);
    const totalGst = rows.reduce((sum, r) => sum + parseFloat(r.gst || 0), 0);

    const overall = {
      total_value: parseFloat(totalValue.toFixed(2)),
      total_gst: parseFloat(totalGst.toFixed(2)),
      total_records: rows.length
    };

    res.status(200).json({
      status: 'success',
      message: 'Sales registers retrieved successfully',
      data: {
        summary: overall,
        records: rows
      }
    });
  } catch (error) {
    console.error('Error in getSalesRegisters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Sales Register by ID
exports.getSalesRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        fsr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_sales_register fsr
      LEFT JOIN finance_financial_year ffy ON fsr.finance_year_id = ffy.id
      WHERE fsr.id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sales register not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error in getSalesRegisterById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Sales Register
exports.deleteSalesRegister = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM finance_sales_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Sales register not found'
      });
    }

    await db.query('DELETE FROM finance_sales_register WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Sales register deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteSalesRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




// ==================== SYNC FUNCTION FROM BANK STATEMENT ====================

/**
 * Sync payment details from bank statement to purchase/sales registers
 * This can be called on page load or via a dedicated sync button
 */
exports.syncBankStatementToRegisters = async (req, res) => {
  try {
    const { finance_year_id } = req.query;
    
    if (!finance_year_id) {
      return res.status(400).json({
        status: 'error',
        message: 'finance_year_id is required'
      });
    }

    // Get all bank statements with payment category purchase/purchase_advance/sales/sales_advance
    const [bankStatements] = await db.query(
      `SELECT 
        invoice_no,
        invoice_date as date_of_payment,
        utr_details,
        po_number as po_work_order_no,
        finance_year_id,
        payment_category
      FROM finance_bank_statement_consolidation 
      WHERE finance_year_id = ?
        AND is_active = 1
        AND payment_category IN ('purchase', 'purchase_advance', 'sales', 'sales_advance')
        AND invoice_no IS NOT NULL
        AND invoice_no != ''`,
      [finance_year_id]
    );

    if (bankStatements.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No bank statements found to sync',
        data: {
          synced_purchase: 0,
          synced_sales: 0,
          skipped: 0,
          total_processed: 0
        }
      });
    }

    let purchaseSynced = 0;
    let salesSynced = 0;
    let skipped = 0;

    // Process each bank statement
    for (const bankRecord of bankStatements) {
      const { invoice_no, date_of_payment, utr_details, po_work_order_no, payment_category } = bankRecord;

      // Check if this invoice exists in purchase register
      const [purchaseExists] = await db.query(
        'SELECT id FROM finance_purchase_register WHERE invoice_no = ? AND finance_year_id = ?',
        [invoice_no, finance_year_id]
      );

      // Check if this invoice exists in sales register
      const [salesExists] = await db.query(
        'SELECT id FROM finance_sales_register WHERE invoice_no = ? AND finance_year_id = ?',
        [invoice_no, finance_year_id]
      );

      // For purchase/purchase_advance - update purchase register
      if (payment_category === 'purchase' || payment_category === 'purchase_advance') {
        if (purchaseExists.length > 0) {
          // Update existing purchase record
          await db.query(
            `UPDATE finance_purchase_register 
             SET date_of_payment = ?,
                 utr_details = ?,
                 po_work_order_no = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE invoice_no = ? AND finance_year_id = ?`,
            [date_of_payment, utr_details, po_work_order_no, invoice_no, finance_year_id]
          );
          purchaseSynced++;
        } else {
          // Purchase record doesn't exist, skip
          skipped++;
        }
      }

      // For sales/sales_advance - update sales register
      if (payment_category === 'sales' || payment_category === 'sales_advance') {
        if (salesExists.length > 0) {
          // Update existing sales record
          await db.query(
            `UPDATE finance_sales_register 
             SET date_of_payment = ?,
                 utr_details = ?,
                 po_work_order_no = ?,
                 updated_at = CURRENT_TIMESTAMP
             WHERE invoice_no = ? AND finance_year_id = ?`,
            [date_of_payment, utr_details, po_work_order_no, invoice_no, finance_year_id]
          );
          salesSynced++;
        } else {
          // Sales record doesn't exist, skip
          skipped++;
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Bank statement data synced successfully',
      data: {
        synced_purchase: purchaseSynced,
        synced_sales: salesSynced,
        skipped: skipped,
        total_processed: bankStatements.length
      }
    });

  } catch (error) {
    console.error('Error in syncBankStatementToRegisters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ==================== GET BANK STATEMENT SYNC STATUS ====================

/**
 * Get sync status - shows which invoices are synced and which are pending
 */
exports.getBankStatementSyncStatus = async (req, res) => {
  try {
    const { finance_year_id } = req.query;

    if (!finance_year_id) {
      return res.status(400).json({
        status: 'error',
        message: 'finance_year_id is required'
      });
    }

    // Get all bank statements with payment category
    const [bankStatements] = await db.query(
      `SELECT 
        invoice_no,
        invoice_date,
        utr_details,
        po_number,
        payment_category,
        supplier_customer_name
      FROM finance_bank_statement_consolidation 
      WHERE finance_year_id = ?
        AND is_active = 1
        AND payment_category IN ('purchase', 'purchase_advance', 'sales', 'sales_advance')
        AND invoice_no IS NOT NULL
        AND invoice_no != ''
      ORDER BY transaction_date DESC`,
      [finance_year_id]
    );

    const syncStatus = [];

    for (const bankRecord of bankStatements) {
      let isSyncedToPurchase = false;
      let isSyncedToSales = false;

      // Check if exists in purchase register
      const [purchaseExists] = await db.query(
        'SELECT id FROM finance_purchase_register WHERE invoice_no = ? AND finance_year_id = ?',
        [bankRecord.invoice_no, finance_year_id]
      );

      // Check if exists in sales register
      const [salesExists] = await db.query(
        'SELECT id FROM finance_sales_register WHERE invoice_no = ? AND finance_year_id = ?',
        [bankRecord.invoice_no, finance_year_id]
      );

      if ((bankRecord.payment_category === 'purchase' || bankRecord.payment_category === 'purchase_advance') && purchaseExists.length > 0) {
        isSyncedToPurchase = true;
      }

      if ((bankRecord.payment_category === 'sales' || bankRecord.payment_category === 'sales_advance') && salesExists.length > 0) {
        isSyncedToSales = true;
      }

      syncStatus.push({
        invoice_no: bankRecord.invoice_no,
        payment_category: bankRecord.payment_category,
        supplier_customer_name: bankRecord.supplier_customer_name,
        invoice_date: bankRecord.invoice_date,
        utr_details: bankRecord.utr_details,
        po_number: bankRecord.po_number,
        is_synced_to_purchase: isSyncedToPurchase,
        is_synced_to_sales: isSyncedToSales,
        status: (isSyncedToPurchase || isSyncedToSales) ? 'Synced' : 'Pending'
      });
    }

    const summary = {
      total: syncStatus.length,
      synced: syncStatus.filter(s => s.status === 'Synced').length,
      pending: syncStatus.filter(s => s.status === 'Pending').length
    };

    res.status(200).json({
      status: 'success',
      data: {
        summary,
        details: syncStatus
      }
    });

  } catch (error) {
    console.error('Error in getBankStatementSyncStatus:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



// ==================== MATERIAL REGISTER ====================

// Create Material Register
exports.createMaterialRegister = async (req, res) => {
  try {
    const {
      transaction_date,
      customer_name,
      dc_or_invoice,
      dc_number,
      invoice_number,
      po_number,
      work_order_number,
      uom,
      quantity,
      rate,
      gst,
      total_value,
      finance_year_id,
      created_by
    } = req.body;

    if (!transaction_date || !customer_name || !dc_or_invoice || !finance_year_id || !created_by) {
      return res.status(400).json({
        status: 'error',
        message: 'transaction_date, customer_name, dc_or_invoice, finance_year_id and created_by are required'
      });
    }

    // Validation: If DC selected, dc_number is required; if Invoice selected, invoice_number is required
    if (dc_or_invoice === 'DC' && !dc_number) {
      return res.status(400).json({
        status: 'error',
        message: 'DC Number is required when DC is selected'
      });
    }
    if (dc_or_invoice === 'Invoice' && !invoice_number) {
      return res.status(400).json({
        status: 'error',
        message: 'Invoice Number is required when Invoice is selected'
      });
    }

    const formattedTransactionDate = formatDate(transaction_date);

    const sql = `
      INSERT INTO finance_material_register (
        transaction_date,
        customer_name,
        dc_or_invoice,
        dc_number,
        invoice_number,
        po_number,
        work_order_number,
        uom,
        quantity,
        rate,
        gst,
        total_value,
        finance_year_id,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      formattedTransactionDate,
      customer_name,
      dc_or_invoice,
      dc_or_invoice === 'DC' ? dc_number : null,
      dc_or_invoice === 'Invoice' ? invoice_number : null,
      po_number || null,
      work_order_number || null,
      uom || null,
      quantity || 0,
      rate || 0,
      gst || 0,
      total_value || 0,
      finance_year_id,
      created_by
    ];

    const [result] = await db.query(sql, params);

    res.status(201).json({
      status: 'success',
      message: 'Material register created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error in createMaterialRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Material Registers
exports.getMaterialRegisters = async (req, res) => {
  try {
    const { finance_year_id } = req.query;

    let sql = `
      SELECT 
        fmr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_material_register fmr
      LEFT JOIN finance_financial_year ffy ON fmr.finance_year_id = ffy.id
      WHERE 1=1
    `;
    const params = [];

    if (finance_year_id) {
      sql += ' AND fmr.finance_year_id = ?';
      params.push(finance_year_id);
    }

    sql += ' ORDER BY fmr.transaction_date DESC, fmr.created_at DESC';

    const [rows] = await db.query(sql, params);

    // Calculate totals
    const totalValue = rows.reduce((sum, r) => sum + parseFloat(r.total_value || 0), 0);
    const totalGst = rows.reduce((sum, r) => sum + parseFloat(r.gst || 0), 0);
    const totalQuantity = rows.reduce((sum, r) => sum + parseFloat(r.quantity || 0), 0);

    const overall = {
      total_value: parseFloat(totalValue.toFixed(2)),
      total_gst: parseFloat(totalGst.toFixed(2)),
      total_quantity: parseFloat(totalQuantity.toFixed(2)),
      total_records: rows.length
    };

    res.status(200).json({
      status: 'success',
      message: 'Material registers retrieved successfully',
      data: {
        summary: overall,
        records: rows
      }
    });
  } catch (error) {
    console.error('Error in getMaterialRegisters:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get Material Register by ID
exports.getMaterialRegisterById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        fmr.*,
        CONCAT(ffy.start_year, ' - ', ffy.end_year) as financial_year
      FROM finance_material_register fmr
      LEFT JOIN finance_financial_year ffy ON fmr.finance_year_id = ffy.id
      WHERE fmr.id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Material register not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error in getMaterialRegisterById:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update Material Register
exports.updateMaterialRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      transaction_date,
      customer_name,
      dc_or_invoice,
      dc_number,
      invoice_number,
      po_number,
      work_order_number,
      uom,
      quantity,
      rate,
      gst,
      total_value,
      finance_year_id,
      updated_by
    } = req.body;

    if (!updated_by) {
      return res.status(400).json({
        status: 'error',
        message: 'updated_by is required'
      });
    }

    // Validation: If DC selected, dc_number is required; if Invoice selected, invoice_number is required
    if (dc_or_invoice === 'DC' && !dc_number) {
      return res.status(400).json({
        status: 'error',
        message: 'DC Number is required when DC is selected'
      });
    }
    if (dc_or_invoice === 'Invoice' && !invoice_number) {
      return res.status(400).json({
        status: 'error',
        message: 'Invoice Number is required when Invoice is selected'
      });
    }

    const [existing] = await db.query('SELECT * FROM finance_material_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Material register not found'
      });
    }

    const oldData = existing[0];
    const historySql = `
      INSERT INTO finance_material_register_edit_history (
        finance_material_register_id,
        transaction_date,
        customer_name,
        dc_or_invoice,
        dc_number,
        invoice_number,
        po_number,
        work_order_number,
        uom,
        quantity,
        rate,
        gst,
        total_value,
        finance_year_id,
        created_by,
        changed_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await db.query(historySql, [
      id,
      oldData.transaction_date,
      oldData.customer_name,
      oldData.dc_or_invoice,
      oldData.dc_number,
      oldData.invoice_number,
      oldData.po_number,
      oldData.work_order_number,
      oldData.uom,
      oldData.quantity,
      oldData.rate,
      oldData.gst,
      oldData.total_value,
      oldData.finance_year_id,
      oldData.created_by,
      updated_by
    ]);

    const formattedTransactionDate = formatDate(transaction_date);

    const updateSql = `
      UPDATE finance_material_register SET
        transaction_date = ?,
        customer_name = ?,
        dc_or_invoice = ?,
        dc_number = ?,
        invoice_number = ?,
        po_number = ?,
        work_order_number = ?,
        uom = ?,
        quantity = ?,
        rate = ?,
        gst = ?,
        total_value = ?,
        finance_year_id = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      formattedTransactionDate || oldData.transaction_date,
      customer_name || oldData.customer_name,
      dc_or_invoice || oldData.dc_or_invoice,
      dc_or_invoice === 'DC' ? dc_number : null,
      dc_or_invoice === 'Invoice' ? invoice_number : null,
      po_number || null,
      work_order_number || null,
      uom || null,
      quantity || 0,
      rate || 0,
      gst || 0,
      total_value || 0,
      finance_year_id || oldData.finance_year_id,
      updated_by,
      id
    ];

    await db.query(updateSql, params);

    res.status(200).json({
      status: 'success',
      message: 'Material register updated successfully'
    });
  } catch (error) {
    console.error('Error in updateMaterialRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete Material Register
exports.deleteMaterialRegister = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM finance_material_register WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Material register not found'
      });
    }

    await db.query('DELETE FROM finance_material_register WHERE id = ?', [id]);

    res.status(200).json({
      status: 'success',
      message: 'Material register deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMaterialRegister:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};