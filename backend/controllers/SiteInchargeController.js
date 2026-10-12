const db = require('../config/db');


exports.getCompletionEntries = async (req, res) => {
  try {
    const { rec_id, date } = req.query;

    if (!rec_id || isNaN(rec_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'rec_id is required and must be a number',
      });
    }

    // Fetch cumulative area up to the given date
    let cumulativeQuery = `
      SELECT COALESCE(SUM(area_added), 0) as cumulative_area
      FROM completion_entries_history
      WHERE rec_id = ? AND entry_date <= ?
    `;
    const [cumulativeResult] = await db.query(cumulativeQuery, [rec_id, date || new Date().toISOString().split('T')[0]]);

    // Fetch entries for the exact date (with remarks and is_editable)
    let entriesQuery = `
      SELECT entry_id, area_added, rate, value_added, created_by, created_at, remarks
      FROM completion_entries_history
      WHERE rec_id = ? AND entry_date = ?
      ORDER BY created_at DESC
    `;
    const [entries] = await db.query(entriesQuery, [rec_id, date || new Date().toISOString().split('T')[0]]);

    // Add is_editable flag to each entry
    const now = new Date();
    const entriesWithEditable = entries.map(entry => {
      const createdTime = new Date(entry.created_at);
      const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
      const isEditable = hoursDiff <= 48;
      return {
        ...entry,
        is_editable: isEditable
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        entries: entriesWithEditable,
        cumulative_area: parseFloat(cumulativeResult[0].cumulative_area) || 0,
      },
    });
  } catch (error) {
    console.error('Error in getCompletionEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.saveCompletionStatus = async (req, res) => {
  try {
    const { rec_id, area_added, rate, value, created_by, entry_date, remarks } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Validate inputs
    if (!rec_id || typeof rec_id !== 'number') {
      return res.status(400).json({ status: 'error', message: 'rec_id is required and must be a number' });
    }
    if (area_added === undefined || typeof area_added !== 'number' || area_added < 0) {
      return res.status(400).json({ status: 'error', message: 'area_added is required and must be a non-negative number' });
    }
    if (rate === undefined || typeof rate !== 'number' || rate < 0) {
      return res.status(400).json({ status: 'error', message: 'rate is required and must be a non-negative number' });
    }
    if (value === undefined || typeof value !== 'number' || value < 0) {
      return res.status(400).json({ status: 'error', message: 'value is required and must be a non-negative number' });
    }
    if (!created_by || typeof created_by !== 'number') {
      return res.status(400).json({ status: 'error', message: 'created_by is required and must be a number' });
    }
    if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date) || entry_date > today) {
      return res.status(400).json({ status: 'error', message: 'entry_date is required, must be in YYYY-MM-DD format, and cannot be in the future' });
    }
    if (!remarks || typeof remarks !== 'string' || remarks.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'remarks is required and must be a non-empty string' });
    }

    // Check rec_id exists in po_reckoner and get po_quantity
    const [reckonerRecord] = await db.query(
      'SELECT rec_id, po_quantity FROM po_reckoner WHERE rec_id = ?',
      [rec_id]
    );
    if (reckonerRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid rec_id (${rec_id}): record does not exist in po_reckoner` });
    }
    const po_quantity = parseFloat(reckonerRecord[0].po_quantity);

    // Check created_by exists
    const [userRecord] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (userRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid created_by (${created_by}): user does not exist` });
    }

    // Calculate server-side value_added
    const calculatedValue = parseFloat(area_added) * parseFloat(rate);
    if (Math.abs(calculatedValue - value) > 0.01) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid value: expected ${calculatedValue.toFixed(2)}, received ${value}`,
      });
    }

    // Check current completion_status (select all fields for history)
    const [completionRecord] = await db.query(
      'SELECT completion_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, work_status, billing_status, created_by, remarks, created_at, updated_at, updated_by FROM completion_status WHERE rec_id = ?',
      [rec_id]
    );

    // Insert new entry into completion_entries_history (with remarks)
    await db.query(
      `
        INSERT INTO completion_entries_history
        (rec_id, entry_date, area_added, rate, value_added, created_by, remarks, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `,
      [rec_id, entry_date, parseFloat(area_added), parseFloat(rate), calculatedValue, created_by, remarks.trim()]
    );

    // Calculate new cumulative area
    const [currentCumulative] = await db.query(
      'SELECT COALESCE(SUM(area_added), 0) as current_area FROM completion_entries_history WHERE rec_id = ?',
      [rec_id]
    );
    const new_area = parseFloat(currentCumulative[0].current_area) || 0;
    if (new_area > po_quantity) {
      return res.status(400).json({ status: 'error', message: `Completed area cannot exceed PO quantity (${po_quantity})` });
    }

    // Prepare cumulative data
    const completionData = {
      rec_id,
      area_completed: new_area,
      rate: parseFloat(rate),
      value: parseFloat((new_area * rate).toFixed(2)),
      created_by,
      work_status: 'In Progress',
      billing_status: 'Not Billed',
      remarks: remarks.trim(),
    };

    // Update or insert into completion_status
    let result;
    if (completionRecord.length === 0) {
      // No existing completion_status record, insert new one (with remarks)
      [result] = await db.query(
        `
          INSERT INTO completion_status
          (rec_id, area_completed, rate, value, created_by, work_status, billing_status, remarks, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          completionData.rec_id,
          completionData.area_completed,
          completionData.rate,
          completionData.value,
          completionData.created_by,
          completionData.work_status,
          completionData.billing_status,
          completionData.remarks,
        ]
      );
      res.status(201).json({
        status: 'success',
        message: 'Completion entry created successfully',
        data: completionData,
      });
    } else {
      // Existing record: Save old state to edit history (with all fields, null safe)
      const existingCompletion = completionRecord[0];
      await db.query(
        `
          INSERT INTO completion_edit_entries_history
          (completion_status_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, 
           work_status, billing_status, remarks, created_by, updated_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          existingCompletion.completion_id,
          existingCompletion.area_completed || null,
          existingCompletion.rate || null,
          existingCompletion.value || null,
          existingCompletion.billed_area || null,
          existingCompletion.billed_value || null,
          existingCompletion.balance_area || null,
          existingCompletion.balance_value || null,
          existingCompletion.work_status || null,
          existingCompletion.billing_status || null,
          existingCompletion.remarks || null,
          existingCompletion.created_by || null,
          existingCompletion.updated_by || null,
          existingCompletion.created_at,
          existingCompletion.updated_at || existingCompletion.created_at,
        ]
      );

      // Update completion_status (with remarks)
      [result] = await db.query(
        `
          UPDATE completion_status
          SET
            area_completed = ?,
            rate = ?,
            value = ?,
            created_by = ?,
            work_status = ?,
            billing_status = ?,
            remarks = ?,
            updated_at = NOW()
          WHERE rec_id = ?
        `,
        [
          completionData.area_completed,
          completionData.rate,
          completionData.value,
          completionData.created_by,
          completionData.work_status,
          completionData.billing_status,
          completionData.remarks,
          completionData.rec_id,
        ]
      );
      res.status(200).json({
        status: 'success',
        message: 'Completion entry updated successfully',
        data: completionData,
      });
    }
  } catch (error) {
    console.error('Error in saveCompletionStatus:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid rec_id or created_by: referenced record does not exist',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.updateCompletionEntry = async (req, res) => {
  try {
    const { entry_id, area_added, remarks, updated_by } = req.body;

    console.log('Update completion entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Validate updated_by
    if (!updated_by || typeof updated_by !== 'string' || updated_by.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Updated By is required and must be a non-empty string',
      });
    }

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate area_added if provided
    const validateArea = (val, field) => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedAreaAdded = validateArea(area_added, 'area_added');

    // Validate remarks (required for update)
    if (!remarks || typeof remarks !== 'string' || remarks.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'remarks is required and must be a non-empty string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT entry_id, rec_id, area_added, remarks, created_at, created_by
      FROM completion_entries_history 
      WHERE entry_id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Completion entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Check 48-hour window from created_at
    const createdTime = new Date(currentEntry.created_at);
    const now = new Date();
    const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
    
    console.log(`Time difference for entry ${entryId}: ${hoursDiff.toFixed(1)} hours`);
    
    if (hoursDiff > 48) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update completion entry. More than 48 hours have passed since creation (${hoursDiff.toFixed(1)} hours).`
      });
    }

    // Get the rec_id to check against po_quantity
    const recId = currentEntry.rec_id;
    const [reckonerRecord] = await db.query('SELECT po_quantity FROM po_reckoner WHERE rec_id = ?', [recId]);
    if (reckonerRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid rec_id (${recId}): record does not exist` });
    }
    const poQuantity = parseFloat(reckonerRecord[0].po_quantity) || 0;

    // Calculate current total area without this entry
    const [totalAreaWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(area_added), 0) AS total_area
       FROM completion_entries_history 
       WHERE rec_id = ? AND entry_id != ?`,
      [recId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalAreaWithoutThis[0].total_area) || 0;

    // New total after update
    const oldArea = parseFloat(currentEntry.area_added) || 0;
    const newAreaAdded = validatedAreaAdded !== null ? validatedAreaAdded : oldArea;
    const newTotal = currTotalWithoutThis + newAreaAdded;

    if (newTotal > poQuantity) {
      return res.status(400).json({ status: 'error', message: `Updated area would exceed PO quantity (${poQuantity}) after update` });
    }

    // Get current completion_status before update (to save old state)
    const [currentStatus] = await db.query(
      'SELECT completion_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, work_status, billing_status, remarks, created_by, created_at, updated_at, updated_by FROM completion_status WHERE rec_id = ?',
      [recId]
    );

    // Update the entry in completion_entries_history (no updated_by/updated_at in table, so only area and remarks)
    console.log('Updating completion_entries_history entry...');
    await db.query(
      `UPDATE completion_entries_history
       SET
         area_added = ?,
         remarks = ?
       WHERE entry_id = ?`,
      [
        newAreaAdded,
        remarks.trim(),
        entryId
      ]
    );

    console.log('Update result: success');

    // Recalculate new cumulative area
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(area_added), 0) AS new_total_area
       FROM completion_entries_history 
       WHERE rec_id = ?`,
      [recId]
    );
    const newCumulativeArea = parseFloat(newTotalCumulative[0].new_total_area) || 0;

    // Get rate
    const rate = currentStatus.length > 0 ? parseFloat(currentStatus[0].rate) : 0;
    const newValue = parseFloat((newCumulativeArea * rate).toFixed(2));

    // Save old status to edit history
    if (currentStatus.length > 0) {
      const existingStatus = currentStatus[0];
      await db.query(
        `
          INSERT INTO completion_edit_entries_history
          (completion_status_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, 
           work_status, billing_status, remarks, created_by, updated_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          existingStatus.completion_id,
          existingStatus.area_completed || null,
          existingStatus.rate || null,
          existingStatus.value || null,
          existingStatus.billed_area || null,
          existingStatus.billed_value || null,
          existingStatus.balance_area || null,
          existingStatus.balance_value || null,
          existingStatus.work_status || null,
          existingStatus.billing_status || null,
          existingStatus.remarks || null,
          existingStatus.created_by || null,
          existingStatus.updated_by || null,
          existingStatus.created_at,
          existingStatus.updated_at || existingStatus.created_at,
        ]
      );
    }

    // Update completion_status
    if (currentStatus.length === 0) {
      // If no status, create one
      await db.query(
        `
          INSERT INTO completion_status
          (rec_id, area_completed, rate, value, created_by, work_status, billing_status, remarks, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [recId, newCumulativeArea, rate, newValue, updated_by, 'In Progress', 'Not Billed', remarks.trim()]
      );
    } else {
      await db.query(
        `UPDATE completion_status 
         SET 
           area_completed = ?,
           value = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE rec_id = ?`,
        [newCumulativeArea, newValue, updated_by, recId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Completion entry updated successfully',
      data: {
        entry_id: entryId,
        rec_id: recId,
        area_added: newAreaAdded,
        remarks: remarks.trim(),
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in updateCompletionEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getCompletionEntriesBySiteID = async (req, res) => {
  try {
    const { site_id } = req.params;
    const { start_date, end_date } = req.query;

    if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date must be in YYYY-MM-DD format',
      });
    }
    if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      return res.status(400).json({
        status: 'error',
        message: 'end_date must be in YYYY-MM-DD format',
      });
    }
    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        status: 'error',
        message: 'start_date cannot be later than end_date',
      });
    }

    // Build query with joins to fetch category_name and subcategory_name (updated to include remarks)
    let query = `
      SELECT 
        ic.category_name,
        isc.subcategory_name,
        DATE_FORMAT(ceh.entry_date, '%Y-%m-%d') as entry_date,
        ceh.entry_id,
        ceh.area_added,
        ceh.rate,
        ceh.value_added,
        ceh.created_by,
        ceh.remarks,
        DATE_FORMAT(CONVERT_TZ(ceh.created_at, '+00:00', '+05:30'), '%Y-%m-%d') as created_date,
        DATE_FORMAT(CONVERT_TZ(ceh.created_at, '+00:00', '+05:30'), '%H:%i:%s') as created_time
      FROM completion_entries_history ceh
      JOIN po_reckoner pr ON ceh.rec_id = pr.rec_id
      JOIN item_category ic ON pr.category_id = ic.category_id
      JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
      WHERE pr.site_id = ?
    `;
    const queryParams = [site_id];

    if (start_date) {
      query += ' AND ceh.entry_date >= ?';
      queryParams.push(start_date);
    }
    if (end_date) {
      query += ' AND ceh.entry_date <= ?';
      queryParams.push(end_date);
    }

    query += ' ORDER BY ic.category_name, isc.subcategory_name, ceh.entry_date, ceh.created_at';

    const [rows] = await db.query(query, queryParams);

    // Structure the data
    const groupedData = [];
    const categoryMap = new Map();

    rows.forEach(row => {
      const { category_name, subcategory_name, entry_date, created_date, created_time, remarks, ...entry } = row;

      // Find or create category
      let category = categoryMap.get(category_name);
      if (!category) {
        category = { category_name, subcategories: [] };
        categoryMap.set(category_name, category);
        groupedData.push(category);
      }

      // Find or create subcategory
      let subcategory = category.subcategories.find(sc => sc.subcategory_name === subcategory_name);
      if (!subcategory) {
        subcategory = { subcategory_name, entries_by_date: [] };
        category.subcategories.push(subcategory);
      }

      // Find or create date entry
      let dateEntry = subcategory.entries_by_date.find(de => de.entry_date === entry_date);
      if (!dateEntry) {
        dateEntry = { entry_date, entries: [] };
        subcategory.entries_by_date.push(dateEntry);
      }

      // Add entry with separate date and time fields (include remarks)
      dateEntry.entries.push({
        entry_id: row.entry_id,
        area_added: parseFloat(row.area_added),
        rate: parseFloat(row.rate),
        value_added: parseFloat(row.value_added),
        created_by: row.created_by,
        created_date: row.created_date,
        created_time: row.created_time,
        remarks: row.remarks
      });
    });

    res.status(200).json({
      status: 'success',
      data: groupedData
    });
  } catch (error) {
    console.error('Error in getCompletionEntriesBySiteID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

exports.saveMaterialAcknowledgement = async (req, res) => {
  try {
    const { material_dispatch_id, overall_quantity, remarks, created_by } = req.body;

    console.log('Request body:', req.body);

    if (!material_dispatch_id || isNaN(material_dispatch_id)) {
      return res.status(400).json({ status: 'error', message: 'material_dispatch_id is required and must be a number' });
    }

    const dispatchId = parseInt(material_dispatch_id);
    if (isNaN(dispatchId)) {
      return res.status(400).json({ status: 'error', message: 'material_dispatch_id must be a valid number' });
    }

    // if (!created_by || typeof created_by !== 'string' || created_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Created By is required and must be a non-empty string',
    //   });
    // }

    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Created By: User does not exist',
      });
    }

    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined) return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQuantity = validateQuantity(overall_quantity, 'overall_quantity');

    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ status: 'error', message: 'Database connection failed', error: dbError.message });
    }

    const [dispatchRecord] = await db.query('SELECT id FROM material_dispatch WHERE id = ?', [dispatchId]);
    if (dispatchRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid material_dispatch_id (${dispatchId}): record does not exist` });
    }

    const [existingAck] = await db.query('SELECT id FROM material_acknowledgement WHERE material_dispatch_id = ?', [dispatchId]);
    if (existingAck.length > 0) {
      return res.status(400).json({ status: 'error', message: `Acknowledgement already exists for material_dispatch_id (${dispatchId}). Use update endpoint.` });
    }

    const [result] = await db.query(
      `
        INSERT INTO material_acknowledgement
        (material_dispatch_id, comp_a_qty, comp_b_qty, comp_c_qty, comp_a_remarks, comp_b_remarks, comp_c_remarks, overall_quantity, remarks, created_by, created_at, updated_at)
        VALUES (?, NULL, NULL, NULL, NULL, NULL, NULL, ?, ?, ?, NOW(), NOW())
      `,
      [
        dispatchId,
        validatedOverallQuantity,
        remarks || null,
        created_by
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Material acknowledgement saved successfully',
      data: {
        id: result.insertId,
        material_dispatch_id: dispatchId,
        overall_quantity: validatedOverallQuantity,
        remarks: remarks || null
      }
    });
  } catch (error) {
    console.error('Error in saveMaterialAcknowledgement:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Acknowledgement already exists for this material dispatch'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid material_dispatch_id: referenced record does not exist'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateMaterialAcknowledgement = async (req, res) => {
  try {
    const { ack_id, overall_quantity, remarks, updated_by } = req.body;

    // Log incoming request body for debugging
    console.log('Update request body:', req.body);

    // Validate ack_id
    if (!ack_id || isNaN(ack_id)) {
      return res.status(400).json({ status: 'error', message: 'ack_id is required and must be a number' });
    }
    const ackId = parseInt(ack_id);

    // Validate updated_by
    // if (!updated_by || typeof updated_by !== 'string' || updated_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Updated By is required and must be a non-empty string',
    //   });
    // }

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate overall_quantity if provided
    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined || qty === '') return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQuantity = validateQuantity(overall_quantity, 'overall_quantity');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if ack_id exists
    const [existingAck] = await db.query(`
      SELECT id, material_dispatch_id, overall_quantity, remarks, created_at, updated_at, created_by, updated_by
      FROM material_acknowledgement 
      WHERE id = ?
    `, [ackId]);
    
    if (existingAck.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Acknowledgement with id ${ackId} does not exist` 
      });
    }

    const currentAck = existingAck[0];

    // Check 48-hour window from created_at or last updated_at
    const lastUpdateTime = new Date(Math.max(new Date(currentAck.created_at), new Date(currentAck.updated_at || currentAck.created_at)));
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    console.log(`Time difference: ${hoursDiff.toFixed(1)} hours`);
    
    if (hoursDiff > 48) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update acknowledgement. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
      });
    }

    // Insert current state into history table BEFORE updating
    console.log('Inserting into history table...');
    const historyResult = await db.query(`
      INSERT INTO material_acknowledgement_history
      (material_acknowledgement_id, material_dispatch_id, comp_a_qty, comp_b_qty, comp_c_qty, 
       comp_a_remarks, comp_b_remarks, comp_c_remarks, overall_quantity, remarks, 
       created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ackId,
      currentAck.material_dispatch_id,
      currentAck.comp_a_qty,
      currentAck.comp_b_qty,
      currentAck.comp_c_qty,
      currentAck.comp_a_remarks,
      currentAck.comp_b_remarks,
      currentAck.comp_c_remarks,
      currentAck.overall_quantity,
      currentAck.remarks,
      currentAck.created_by,
      currentAck.updated_by,
      currentAck.created_at,
      currentAck.updated_at || currentAck.created_at
    ]);

    console.log('History insert result:', historyResult);

    // Update the main acknowledgement table
    console.log('Updating main acknowledgement table...');
    const updateResult = await db.query(`
      UPDATE material_acknowledgement
      SET
        overall_quantity = ?,
        remarks = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      validatedOverallQuantity,
      remarks || null,
      updated_by,
      ackId
    ]);

    console.log('Update result:', updateResult);

    // Fetch the updated record to return
    const [updatedRecord] = await db.query(`
      SELECT * FROM material_acknowledgement WHERE id = ?
    `, [ackId]);

    res.status(200).json({
      status: 'success',
      message: 'Material acknowledgement updated successfully',
      data: {
        id: ackId,
        material_dispatch_id: currentAck.material_dispatch_id,
        overall_quantity: validatedOverallQuantity,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in updateMaterialAcknowledgement:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getAcknowledgementDetails = async (req, res) => {
  try {
    const { material_dispatch_id } = req.query;

    if (!material_dispatch_id || isNaN(material_dispatch_id)) {
      return res.status(400).json({
        status: 'error',
        message: 'material_dispatch_id is required and must be a number',
      });
    }

    const dispatchId = parseInt(material_dispatch_id);
    if (isNaN(dispatchId)) {
      return res.status(400).json({
        status: 'error',
        message: 'material_dispatch_id must be a valid number',
      });
    }

    const query = `
      SELECT 
        id AS ack_id,
        material_dispatch_id,
        overall_quantity AS ack_overall_quantity,
        remarks AS ack_remarks,
        created_at AS ack_created_at,
        updated_at AS ack_updated_at,
        created_by,
        updated_by
      FROM material_acknowledgement
      WHERE material_dispatch_id = ?
    `;

    const [rows] = await db.query(query, [dispatchId]);

    const now = new Date();
    const data = rows.map(row => {
      const lastUpdateTime = new Date(Math.max(new Date(row.ack_created_at), new Date(row.ack_updated_at)));
      const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
      const isEditable = hoursDiff <= 48;

      return {
        id: row.ack_id,
        material_dispatch_id: row.material_dispatch_id,
        acknowledgement: {
          id: row.ack_id,
          overall_quantity: row.ack_overall_quantity,
          remarks: row.ack_remarks,
          created_at: row.ack_created_at,
          updated_at: row.ack_updated_at,
          created_by: row.created_by,
          updated_by: row.updated_by,
          is_editable: isEditable
        }
      };
    });

    res.status(200).json({
      status: 'success',
      message: 'Acknowledgement details fetched successfully',
      data
    });
  } catch (error) {
    console.error('Error in getAcknowledgementDetails:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.saveMaterialUsage = async (req, res) => {
  try {
    const { material_ack_id, entry_date, overall_qty, remarks, created_by } = req.body;

    // Log incoming request body for debugging
    console.log('Request body:', req.body);

    // Validate material_ack_id
    if (!material_ack_id || isNaN(material_ack_id)) {
      return res.status(400).json({ status: 'error', message: 'material_ack_id is required and must be a number' });
    }

    // Convert material_ack_id to integer
    const ackId = parseInt(material_ack_id);
    if (isNaN(ackId)) {
      return res.status(400).json({ status: 'error', message: 'material_ack_id must be a valid number' });
    }

    // Validate entry_date
    if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      return res.status(400).json({ status: 'error', message: 'entry_date is required in YYYY-MM-DD format' });
    }

    // Validate created_by
    // if (!created_by || typeof created_by !== 'string' || created_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Created By is required and must be a non-empty string',
    //   });
    // }

    // Verify if created_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Created By: User does not exist',
      });
    }

    // Validate overall_qty if provided
    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined) return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQty = validateQuantity(overall_qty, 'overall_qty');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check database connection
    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return res.status(500).json({ status: 'error', message: 'Database connection failed', error: dbError.message });
    }

    // Check if material_ack_id exists and get acknowledged quantities
    const [ackRecord] = await db.query('SELECT overall_quantity FROM material_acknowledgement WHERE id = ?', [ackId]);
    if (ackRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid material_ack_id (${ackId}): record does not exist` });
    }
    const ack = ackRecord[0];
    const sumAck = parseFloat(ack.overall_quantity) || 0;

    // Validate new overall_qty won't exceed acknowledged sum
    const [currentUsage] = await db.query(
      `SELECT COALESCE(SUM(overall_qty), 0) AS overall_qty
       FROM material_usage_history 
       WHERE material_ack_id = ?`,
      [ackId]
    );
    const currOverall = parseFloat(currentUsage[0].overall_qty) || 0;

    if (validatedOverallQty !== null && currOverall + validatedOverallQty > sumAck) {
      return res.status(400).json({ status: 'error', message: `Overall usage would exceed acknowledged quantity sum (${sumAck})` });
    }

    // Insert into material_usage_history
    await db.query(
      `INSERT INTO material_usage_history 
       (material_ack_id, entry_date, overall_qty, remarks, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [
        ackId,
        entry_date,
        validatedOverallQty,
        remarks || null,
        created_by
      ]
    );

    // Update or insert into material_usage
    const [existingUsage] = await db.query('SELECT id FROM material_usage WHERE material_ack_id = ?', [ackId]);

    if (existingUsage.length === 0) {
      // Insert new record
      await db.query(
        `INSERT INTO material_usage 
         (material_ack_id, overall_qty, remarks, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [
          ackId,
          validatedOverallQty || 0,
          remarks || null,
          created_by
        ]
      );
    } else {
      // Update existing record with cumulative quantities
      await db.query(
        `UPDATE material_usage 
         SET 
           overall_qty = COALESCE(overall_qty, 0) + ?,
           remarks = ?,
           created_by = ?,
           updated_at = NOW()
         WHERE material_ack_id = ?`,
        [
          validatedOverallQty || 0,
          remarks || null,
          created_by,
          ackId
        ]
      );
    }

    res.status(201).json({
      status: 'success',
      message: 'Material usage saved successfully'
    });
  } catch (error) {
    console.error('Error in saveMaterialUsage:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate entry error'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid material_ack_id: referenced record does not exist'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateMaterialUsageEntry = async (req, res) => {
  try {
    const { entry_id, overall_qty, remarks, updated_by } = req.body;

    console.log('Update material usage entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Validate updated_by
    // if (!updated_by || typeof updated_by !== 'string' || updated_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Updated By is required and must be a non-empty string',
    //   });
    // }

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate overall_qty if provided
    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined || qty === '') return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQty = validateQuantity(overall_qty, 'overall_qty');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT entry_id, material_ack_id, overall_qty, remarks, created_at, updated_at, created_by, updated_by
      FROM material_usage_history 
      WHERE entry_id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Material usage entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Check 48-hour window from created_at or last updated_at
    const lastUpdateTime = new Date(Math.max(new Date(currentEntry.created_at), new Date(currentEntry.updated_at || currentEntry.created_at)));
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    console.log(`Time difference for entry ${entryId}: ${hoursDiff.toFixed(1)} hours`);
    
    if (hoursDiff > 48) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update material usage entry. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
      });
    }

    // Get the material_ack_id to check against acknowledged quantity
    const ackId = currentEntry.material_ack_id;
    const [ackRecord] = await db.query('SELECT overall_quantity FROM material_acknowledgement WHERE id = ?', [ackId]);
    if (ackRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid material_ack_id (${ackId}): record does not exist` });
    }
    const sumAck = parseFloat(ackRecord[0].overall_quantity) || 0;

    // Calculate current total usage without this entry
    const [totalUsageWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(overall_qty), 0) AS total_qty
       FROM material_usage_history 
       WHERE material_ack_id = ? AND entry_id != ?`,
      [ackId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalUsageWithoutThis[0].total_qty) || 0;

    // New total after update
    const newOverallQty = validatedOverallQty !== null ? validatedOverallQty : parseFloat(currentEntry.overall_qty) || 0;
    const newTotal = currTotalWithoutThis + newOverallQty;

    if (newTotal > sumAck) {
      return res.status(400).json({ status: 'error', message: `Overall usage would exceed acknowledged quantity sum (${sumAck}) after update` });
    }

    // Insert current state into edit history BEFORE updating
    console.log('Inserting into edit history table...');
    const historyResult = await db.query(`
      INSERT INTO material_usage_edit_history
      (material_usage_history_id, material_ack_id, comp_a_qty, comp_b_qty, comp_c_qty, 
       comp_a_remarks, comp_b_remarks, comp_c_remarks, overall_qty, remarks, 
       created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entryId,
      currentEntry.material_ack_id,
      currentEntry.comp_a_qty || null,
      currentEntry.comp_b_qty || null,
      currentEntry.comp_c_qty || null,
      currentEntry.comp_a_remarks || null,
      currentEntry.comp_b_remarks || null,
      currentEntry.comp_c_remarks || null,
      currentEntry.overall_qty,
      currentEntry.remarks,
      currentEntry.created_by,
      currentEntry.updated_by,
      currentEntry.created_at,
      currentEntry.updated_at || currentEntry.created_at
    ]);

    console.log('Edit history insert result:', historyResult);

    // Update the entry in material_usage_history
    console.log('Updating material_usage_history entry...');
    const updateResult = await db.query(`
      UPDATE material_usage_history
      SET
        overall_qty = ?,
        remarks = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE entry_id = ?
    `, [
      newOverallQty,
      remarks || null,
      updated_by,
      entryId
    ]);

    console.log('Update result:', updateResult);

    // Recalculate and update cumulative in material_usage
    console.log('Recalculating cumulative in material_usage...');
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(overall_qty), 0) AS new_total
       FROM material_usage_history 
       WHERE material_ack_id = ?`,
      [ackId]
    );
    const newCumulativeTotal = parseFloat(newTotalCumulative[0].new_total) || 0;

    const [existingUsage] = await db.query('SELECT id FROM material_usage WHERE material_ack_id = ?', [ackId]);
    if (existingUsage.length === 0) {
      await db.query(
        `INSERT INTO material_usage 
         (material_ack_id, overall_qty, remarks, created_by, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [ackId, newCumulativeTotal, remarks || null, currentEntry.created_by, updated_by]
      );
    } else {
      await db.query(
        `UPDATE material_usage 
         SET 
           overall_qty = ?,
           remarks = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE material_ack_id = ?`,
        [newCumulativeTotal, remarks || null, updated_by, ackId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Material usage entry updated successfully',
      data: {
        entry_id: entryId,
        material_ack_id: ackId,
        overall_qty: newOverallQty,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in updateMaterialUsageEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getMaterialUsageDetails = async (req, res) => {
  try {
    const { material_ack_id, date } = req.query;

    if (!material_ack_id || isNaN(parseInt(material_ack_id))) {
      return res.status(400).json({ status: 'error', message: 'material_ack_id is required and must be a number' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ status: 'error', message: 'date is required in YYYY-MM-DD format' });
    }

    const ackId = parseInt(material_ack_id);

    // Fetch entries for the specific date
    const [entries] = await db.query(
      `SELECT entry_id, overall_qty, remarks, created_at, created_by, updated_at, updated_by
       FROM material_usage_history 
       WHERE material_ack_id = ? AND entry_date = ? 
       ORDER BY created_at DESC`,
      [ackId, date]
    );

    // Add is_editable flag to each entry (fixed to use max(created_at, updated_at))
    const now = new Date();
    const entriesWithEditable = entries.map(entry => {
      const lastUpdateTime = new Date(Math.max(new Date(entry.created_at), new Date(entry.updated_at || entry.created_at)));
      const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
      const isEditable = hoursDiff <= 48;
      return {
        ...entry,
        is_editable: isEditable
      };
    });

    // Fetch cumulative usage up to the date
    const [cumulative] = await db.query(
      `SELECT 
         COALESCE(SUM(overall_qty), 0) AS overall_qty
       FROM material_usage_history 
       WHERE material_ack_id = ? AND entry_date <= ?`,
      [ackId, date]
    );

    // Fetch total cumulative usage (all dates)
    const [totalCumulative] = await db.query(
      `SELECT 
         COALESCE(SUM(overall_qty), 0) AS overall_qty
       FROM material_usage_history 
       WHERE material_ack_id = ?`,
      [ackId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        cumulative: cumulative[0],
        total_cumulative: totalCumulative[0],
        entries: entriesWithEditable
      }
    });
  } catch (error) {
    console.error('Error in getMaterialUsageDetails:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

exports.getWorkDescriptionsBySite = async (req, res) => {
  try {
    const { site_id } = req.query;
    if (!site_id) {
      return res.status(400).json({ status: 'error', message: 'site_id is required' });
    }

    const [descIds] = await db.query(
      `SELECT DISTINCT desc_id 
       FROM po_reckoner 
       WHERE site_id = ?`,
      [site_id]
    );

    if (descIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }

    const descIdList = descIds.map(d => d.desc_id);
    const [descriptions] = await db.query(
      `SELECT desc_id, desc_name 
       FROM work_descriptions 
       WHERE desc_id IN (?)`,
      [descIdList]
    );

    res.status(200).json({
      status: 'success',
      data: descriptions || []
    });
  } catch (error) {
    console.error('Error in getWorkDescriptionsBySite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getEmployeesByDesignation = async (req, res) => {
  try {
    const designationId = 6; // Fixed designation_id for labour
    const [employees] = await db.query(
      `SELECT emp_id, full_name 
       FROM employee_master 
       WHERE designation_id = ?`,
      [designationId]
    );

    res.status(200).json({
      status: 'success',
      data: employees || []
    });
  } catch (error) {
    console.error('Error in getEmployeesByDesignation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getAssignedLabours = async (req, res) => {
  try {
    const { project_id, site_id, desc_id } = req.query;

    if (!project_id || !site_id || !desc_id || isNaN(desc_id)) {
      return res.status(400).json({ status: 'error', message: 'project_id, site_id, and desc_id are required' });
    }

    // Enhanced query to join with labour table for full_name and mobile, and include created_at
    const [labours] = await db.query(
      `SELECT la.id, la.labour_id, l.full_name, l.mobile, la.from_date, la.to_date, la.salary, la.created_at
       FROM labour_assignment la 
       JOIN labour l ON la.labour_id = l.id
       WHERE la.project_id = ? AND la.site_id = ? AND la.desc_id = ?`,
      [project_id, site_id, desc_id]
    );

    // Add is_editable flag to each labour based on 48-hour window from created_at
    const now = new Date();
    const laboursWithEditable = labours.map(labour => {
      const createdTime = new Date(labour.created_at);
      const hoursDiff = (now - createdTime) / (1000 * 60 * 60);
      const isEditable = hoursDiff <= 48;
      return {
        ...labour,
        is_editable: isEditable
      };
    });

    res.status(200).json({
      status: 'success',
      data: laboursWithEditable || []
    });
  } catch (error) {
    console.error('Error in getAssignedLabours:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.saveLabourAttendance = async (req, res) => {
  try {
    const { attendance_data, created_by } = req.body;
    console.log('Received payload:', req.body); // Debug log

    if (!attendance_data || !Array.isArray(attendance_data) || attendance_data.length === 0) {
      console.log('Validation failed: attendance_data missing, not an array, or empty');
      return res.status(400).json({ status: 'error', message: 'attendance_data is required and must be a non-empty array' });
    }
    if (!created_by || isNaN(created_by)) {
      console.log('Validation failed: created_by missing or not a number');
      return res.status(400).json({ status: 'error', message: 'created_by is required and must be a number' });
    }

    // Verify created_by exists
    const [userRecord] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (userRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid created_by user_id' });
    }

    const now = new Date();

    for (const data of attendance_data) {
      const { labour_assignment_id, entry_date, shift, remarks, attendance_id } = data;

      // Common validations
      if (!labour_assignment_id || isNaN(labour_assignment_id)) {
        console.log('Validation failed: labour_assignment_id missing or not a number');
        return res.status(400).json({ status: 'error', message: 'labour_assignment_id is required and must be a number for each attendance entry' });
      }
      if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
        console.log('Validation failed: entry_date missing or invalid format');
        return res.status(400).json({ status: 'error', message: 'entry_date is required in YYYY-MM-DD format for each attendance entry' });
      }
      const parsedShift = parseFloat(shift);
      if (isNaN(parsedShift) || parsedShift < 0) {
        console.log('Validation failed: shift must be a non-negative number');
        return res.status(400).json({ status: 'error', message: 'shift is required and must be a non-negative number for each attendance entry' });
      }
      if (remarks && typeof remarks !== 'string') {
        return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
      }

      const [assignment] = await db.query('SELECT id FROM labour_assignment WHERE id = ?', [labour_assignment_id]);
      if (assignment.length === 0) {
        console.log('Validation failed: Invalid labour_assignment_id', labour_assignment_id);
        return res.status(400).json({ status: 'error', message: 'Invalid labour_assignment_id' });
      }

      if (attendance_id) {
        // Update existing attendance
        const attendanceId = parseInt(attendance_id);
        if (isNaN(attendanceId)) {
          return res.status(400).json({ status: 'error', message: 'attendance_id must be a number for updates' });
        }

        // Fetch current state for history
        const [existingAttendance] = await db.query(`
          SELECT id, labour_assignment_id, shift, remarks, created_by, created_at, updated_at
          FROM labour_attendance 
          WHERE id = ?
        `, [attendanceId]);

        if (existingAttendance.length === 0) {
          return res.status(400).json({ status: 'error', message: `Attendance entry with id ${attendanceId} does not exist` });
        }

        const currentAttendance = existingAttendance[0];

        // Check 48-hour window
        const lastUpdateTime = new Date(Math.max(new Date(currentAttendance.created_at), new Date(currentAttendance.updated_at || currentAttendance.created_at)));
        const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
        if (hoursDiff > 48) {
          return res.status(400).json({
            status: 'error',
            message: `Cannot update attendance entry ${attendanceId}. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
          });
        }

        // Insert current state into edit history
        await db.query(
          `INSERT INTO labour_attendance_edit_history
           (labour_attendance_id, labour_assignment_id, shift, remarks, created_by, updated_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attendanceId,
            currentAttendance.labour_assignment_id,
            currentAttendance.shift,
            currentAttendance.remarks,
            currentAttendance.created_by,
            currentAttendance.updated_by,
            currentAttendance.created_at,
            currentAttendance.updated_at || currentAttendance.created_at
          ]
        );

        // Update the attendance
        await db.query(
          `UPDATE labour_attendance
           SET shift = ?, remarks = ?, updated_by = ?, updated_at = NOW()
           WHERE id = ?`,
          [parsedShift, remarks || null, created_by, attendanceId]
        );
      } else {
        // Insert new attendance
        await db.query(
          `INSERT INTO labour_attendance 
           (labour_assignment_id, shift, remarks, created_by, created_at, entry_date)
           VALUES (?, ?, ?, ?, NOW(), ?)`,
          [labour_assignment_id, parsedShift, remarks || null, created_by, entry_date]
        );
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Labour attendance saved/updated successfully'
    });
  } catch (error) {
    console.error('Error in saveLabourAttendance:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate attendance entry'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.saveLabourAssignment = async (req, res) => {
  try {
    const { project_id, site_id, desc_id, labour_ids, from_date, to_date, created_by } = req.body;
    console.log("Received payload:", req.body); // Debug log

    // Basic input validation
    if (!project_id) {
      console.log("Validation failed: project_id missing");
      return res.status(400).json({ status: "error", message: "project_id is required" });
    }
    if (!site_id) {
      console.log("Validation failed: site_id missing");
      return res.status(400).json({ status: "error", message: "site_id is required" });
    }
    if (!desc_id || isNaN(desc_id)) {
      console.log("Validation failed: desc_id missing or not a number");
      return res.status(400).json({ status: "error", message: "desc_id is required and must be a number" });
    }
    if (!labour_ids || !Array.isArray(labour_ids) || labour_ids.length === 0) {
      console.log("Validation failed: labour_ids missing, not an array, or empty");
      return res.status(400).json({ status: "error", message: "labour_ids is required and must be a non-empty array" });
    }
    if (!from_date || !/^\d{4}-\d{2}-\d{2}$/.test(from_date)) {
      console.log("Validation failed: from_date missing or invalid format");
      return res.status(400).json({ status: "error", message: "from_date is required in YYYY-MM-DD format" });
    }
    if (!to_date || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
      console.log("Validation failed: to_date missing or invalid format");
      return res.status(400).json({ status: "error", message: "to_date is required in YYYY-MM-DD format" });
    }
    if (!created_by || isNaN(created_by)) {
      console.log("Validation failed: created_by missing or not a number");
      return res.status(400).json({ status: "error", message: "created_by is required and must be a number" });
    }

    // Validate date range
    if (new Date(from_date) > new Date(to_date)) {
      console.log("Validation failed: from_date later than to_date");
      return res.status(400).json({ status: "error", message: "from_date cannot be later than to_date" });
    }

    // Check foreign key existence
    const [project] = await db.query("SELECT pd_id FROM project_details WHERE pd_id = ?", [project_id]);
    if (project.length === 0) {
      console.log("Validation failed: Invalid project_id", project_id);
      return res.status(400).json({ status: "error", message: "Invalid project_id" });
    }
    const [site] = await db.query("SELECT site_id FROM site_details WHERE site_id = ?", [site_id]);
    if (site.length === 0) {
      console.log("Validation failed: Invalid site_id", site_id);
      return res.status(400).json({ status: "error", message: "Invalid site_id" });
    }
    const [workDesc] = await db.query("SELECT desc_id FROM work_descriptions WHERE desc_id = ?", [desc_id]);
    if (workDesc.length === 0) {
      console.log("Validation failed: Invalid desc_id", desc_id);
      return res.status(400).json({ status: "error", message: "Invalid desc_id" });
    }
    const [labours] = await db.query("SELECT id FROM labour WHERE id IN (?)", [labour_ids]);
    if (labours.length !== labour_ids.length) {
      console.log("Validation failed: Invalid labour_ids", labour_ids);
      return res.status(400).json({ status: "error", message: "One or more labour_ids are invalid" });
    }
    const [user] = await db.query("SELECT user_id FROM users WHERE user_id = ?", [created_by]);
    if (user.length === 0) {
      console.log("Validation failed: Invalid created_by", created_by);
      return res.status(400).json({ status: "error", message: "Invalid created_by user_id" });
    }

    // Insert a row for each labour_id
    for (const labour_id of labour_ids) {
      await db.query(
        `INSERT INTO labour_assignment 
         (project_id, site_id, desc_id, labour_id, from_date, to_date, created_by, created_at, salary)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NULL)`,
        [project_id, site_id, desc_id, labour_id, from_date, to_date, created_by]
      );
    }

    res.status(201).json({
      status: "success",
      message: "Labour assignments saved successfully",
    });
  } catch (error) {
    console.error("Error in saveLabourAssignment:", {
      error: error.message,
      stack: error.stack,
    });
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "error",
        message: "Duplicate labour assignment",
      });
    }
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Invalid foreign key reference",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updateLabourAssignment = async (req, res) => {
  try {
    const { assignment_id, from_date, to_date, salary, updated_by } = req.body;

    console.log('Update labour assignment request body:', req.body);

    // Validate assignment_id
    if (!assignment_id || isNaN(assignment_id)) {
      return res.status(400).json({ status: 'error', message: 'assignment_id is required and must be a number' });
    }
    const assignmentId = parseInt(assignment_id);

    // Validate dates
    if (!from_date || !/^\d{4}-\d{2}-\d{2}$/.test(from_date)) {
      return res.status(400).json({ status: 'error', message: 'from_date is required in YYYY-MM-DD format' });
    }
    if (!to_date || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
      return res.status(400).json({ status: 'error', message: 'to_date is required in YYYY-MM-DD format' });
    }
    if (new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ status: 'error', message: 'from_date cannot be later than to_date' });
    }

    // Validate salary if provided
    let validatedSalary = null;
    if (salary !== undefined) {
      if (salary === null || salary === '') {
        validatedSalary = null;
      } else {
        const parsedSalary = parseFloat(salary);
        if (isNaN(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({ status: 'error', message: 'salary must be a non-negative number' });
        }
        validatedSalary = parsedSalary;
      }
    }

    // Validate updated_by
    if (!updated_by || isNaN(updated_by)) {
      return res.status(400).json({ status: 'error', message: 'updated_by is required and must be a number' });
    }

    // Verify if updated_by exists
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({ status: 'error', message: 'Invalid updated_by: User does not exist' });
    }

    // Check if assignment_id exists and fetch current state (include updated_by and updated_at)
    const [existingAssignment] = await db.query(`
      SELECT id, project_id, site_id, desc_id, labour_id, from_date, to_date, salary, created_by, updated_by, created_at, updated_at
      FROM labour_assignment 
      WHERE id = ?
    `, [assignmentId]);
    
    if (existingAssignment.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Labour assignment with id ${assignmentId} does not exist` 
      });
    }

    const currentAssignment = existingAssignment[0];

    // Check 48-hour window from created_at (or updated_at if exists)
    const lastUpdateTime = new Date(Math.max(new Date(currentAssignment.created_at), new Date(currentAssignment.updated_at || currentAssignment.created_at)));
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    console.log(`Time difference for assignment ${assignmentId}: ${hoursDiff.toFixed(1)} hours`);
    
    if (hoursDiff > 48) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update labour assignment. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
      });
    }

    // Insert current state into edit history BEFORE updating (copy all fields, including updated_at)
    console.log('Inserting into edit history table...');
    await db.query(
      `INSERT INTO labour_assignment_edit_history
       (labour_assignment_id, project_id, site_id, desc_id, labour_id, from_date, to_date, salary, 
        created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assignmentId,
        currentAssignment.project_id,
        currentAssignment.site_id,
        currentAssignment.desc_id,
        currentAssignment.labour_id,
        currentAssignment.from_date,
        currentAssignment.to_date,
        currentAssignment.salary,
        currentAssignment.created_by,
        currentAssignment.updated_by,
        currentAssignment.created_at,
        currentAssignment.updated_at || currentAssignment.created_at
      ]
    );

    console.log('History insert result: success');

    // Update the assignment (always include salary set to validatedSalary, which could be null)
    console.log('Updating labour_assignment...');
    const updateQuery = `
      UPDATE labour_assignment
      SET
        from_date = ?,
        to_date = ?,
        salary = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    const updateParams = [from_date, to_date, validatedSalary, updated_by, assignmentId];

    await db.query(updateQuery, updateParams);

    console.log('Update result: success');

    res.status(200).json({
      status: 'success',
      message: 'Labour assignment updated successfully',
      data: {
        assignment_id: assignmentId,
        from_date,
        to_date,
        salary: validatedSalary,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in updateLabourAssignment:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.getLabourAttendance = async (req, res) => {
  try {
    const { project_id, site_id, desc_id, entry_date } = req.query;

    // Input validation
    if (!project_id || !site_id || !desc_id || isNaN(desc_id)) {
      console.log(
        `Validation failed: Missing or invalid parameters - project_id: ${project_id}, site_id: ${site_id}, desc_id: ${desc_id}`
      );
      return res.status(400).json({
        status: "error",
        message: "project_id, site_id, and desc_id are required and must be valid",
      });
    }

    if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      console.log(`Validation failed: Invalid entry_date - ${entry_date}`);
      return res.status(400).json({
        status: "error",
        message: "entry_date is required in YYYY-MM-DD format",
      });
    }

    // Query with DISTINCT to avoid duplicate rows, include attendance_id, remarks, created_at, updated_at
    const [labours] = await db.query(
      `SELECT DISTINCT 
         la.id as assignment_id, 
         la.labour_id, 
         l.full_name, 
         lat.id as attendance_id,
         lat.shift,
         lat.remarks,
         lat.created_at,
         lat.updated_at
       FROM labour_assignment la 
       JOIN labour l ON la.labour_id = l.id 
       LEFT JOIN labour_attendance lat ON la.id = lat.labour_assignment_id AND lat.entry_date = ?
       WHERE la.project_id = ? AND la.site_id = ? AND la.desc_id = ?`,
      [entry_date, project_id, site_id, desc_id]
    );

    // Log the number of records returned for debugging
    console.log(
      `getLabourAttendance: Retrieved ${labours.length} records for project_id: ${project_id}, site_id: ${site_id}, desc_id: ${desc_id}, entry_date: ${entry_date}`
    );

    // Add is_editable flag only for rows with attendance_id
    const now = new Date();
    const laboursWithEditable = labours.map(labour => {
      if (labour.attendance_id) {
        const lastUpdateTime = new Date(Math.max(new Date(labour.created_at), new Date(labour.updated_at || labour.created_at)));
        const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
        const isEditable = hoursDiff <= 48;
        return {
          ...labour,
          is_editable: isEditable
        };
      }
      return labour; // For new rows, no is_editable
    });

    // Return response
    res.status(200).json({
      status: "success",
      data: laboursWithEditable || [],
    });
  } catch (error) {
    console.error("Error in getLabourAttendance:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.getBudgetDetails = async (req, res) => {
  try {
    const { site_id } = req.query;

    if (!site_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id is required',
      });
    }

    // Fetch po_budget for the site with desc_id
    const [poBudgets] = await db.query(
      `SELECT id, total_budget_value, desc_id 
       FROM po_budget 
       WHERE site_id = ?`,
      [site_id]
    );

    if (poBudgets.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }

    const poBudgetIds = poBudgets.map(pb => pb.id);

    // Fetch actual_budget entries with overhead details and work description
    const [actualBudgets] = await db.query(
      `SELECT 
        ab.id, 
        ab.overhead_id, 
        ab.po_budget_id, 
        ab.splitted_budget, 
        ab.actual_value, 
        ab.difference_value, 
        ab.remarks,
        o.expense_name,
        wd.desc_name AS work_descriptions
      FROM actual_budget ab
      JOIN overhead o ON ab.overhead_id = o.id
      LEFT JOIN po_budget pb ON ab.po_budget_id = pb.id
      LEFT JOIN work_descriptions wd ON pb.desc_id = wd.desc_id
      WHERE ab.po_budget_id IN (?)`,
      [poBudgetIds]
    );

    res.status(200).json({
      status: 'success',
      data: actualBudgets
    });
  } catch (error) {
    console.error('Error in getBudgetDetails:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getBudgetExpenseDetails = async (req, res) => {
  try {
    const { actual_budget_id, date } = req.query;

    if (!actual_budget_id || isNaN(parseInt(actual_budget_id))) {
      return res.status(400).json({ status: 'error', message: 'actual_budget_id is required and must be a number' });
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ status: 'error', message: 'date is required in YYYY-MM-DD format' });
    }

    const budgetId = parseInt(actual_budget_id);

    // Fetch entries for the specific date
    const [entries] = await db.query(
      `SELECT id, actual_value, remarks, created_at, created_by, updated_at, updated_by
       FROM actual_budget_history 
       WHERE actual_budget_id = ? AND entry_date = ? 
       ORDER BY created_at DESC`,
      [budgetId, date]
    );

    // Add is_editable flag to each entry (fixed to use max(created_at, updated_at))
    const now = new Date();
    const entriesWithEditable = entries.map(entry => {
      const lastUpdateTime = new Date(Math.max(new Date(entry.created_at), new Date(entry.updated_at || entry.created_at)));
      const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
      const isEditable = hoursDiff <= 48;
      return {
        ...entry,
        is_editable: isEditable
      };
    });

    // Fetch cumulative actual_value up to the date
    const [cumulative] = await db.query(
      `SELECT 
         COALESCE(SUM(actual_value), 0) AS actual_value
       FROM actual_budget_history 
       WHERE actual_budget_id = ? AND entry_date <= ?`,
      [budgetId, date]
    );

    // Fetch total cumulative actual_value (all dates)
    const [totalCumulative] = await db.query(
      `SELECT 
         COALESCE(SUM(actual_value), 0) AS actual_value
       FROM actual_budget_history 
       WHERE actual_budget_id = ?`,
      [budgetId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        cumulative: cumulative[0],
        total_cumulative: totalCumulative[0],
        entries: entriesWithEditable
      }
    });
  } catch (error) {
    console.error('Error in getBudgetExpenseDetails:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error', error: error.message });
  }
};

exports.saveBudgetExpense = async (req, res) => {
  try {
    const { actual_budget_id, entry_date, actual_value, remarks, created_by } = req.body;

    console.log('Save budget expense request body:', req.body);

    // Validate actual_budget_id
    if (!actual_budget_id || isNaN(actual_budget_id)) {
      return res.status(400).json({ status: 'error', message: 'actual_budget_id is required and must be a number' });
    }

    const budgetId = parseInt(actual_budget_id);

    // Validate entry_date
    if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
      return res.status(400).json({ status: 'error', message: 'entry_date is required in YYYY-MM-DD format' });
    }

    // Validate created_by (used as updater_id for updates)
    // if (!created_by || typeof created_by !== 'string' || created_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Created By is required and must be a non-empty string',
    //   });
    // }

    // Verify if created_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Created By: User does not exist',
      });
    }

    // Validate actual_value if provided
    const validateValue = (val, field) => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedActualValue = validateValue(actual_value, 'actual_value');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if actual_budget_id exists and get splitted_budget
    const [budgetRecord] = await db.query('SELECT splitted_budget FROM actual_budget WHERE id = ?', [budgetId]);
    if (budgetRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid actual_budget_id (${budgetId}): record does not exist` });
    }
    const splittedBudget = parseFloat(budgetRecord[0].splitted_budget) || 0;

    // Get current cumulative actual_value before any changes
    const [currentActual] = await db.query(
      `SELECT COALESCE(SUM(actual_value), 0) AS actual_value
       FROM actual_budget_history 
       WHERE actual_budget_id = ?`,
      [budgetId]
    );
    let currActual = parseFloat(currentActual[0].actual_value) || 0;

    // Check if entry already exists for this date
    const [existingEntry] = await db.query(
      `SELECT id, actual_budget_id, actual_value, remarks, created_by, updated_by, created_at, updated_at 
       FROM actual_budget_history 
       WHERE actual_budget_id = ? AND entry_date = ?`,
      [budgetId, entry_date]
    );

    if (existingEntry.length > 0) {
      // Entry exists, update it
      const existing = existingEntry[0];
      
      // Check 48-hour window from last update time
      const lastUpdateTime = new Date(Math.max(new Date(existing.created_at), new Date(existing.updated_at || existing.created_at)));
      const now = new Date();
      const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 48) {
        return res.status(400).json({
          status: 'error',
          message: `Cannot update budget expense. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
        });
      }

      // Calculate old and new values for exceed check
      const oldValue = parseFloat(existing.actual_value) || 0;
      const newValue = validatedActualValue !== null ? validatedActualValue : oldValue;
      const newActual = currActual - oldValue + newValue;
      const newDifference = splittedBudget - newActual;

      if (newActual > splittedBudget) {
        return res.status(400).json({ status: 'error', message: `Expense would exceed splitted budget (${splittedBudget.toFixed(2)})` });
      }

      // Insert old state into edit history before updating
      await db.query(
        `INSERT INTO actual_budget_edit_history
         (actual_budget_history_id, actual_budget_id, actual_value, remarks, 
          created_by, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          existing.id,
          budgetId,
          existing.actual_value,
          existing.remarks,
          existing.created_by,
          existing.updated_by,
          existing.created_at,
          existing.updated_at || existing.created_at
        ]
      );

      // Update the existing entry
      await db.query(
        `UPDATE actual_budget_history 
         SET 
           actual_value = ?,
           remarks = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE id = ?`,
        [
          newValue,
          remarks || null,
          created_by,  // Use as updater
          existing.id
        ]
      );

      // Update cumulative in actual_budget
      await db.query(
        `UPDATE actual_budget 
         SET 
           actual_value = ?,
           difference_value = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE id = ?`,
        [
          newActual,
          newDifference,
          created_by,
          budgetId
        ]
      );

      res.status(200).json({
        status: 'success',
        message: 'Budget expense updated successfully'
      });

    } else {
      // No existing entry, insert new one
      const newValue = validatedActualValue !== null ? validatedActualValue : 0;
      const newActual = currActual + newValue;
      const newDifference = splittedBudget - newActual;

      if (newActual > splittedBudget) {
        return res.status(400).json({ status: 'error', message: `Expense would exceed splitted budget (${splittedBudget.toFixed(2)})` });
      }

      // Insert new entry into actual_budget_history
      const [insertResult] = await db.query(
        `INSERT INTO actual_budget_history 
         (actual_budget_id, entry_date, actual_value, remarks, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          budgetId,
          entry_date,
          newValue,
          remarks || null,
          created_by
        ]
      );

      // Update cumulative in actual_budget
      await db.query(
        `UPDATE actual_budget 
         SET 
           actual_value = ?,
           difference_value = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE id = ?`,
        [
          newActual,
          newDifference,
          created_by,
          budgetId
        ]
      );

      res.status(201).json({
        status: 'success',
        message: 'Budget expense saved successfully'
      });
    }

  } catch (error) {
    console.error('Error in saveBudgetExpense:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate entry error'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid actual_budget_id: referenced record does not exist'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.updateBudgetExpenseEntry = async (req, res) => {
  try {
    const { entry_id, actual_value, remarks, updated_by } = req.body;

    console.log('Update budget expense entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Validate updated_by
    // if (!updated_by || typeof updated_by !== 'string' || updated_by.trim() === '') {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: 'Updated By is required and must be a non-empty string',
    //   });
    // }

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate actual_value if provided
    const validateValue = (val, field) => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedActualValue = validateValue(actual_value, 'actual_value');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT id, actual_budget_id, entry_date, actual_value, remarks, created_at, updated_at, created_by, updated_by
      FROM actual_budget_history 
      WHERE id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Budget expense entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Check 48-hour window from created_at or last updated_at
    const lastUpdateTime = new Date(Math.max(new Date(currentEntry.created_at), new Date(currentEntry.updated_at || currentEntry.created_at)));
    const now = new Date();
    const hoursDiff = (now - lastUpdateTime) / (1000 * 60 * 60);
    
    console.log(`Time difference for entry ${entryId}: ${hoursDiff.toFixed(1)} hours`);
    
    if (hoursDiff > 48) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot update budget expense entry. More than 48 hours have passed since creation/update (${hoursDiff.toFixed(1)} hours).`
      });
    }

    // Get the actual_budget_id to check against splitted_budget
    const budgetId = currentEntry.actual_budget_id;
    const [budgetRecord] = await db.query('SELECT splitted_budget FROM actual_budget WHERE id = ?', [budgetId]);
    if (budgetRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid actual_budget_id (${budgetId}): record does not exist` });
    }
    const maxBudget = parseFloat(budgetRecord[0].splitted_budget) || 0;

    // Calculate current total expense without this entry
    const [totalExpenseWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(actual_value), 0) AS total_expense
       FROM actual_budget_history 
       WHERE actual_budget_id = ? AND id != ?`,
      [budgetId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalExpenseWithoutThis[0].total_expense) || 0;

    // New total after update
    const oldValue = parseFloat(currentEntry.actual_value) || 0;
    const newActualValue = validatedActualValue !== null ? validatedActualValue : oldValue;
    const newTotal = currTotalWithoutThis + newActualValue;

    if (newTotal > maxBudget) {
      return res.status(400).json({ status: 'error', message: `Expense would exceed splitted budget (${maxBudget.toFixed(2)}) after update` });
    }

    // Insert current (old) state into edit_history BEFORE updating
    console.log('Inserting into edit history table...');
    await db.query(
      `INSERT INTO actual_budget_edit_history
       (actual_budget_history_id, actual_budget_id, actual_value, remarks, 
        created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entryId,
        currentEntry.actual_budget_id,
        currentEntry.actual_value,
        currentEntry.remarks,
        currentEntry.created_by,
        currentEntry.updated_by,
        currentEntry.created_at,
        currentEntry.updated_at || currentEntry.created_at
      ]
    );

    console.log('Edit history insert result: success');

    // Update the entry in actual_budget_history
    console.log('Updating actual_budget_history entry...');
    await db.query(
      `UPDATE actual_budget_history
       SET
         actual_value = ?,
         remarks = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        newActualValue,
        remarks || null,
        updated_by,
        entryId
      ]
    );

    console.log('Update result: success');

    // Recalculate and update cumulative in actual_budget
    console.log('Recalculating cumulative in actual_budget...');
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(actual_value), 0) AS new_total
       FROM actual_budget_history 
       WHERE actual_budget_id = ?`,
      [budgetId]
    );
    const newCumulativeTotal = parseFloat(newTotalCumulative[0].new_total) || 0;
    const newDifference = maxBudget - newCumulativeTotal;  // Fixed: use value, not object

    await db.query(
      `UPDATE actual_budget 
       SET 
         actual_value = ?,
         difference_value = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [newCumulativeTotal, newDifference, updated_by, budgetId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Budget expense entry updated successfully',
      data: {
        entry_id: entryId,
        actual_budget_id: budgetId,
        actual_value: newActualValue,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in updateBudgetExpenseEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getBudgetWorkDescriptionsBySite = async (req, res) => {
  try {
    const { site_id } = req.params;

    if (!site_id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'site_id is required' 
      });
    }

    // First, get unique desc_id from po_reckoner for the given site_id
    const [descIds] = await db.query(
      `SELECT DISTINCT desc_id 
       FROM po_reckoner 
       WHERE site_id = ?`,
      [site_id]
    );

    if (descIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: []
      });
    }

    // Get the corresponding desc_name from work_descriptions table
    const descIdList = descIds.map(d => d.desc_id);
    const [descriptions] = await db.query(
      `SELECT desc_id, desc_name 
       FROM work_descriptions 
       WHERE desc_id IN (?) 
       ORDER BY desc_name`,
      [descIdList]
    );

    res.status(200).json({
      status: 'success',
      data: descriptions || []
    });
  } catch (error) {
    console.error('Error in getBudgetWorkDescriptionsBySite:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getLabours = async (req, res) => {
  try {
    // Query to fetch id and full_name from the labour table
    const [labours] = await db.query(
      `SELECT id, full_name 
       FROM labour`
    );

    // Log the number of records retrieved for debugging
    console.log(`getLabours: Retrieved ${labours.length} labour records`);

    // Return response
    res.status(200).json({
      status: "success",
      data: labours || [],
    });
  } catch (error) {
    console.error("Error in getLabours:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.calculateLabourBudget = async (req, res) => {
  try {
    // Step 1: Fetch all labour assignments with labour_id, full_name, desc_id, and desc_name
    const [assignments] = await db.query(
      `SELECT la.id, la.project_id, la.site_id, la.desc_id, la.salary, la.labour_id, l.full_name, wd.desc_name 
       FROM labour_assignment la
       JOIN labour l ON la.labour_id = l.id
       JOIN work_descriptions wd ON la.desc_id = wd.desc_id`
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No labour assignments found.",
      });
    }

    // Step 2: Group assignments by po_budget_id for efficient processing
    const budgetMap = new Map(); // Map<po_budget_id, { total_salary, total_shifts, desc_id, desc_name, labour_assignments }>

    for (const assignment of assignments) {
      // Find po_budget_id for the assignment's site_id and desc_id
      const [poBudgetRows] = await db.query(
        `SELECT id FROM po_budget WHERE site_id = ? AND desc_id = ?`,
        [assignment.site_id, assignment.desc_id]
      );

      if (poBudgetRows.length === 0) {
        console.log(
          `No po_budget record found for site_id: ${assignment.site_id}, desc_id: ${assignment.desc_id}`
        );
        continue; // Skip if no matching po_budget record
      }

      const po_budget_id = poBudgetRows[0].id;

      // Fetch attendances for this labour_assignment with shift and entry_date
      const [attendances] = await db.query(
        `SELECT shift, entry_date FROM labour_attendance WHERE labour_assignment_id = ?`,
        [assignment.id]
      );

      let total_salary = 0;
      let total_shifts = 0;
      const shifts_by_date = [];

      for (const attendance of attendances) {
        const shift = parseFloat(attendance.shift) || 0; // Convert shift to number
        total_salary += shift * (parseFloat(assignment.salary) || 0);
        total_shifts += shift;
        shifts_by_date.push({
          entry_date: attendance.entry_date,
          shift, // Store as number
        });
      }

      // Format total_shifts to one decimal place
      total_shifts = parseFloat(total_shifts.toFixed(1));

      // Aggregate total_salary and total_shifts by po_budget_id
      if (!budgetMap.has(po_budget_id)) {
        budgetMap.set(po_budget_id, { 
          total_salary: 0, 
          total_shifts: 0, 
          desc_id: assignment.desc_id, 
          desc_name: assignment.desc_name, 
          labour_assignments: [] 
        });
      }
      const budget = budgetMap.get(po_budget_id);
      budget.total_salary += total_salary;
      budget.total_shifts += total_shifts;
      budget.labour_assignments.push({
        labour_assignment_id: assignment.id,
        labour_id: assignment.labour_id,
        full_name: assignment.full_name,
        salary: total_salary,
        shifts_by_date,
        total_shifts,
      });
    }

    // Step 3: Store or update in actual_budget
    for (const [po_budget_id, { total_salary }] of budgetMap) {
      // Check if actual_budget record exists for po_budget_id and overhead_id = 2
      const [actualBudgetRows] = await db.query(
        `SELECT id, splitted_budget FROM actual_budget WHERE po_budget_id = ? AND overhead_id = 2`,
        [po_budget_id]
      );

      const difference_value = actualBudgetRows.length > 0
        ? (parseFloat(actualBudgetRows[0].splitted_budget) || 0) - total_salary
        : 0 - total_salary; // Assume splitted_budget = 0 if new

      if (actualBudgetRows.length > 0) {
        // Update existing record
        await db.query(
          `UPDATE actual_budget SET actual_value = ?, difference_value = ? WHERE id = ?`,
          [total_salary, difference_value, actualBudgetRows[0].id]
        );
      } else {
        // Insert new record
        await db.query(
          `INSERT INTO actual_budget (po_budget_id, overhead_id, splitted_budget, actual_value, difference_value, remarks)
           VALUES (?, 2, 0, ?, ?, NULL)`,
          [po_budget_id, total_salary, difference_value]
        );
      }
    }

    res.status(200).json({
      status: "success",
      message: "Labour budget calculated and stored/updated successfully.",
      processed_po_budgets: Array.from(budgetMap.entries()).map(([po_budget_id, { total_salary, total_shifts, desc_id, desc_name, labour_assignments }]) => ({
        po_budget_id,
        desc_id,
        desc_name,
        total_salary, // overall_salary
        total_shifts, // overall_shifts
        labour_assignments,
      })),
    });
  } catch (error) {
    console.error("Error in calculateLabourBudget:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};







// Updated export in SiteInchargeController.js

exports.viewAcknowledgementsBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current acknowledgements created by this incharge with material name via joins and user names/emails
    const [acknowledgements] = await db.query(
      `SELECT 
         ma.id, ma.material_dispatch_id, ma.comp_a_qty, ma.comp_b_qty, ma.comp_c_qty, 
         ma.comp_a_remarks, ma.comp_b_remarks, ma.comp_c_remarks, ma.overall_quantity, 
         ma.remarks, ma.created_at, ma.updated_at, ma.created_by, ma.updated_by,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         mm.item_name
       FROM material_acknowledgement ma
       JOIN material_dispatch md ON ma.material_dispatch_id = md.id
       JOIN material_assign mas ON md.material_assign_id = mas.id
       JOIN material_master mm ON mas.item_id = mm.item_id
       LEFT JOIN users uc ON ma.created_by = uc.user_id
       LEFT JOIN users uu ON ma.updated_by = uu.user_id
       WHERE ma.created_by = ? 
       ORDER BY ma.created_at DESC`,
      [inchargeId]
    );

    // For each acknowledgement, fetch its history with material name via joins and user names/emails
    const acknowledgementsWithHistory = [];
    for (const ack of acknowledgements) {
      const [history] = await db.query(
        `SELECT 
           h.id, h.material_acknowledgement_id, h.material_dispatch_id, h.comp_a_qty, 
           h.comp_b_qty, h.comp_c_qty, h.comp_a_remarks, h.comp_b_remarks, 
           h.comp_c_remarks, h.overall_quantity, h.remarks, h.created_by, 
           h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           mm.item_name
         FROM material_acknowledgement_history h
         JOIN material_dispatch md ON h.material_dispatch_id = md.id
         JOIN material_assign mas ON md.material_assign_id = mas.id
         JOIN material_master mm ON mas.item_id = mm.item_id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.material_acknowledgement_id = ? 
         ORDER BY h.created_at DESC`,
        [ack.id]
      );

      acknowledgementsWithHistory.push({
        acknowledgement: {
          id: ack.id,
          material_dispatch_id: ack.material_dispatch_id,
          comp_a_qty: ack.comp_a_qty,
          comp_b_qty: ack.comp_b_qty,
          comp_c_qty: ack.comp_c_qty,
          comp_a_remarks: ack.comp_a_remarks,
          comp_b_remarks: ack.comp_b_remarks,
          comp_c_remarks: ack.comp_c_remarks,
          overall_quantity: ack.overall_quantity,
          remarks: ack.remarks,
          item_name: ack.item_name,
          created_at: ack.created_at,
          updated_at: ack.updated_at,
          created_by: ack.created_by,
          updated_by: ack.updated_by,
          created_by_user_name: ack.created_by_user_name,
          created_by_user_email: ack.created_by_user_email,
          updated_by_user_name: ack.updated_by_user_name,
          updated_by_user_email: ack.updated_by_user_email
        },
        history: history.map(h => ({
          id: h.id,
          material_acknowledgement_id: h.material_acknowledgement_id,
          material_dispatch_id: h.material_dispatch_id,
          comp_a_qty: h.comp_a_qty,
          comp_b_qty: h.comp_b_qty,
          comp_c_qty: h.comp_c_qty,
          comp_a_remarks: h.comp_a_remarks,
          comp_b_remarks: h.comp_b_remarks,
          comp_c_remarks: h.comp_c_remarks,
          overall_quantity: h.overall_quantity,
          remarks: h.remarks,
          item_name: h.item_name,
          created_by: h.created_by,
          updated_by: h.updated_by,
          created_at: h.created_at,
          updated_at: h.updated_at,
          created_by_user_name: h.created_by_user_name,
          created_by_user_email: h.created_by_user_email,
          updated_by_user_name: h.updated_by_user_name,
          updated_by_user_email: h.updated_by_user_email
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: acknowledgementsWithHistory
    });
  } catch (error) {
    console.error('Error in viewAcknowledgementsBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};





  // Add this new export to SiteInchargeController.js

 // Add this new export to SiteInchargeController.js

exports.viewMaterialUsageBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current material usages created by this incharge with material name via joins and user names/emails
    const [usages] = await db.query(
      `SELECT 
         mu.id, mu.material_ack_id, mu.comp_a_qty, mu.comp_b_qty, mu.comp_c_qty, 
         mu.comp_a_remarks, mu.comp_b_remarks, mu.comp_c_remarks, mu.overall_qty, 
         mu.remarks, mu.created_at, mu.updated_at, mu.created_by, mu.updated_by,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         mm.item_name
       FROM material_usage mu
       JOIN material_acknowledgement ma ON mu.material_ack_id = ma.id
       JOIN material_dispatch md ON ma.material_dispatch_id = md.id
       JOIN material_assign mas ON md.material_assign_id = mas.id
       JOIN material_master mm ON mas.item_id = mm.item_id
       LEFT JOIN users uc ON mu.created_by = uc.user_id
       LEFT JOIN users uu ON mu.updated_by = uu.user_id
       WHERE mu.created_by = ? 
       ORDER BY mu.created_at DESC`,
      [inchargeId]
    );

    // For each usage, fetch its daily history and edit history with material name via joins and user names/emails
    const usagesWithHistory = [];
    for (const usage of usages) {
      // Fetch daily history for this material_ack_id
      const [dailyHistory] = await db.query(
        `SELECT 
           h.entry_id, h.material_ack_id, h.entry_date, h.comp_a_qty, 
           h.comp_b_qty, h.comp_c_qty, h.comp_a_remarks, h.comp_b_remarks, 
           h.comp_c_remarks, h.overall_qty, h.remarks, h.created_by, 
           h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           mm.item_name
         FROM material_usage_history h
         JOIN material_acknowledgement ma ON h.material_ack_id = ma.id
         JOIN material_dispatch md ON ma.material_dispatch_id = md.id
         JOIN material_assign mas ON md.material_assign_id = mas.id
         JOIN material_master mm ON mas.item_id = mm.item_id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.material_ack_id = ? 
         ORDER BY h.created_at DESC`,
        [usage.material_ack_id]
      );

      // For each daily entry, fetch its edit history
      const dailyHistoryWithEdits = [];
      for (const daily of dailyHistory) {
        const [edits] = await db.query(
          `SELECT 
             e.id, e.material_usage_history_id, e.material_ack_id, e.comp_a_qty, 
             e.comp_b_qty, e.comp_c_qty, e.comp_a_remarks, e.comp_b_remarks, 
             e.comp_c_remarks, e.overall_qty, e.remarks, e.created_by, 
             e.updated_by, e.created_at, e.updated_at,
             ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
             eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
             mm.item_name
           FROM material_usage_edit_history e
           JOIN material_acknowledgement ma ON e.material_ack_id = ma.id
           JOIN material_dispatch md ON ma.material_dispatch_id = md.id
           JOIN material_assign mas ON md.material_assign_id = mas.id
           JOIN material_master mm ON mas.item_id = mm.item_id
           LEFT JOIN users ec ON e.created_by = ec.user_id
           LEFT JOIN users eu ON e.updated_by = eu.user_id
           WHERE e.material_usage_history_id = ? 
           ORDER BY e.created_at DESC`,
          [daily.entry_id]
        );

        dailyHistoryWithEdits.push({
          ...daily,
          edit_history: edits.map(edit => ({
            id: edit.id,
            material_usage_history_id: edit.material_usage_history_id,
            material_ack_id: edit.material_ack_id,
            comp_a_qty: edit.comp_a_qty,
            comp_b_qty: edit.comp_b_qty,
            comp_c_qty: edit.comp_c_qty,
            comp_a_remarks: edit.comp_a_remarks,
            comp_b_remarks: edit.comp_b_remarks,
            comp_c_remarks: edit.comp_c_remarks,
            overall_qty: edit.overall_qty,
            remarks: edit.remarks,
            item_name: edit.item_name,
            created_by: edit.created_by,
            updated_by: edit.updated_by,
            created_at: edit.created_at,
            updated_at: edit.updated_at,
            created_by_user_name: edit.created_by_user_name,
            created_by_user_email: edit.created_by_user_email,
            updated_by_user_name: edit.updated_by_user_name,
            updated_by_user_email: edit.updated_by_user_email
          }))
        });
      }

      usagesWithHistory.push({
        usage: {
          id: usage.id,
          material_ack_id: usage.material_ack_id,
          comp_a_qty: usage.comp_a_qty,
          comp_b_qty: usage.comp_b_qty,
          comp_c_qty: usage.comp_c_qty,
          comp_a_remarks: usage.comp_a_remarks,
          comp_b_remarks: usage.comp_b_remarks,
          comp_c_remarks: usage.comp_c_remarks,
          overall_qty: usage.overall_qty,
          remarks: usage.remarks,
          item_name: usage.item_name,
          created_at: usage.created_at,
          updated_at: usage.updated_at,
          created_by: usage.created_by,
          updated_by: usage.updated_by,
          created_by_user_name: usage.created_by_user_name,
          created_by_user_email: usage.created_by_user_email,
          updated_by_user_name: usage.updated_by_user_name,
          updated_by_user_email: usage.updated_by_user_email
        },
        daily_history: dailyHistoryWithEdits
      });
    }

    res.status(200).json({
      status: 'success',
      data: usagesWithHistory
    });
  } catch (error) {
    console.error('Error in viewMaterialUsageBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



  // Add this new export to SiteInchargeController.js
// Add this new export to SiteInchargeController.js

exports.viewExpenseBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current expenses created by this incharge with expense name via joins and user names/emails
    // Note: actual_budget doesn't have created_by, so we aggregate from history
    // But to get unique expenses, we'll fetch distinct actual_budget records where history has created_by = inchargeId
    const [expenses] = await db.query(
      `SELECT DISTINCT
         ab.id, ab.overhead_id, ab.po_budget_id, ab.actual_value, ab.difference_value, 
         ab.remarks, ab.created_at, ab.splitted_budget, ab.updated_by, ab.updated_at,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         o.expense_name
       FROM actual_budget ab
       JOIN overhead o ON ab.overhead_id = o.id
       JOIN actual_budget_history abh ON ab.id = abh.actual_budget_id
       LEFT JOIN users uu ON ab.updated_by = uu.user_id
       WHERE abh.created_by = ? 
       ORDER BY ab.created_at DESC`,
      [inchargeId]
    );

    // For each expense, fetch its daily history and edit history with expense name via joins and user names/emails
    const expensesWithHistory = [];
    for (const expense of expenses) {
      // Fetch daily history for this actual_budget_id
      const [dailyHistory] = await db.query(
        `SELECT 
           h.id, h.actual_budget_id, h.entry_date, h.actual_value, 
           h.remarks, h.created_by, h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           o.expense_name
         FROM actual_budget_history h
         JOIN actual_budget ab ON h.actual_budget_id = ab.id
         JOIN overhead o ON ab.overhead_id = o.id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.actual_budget_id = ? 
         ORDER BY h.created_at DESC`,
        [expense.id]
      );

      // For each daily entry, fetch its edit history
      const dailyHistoryWithEdits = [];
      for (const daily of dailyHistory) {
        const [edits] = await db.query(
          `SELECT 
             e.id, e.actual_budget_history_id, e.actual_budget_id, e.actual_value, 
             e.remarks, e.created_by, e.updated_by, e.created_at, e.updated_at,
             ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
             eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
             o.expense_name
           FROM actual_budget_edit_history e
           JOIN actual_budget ab ON e.actual_budget_id = ab.id
           JOIN overhead o ON ab.overhead_id = o.id
           LEFT JOIN users ec ON e.created_by = ec.user_id
           LEFT JOIN users eu ON e.updated_by = eu.user_id
           WHERE e.actual_budget_history_id = ? 
           ORDER BY e.created_at DESC`,
          [daily.id]
        );

        dailyHistoryWithEdits.push({
          ...daily,
          edit_history: edits.map(edit => ({
            id: edit.id,
            actual_budget_history_id: edit.actual_budget_history_id,
            actual_budget_id: edit.actual_budget_id,
            actual_value: edit.actual_value,
            remarks: edit.remarks,
            expense_name: edit.expense_name,
            created_by: edit.created_by,
            updated_by: edit.updated_by,
            created_at: edit.created_at,
            updated_at: edit.updated_at,
            created_by_user_name: edit.created_by_user_name,
            created_by_user_email: edit.created_by_user_email,
            updated_by_user_name: edit.updated_by_user_name,
            updated_by_user_email: edit.updated_by_user_email
          }))
        });
      }

      expensesWithHistory.push({
        expense: {
          id: expense.id,
          overhead_id: expense.overhead_id,
          po_budget_id: expense.po_budget_id,
          actual_value: expense.actual_value,
          difference_value: expense.difference_value,
          remarks: expense.remarks,
          splitted_budget: expense.splitted_budget,
          expense_name: expense.expense_name,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          updated_by: expense.updated_by,
          updated_by_user_name: expense.updated_by_user_name,
          updated_by_user_email: expense.updated_by_user_email
        },
        daily_history: dailyHistoryWithEdits
      });
    }

    res.status(200).json({
      status: 'success',
      data: expensesWithHistory
    });
  } catch (error) {
    console.error('Error in viewExpenseBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



  // Add this new export to SiteInchargeController.js

// Add this new export to SiteInchargeController.js

exports.viewCompletionBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current completions where history has created_by = inchargeId with joined names and user names/emails
    const [completions] = await db.query(
      `SELECT DISTINCT
         cs.completion_id, cs.rec_id, cs.area_completed, cs.rate, cs.value,
         cs.billed_area, cs.billed_value, cs.balance_area, cs.balance_value,
         cs.work_status, cs.billing_status, cs.created_at, cs.created_by,
         cs.updated_by, cs.updated_at, cs.remarks,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
       FROM completion_status cs
       JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
       JOIN item_category ic ON pr.category_id = ic.category_id
       JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
       JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
       JOIN completion_entries_history ceh ON cs.rec_id = ceh.rec_id
       LEFT JOIN users uc ON cs.created_by = uc.user_id
       LEFT JOIN users uu ON cs.updated_by = uu.user_id
       WHERE ceh.created_by = ? 
       ORDER BY cs.created_at DESC`,
      [inchargeId]
    );

    // For each completion, fetch its entries history with joined names and user names/emails
    const completionsWithHistory = [];
    for (const completion of completions) {
      // Fetch entries history for this rec_id
      const [entriesHistory] = await db.query(
        `SELECT 
           ceh.entry_id, ceh.rec_id, ceh.entry_date, ceh.area_added, ceh.rate,
           ceh.value_added, ceh.remarks, ceh.created_by, ceh.created_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
         FROM completion_entries_history ceh
         JOIN po_reckoner pr ON ceh.rec_id = pr.rec_id
         JOIN item_category ic ON pr.category_id = ic.category_id
         JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
         JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
         LEFT JOIN users hc ON ceh.created_by = hc.user_id
         WHERE ceh.rec_id = ? 
         ORDER BY ceh.created_at DESC`,
        [completion.rec_id]
      );

      // For the completion status, fetch its edit history with joined names and user names/emails
      const [statusEditHistory] = await db.query(
        `SELECT 
           ceeh.completion_status_id, ceeh.area_completed, ceeh.rate, ceeh.value,
           ceeh.billed_area, ceeh.billed_value, ceeh.balance_area, ceeh.balance_value,
           ceeh.work_status, ceeh.billing_status, ceeh.remarks, ceeh.created_by,
           ceeh.updated_by, ceeh.created_at, ceeh.updated_at,
           ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
           eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
           ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
         FROM completion_edit_entries_history ceeh
         JOIN completion_status cs ON ceeh.completion_status_id = cs.completion_id
         JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
         JOIN item_category ic ON pr.category_id = ic.category_id
         JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
         JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
         LEFT JOIN users ec ON ceeh.created_by = ec.user_id
         LEFT JOIN users eu ON ceeh.updated_by = eu.user_id
         WHERE ceeh.completion_status_id = ? 
         ORDER BY ceeh.created_at DESC`,
        [completion.completion_id]
      );

      completionsWithHistory.push({
        completion: {
          completion_id: completion.completion_id,
          rec_id: completion.rec_id,
          area_completed: completion.area_completed,
          rate: completion.rate,
          value: completion.value,
          billed_area: completion.billed_area,
          billed_value: completion.billed_value,
          balance_area: completion.balance_area,
          balance_value: completion.balance_value,
          work_status: completion.work_status,
          billing_status: completion.billing_status,
          remarks: completion.remarks,
          category_name: completion.category_name,
          subcategory_name: completion.subcategory_name,
          billing: completion.billing,
          desc_name: completion.desc_name,
          created_at: completion.created_at,
          created_by: completion.created_by,
          updated_at: completion.updated_at,
          updated_by: completion.updated_by,
          created_by_user_name: completion.created_by_user_name,
          created_by_user_email: completion.created_by_user_email,
          updated_by_user_name: completion.updated_by_user_name,
          updated_by_user_email: completion.updated_by_user_email
        },
        entries_history: entriesHistory.map(entry => ({
          entry_id: entry.entry_id,
          rec_id: entry.rec_id,
          entry_date: entry.entry_date,
          area_added: entry.area_added,
          rate: entry.rate,
          value_added: entry.value_added,
          remarks: entry.remarks,
          category_name: entry.category_name,
          subcategory_name: entry.subcategory_name,
          billing: entry.billing,
          desc_name: entry.desc_name,
          created_by: entry.created_by,
          created_at: entry.created_at,
          created_by_user_name: entry.created_by_user_name,
          created_by_user_email: entry.created_by_user_email
        })),
        status_edit_history: statusEditHistory.map(edit => ({
          completion_status_id: edit.completion_status_id,
          area_completed: edit.area_completed,
          rate: edit.rate,
          value: edit.value,
          billed_area: edit.billed_area,
          billed_value: edit.billed_value,
          balance_area: edit.balance_area,
          balance_value: edit.balance_value,
          work_status: edit.work_status,
          billing_status: edit.billing_status,
          remarks: edit.remarks,
          category_name: edit.category_name,
          subcategory_name: edit.subcategory_name,
          billing: edit.billing,
          desc_name: edit.desc_name,
          created_by: edit.created_by,
          updated_by: edit.updated_by,
          created_at: edit.created_at,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: completionsWithHistory
    });
  } catch (error) {
    console.error('Error in viewCompletionBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};





  // Add this new export to SiteInchargeController.js

 // Add this new export to SiteInchargeController.js

exports.viewLabourAssignmentBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current labour assignments created by this incharge with joined details and user names/emails
    const [assignments] = await db.query(
      `SELECT 
         la.id, la.project_id, la.site_id, la.desc_id, la.from_date, la.to_date, 
         la.salary, la.created_by, la.created_at, la.updated_by, la.updated_at,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         pd.project_name, sd.site_name, sd.po_number, wd.desc_name,
         l.id as labour_id, l.full_name, l.mobile
       FROM labour_assignment la
       JOIN project_details pd ON la.project_id = pd.pd_id
       JOIN site_details sd ON la.site_id = sd.site_id
       JOIN work_descriptions wd ON la.desc_id = wd.desc_id
       JOIN labour l ON la.labour_id = l.id
       LEFT JOIN users uc ON la.created_by = uc.user_id
       LEFT JOIN users uu ON la.updated_by = uu.user_id
       WHERE la.created_by = ? 
       ORDER BY la.created_at DESC`,
      [inchargeId]
    );

    // For each assignment, fetch its edit history with joined details and user names/emails
    const assignmentsWithHistory = [];
    for (const assignment of assignments) {
      const [editHistory] = await db.query(
        `SELECT 
           h.id, h.labour_assignment_id, h.project_id, h.site_id, h.desc_id, 
           h.from_date, h.to_date, h.salary, h.created_by, h.updated_by, 
           h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           pd.project_name, sd.site_name, sd.po_number, wd.desc_name,
           l.id as labour_id, l.full_name, l.mobile
         FROM labour_assignment_edit_history h
         JOIN project_details pd ON h.project_id = pd.pd_id
         JOIN site_details sd ON h.site_id = sd.site_id
         JOIN work_descriptions wd ON h.desc_id = wd.desc_id
         JOIN labour l ON h.labour_id = l.id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.labour_assignment_id = ? 
         ORDER BY h.created_at DESC`,
        [assignment.id]
      );

      assignmentsWithHistory.push({
        assignment: {
          id: assignment.id,
          project_id: assignment.project_id,
          site_id: assignment.site_id,
          desc_id: assignment.desc_id,
          from_date: assignment.from_date,
          to_date: assignment.to_date,
          salary: assignment.salary,
          created_by: assignment.created_by,
          created_at: assignment.created_at,
          updated_by: assignment.updated_by,
          updated_at: assignment.updated_at,
          created_by_user_name: assignment.created_by_user_name,
          created_by_user_email: assignment.created_by_user_email,
          updated_by_user_name: assignment.updated_by_user_name,
          updated_by_user_email: assignment.updated_by_user_email,
          project_name: assignment.project_name,
          site_name: assignment.site_name,
          po_number: assignment.po_number,
          desc_name: assignment.desc_name,
          labour_id: assignment.labour_id,
          full_name: assignment.full_name,
          mobile: assignment.mobile
        },
        edit_history: editHistory.map(edit => ({
          id: edit.id,
          labour_assignment_id: edit.labour_assignment_id,
          project_id: edit.project_id,
          site_id: edit.site_id,
          desc_id: edit.desc_id,
          from_date: edit.from_date,
          to_date: edit.to_date,
          salary: edit.salary,
          created_by: edit.created_by,
          created_at: edit.created_at,
          updated_by: edit.updated_by,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email,
          project_name: edit.project_name,
          site_name: edit.site_name,
          po_number: edit.po_number,
          desc_name: edit.desc_name,
          labour_id: edit.labour_id,
          full_name: edit.full_name,
          mobile: edit.mobile
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: assignmentsWithHistory
    });
  } catch (error) {
    console.error('Error in viewLabourAssignmentBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};






  // Updated export in SiteInchargeController.js
// Updated export in SiteInchargeController.js

exports.viewLabourAttendanceBySiteInchargeId = async (req, res) => {
  try {
    const { incharge_id } = req.params;

    if (!incharge_id || isNaN(parseInt(incharge_id))) {
      return res.status(400).json({
        status: 'error',
        message: 'incharge_id is required and must be a number',
      });
    }

    const inchargeId = parseInt(incharge_id);

    // Fetch current labour attendance created by this incharge with joined labour details and user names/emails
    const [attendances] = await db.query(
      `SELECT 
         la.id, la.labour_assignment_id, la.shift, la.entry_date, la.remarks, 
         la.created_by, la.created_at, la.updated_by, la.updated_at,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         l.id as labour_id, l.full_name, l.mobile
       FROM labour_attendance la
       JOIN labour_assignment laa ON la.labour_assignment_id = laa.id
       JOIN labour l ON laa.labour_id = l.id
       LEFT JOIN users uc ON la.created_by = uc.user_id
       LEFT JOIN users uu ON la.updated_by = uu.user_id
       WHERE la.created_by = ? 
       ORDER BY la.created_at DESC`,
      [inchargeId]
    );

    // For each attendance, fetch its edit history with joined labour details and user names/emails
    const attendancesWithHistory = [];
    for (const attendance of attendances) {
      const [editHistory] = await db.query(
        `SELECT 
           eh.id, eh.labour_attendance_id, eh.labour_assignment_id, eh.shift, 
           eh.remarks, eh.created_by, eh.updated_by, eh.created_at, eh.updated_at,
           ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
           eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
           l.id as labour_id, l.full_name, l.mobile
         FROM labour_attendance_edit_history eh
         JOIN labour_assignment laa ON eh.labour_assignment_id = laa.id
         JOIN labour l ON laa.labour_id = l.id
         LEFT JOIN users ec ON eh.created_by = ec.user_id
         LEFT JOIN users eu ON eh.updated_by = eu.user_id
         WHERE eh.labour_attendance_id = ? 
         ORDER BY eh.created_at DESC`,
        [attendance.id]
      );

      attendancesWithHistory.push({
        attendance: {
          id: attendance.id,
          labour_assignment_id: attendance.labour_assignment_id,
          shift: attendance.shift,
          entry_date: attendance.entry_date,
          remarks: attendance.remarks,
          created_by: attendance.created_by,
          created_at: attendance.created_at,
          updated_by: attendance.updated_by,
          updated_at: attendance.updated_at,
          created_by_user_name: attendance.created_by_user_name,
          created_by_user_email: attendance.created_by_user_email,
          updated_by_user_name: attendance.updated_by_user_name,
          updated_by_user_email: attendance.updated_by_user_email,
          labour_id: attendance.labour_id,
          full_name: attendance.full_name,
          mobile: attendance.mobile
        },
        edit_history: editHistory.map(edit => ({
          id: edit.id,
          labour_attendance_id: edit.labour_attendance_id,
          labour_assignment_id: edit.labour_assignment_id,
          shift: edit.shift,
          remarks: edit.remarks,
          created_by: edit.created_by,
          created_at: edit.created_at,
          updated_by: edit.updated_by,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email,
          labour_id: edit.labour_id,
          full_name: edit.full_name,
          mobile: edit.mobile
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: attendancesWithHistory
    });
  } catch (error) {
    console.error('Error in viewLabourAttendanceBySiteInchargeId:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};








// New export in SiteInchargeController.js - Fetch all acknowledgements with site incharge name (created_by username)

exports.viewAllAcknowledgements = async (req, res) => {
  try {
    // Fetch all acknowledgements with material name via joins and user names/emails
    const [acknowledgements] = await db.query(
      `SELECT 
         ma.id, ma.material_dispatch_id, ma.comp_a_qty, ma.comp_b_qty, ma.comp_c_qty, 
         ma.comp_a_remarks, ma.comp_b_remarks, ma.comp_c_remarks, ma.overall_quantity, 
         ma.remarks, ma.created_at, ma.updated_at, ma.created_by, ma.updated_by,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         mm.item_name
       FROM material_acknowledgement ma
       JOIN material_dispatch md ON ma.material_dispatch_id = md.id
       JOIN material_assign mas ON md.material_assign_id = mas.id
       JOIN material_master mm ON mas.item_id = mm.item_id
       LEFT JOIN users uc ON ma.created_by = uc.user_id
       LEFT JOIN users uu ON ma.updated_by = uu.user_id
       ORDER BY ma.created_by, ma.created_at DESC`,
      []
    );

    // For each acknowledgement, fetch its history with material name via joins and user names/emails
    const acknowledgementsWithHistory = [];
    for (const ack of acknowledgements) {
      const [history] = await db.query(
        `SELECT 
           h.id, h.material_acknowledgement_id, h.material_dispatch_id, h.comp_a_qty, 
           h.comp_b_qty, h.comp_c_qty, h.comp_a_remarks, h.comp_b_remarks, 
           h.comp_c_remarks, h.overall_quantity, h.remarks, h.created_by, 
           h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           mm.item_name
         FROM material_acknowledgement_history h
         JOIN material_dispatch md ON h.material_dispatch_id = md.id
         JOIN material_assign mas ON md.material_assign_id = mas.id
         JOIN material_master mm ON mas.item_id = mm.item_id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.material_acknowledgement_id = ? 
         ORDER BY h.created_at DESC`,
        [ack.id]
      );

      acknowledgementsWithHistory.push({
        acknowledgement: {
          id: ack.id,
          material_dispatch_id: ack.material_dispatch_id,
          comp_a_qty: ack.comp_a_qty,
          comp_b_qty: ack.comp_b_qty,
          comp_c_qty: ack.comp_c_qty,
          comp_a_remarks: ack.comp_a_remarks,
          comp_b_remarks: ack.comp_b_remarks,
          comp_c_remarks: ack.comp_c_remarks,
          overall_quantity: ack.overall_quantity,
          remarks: ack.remarks,
          item_name: ack.item_name,
          created_at: ack.created_at,
          updated_at: ack.updated_at,
          created_by: ack.created_by,
          updated_by: ack.updated_by,
          siteincharge_name: ack.siteincharge_name,
          siteincharge_email: ack.siteincharge_email,
          created_by_user_name: ack.created_by_user_name,
          created_by_user_email: ack.created_by_user_email,
          updated_by_user_name: ack.updated_by_user_name,
          updated_by_user_email: ack.updated_by_user_email
        },
        history: history.map(h => ({
          id: h.id,
          material_acknowledgement_id: h.material_acknowledgement_id,
          material_dispatch_id: h.material_dispatch_id,
          comp_a_qty: h.comp_a_qty,
          comp_b_qty: h.comp_b_qty,
          comp_c_qty: h.comp_c_qty,
          comp_a_remarks: h.comp_a_remarks,
          comp_b_remarks: h.comp_b_remarks,
          comp_c_remarks: h.comp_c_remarks,
          overall_quantity: h.overall_quantity,
          remarks: h.remarks,
          item_name: h.item_name,
          created_by: h.created_by,
          updated_by: h.updated_by,
          created_at: h.created_at,
          updated_at: h.updated_at,
          created_by_user_name: h.created_by_user_name,
          created_by_user_email: h.created_by_user_email,
          updated_by_user_name: h.updated_by_user_name,
          updated_by_user_email: h.updated_by_user_email
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: acknowledgementsWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllAcknowledgements:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




// New export in SiteInchargeController.js - Fetch all material usages with site incharge name (created_by username)

exports.viewAllMaterialUsage = async (req, res) => {
  try {
    // Fetch all material usages created with material name via joins and user names/emails
    const [usages] = await db.query(
      `SELECT 
         mu.id, mu.material_ack_id, mu.comp_a_qty, mu.comp_b_qty, mu.comp_c_qty, 
         mu.comp_a_remarks, mu.comp_b_remarks, mu.comp_c_remarks, mu.overall_qty, 
         mu.remarks, mu.created_at, mu.updated_at, mu.created_by, mu.updated_by,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         mm.item_name
       FROM material_usage mu
       JOIN material_acknowledgement ma ON mu.material_ack_id = ma.id
       JOIN material_dispatch md ON ma.material_dispatch_id = md.id
       JOIN material_assign mas ON md.material_assign_id = mas.id
       JOIN material_master mm ON mas.item_id = mm.item_id
       LEFT JOIN users uc ON mu.created_by = uc.user_id
       LEFT JOIN users uu ON mu.updated_by = uu.user_id
       ORDER BY mu.created_by, mu.created_at DESC`,
      []
    );

    // For each usage, fetch its daily history and edit history with material name via joins and user names/emails
    const usagesWithHistory = [];
    for (const usage of usages) {
      // Fetch daily history for this material_ack_id
      const [dailyHistory] = await db.query(
        `SELECT 
           h.entry_id, h.material_ack_id, h.entry_date, h.comp_a_qty, 
           h.comp_b_qty, h.comp_c_qty, h.comp_a_remarks, h.comp_b_remarks, 
           h.comp_c_remarks, h.overall_qty, h.remarks, h.created_by, 
           h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           mm.item_name
         FROM material_usage_history h
         JOIN material_acknowledgement ma ON h.material_ack_id = ma.id
         JOIN material_dispatch md ON ma.material_dispatch_id = md.id
         JOIN material_assign mas ON md.material_assign_id = mas.id
         JOIN material_master mm ON mas.item_id = mm.item_id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.material_ack_id = ? 
         ORDER BY h.created_at DESC`,
        [usage.material_ack_id]
      );

      // For each daily entry, fetch its edit history
      const dailyHistoryWithEdits = [];
      for (const daily of dailyHistory) {
        const [edits] = await db.query(
          `SELECT 
             e.id, e.material_usage_history_id, e.material_ack_id, e.comp_a_qty, 
             e.comp_b_qty, e.comp_c_qty, e.comp_a_remarks, e.comp_b_remarks, 
             e.comp_c_remarks, e.overall_qty, e.remarks, e.created_by, 
             e.updated_by, e.created_at, e.updated_at,
             ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
             eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
             mm.item_name
           FROM material_usage_edit_history e
           JOIN material_acknowledgement ma ON e.material_ack_id = ma.id
           JOIN material_dispatch md ON ma.material_dispatch_id = md.id
           JOIN material_assign mas ON md.material_assign_id = mas.id
           JOIN material_master mm ON mas.item_id = mm.item_id
           LEFT JOIN users ec ON e.created_by = ec.user_id
           LEFT JOIN users eu ON e.updated_by = eu.user_id
           WHERE e.material_usage_history_id = ? 
           ORDER BY e.created_at DESC`,
          [daily.entry_id]
        );

        dailyHistoryWithEdits.push({
          ...daily,
          edit_history: edits.map(edit => ({
            id: edit.id,
            material_usage_history_id: edit.material_usage_history_id,
            material_ack_id: edit.material_ack_id,
            comp_a_qty: edit.comp_a_qty,
            comp_b_qty: edit.comp_b_qty,
            comp_c_qty: edit.comp_c_qty,
            comp_a_remarks: edit.comp_a_remarks,
            comp_b_remarks: edit.comp_b_remarks,
            comp_c_remarks: edit.comp_c_remarks,
            overall_qty: edit.overall_qty,
            remarks: edit.remarks,
            item_name: edit.item_name,
            created_by: edit.created_by,
            updated_by: edit.updated_by,
            created_at: edit.created_at,
            updated_at: edit.updated_at,
            created_by_user_name: edit.created_by_user_name,
            created_by_user_email: edit.created_by_user_email,
            updated_by_user_name: edit.updated_by_user_name,
            updated_by_user_email: edit.updated_by_user_email
          }))
        });
      }

      usagesWithHistory.push({
        usage: {
          id: usage.id,
          material_ack_id: usage.material_ack_id,
          comp_a_qty: usage.comp_a_qty,
          comp_b_qty: usage.comp_b_qty,
          comp_c_qty: usage.comp_c_qty,
          comp_a_remarks: usage.comp_a_remarks,
          comp_b_remarks: usage.comp_b_remarks,
          comp_c_remarks: usage.comp_c_remarks,
          overall_qty: usage.overall_qty,
          remarks: usage.remarks,
          item_name: usage.item_name,
          created_at: usage.created_at,
          updated_at: usage.updated_at,
          created_by: usage.created_by,
          updated_by: usage.updated_by,
          siteincharge_name: usage.siteincharge_name,
          siteincharge_email: usage.siteincharge_email,
          created_by_user_name: usage.created_by_user_name,
          created_by_user_email: usage.created_by_user_email,
          updated_by_user_name: usage.updated_by_user_name,
          updated_by_user_email: usage.updated_by_user_email
        },
        daily_history: dailyHistoryWithEdits
      });
    }

    res.status(200).json({
      status: 'success',
      data: usagesWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllMaterialUsage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




exports.viewAllExpense = async (req, res) => {
  try {
    // Fetch all distinct expenses where history has created_by with expense name via joins and user names/emails
    const [expenses] = await db.query(
      `SELECT 
         ab.id, ab.overhead_id, ab.po_budget_id, ab.actual_value, ab.difference_value, 
         ab.remarks, ab.created_at, ab.splitted_budget, ab.updated_by, ab.updated_at,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         o.expense_name
       FROM actual_budget ab
       JOIN overhead o ON ab.overhead_id = o.id
       INNER JOIN (
         SELECT DISTINCT actual_budget_id, created_by
         FROM actual_budget_history abh1
         WHERE abh1.created_at = (
           SELECT MIN(abh2.created_at) 
           FROM actual_budget_history abh2 
           WHERE abh2.actual_budget_id = abh1.actual_budget_id
         )
       ) first_creator ON ab.id = first_creator.actual_budget_id
       LEFT JOIN users uu ON ab.updated_by = uu.user_id
       LEFT JOIN users uc ON first_creator.created_by = uc.user_id
       ORDER BY first_creator.created_by, ab.created_at DESC`,
      []
    );

    // For each expense, fetch its daily history and edit history with expense name via joins and user names/emails
    const expensesWithHistory = [];
    for (const expense of expenses) {
      // Fetch daily history for this actual_budget_id
      const [dailyHistory] = await db.query(
        `SELECT 
           h.id, h.actual_budget_id, h.entry_date, h.actual_value, 
           h.remarks, h.created_by, h.updated_by, h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           o.expense_name
         FROM actual_budget_history h
         JOIN actual_budget ab ON h.actual_budget_id = ab.id
         JOIN overhead o ON ab.overhead_id = o.id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.actual_budget_id = ? 
         ORDER BY h.created_at DESC`,
        [expense.id]
      );

      // For each daily entry, fetch its edit history
      const dailyHistoryWithEdits = [];
      for (const daily of dailyHistory) {
        const [edits] = await db.query(
          `SELECT 
             e.id, e.actual_budget_history_id, e.actual_budget_id, e.actual_value, 
             e.remarks, e.created_by, e.updated_by, e.created_at, e.updated_at,
             ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
             eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
             o.expense_name
           FROM actual_budget_edit_history e
           JOIN actual_budget ab ON e.actual_budget_id = ab.id
           JOIN overhead o ON ab.overhead_id = o.id
           LEFT JOIN users ec ON e.created_by = ec.user_id
           LEFT JOIN users eu ON e.updated_by = eu.user_id
           WHERE e.actual_budget_history_id = ? 
           ORDER BY e.created_at DESC`,
          [daily.id]
        );

        dailyHistoryWithEdits.push({
          ...daily,
          edit_history: edits.map(edit => ({
            id: edit.id,
            actual_budget_history_id: edit.actual_budget_history_id,
            actual_budget_id: edit.actual_budget_id,
            actual_value: edit.actual_value,
            remarks: edit.remarks,
            expense_name: edit.expense_name,
            created_by: edit.created_by,
            updated_by: edit.updated_by,
            created_at: edit.created_at,
            updated_at: edit.updated_at,
            created_by_user_name: edit.created_by_user_name,
            created_by_user_email: edit.created_by_user_email,
            updated_by_user_name: edit.updated_by_user_name,
            updated_by_user_email: edit.updated_by_user_email
          }))
        });
      }

      expensesWithHistory.push({
        expense: {
          id: expense.id,
          overhead_id: expense.overhead_id,
          po_budget_id: expense.po_budget_id,
          actual_value: expense.actual_value,
          difference_value: expense.difference_value,
          remarks: expense.remarks,
          splitted_budget: expense.splitted_budget,
          expense_name: expense.expense_name,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          updated_by: expense.updated_by,
          siteincharge_name: expense.siteincharge_name,
          siteincharge_email: expense.siteincharge_email,
          updated_by_user_name: expense.updated_by_user_name,
          updated_by_user_email: expense.updated_by_user_email
        },
        daily_history: dailyHistoryWithEdits
      });
    }

    res.status(200).json({
      status: 'success',
      data: expensesWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllExpense:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};



// New export in SiteInchargeController.js - Fetch all completions with site incharge name (created_by username)

exports.viewAllCompletion = async (req, res) => {
  try {
    // Fetch all distinct completions where history has created_by with joined names and user names/emails
    const [completions] = await db.query(
      `SELECT DISTINCT
         cs.completion_id, cs.rec_id, cs.area_completed, cs.rate, cs.value,
         cs.billed_area, cs.billed_value, cs.balance_area, cs.balance_value,
         cs.work_status, cs.billing_status, cs.created_at, cs.created_by,
         cs.updated_by, cs.updated_at, cs.remarks,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
       FROM completion_status cs
       JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
       JOIN item_category ic ON pr.category_id = ic.category_id
       JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
       JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
       JOIN completion_entries_history ceh ON cs.rec_id = ceh.rec_id
       LEFT JOIN users uc ON cs.created_by = uc.user_id
       LEFT JOIN users uu ON cs.updated_by = uu.user_id
       ORDER BY cs.created_by, cs.created_at DESC`,
      []
    );

    // For each completion, fetch its entries history with joined names and user names/emails
    const completionsWithHistory = [];
    for (const completion of completions) {
      // Fetch entries history for this rec_id
      const [entriesHistory] = await db.query(
        `SELECT 
           ceh.entry_id, ceh.rec_id, ceh.entry_date, ceh.area_added, ceh.rate,
           ceh.value_added, ceh.remarks, ceh.created_by, ceh.created_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
         FROM completion_entries_history ceh
         JOIN po_reckoner pr ON ceh.rec_id = pr.rec_id
         JOIN item_category ic ON pr.category_id = ic.category_id
         JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
         JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
         LEFT JOIN users hc ON ceh.created_by = hc.user_id
         WHERE ceh.rec_id = ? 
         ORDER BY ceh.created_at DESC`,
        [completion.rec_id]
      );

      // For the completion status, fetch its edit history with joined names and user names/emails
      const [statusEditHistory] = await db.query(
        `SELECT 
           ceeh.completion_status_id, ceeh.area_completed, ceeh.rate, ceeh.value,
           ceeh.billed_area, ceeh.billed_value, ceeh.balance_area, ceeh.balance_value,
           ceeh.work_status, ceeh.billing_status, ceeh.remarks, ceeh.created_by,
           ceeh.updated_by, ceeh.created_at, ceeh.updated_at,
           ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
           eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
           ic.category_name, isc.subcategory_name, isc.billing, wd.desc_name
         FROM completion_edit_entries_history ceeh
         JOIN completion_status cs ON ceeh.completion_status_id = cs.completion_id
         JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
         JOIN item_category ic ON pr.category_id = ic.category_id
         JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
         JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
         LEFT JOIN users ec ON ceeh.created_by = ec.user_id
         LEFT JOIN users eu ON ceeh.updated_by = eu.user_id
         WHERE ceeh.completion_status_id = ? 
         ORDER BY ceeh.created_at DESC`,
        [completion.completion_id]
      );

      completionsWithHistory.push({
        completion: {
          completion_id: completion.completion_id,
          rec_id: completion.rec_id,
          area_completed: completion.area_completed,
          rate: completion.rate,
          value: completion.value,
          billed_area: completion.billed_area,
          billed_value: completion.billed_value,
          balance_area: completion.balance_area,
          balance_value: completion.balance_value,
          work_status: completion.work_status,
          billing_status: completion.billing_status,
          remarks: completion.remarks,
          category_name: completion.category_name,
          subcategory_name: completion.subcategory_name,
          billing: completion.billing,
          desc_name: completion.desc_name,
          created_at: completion.created_at,
          created_by: completion.created_by,
          updated_at: completion.updated_at,
          updated_by: completion.updated_by,
          siteincharge_name: completion.siteincharge_name,
          siteincharge_email: completion.siteincharge_email,
          created_by_user_name: completion.created_by_user_name,
          created_by_user_email: completion.created_by_user_email,
          updated_by_user_name: completion.updated_by_user_name,
          updated_by_user_email: completion.updated_by_user_email
        },
        entries_history: entriesHistory.map(entry => ({
          entry_id: entry.entry_id,
          rec_id: entry.rec_id,
          entry_date: entry.entry_date,
          area_added: entry.area_added,
          rate: entry.rate,
          value_added: entry.value_added,
          remarks: entry.remarks,
          category_name: entry.category_name,
          subcategory_name: entry.subcategory_name,
          billing: entry.billing,
          desc_name: entry.desc_name,
          created_by: entry.created_by,
          created_at: entry.created_at,
          created_by_user_name: entry.created_by_user_name,
          created_by_user_email: entry.created_by_user_email
        })),
        status_edit_history: statusEditHistory.map(edit => ({
          completion_status_id: edit.completion_status_id,
          area_completed: edit.area_completed,
          rate: edit.rate,
          value: edit.value,
          billed_area: edit.billed_area,
          billed_value: edit.billed_value,
          balance_area: edit.balance_area,
          balance_value: edit.balance_value,
          work_status: edit.work_status,
          billing_status: edit.billing_status,
          remarks: edit.remarks,
          category_name: edit.category_name,
          subcategory_name: edit.subcategory_name,
          billing: edit.billing,
          desc_name: edit.desc_name,
          created_by: edit.created_by,
          updated_by: edit.updated_by,
          created_at: edit.created_at,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: completionsWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllCompletion:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// New export in SiteInchargeController.js - Fetch all labour assignments with site incharge name (created_by username)

exports.viewAllLabourAssignment = async (req, res) => {
  try {
    // Fetch all labour assignments with joined details and user names/emails
    const [assignments] = await db.query(
      `SELECT 
         la.id, la.project_id, la.site_id, la.desc_id, la.from_date, la.to_date, 
         la.salary, la.created_by, la.created_at, la.updated_by, la.updated_at,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         pd.project_name, sd.site_name, sd.po_number, wd.desc_name,
         l.id as labour_id, l.full_name, l.mobile
       FROM labour_assignment la
       JOIN project_details pd ON la.project_id = pd.pd_id
       JOIN site_details sd ON la.site_id = sd.site_id
       JOIN work_descriptions wd ON la.desc_id = wd.desc_id
       JOIN labour l ON la.labour_id = l.id
       LEFT JOIN users uc ON la.created_by = uc.user_id
       LEFT JOIN users uu ON la.updated_by = uu.user_id
       ORDER BY la.created_by, la.created_at DESC`,
      []
    );

    // For each assignment, fetch its edit history with joined details and user names/emails
    const assignmentsWithHistory = [];
    for (const assignment of assignments) {
      const [editHistory] = await db.query(
        `SELECT 
           h.id, h.labour_assignment_id, h.project_id, h.site_id, h.desc_id, 
           h.from_date, h.to_date, h.salary, h.created_by, h.updated_by, 
           h.created_at, h.updated_at,
           hc.user_name as created_by_user_name, hc.user_email as created_by_user_email,
           hu.user_name as updated_by_user_name, hu.user_email as updated_by_user_email,
           pd.project_name, sd.site_name, sd.po_number, wd.desc_name,
           l.id as labour_id, l.full_name, l.mobile
         FROM labour_assignment_edit_history h
         JOIN project_details pd ON h.project_id = pd.pd_id
         JOIN site_details sd ON h.site_id = sd.site_id
         JOIN work_descriptions wd ON h.desc_id = wd.desc_id
         JOIN labour l ON h.labour_id = l.id
         LEFT JOIN users hc ON h.created_by = hc.user_id
         LEFT JOIN users hu ON h.updated_by = hu.user_id
         WHERE h.labour_assignment_id = ? 
         ORDER BY h.created_at DESC`,
        [assignment.id]
      );

      assignmentsWithHistory.push({
        assignment: {
          id: assignment.id,
          project_id: assignment.project_id,
          site_id: assignment.site_id,
          desc_id: assignment.desc_id,
          from_date: assignment.from_date,
          to_date: assignment.to_date,
          salary: assignment.salary,
          created_by: assignment.created_by,
          created_at: assignment.created_at,
          updated_by: assignment.updated_by,
          updated_at: assignment.updated_at,
          siteincharge_name: assignment.siteincharge_name,
          siteincharge_email: assignment.siteincharge_email,
          created_by_user_name: assignment.created_by_user_name,
          created_by_user_email: assignment.created_by_user_email,
          updated_by_user_name: assignment.updated_by_user_name,
          updated_by_user_email: assignment.updated_by_user_email,
          project_name: assignment.project_name,
          site_name: assignment.site_name,
          po_number: assignment.po_number,
          desc_name: assignment.desc_name,
          labour_id: assignment.labour_id,
          full_name: assignment.full_name,
          mobile: assignment.mobile
        },
        edit_history: editHistory.map(edit => ({
          id: edit.id,
          labour_assignment_id: edit.labour_assignment_id,
          project_id: edit.project_id,
          site_id: edit.site_id,
          desc_id: edit.desc_id,
          from_date: edit.from_date,
          to_date: edit.to_date,
          salary: edit.salary,
          created_by: edit.created_by,
          created_at: edit.created_at,
          updated_by: edit.updated_by,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email,
          project_name: edit.project_name,
          site_name: edit.site_name,
          po_number: edit.po_number,
          desc_name: edit.desc_name,
          labour_id: edit.labour_id,
          full_name: edit.full_name,
          mobile: edit.mobile
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: assignmentsWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllLabourAssignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




// New export in SiteInchargeController.js - Fetch all labour attendances with site incharge name (created_by username)

exports.viewAllLabourAttendance = async (req, res) => {
  try {
    // Fetch all labour attendance with joined labour details and user names/emails
    const [attendances] = await db.query(
      `SELECT 
         la.id, la.labour_assignment_id, la.shift, la.entry_date, la.remarks, 
         la.created_by, la.created_at, la.updated_by, la.updated_at,
         uc.user_name as siteincharge_name, uc.user_email as siteincharge_email,
         uc.user_name as created_by_user_name, uc.user_email as created_by_user_email,
         uu.user_name as updated_by_user_name, uu.user_email as updated_by_user_email,
         l.id as labour_id, l.full_name, l.mobile
       FROM labour_attendance la
       JOIN labour_assignment laa ON la.labour_assignment_id = laa.id
       JOIN labour l ON laa.labour_id = l.id
       LEFT JOIN users uc ON la.created_by = uc.user_id
       LEFT JOIN users uu ON la.updated_by = uu.user_id
       ORDER BY la.created_by, la.created_at DESC`,
      []
    );

    // For each attendance, fetch its edit history with joined labour details and user names/emails
    const attendancesWithHistory = [];
    for (const attendance of attendances) {
      const [editHistory] = await db.query(
        `SELECT 
           eh.id, eh.labour_attendance_id, eh.labour_assignment_id, eh.shift, 
           eh.remarks, eh.created_by, eh.updated_by, eh.created_at, eh.updated_at,
           ec.user_name as created_by_user_name, ec.user_email as created_by_user_email,
           eu.user_name as updated_by_user_name, eu.user_email as updated_by_user_email,
           l.id as labour_id, l.full_name, l.mobile
         FROM labour_attendance_edit_history eh
         JOIN labour_assignment laa ON eh.labour_assignment_id = laa.id
         JOIN labour l ON laa.labour_id = l.id
         LEFT JOIN users ec ON eh.created_by = ec.user_id
         LEFT JOIN users eu ON eh.updated_by = eu.user_id
         WHERE eh.labour_attendance_id = ? 
         ORDER BY eh.created_at DESC`,
        [attendance.id]
      );

      attendancesWithHistory.push({
        attendance: {
          id: attendance.id,
          labour_assignment_id: attendance.labour_assignment_id,
          shift: attendance.shift,
          entry_date: attendance.entry_date,
          remarks: attendance.remarks,
          created_by: attendance.created_by,
          created_at: attendance.created_at,
          updated_by: attendance.updated_by,
          updated_at: attendance.updated_at,
          siteincharge_name: attendance.siteincharge_name,
          siteincharge_email: attendance.siteincharge_email,
          created_by_user_name: attendance.created_by_user_name,
          created_by_user_email: attendance.created_by_user_email,
          updated_by_user_name: attendance.updated_by_user_name,
          updated_by_user_email: attendance.updated_by_user_email,
          labour_id: attendance.labour_id,
          full_name: attendance.full_name,
          mobile: attendance.mobile
        },
        edit_history: editHistory.map(edit => ({
          id: edit.id,
          labour_attendance_id: edit.labour_attendance_id,
          labour_assignment_id: edit.labour_assignment_id,
          shift: edit.shift,
          remarks: edit.remarks,
          created_by: edit.created_by,
          created_at: edit.created_at,
          updated_by: edit.updated_by,
          updated_at: edit.updated_at,
          created_by_user_name: edit.created_by_user_name,
          created_by_user_email: edit.created_by_user_email,
          updated_by_user_name: edit.updated_by_user_name,
          updated_by_user_email: edit.updated_by_user_email,
          labour_id: edit.labour_id,
          full_name: edit.full_name,
          mobile: edit.mobile
        }))
      });
    }

    res.status(200).json({
      status: 'success',
      data: attendancesWithHistory
    });
  } catch (error) {
    console.error('Error in viewAllLabourAttendance:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};





// Admin update completion entry (no 48-hour check)
exports.adminUpdateCompletionEntry = async (req, res) => {
  try {
    const { entry_id, area_added, remarks, updated_by } = req.body;

    console.log('Admin update completion entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Validate updated_by
    if (!updated_by || typeof updated_by !== 'string' || updated_by.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Updated By is required and must be a non-empty string',
      });
    }

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate area_added if provided
    const validateArea = (val, field) => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedAreaAdded = validateArea(area_added, 'area_added');

    // Validate remarks (required for update)
    if (!remarks || typeof remarks !== 'string' || remarks.trim() === '') {
      return res.status(400).json({ status: 'error', message: 'remarks is required and must be a non-empty string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT entry_id, rec_id, area_added, remarks, created_at, created_by
      FROM completion_entries_history 
      WHERE entry_id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Completion entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Get the rec_id to check against po_quantity
    const recId = currentEntry.rec_id;
    const [reckonerRecord] = await db.query('SELECT po_quantity FROM po_reckoner WHERE rec_id = ?', [recId]);
    if (reckonerRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid rec_id (${recId}): record does not exist` });
    }
    const poQuantity = parseFloat(reckonerRecord[0].po_quantity) || 0;

    // Calculate current total area without this entry
    const [totalAreaWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(area_added), 0) AS total_area
       FROM completion_entries_history 
       WHERE rec_id = ? AND entry_id != ?`,
      [recId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalAreaWithoutThis[0].total_area) || 0;

    // New total after update
    const oldArea = parseFloat(currentEntry.area_added) || 0;
    const newAreaAdded = validatedAreaAdded !== null ? validatedAreaAdded : oldArea;
    const newTotal = currTotalWithoutThis + newAreaAdded;

    if (newTotal > poQuantity) {
      return res.status(400).json({ status: 'error', message: `Updated area would exceed PO quantity (${poQuantity}) after update` });
    }

    // Get current completion_status before update (to save old state)
    const [currentStatus] = await db.query(
      'SELECT completion_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, work_status, billing_status, remarks, created_by, created_at, updated_at, updated_by FROM completion_status WHERE rec_id = ?',
      [recId]
    );

    // Update the entry in completion_entries_history (no updated_by/updated_at in table, so only area and remarks)
    console.log('Updating completion_entries_history entry...');
    await db.query(
      `UPDATE completion_entries_history
       SET
         area_added = ?,
         remarks = ?
       WHERE entry_id = ?`,
      [
        newAreaAdded,
        remarks.trim(),
        entryId
      ]
    );

    console.log('Update result: success');

    // Recalculate new cumulative area
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(area_added), 0) AS new_total_area
       FROM completion_entries_history 
       WHERE rec_id = ?`,
      [recId]
    );
    const newCumulativeArea = parseFloat(newTotalCumulative[0].new_total_area) || 0;

    // Get rate
    const rate = currentStatus.length > 0 ? parseFloat(currentStatus[0].rate) : 0;
    const newValue = parseFloat((newCumulativeArea * rate).toFixed(2));

    // Save old status to edit history
    if (currentStatus.length > 0) {
      const existingStatus = currentStatus[0];
      await db.query(
        `
          INSERT INTO completion_edit_entries_history
          (completion_status_id, area_completed, rate, value, billed_area, billed_value, balance_area, balance_value, 
           work_status, billing_status, remarks, created_by, updated_by, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          existingStatus.completion_id,
          existingStatus.area_completed || null,
          existingStatus.rate || null,
          existingStatus.value || null,
          existingStatus.billed_area || null,
          existingStatus.billed_value || null,
          existingStatus.balance_area || null,
          existingStatus.balance_value || null,
          existingStatus.work_status || null,
          existingStatus.billing_status || null,
          existingStatus.remarks || null,
          existingStatus.created_by || null,
          existingStatus.updated_by || null,
          existingStatus.created_at,
          existingStatus.updated_at || existingStatus.created_at,
        ]
      );
    }

    // Update completion_status
    if (currentStatus.length === 0) {
      // If no status, create one
      await db.query(
        `
          INSERT INTO completion_status
          (rec_id, area_completed, rate, value, created_by, work_status, billing_status, remarks, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [recId, newCumulativeArea, rate, newValue, updated_by, 'In Progress', 'Not Billed', remarks.trim()]
      );
    } else {
      await db.query(
        `UPDATE completion_status 
         SET 
           area_completed = ?,
           value = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE rec_id = ?`,
        [newCumulativeArea, newValue, updated_by, recId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Completion entry updated successfully (Admin mode)',
      data: {
        entry_id: entryId,
        rec_id: recId,
        area_added: newAreaAdded,
        remarks: remarks.trim(),
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in adminUpdateCompletionEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin update material acknowledgement (no 48-hour check)
exports.adminUpdateMaterialAcknowledgement = async (req, res) => {
  try {
    const { ack_id, overall_quantity, remarks, updated_by } = req.body;

    // Log incoming request body for debugging
    console.log('Admin update request body:', req.body);

    // Validate ack_id
    if (!ack_id || isNaN(ack_id)) {
      return res.status(400).json({ status: 'error', message: 'ack_id is required and must be a number' });
    }
    const ackId = parseInt(ack_id);

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate overall_quantity if provided
    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined || qty === '') return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQuantity = validateQuantity(overall_quantity, 'overall_quantity');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if ack_id exists
    const [existingAck] = await db.query(`
      SELECT id, material_dispatch_id, overall_quantity, remarks, created_at, updated_at, created_by, updated_by
      FROM material_acknowledgement 
      WHERE id = ?
    `, [ackId]);
    
    if (existingAck.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Acknowledgement with id ${ackId} does not exist` 
      });
    }

    const currentAck = existingAck[0];

    // Insert current state into history table BEFORE updating
    console.log('Inserting into history table...');
    const historyResult = await db.query(`
      INSERT INTO material_acknowledgement_history
      (material_acknowledgement_id, material_dispatch_id, comp_a_qty, comp_b_qty, comp_c_qty, 
       comp_a_remarks, comp_b_remarks, comp_c_remarks, overall_quantity, remarks, 
       created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      ackId,
      currentAck.material_dispatch_id,
      currentAck.comp_a_qty,
      currentAck.comp_b_qty,
      currentAck.comp_c_qty,
      currentAck.comp_a_remarks,
      currentAck.comp_b_remarks,
      currentAck.comp_c_remarks,
      currentAck.overall_quantity,
      currentAck.remarks,
      currentAck.created_by,
      currentAck.updated_by,
      currentAck.created_at,
      currentAck.updated_at || currentAck.created_at
    ]);

    console.log('History insert result:', historyResult);

    // Update the main acknowledgement table
    console.log('Updating main acknowledgement table...');
    const updateResult = await db.query(`
      UPDATE material_acknowledgement
      SET
        overall_quantity = ?,
        remarks = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      validatedOverallQuantity,
      remarks || null,
      updated_by,
      ackId
    ]);

    console.log('Update result:', updateResult);

    // Fetch the updated record to return
    const [updatedRecord] = await db.query(`
      SELECT * FROM material_acknowledgement WHERE id = ?
    `, [ackId]);

    res.status(200).json({
      status: 'success',
      message: 'Material acknowledgement updated successfully (Admin mode)',
      data: {
        id: ackId,
        material_dispatch_id: currentAck.material_dispatch_id,
        overall_quantity: validatedOverallQuantity,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in adminUpdateMaterialAcknowledgement:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin update material usage entry (no 48-hour check)
exports.adminUpdateMaterialUsageEntry = async (req, res) => {
  try {
    const { entry_id, overall_qty, remarks, updated_by } = req.body;

    console.log('Admin update material usage entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate overall_qty if provided
    const validateQuantity = (qty, field) => {
      if (qty === null || qty === undefined || qty === '') return null;
      const parsed = parseInt(qty);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedOverallQty = validateQuantity(overall_qty, 'overall_qty');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT entry_id, material_ack_id, overall_qty, remarks, created_at, updated_at, created_by, updated_by
      FROM material_usage_history 
      WHERE entry_id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Material usage entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Get the material_ack_id to check against acknowledged quantity
    const ackId = currentEntry.material_ack_id;
    const [ackRecord] = await db.query('SELECT overall_quantity FROM material_acknowledgement WHERE id = ?', [ackId]);
    if (ackRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid material_ack_id (${ackId}): record does not exist` });
    }
    const sumAck = parseFloat(ackRecord[0].overall_quantity) || 0;

    // Calculate current total usage without this entry
    const [totalUsageWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(overall_qty), 0) AS total_qty
       FROM material_usage_history 
       WHERE material_ack_id = ? AND entry_id != ?`,
      [ackId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalUsageWithoutThis[0].total_qty) || 0;

    // New total after update
    const newOverallQty = validatedOverallQty !== null ? validatedOverallQty : parseFloat(currentEntry.overall_qty) || 0;
    const newTotal = currTotalWithoutThis + newOverallQty;

    if (newTotal > sumAck) {
      return res.status(400).json({ status: 'error', message: `Overall usage would exceed acknowledged quantity sum (${sumAck}) after update` });
    }

    // Insert current state into edit history BEFORE updating
    console.log('Inserting into edit history table...');
    const historyResult = await db.query(`
      INSERT INTO material_usage_edit_history
      (material_usage_history_id, material_ack_id, comp_a_qty, comp_b_qty, comp_c_qty, 
       comp_a_remarks, comp_b_remarks, comp_c_remarks, overall_qty, remarks, 
       created_by, updated_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      entryId,
      currentEntry.material_ack_id,
      currentEntry.comp_a_qty || null,
      currentEntry.comp_b_qty || null,
      currentEntry.comp_c_qty || null,
      currentEntry.comp_a_remarks || null,
      currentEntry.comp_b_remarks || null,
      currentEntry.comp_c_remarks || null,
      currentEntry.overall_qty,
      currentEntry.remarks,
      currentEntry.created_by,
      currentEntry.updated_by,
      currentEntry.created_at,
      currentEntry.updated_at || currentEntry.created_at
    ]);

    console.log('Edit history insert result:', historyResult);

    // Update the entry in material_usage_history
    console.log('Updating material_usage_history entry...');
    const updateResult = await db.query(`
      UPDATE material_usage_history
      SET
        overall_qty = ?,
        remarks = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE entry_id = ?
    `, [
      newOverallQty,
      remarks || null,
      updated_by,
      entryId
    ]);

    console.log('Update result:', updateResult);

    // Recalculate and update cumulative in material_usage
    console.log('Recalculating cumulative in material_usage...');
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(overall_qty), 0) AS new_total
       FROM material_usage_history 
       WHERE material_ack_id = ?`,
      [ackId]
    );
    const newCumulativeTotal = parseFloat(newTotalCumulative[0].new_total) || 0;

    const [existingUsage] = await db.query('SELECT id FROM material_usage WHERE material_ack_id = ?', [ackId]);
    if (existingUsage.length === 0) {
      await db.query(
        `INSERT INTO material_usage 
         (material_ack_id, overall_qty, remarks, created_by, updated_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [ackId, newCumulativeTotal, remarks || null, currentEntry.created_by, updated_by]
      );
    } else {
      await db.query(
        `UPDATE material_usage 
         SET 
           overall_qty = ?,
           remarks = ?,
           updated_by = ?,
           updated_at = NOW()
         WHERE material_ack_id = ?`,
        [newCumulativeTotal, remarks || null, updated_by, ackId]
      );
    }

    res.status(200).json({
      status: 'success',
      message: 'Material usage entry updated successfully (Admin mode)',
      data: {
        entry_id: entryId,
        material_ack_id: ackId,
        overall_qty: newOverallQty,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in adminUpdateMaterialUsageEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin update labour assignment (no 48-hour check)
exports.adminUpdateLabourAssignment = async (req, res) => {
  try {
    const { assignment_id, from_date, to_date, salary, updated_by } = req.body;

    console.log('Admin update labour assignment request body:', req.body);

    // Validate assignment_id
    if (!assignment_id || isNaN(assignment_id)) {
      return res.status(400).json({ status: 'error', message: 'assignment_id is required and must be a number' });
    }
    const assignmentId = parseInt(assignment_id);

    // Validate dates
    if (!from_date || !/^\d{4}-\d{2}-\d{2}$/.test(from_date)) {
      return res.status(400).json({ status: 'error', message: 'from_date is required in YYYY-MM-DD format' });
    }
    if (!to_date || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
      return res.status(400).json({ status: 'error', message: 'to_date is required in YYYY-MM-DD format' });
    }
    if (new Date(from_date) > new Date(to_date)) {
      return res.status(400).json({ status: 'error', message: 'from_date cannot be later than to_date' });
    }

    // Validate salary if provided
    let validatedSalary = null;
    if (salary !== undefined) {
      if (salary === null || salary === '') {
        validatedSalary = null;
      } else {
        const parsedSalary = parseFloat(salary);
        if (isNaN(parsedSalary) || parsedSalary < 0) {
          return res.status(400).json({ status: 'error', message: 'salary must be a non-negative number' });
        }
        validatedSalary = parsedSalary;
      }
    }

    // Validate updated_by
    if (!updated_by || isNaN(updated_by)) {
      return res.status(400).json({ status: 'error', message: 'updated_by is required and must be a number' });
    }

    // Verify if updated_by exists
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({ status: 'error', message: 'Invalid updated_by: User does not exist' });
    }

    // Check if assignment_id exists and fetch current state (include updated_by and updated_at)
    const [existingAssignment] = await db.query(`
      SELECT id, project_id, site_id, desc_id, labour_id, from_date, to_date, salary, created_by, updated_by, created_at, updated_at
      FROM labour_assignment 
      WHERE id = ?
    `, [assignmentId]);
    
    if (existingAssignment.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Labour assignment with id ${assignmentId} does not exist` 
      });
    }

    const currentAssignment = existingAssignment[0];

    // Insert current state into edit history BEFORE updating (copy all fields, including updated_at)
    console.log('Inserting into edit history table...');
    await db.query(
      `INSERT INTO labour_assignment_edit_history
       (labour_assignment_id, project_id, site_id, desc_id, labour_id, from_date, to_date, salary, 
        created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assignmentId,
        currentAssignment.project_id,
        currentAssignment.site_id,
        currentAssignment.desc_id,
        currentAssignment.labour_id,
        currentAssignment.from_date,
        currentAssignment.to_date,
        currentAssignment.salary,
        currentAssignment.created_by,
        currentAssignment.updated_by,
        currentAssignment.created_at,
        currentAssignment.updated_at || currentAssignment.created_at
      ]
    );

    console.log('History insert result: success');

    // Update the assignment (always include salary set to validatedSalary, which could be null)
    console.log('Updating labour_assignment...');
    const updateQuery = `
      UPDATE labour_assignment
      SET
        from_date = ?,
        to_date = ?,
        salary = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    const updateParams = [from_date, to_date, validatedSalary, updated_by, assignmentId];

    await db.query(updateQuery, updateParams);

    console.log('Update result: success');

    res.status(200).json({
      status: 'success',
      message: 'Labour assignment updated successfully (Admin mode)',
      data: {
        assignment_id: assignmentId,
        from_date,
        to_date,
        salary: validatedSalary,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in adminUpdateLabourAssignment:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin update budget expense entry (no 48-hour check)
exports.adminUpdateBudgetExpenseEntry = async (req, res) => {
  try {
    const { entry_id, actual_value, remarks, updated_by } = req.body;

    console.log('Admin update budget expense entry request body:', req.body);

    // Validate entry_id
    if (!entry_id || isNaN(entry_id)) {
      return res.status(400).json({ status: 'error', message: 'entry_id is required and must be a number' });
    }
    const entryId = parseInt(entry_id);

    // Verify if updated_by exists in the users table
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [updated_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Updated By: User does not exist',
      });
    }

    // Validate actual_value if provided
    const validateValue = (val, field) => {
      if (val === null || val === undefined || val === '') return null;
      const parsed = parseFloat(val);
      if (isNaN(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative number or null`);
      }
      return parsed;
    };

    const validatedActualValue = validateValue(actual_value, 'actual_value');

    // Validate remarks if provided
    if (remarks && typeof remarks !== 'string') {
      return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
    }

    // Check if entry_id exists
    const [existingEntry] = await db.query(`
      SELECT id, actual_budget_id, entry_date, actual_value, remarks, created_at, updated_at, created_by, updated_by
      FROM actual_budget_history 
      WHERE id = ?
    `, [entryId]);
    
    if (existingEntry.length === 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Budget expense entry with id ${entryId} does not exist` 
      });
    }

    const currentEntry = existingEntry[0];

    // Get the actual_budget_id to check against splitted_budget
    const budgetId = currentEntry.actual_budget_id;
    const [budgetRecord] = await db.query('SELECT splitted_budget FROM actual_budget WHERE id = ?', [budgetId]);
    if (budgetRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: `Invalid actual_budget_id (${budgetId}): record does not exist` });
    }
    const maxBudget = parseFloat(budgetRecord[0].splitted_budget) || 0;

    // Calculate current total expense without this entry
    const [totalExpenseWithoutThis] = await db.query(
      `SELECT COALESCE(SUM(actual_value), 0) AS total_expense
       FROM actual_budget_history 
       WHERE actual_budget_id = ? AND id != ?`,
      [budgetId, entryId]
    );
    const currTotalWithoutThis = parseFloat(totalExpenseWithoutThis[0].total_expense) || 0;

    // New total after update
    const oldValue = parseFloat(currentEntry.actual_value) || 0;
    const newActualValue = validatedActualValue !== null ? validatedActualValue : oldValue;
    const newTotal = currTotalWithoutThis + newActualValue;

    if (newTotal > maxBudget) {
      return res.status(400).json({ status: 'error', message: `Expense would exceed splitted budget (${maxBudget.toFixed(2)}) after update` });
    }

    // Insert current (old) state into edit_history BEFORE updating
    console.log('Inserting into edit history table...');
    await db.query(
      `INSERT INTO actual_budget_edit_history
       (actual_budget_history_id, actual_budget_id, actual_value, remarks, 
        created_by, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entryId,
        currentEntry.actual_budget_id,
        currentEntry.actual_value,
        currentEntry.remarks,
        currentEntry.created_by,
        currentEntry.updated_by,
        currentEntry.created_at,
        currentEntry.updated_at || currentEntry.created_at
      ]
    );

    console.log('Edit history insert result: success');

    // Update the entry in actual_budget_history
    console.log('Updating actual_budget_history entry...');
    await db.query(
      `UPDATE actual_budget_history
       SET
         actual_value = ?,
         remarks = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [
        newActualValue,
        remarks || null,
        updated_by,
        entryId
      ]
    );

    console.log('Update result: success');

    // Recalculate and update cumulative in actual_budget
    console.log('Recalculating cumulative in actual_budget...');
    const [newTotalCumulative] = await db.query(
      `SELECT COALESCE(SUM(actual_value), 0) AS new_total
       FROM actual_budget_history 
       WHERE actual_budget_id = ?`,
      [budgetId]
    );
    const newCumulativeTotal = parseFloat(newTotalCumulative[0].new_total) || 0;
    const newDifference = maxBudget - newCumulativeTotal;

    await db.query(
      `UPDATE actual_budget 
       SET 
         actual_value = ?,
         difference_value = ?,
         updated_by = ?,
         updated_at = NOW()
       WHERE id = ?`,
      [newCumulativeTotal, newDifference, updated_by, budgetId]
    );

    res.status(200).json({
      status: 'success',
      message: 'Budget expense entry updated successfully (Admin mode)',
      data: {
        entry_id: entryId,
        actual_budget_id: budgetId,
        actual_value: newActualValue,
        remarks: remarks || null,
        updated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in adminUpdateBudgetExpenseEntry:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid data format in request',
        error: error.message
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Admin save labour attendance (no 48-hour check for updates)
exports.adminSaveLabourAttendance = async (req, res) => {
  try {
    const { attendance_data, created_by } = req.body;
    console.log('Admin received payload:', req.body); // Debug log

    if (!attendance_data || !Array.isArray(attendance_data) || attendance_data.length === 0) {
      console.log('Validation failed: attendance_data missing, not an array, or empty');
      return res.status(400).json({ status: 'error', message: 'attendance_data is required and must be a non-empty array' });
    }
    if (!created_by || isNaN(created_by)) {
      console.log('Validation failed: created_by missing or not a number');
      return res.status(400).json({ status: 'error', message: 'created_by is required and must be a number' });
    }

    // Verify created_by exists
    const [userRecord] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (userRecord.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid created_by user_id' });
    }

    const now = new Date();

    for (const data of attendance_data) {
      const { labour_assignment_id, entry_date, shift, remarks, attendance_id } = data;

      // Common validations
      if (!labour_assignment_id || isNaN(labour_assignment_id)) {
        console.log('Validation failed: labour_assignment_id missing or not a number');
        return res.status(400).json({ status: 'error', message: 'labour_assignment_id is required and must be a number for each attendance entry' });
      }
      if (!entry_date || !/^\d{4}-\d{2}-\d{2}$/.test(entry_date)) {
        console.log('Validation failed: entry_date missing or invalid format');
        return res.status(400).json({ status: 'error', message: 'entry_date is required in YYYY-MM-DD format for each attendance entry' });
      }
      const parsedShift = parseFloat(shift);
      if (isNaN(parsedShift) || parsedShift < 0) {
        console.log('Validation failed: shift must be a non-negative number');
        return res.status(400).json({ status: 'error', message: 'shift is required and must be a non-negative number for each attendance entry' });
      }
      if (remarks && typeof remarks !== 'string') {
        return res.status(400).json({ status: 'error', message: 'remarks must be a string' });
      }

      const [assignment] = await db.query('SELECT id FROM labour_assignment WHERE id = ?', [labour_assignment_id]);
      if (assignment.length === 0) {
        console.log('Validation failed: Invalid labour_assignment_id', labour_assignment_id);
        return res.status(400).json({ status: 'error', message: 'Invalid labour_assignment_id' });
      }

      if (attendance_id) {
        // Update existing attendance (no 48-hour check for admin)
        const attendanceId = parseInt(attendance_id);
        if (isNaN(attendanceId)) {
          return res.status(400).json({ status: 'error', message: 'attendance_id must be a number for updates' });
        }

        // Fetch current state for history
        const [existingAttendance] = await db.query(`
          SELECT id, labour_assignment_id, shift, remarks, created_by, created_at, updated_at
          FROM labour_attendance 
          WHERE id = ?
        `, [attendanceId]);

        if (existingAttendance.length === 0) {
          return res.status(400).json({ status: 'error', message: `Attendance entry with id ${attendanceId} does not exist` });
        }

        const currentAttendance = existingAttendance[0];

        // Insert current state into edit history
        await db.query(
          `INSERT INTO labour_attendance_edit_history
           (labour_attendance_id, labour_assignment_id, shift, remarks, created_by, updated_by, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            attendanceId,
            currentAttendance.labour_assignment_id,
            currentAttendance.shift,
            currentAttendance.remarks,
            currentAttendance.created_by,
            currentAttendance.updated_by,
            currentAttendance.created_at,
            currentAttendance.updated_at || currentAttendance.created_at
          ]
        );

        // Update the attendance
        await db.query(
          `UPDATE labour_attendance
           SET shift = ?, remarks = ?, updated_by = ?, updated_at = NOW()
           WHERE id = ?`,
          [parsedShift, remarks || null, created_by, attendanceId]
        );
      } else {
        // Insert new attendance
        await db.query(
          `INSERT INTO labour_attendance 
           (labour_assignment_id, shift, remarks, created_by, created_at, entry_date)
           VALUES (?, ?, ?, ?, NOW(), ?)`,
          [labour_assignment_id, parsedShift, remarks || null, created_by, entry_date]
        );
      }
    }

    res.status(201).json({
      status: 'success',
      message: 'Labour attendance saved/updated successfully (Admin mode)'
    });
  } catch (error) {
    console.error('Error in adminSaveLabourAttendance:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Duplicate attendance entry'
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key reference'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};