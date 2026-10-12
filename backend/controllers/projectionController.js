// projectionController.js
const db = require("../config/db");

// Fetch PO totals by site ID and desc ID
exports.getPoTotalBudget = async (req, res) => {
  const { siteId, descId } = req.params;
  try {
    // Fetch a single po_quantity (most frequent if multiple records)
    const [qtyResult] = await db.query(
      `SELECT pr.po_quantity, COUNT(*) as count 
       FROM po_reckoner pr
       WHERE pr.site_id = ? AND pr.desc_id = ? 
       GROUP BY pr.po_quantity 
       ORDER BY count DESC, pr.po_quantity DESC 
       LIMIT 1`,
      [siteId, descId]
    );

    const total_po_qty = qtyResult.length > 0 ? parseFloat(qtyResult[0].po_quantity) || 0 : 0;

    // Fetch sum of rate
    const [rateResult] = await db.query(
      `SELECT SUM(pr.rate) AS total_rate
       FROM po_reckoner pr
       WHERE pr.site_id = ? AND pr.desc_id = ?`,
      [siteId, descId]
    );

    const total_rate = rateResult.length > 0 ? parseFloat(rateResult[0].total_rate) || 0 : 0;

    // Calculate total_po_value
    const total_po_value = total_po_qty * total_rate;

    // Fetch the most frequent uom
    const [uomResult] = await db.query(
      `SELECT pr.uom, COUNT(*) as count 
       FROM po_reckoner pr
       WHERE pr.site_id = ? AND pr.desc_id = ? 
       GROUP BY pr.uom 
       ORDER BY count DESC 
       LIMIT 1`,
      [siteId, descId]
    );
    const uom = uomResult.length > 0 ? uomResult[0].uom : 'unknown';

    // Fetch desc_name
    const [descResult] = await db.query(
      `SELECT desc_name FROM work_descriptions WHERE desc_id = ?`,
      [descId]
    );
    const desc_name = descResult.length > 0 ? descResult[0].desc_name : 'Unknown';

    res.status(200).json({
      success: true,
      data: {
        total_po_qty,
        total_rate,
        total_po_value,
        uom,
        desc_name
      }
    });
  } catch (error) {
    console.error("Error fetching PO totals:", error);
    res.status(500).json({ success: false, message: "Failed to fetch PO totals" });
  }
};

exports.getPoBudget = async (req, res) => {
  const { site_id, desc_id } = req.query;

  // Validate query parameters
  if (!site_id || !desc_id) {
    return res.status(400).json({
      success: false,
      message: "site_id and desc_id are required query parameters",
    });
  }

  try {
    const budget = await db.query(
      `SELECT id, site_id, desc_id, total_po_value, total_budget_value, projection_id, created_at, updated_at 
       FROM po_budget 
       WHERE site_id = ? AND desc_id = ?`,
      [site_id, desc_id]
    );
    res.status(200).json({
      success: true,
      data: budget,  // Return the full array of budgets (one per projection_id)
    });
  } catch (error) {
    console.error("Error searching PO budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search PO budget",
      error: error.message,
    });
  }
};

exports.savePoBudget = async (req, res) => {
  const { site_id, desc_id, total_po_value, total_budget_value, projection_id } = req.body;

  // Validate input
  if (!site_id || !desc_id || !total_po_value || !total_budget_value || !projection_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: site_id, desc_id, total_po_value, total_budget_value, projection_id",
    });
  }

  // Parse projection_id to integer
  const parsedProjectionId = parseInt(projection_id, 10);
  if (isNaN(parsedProjectionId)) {
    return res.status(400).json({
      success: false,
      message: "projection_id must be a valid integer",
    });
  }

  // Determine projection_status: 1 for projection_id=1, 0 otherwise
  const projection_status = parsedProjectionId === 1 ? 1 : 0;

  try {
    // Check if a record already exists for the site_id, desc_id, and projection_id
    const [existing] = await db.query(
      `SELECT id, projection_id FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
      [site_id, desc_id, parsedProjectionId]
    );

    let budgetId;
    if (existing.length > 0) {
      // Update existing record (projection_id and projection_status remain unchanged)
      await db.query(
        `UPDATE po_budget 
         SET total_po_value = ?, total_budget_value = ?, projection_status = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
        [total_po_value, total_budget_value, projection_status, site_id, desc_id, parsedProjectionId]
      );
      budgetId = existing[0].id;
      return res.status(200).json({
        success: true,
        message: "Budget updated successfully (projection_id unchanged)",
        data: { id: budgetId, projection_id: parsedProjectionId, projection_status },
      });
    } else {
      // Insert new record with the provided projection_id and projection_status
      const [result] = await db.query(
        `INSERT INTO po_budget (site_id, desc_id, total_po_value, total_budget_value, projection_id, projection_status) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [site_id, desc_id, total_po_value, total_budget_value, parsedProjectionId, projection_status]
      );
      budgetId = result.insertId;
      return res.status(201).json({
        success: true,
        message: "Budget saved successfully",
        data: { id: budgetId, projection_id: parsedProjectionId, projection_status },
      });
    }
  } catch (error) {
    console.error("Error saving PO budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save budget",
      error: error.message,
    });
  }
};
exports.getOverheads = async (req, res) => {
  const { po_budget_id } = req.query;

  try {
    let query, params;

    if (po_budget_id) {
      // For allocated view: Fetch all overheads but JOIN with actual_budget to filter implicitly via data
      query = `
        SELECT DISTINCT o.id, o.expense_name, o.is_default
        FROM overhead o
        LEFT JOIN actual_budget ab ON o.id = ab.overhead_id AND ab.po_budget_id = ?
      `;
      params = [po_budget_id];
    } else {
      // For allocation view: Only fetch non-default (added) overheads
      query = `
        SELECT id, expense_name, is_default
        FROM overhead
        WHERE is_default = 0
      `;
      params = [];
    }

    const [overheads] = await db.query(query, params);
    res.status(200).json({
      success: true,
      data: overheads,
    });
  } catch (error) {
    console.error("Error fetching overheads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overheads",
      error: error.message,
    });
  }
};

// Save a new overhead
exports.saveOverhead = async (req, res) => {
  const { expense_name } = req.body;

  if (!expense_name) {
    return res.status(400).json({
      success: false,
      message: "Expense name is required",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO overhead (expense_name, is_default) VALUES (?, 0)`,
      [expense_name]
    );

    res.status(200).json({
      success: true,
      message: "Overhead saved successfully",
      data: { id: result.insertId, expense_name, is_default: 0 },
    });
  } catch (error) {
    console.error("Error saving overhead:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save overhead",
      error: error.message,
    });
  }
};

exports.saveDynamicOverheadValues = async (req, res) => {
  const { site_id, desc_id, value, percentage, overhead_type, projection_id } = req.body;

  // Enhanced validation
  if (!site_id || !desc_id || value === undefined || percentage === undefined || !overhead_type || !projection_id) {
    return res.status(400).json({
      success: false,
      message: "All fields are required, including projection_id",
    });
  }

  if (isNaN(value) || isNaN(percentage) || isNaN(projection_id)) {
    return res.status(400).json({
      success: false,
      message: "Value, percentage, and projection_id must be valid numbers",
    });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Step 1: Get overhead_type_id dynamically based on input
    const [overheadRows] = await conn.query(
      'SELECT id FROM overhead WHERE expense_name = ? LIMIT 1',
      [overhead_type]
    );

    if (overheadRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: `Invalid overhead type: '${overhead_type}' not found`,
      });
    }
    const overhead_type_id = overheadRows[0].id;

    // Step 2: Check if record already exists for this unique combination
    const [existingRows] = await conn.query(
      `SELECT id FROM projection_allocated 
       WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ? AND projection_id = ? 
       LIMIT 1`,
      [site_id, desc_id, overhead_type_id, parseInt(projection_id)]
    );

    if (existingRows.length > 0) {
      // Step 3: Update existing record
      await conn.query(
        `UPDATE projection_allocated 
         SET total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [parseFloat(value), parseFloat(percentage), existingRows[0].id]
      );
      await conn.commit();
      return res.status(200).json({
        success: true,
        message: `${overhead_type} overhead updated successfully!`,
      });
    } else {
      // Step 4: Insert new record
      const [result] = await conn.query(
        `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [site_id, desc_id, overhead_type_id, parseInt(projection_id), parseFloat(value), parseFloat(percentage)]
      );
      await conn.commit();
      return res.status(200).json({
        success: true,
        message: `${overhead_type} overhead saved successfully!`,
      });
    }
  } catch (error) {
    if (conn) await conn.rollback().catch(rollbackErr => console.error('Rollback failed:', rollbackErr));
    console.error('Error saving dynamic overhead:', error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while saving the overhead value. Please try again.",
    });
  } finally {
    if (conn) conn.release();
  }
};

exports.saveActualBudget = async (req, res) => {
  const { po_budget_id, actual_budget_entries } = req.body;  // Ignore projection_id

  if (!po_budget_id || !Array.isArray(actual_budget_entries) || actual_budget_entries.length === 0) {
    return res.status(400).json({
      success: false,
      message: "po_budget_id and actual_budget_entries array are required",
    });
  }

  try {
    // Check if already allocated for this po_budget_id (prevent re-allocation)
    const [existing] = await db.query(
      `SELECT id FROM actual_budget WHERE po_budget_id = ?`,
      [po_budget_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Budget already allocated and cannot be re-allocated",
      });
    }

    // Fetch total_budget_value from po_budget
    const [poBudget] = await db.query(
      `SELECT total_budget_value FROM po_budget WHERE id = ?`,
      [po_budget_id]
    );
    if (!poBudget.length) {
      return res.status(404).json({
        success: false,
        message: "PO budget not found",
      });
    }
    const total_budget_value = parseFloat(poBudget[0].total_budget_value);

    // Validate sum of splitted_budget values (all added overheads)
    const total_splitted = actual_budget_entries.reduce((sum, entry) => {
      return entry.splitted_budget ? sum + parseFloat(entry.splitted_budget) : sum;
    }, 0);
    if (Math.abs(total_splitted - total_budget_value) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Sum of splitted budget values (${total_splitted.toFixed(2)}) must equal total budget value (${total_budget_value.toFixed(2)})`,
      });
    }

    // Insert new entries for all provided (added overheads) - stores splitted_budget as allocated value
    for (const entry of actual_budget_entries) {
      const { overhead_id, splitted_budget, actual_value, remarks } = entry;
      const difference_value = actual_value !== null && splitted_budget !== null
        ? parseFloat(splitted_budget) - parseFloat(actual_value)
        : null;

      await db.query(
        `INSERT INTO actual_budget (overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks, 'system'] // No projection_id
      );
    }

    res.status(200).json({
      success: true,
      message: "Budget allocated successfully for added overheads",
    });
  } catch (error) {
    console.error("Error allocating budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to allocate budget",
      error: error.message,
    });
  }
};

exports.getActualBudgetEntries = async (req, res) => {
  const { po_budget_id } = req.params;

  if (!po_budget_id) {
    return res.status(400).json({
      success: false,
      message: "po_budget_id is required",
    });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Step 1: Fetch total_budget_value for percentage calculation
    const [poBudgetRows] = await conn.query(
      `SELECT total_budget_value FROM po_budget WHERE id = ?`,
      [po_budget_id]
    );
    const total_budget_value = poBudgetRows.length > 0 ? parseFloat(poBudgetRows[0].total_budget_value) || 0 : 0;

    // Step 2: Fetch only actual_budget entries with JOIN to overhead (only present overheads)
    const [rows] = await conn.query(
      `SELECT ab.overhead_id, o.expense_name, ab.splitted_budget, ab.actual_value, ab.difference_value, ab.remarks, pb.site_id, pb.desc_id
       FROM actual_budget ab
       JOIN po_budget pb ON ab.po_budget_id = pb.id
       JOIN overhead o ON ab.overhead_id = o.id
       WHERE ab.po_budget_id = ?
       ORDER BY o.expense_name ASC`,
      [po_budget_id]
    );

    const entries = {};
    rows.forEach((row) => {
      const overheadId = row.overhead_id;
      const val = parseFloat(row.splitted_budget) || 0;
      const perc = total_budget_value > 0 ? (val / total_budget_value * 100).toFixed(2) : "0.00";
      entries[overheadId] = {
        expense_name: row.expense_name || "Unknown Expense",
        splitted_budget: row.splitted_budget !== null ? parseFloat(row.splitted_budget).toFixed(2) : null,
        actual_value: row.actual_value !== null ? parseFloat(row.actual_value).toFixed(2) : null,
        difference_value: row.difference_value !== null ? parseFloat(row.difference_value).toFixed(2) : null,
        remarks: row.remarks || "",
        percentage: perc,
        edited: true,
        site_id: row.site_id,
        desc_id: row.desc_id,
      };
    });

    await conn.commit();

    res.status(200).json({
      success: true,
      data: entries,  // Only allocated overheads with data (object keyed by overhead_id)
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error fetching actual budget entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch actual budget entries",
      error: error.message,
    });
  } finally {
    if (conn) conn.release();
  }
};

exports.fetchMaterialPlanningBudget = async (req, res) => {
  const { site_id, desc_id } = req.query;

  if (!site_id || !desc_id) {
    return res.status(400).json({
      success: false,
      message: "site_id and desc_id are required",
    });
  }

  try {
    // Step 1: Find po_budget_id from po_budget table
    const [poBudgetRows] = await db.query(
      `SELECT id FROM po_budget WHERE site_id = ? AND desc_id = ?`,
      [site_id, desc_id]
    );

    if (poBudgetRows.length === 0) {
      return res.status(200).json({
        success: true,
        splitted_budget: null,
        assigned_budget: "0.00",
        balance_budget: null,
      });
    }

    const po_budget_id = poBudgetRows[0].id;

    // Step 2: Fetch splitted_budget from actual_budget where overhead_id = 1
    const [budgetRows] = await db.query(
      `SELECT splitted_budget
       FROM actual_budget
       WHERE po_budget_id = ? AND overhead_id = 1`,
      [po_budget_id]
    );

    const splitted_budget = budgetRows.length > 0 && budgetRows[0].splitted_budget !== null
      ? parseFloat(budgetRows[0].splitted_budget).toFixed(2)
      : null;

    // Step 3: Fetch assigned_budget as sum(quantity * rate) from material_assign
    const [assignedRows] = await db.query(
      `SELECT IFNULL(SUM(quantity * rate), 0) AS assigned_budget
       FROM material_assign
       WHERE site_id = ? AND desc_id = ?`,
      [site_id, desc_id]
    );

    const assigned_budget = parseFloat(assignedRows[0].assigned_budget).toFixed(2);

    // Step 4: Calculate balance_budget
    const balance_budget = splitted_budget !== null
      ? (parseFloat(splitted_budget) - parseFloat(assigned_budget)).toFixed(2)
      : null;

    res.status(200).json({
      success: true,
      splitted_budget,
      assigned_budget,
      balance_budget,
    });
  } catch (error) {
    console.error("Error fetching material planning budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch material planning budget",
      error: error.message,
    });
  }
};

exports.saveLabourOverhead = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Endpoint triggered`);
  const {
    site_id, desc_id, calculation_type, no_of_labours, total_shifts,
    rate_per_shift, total_cost, overhead_type, labourBudgetPercentage, projection_id
  } = req.body;

  console.log(`[${new Date().toISOString()}] Request Body:`, req.body);

  if (!site_id || !desc_id || !calculation_type || !rate_per_shift || !total_cost || !projection_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Step 1: Get overhead_type_id
    console.log(`[${new Date().toISOString()}] Querying overhead for expense_name: ${overhead_type}`);
    const [overheadRows] = await connection.query(
      'SELECT id FROM overhead WHERE expense_name = ? LIMIT 1',
      [overhead_type]
    );
    console.log(`[${new Date().toISOString()}] Overhead query result:`, overheadRows);

    if (overheadRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid overhead type' });
    }
    const overhead_type_id = overheadRows[0].id;

    // Step 2: Check if record already exists in labour_overhead for this unique combination (site_id, desc_id, projection_id)
    const [existingLabourRows] = await connection.query(
      `SELECT id FROM labour_overhead 
       WHERE site_id = ? AND desc_id = ? AND projection_id = ? 
       LIMIT 1`,
      [site_id, desc_id, projection_id]
    );

    if (existingLabourRows.length > 0) {
      // Update existing record in labour_overhead
      await connection.query(
        `UPDATE labour_overhead 
         SET calculation_type = ?, no_of_labours = ?, total_shifts = ?, rate_per_shift = ?, total_cost = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [calculation_type, no_of_labours || null, total_shifts || null, rate_per_shift, total_cost, existingLabourRows[0].id]
      );
      console.log(`[${new Date().toISOString()}] Labour overhead updated`);
    } else {
      // Insert new record into labour_overhead
      await connection.query(
        `INSERT INTO labour_overhead (site_id, desc_id, calculation_type, no_of_labours, total_shifts, rate_per_shift, total_cost, overhead_type, projection_id, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [site_id, desc_id, calculation_type, no_of_labours || null, total_shifts || null, rate_per_shift, total_cost, overhead_type_id, projection_id]
      );
      console.log(`[${new Date().toISOString()}] Labour overhead inserted`);
    }

    // Step 3: Check if record already exists in projection_allocated for this unique combination (site_id, desc_id, overhead_type_id, projection_id)
    const [existingAllocRows] = await connection.query(
      `SELECT id FROM projection_allocated 
       WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ? AND projection_id = ? 
       LIMIT 1`,
      [site_id, desc_id, overhead_type_id, projection_id]
    );

    if (existingAllocRows.length > 0) {
      // Update existing record in projection_allocated
      await connection.query(
        `UPDATE projection_allocated 
         SET total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [total_cost, labourBudgetPercentage || 0, existingAllocRows[0].id]
      );
      console.log(`[${new Date().toISOString()}] Projection allocated updated`);
    } else {
      // Insert new record into projection_allocated
      await connection.query(
        `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [site_id, desc_id, overhead_type_id, projection_id, total_cost, labourBudgetPercentage || 0]
      );
      console.log(`[${new Date().toISOString()}] Projection allocated inserted`);
    }

    await connection.commit();
    return res.json({ success: true, message: 'Labour overhead saved successfully' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(`[${new Date().toISOString()}] Error saving labour overhead:`, err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.finalProjectionSubmission = async (req, res) => {
  const { site_id, desc_id, projection_id, projection_data } = req.body;

  if (!site_id || !desc_id || !projection_id || !projection_data) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Step 1: Get po_budget_id
    const [poBudgetRows] = await conn.query(
      'SELECT id, total_budget_value FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
      [site_id, desc_id, projection_id]
    );
    if (poBudgetRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'PO budget not found for this projection' });
    }
    const po_budget_id = poBudgetRows[0].id;
    const total_budget_value = parseFloat(poBudgetRows[0].total_budget_value);

    // Step 2: Fetch all allocated overheads for this projection
    const [allocatedRows] = await conn.query(
      'SELECT overhead_type_id, total_cost FROM projection_allocated WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
      [site_id, desc_id, projection_id]
    );

    // Group allocatedRows by overhead_type_id and sum total_cost for this projection
    const summedAllocated = allocatedRows.reduce((acc, row) => {
      const { overhead_type_id, total_cost } = row;
      const cost = parseFloat(total_cost || 0);
      if (!acc[overhead_type_id]) {
        acc[overhead_type_id] = 0;
      }
      acc[overhead_type_id] += cost;
      return acc;
    }, {});

    // Step 3: Update ALL existing actual_budget records for this site_id/desc_id to use the new po_budget_id (ensures all previous are visible under latest)
    await conn.query(`
      UPDATE actual_budget ab
      JOIN po_budget pb ON ab.po_budget_id = pb.id
      SET ab.po_budget_id = ?
      WHERE pb.site_id = ? AND pb.desc_id = ?
    `, [po_budget_id, site_id, desc_id]);

    // Step 4: For each unique overhead_type_id in this projection, add the summed total_cost to existing or insert new into actual_budget
    for (const [overhead_type_id, summed_total_cost] of Object.entries(summedAllocated)) {
      // Check for existing record
      const [existingAb] = await conn.query(
        'SELECT id, splitted_budget FROM actual_budget WHERE po_budget_id = ? AND overhead_id = ?',
        [po_budget_id, overhead_type_id]
      );
      let new_splitted = parseFloat(summed_total_cost);
      if (existingAb.length > 0) {
        // Add to existing (accumulate across all projections)
        new_splitted += parseFloat(existingAb[0].splitted_budget || 0);
        await conn.query(
          'UPDATE actual_budget SET splitted_budget = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [new_splitted, existingAb[0].id]
        );
      } else {
        // Insert new
        await conn.query(
          'INSERT INTO actual_budget (overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks, updated_by) VALUES (?, ?, ?, NULL, NULL, NULL, "system")',
          [overhead_type_id, po_budget_id, new_splitted]
        );
      }
    }

    // Step 5: Calculate remaining budget/percentage and insert into projection_remaining
    const totalAllocated = Object.values(summedAllocated).reduce((sum, cost) => sum + parseFloat(cost), 0);
    const remaining_budget = total_budget_value - totalAllocated;
    const remaining_percentage = total_budget_value > 0 ? (remaining_budget / total_budget_value * 100) : 0;

    await conn.query(
      'INSERT INTO projection_remaining (site_id, desc_id, remaining_budget, remaining_percentage, projection_id, created_by) VALUES (?, ?, ?, ?, ?, NULL)',
      [site_id, desc_id, remaining_budget, remaining_percentage, projection_id]
    );

    await conn.commit();

    res.status(200).json({
      success: true,
      message: `Projection ${projection_id} submitted successfully`,
      data: { 
        projection_id, 
        remaining_budget: remaining_budget.toFixed(2), 
        remaining_percentage: remaining_percentage.toFixed(2) 
      }
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error in final projection submission:", error);
    res.status(500).json({ success: false, message: "Failed to submit projection" });
  } finally {
    if (conn) conn.release();
  }
};


// New function: getSavedBudgetsBySiteAndDesc
exports.getSavedBudgetsBySiteAndDesc = async (req, res) => {
  const { site_id, desc_id } = req.query;

  // Validate query parameters
  if (!site_id || !desc_id) {
    return res.status(400).json({
      success: false,
      message: "site_id and desc_id are required query parameters",
    });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Step 1: Compute total_po_value (reuse logic from getPoTotalBudget)
    let [qtyResult] = await conn.query(
      `SELECT pr.po_quantity, COUNT(*) as count 
       FROM po_reckoner pr
       WHERE pr.site_id = ? AND pr.desc_id = ? 
       GROUP BY pr.po_quantity 
       ORDER BY count DESC, pr.po_quantity DESC 
       LIMIT 1`,
      [site_id, desc_id]
    );

    const total_po_qty = qtyResult.length > 0 ? parseFloat(qtyResult[0].po_quantity) || 0 : 0;

    let [rateResult] = await conn.query(
      `SELECT SUM(pr.rate) AS total_rate
       FROM po_reckoner pr
       WHERE pr.site_id = ? AND pr.desc_id = ?`,
      [site_id, desc_id]
    );

    const total_rate = rateResult.length > 0 ? parseFloat(rateResult[0].total_rate) || 0 : 0;
    const total_po_value = total_po_qty * total_rate;

    // Step 2: Fetch budgets ordered by projection_id
    let [budgets] = await conn.query(
      `SELECT id, site_id, desc_id, total_po_value, total_budget_value, projection_id, created_at, updated_at 
       FROM po_budget 
       WHERE site_id = ? AND desc_id = ? ORDER BY projection_id ASC`,
      [site_id, desc_id]
    );

    // Step 3: Compute cumulative percentages
    let cumulativePerc = 0;
    budgets.forEach(budget => {
      const totalPerc = total_po_value > 0 ? (parseFloat(budget.total_budget_value) / total_po_value * 100).toFixed(2) : "0.00";
      const additionalPerc = (parseFloat(totalPerc) - cumulativePerc).toFixed(2);
      budget.total_percentage = totalPerc;
      budget.additional_percentage = parseFloat(additionalPerc);
      cumulativePerc = parseFloat(totalPerc);
    });

    await conn.commit();

    res.status(200).json({
      success: true,
      data: budgets,  // Array of budgets with computed total_percentage and additional_percentage
    });
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("Error fetching saved budgets:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved budgets",
      error: error.message,
    });
  } finally {
    if (conn) conn.release();
  }
};


exports.saveMaterialAllocation = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Material allocation endpoint triggered`);
  const {
    site_id, desc_id, total_cost, materialBudgetPercentage, projection_id
  } = req.body;

  console.log(`[${new Date().toISOString()}] Request Body:`, req.body);

  if (!site_id || !desc_id || !total_cost || !projection_id) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Step 1: Get overhead_type_id for 'material'
    console.log(`[${new Date().toISOString()}] Querying overhead for expense_name: material`);
    const [overheadRows] = await connection.query(
      'SELECT id FROM overhead WHERE expense_name = ? LIMIT 1',
      ['material']
    );
    console.log(`[${new Date().toISOString()}] Overhead query result:`, overheadRows);

    if (overheadRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Invalid overhead type: material not found' });
    }
    const overhead_type_id = overheadRows[0].id;

    // Step 2: Delete existing record for this unique combination
    await connection.query(
      'DELETE FROM projection_allocated WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ? AND projection_id = ?',
      [site_id, desc_id, overhead_type_id, projection_id]
    );

    // Step 3: Insert new record
    await connection.query(
      `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [site_id, desc_id, overhead_type_id, projection_id, total_cost, materialBudgetPercentage || 0]
    );

    await connection.commit();
    return res.json({ success: true, message: 'Material allocation saved successfully' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error(`[${new Date().toISOString()}] Error saving material allocation:`, err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};





// Existing: saveActualBudget (unchanged, used for final allocation to actual_budget table with splitted_budget)
exports.saveActualBudget = async (req, res) => {
  const { po_budget_id, actual_budget_entries } = req.body;

  if (!po_budget_id || !Array.isArray(actual_budget_entries) || actual_budget_entries.length === 0) {
    return res.status(400).json({
      success: false,
      message: "po_budget_id and actual_budget_entries array are required",
    });
  }

  try {
    // Check if already allocated (prevent re-allocation)
    const [existing] = await db.query(
      `SELECT id FROM actual_budget WHERE po_budget_id = ?`,
      [po_budget_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Budget already allocated and cannot be re-allocated",
      });
    }

    // Fetch total_budget_value from po_budget
    const [poBudget] = await db.query(
      `SELECT total_budget_value FROM po_budget WHERE id = ?`,
      [po_budget_id]
    );
    if (!poBudget.length) {
      return res.status(404).json({
        success: false,
        message: "PO budget not found",
      });
    }
    const total_budget_value = parseFloat(poBudget[0].total_budget_value);

    // Validate sum of splitted_budget values (all added overheads)
    const total_splitted = actual_budget_entries.reduce((sum, entry) => {
      return entry.splitted_budget ? sum + parseFloat(entry.splitted_budget) : sum;
    }, 0);
    if (Math.abs(total_splitted - total_budget_value) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Sum of splitted budget values (${total_splitted.toFixed(2)}) must equal total budget value (${total_budget_value.toFixed(2)})`,
      });
    }

    // Insert new entries for all provided (added overheads) - stores splitted_budget as allocated value
    for (const entry of actual_budget_entries) {
      const { overhead_id, splitted_budget, actual_value, remarks } = entry;
      const difference_value = actual_value !== null && splitted_budget !== null
        ? parseFloat(splitted_budget) - parseFloat(actual_value)
        : null;

      await db.query(
        `INSERT INTO actual_budget (overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks, updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks, 'system'] // Assume updated_by = 'system' for allocation
      );
    }

    res.status(200).json({
      success: true,
      message: "Budget allocated successfully for added overheads",
    });
  } catch (error) {
    console.error("Error allocating budget:", error);
    res.status(500).json({
      success: false,
      message: "Failed to allocate budget",
      error: error.message,
    });
  }
};



// Updated: getProjectionAllocated - Include prev_remaining_budget/percentage from previous projection
exports.getProjectionAllocated = async (req, res) => {
  const { site_id, desc_id, projection_id } = req.query;

  if (!site_id || !desc_id || !projection_id) {
    return res.status(400).json({
      success: false,
      message: "site_id, desc_id, and projection_id are required query parameters",
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT pa.id, pa.site_id, pa.desc_id, pa.overhead_type_id, o.expense_name, pa.projection_id, 
              pa.total_cost, pa.budget_percentage, pa.created_at
       FROM projection_allocated pa
       JOIN overhead o ON pa.overhead_type_id = o.id
       WHERE pa.site_id = ? AND pa.desc_id = ? AND pa.projection_id = ?
       ORDER BY o.expense_name ASC`,
      [site_id, desc_id, projection_id]
    );

    // Fetch prev remaining if projection_id > 1
    let prevRemaining = { prev_remaining_budget: 0, prev_remaining_percentage: 0 };
    if (parseInt(projection_id) > 1) {
      const [prevRows] = await db.query(
        `SELECT remaining_budget, remaining_percentage 
         FROM projection_remaining 
         WHERE site_id = ? AND desc_id = ? AND projection_id = ? 
         ORDER BY created_at DESC LIMIT 1`,
        [site_id, desc_id, parseInt(projection_id) - 1]
      );
      if (prevRows.length > 0) {
        prevRemaining = {
          prev_remaining_budget: parseFloat(prevRows[0].remaining_budget) || 0,
          prev_remaining_percentage: parseFloat(prevRows[0].remaining_percentage) || 0
        };
      }
    }

    res.status(200).json({
      success: true,
      data: rows,
      prev_remaining: prevRemaining  // Add prev remaining to response
    });
  } catch (error) {
    console.error("Error fetching projection allocated:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch allocated overheads",
      error: error.message,
    });
  }
};

// Updated: getProjectionRemaining - Include effective budget (total + prev remaining) for calculations
exports.getProjectionRemaining = async (req, res) => {
  const { site_id, desc_id, projection_id } = req.query;

  if (!site_id || !desc_id || !projection_id) {
    return res.status(400).json({
      success: false,
      message: "site_id, desc_id, and projection_id are required",
    });
  }

  try {
    // Fetch po_budget total_budget_value
    const [poRows] = await db.query(
      `SELECT total_budget_value FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
      [site_id, desc_id, projection_id]
    );
    const total_budget_value = poRows.length > 0 ? parseFloat(poRows[0].total_budget_value) || 0 : 0;

    const [rows] = await db.query(
      `SELECT remaining_budget, remaining_percentage, created_at 
       FROM projection_remaining 
       WHERE site_id = ? AND desc_id = ? AND projection_id = ? 
       ORDER BY created_at DESC LIMIT 1`,
      [site_id, desc_id, projection_id]
    );

    let remainingData = { remaining_budget: 0, remaining_percentage: 0 };
    if (rows.length > 0) {
      remainingData = {
        remaining_budget: parseFloat(rows[0].remaining_budget) || 0,
        remaining_percentage: parseFloat(rows[0].remaining_percentage) || 0
      };
    } else {
      // Calculate on-the-fly if not stored (for non-submitted)
      const [allocRows] = await db.query(
        `SELECT SUM(total_cost) AS total_allocated FROM projection_allocated WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
        [site_id, desc_id, projection_id]
      );
      const total_allocated = parseFloat(allocRows[0].total_allocated) || 0;
      remainingData.remaining_budget = total_budget_value - total_allocated;
      remainingData.remaining_percentage = total_budget_value > 0 ? (remainingData.remaining_budget / total_budget_value * 100) : 0;
    }

    // Add effective_budget (total + prev remaining)
    let effective_budget = total_budget_value;
    if (parseInt(projection_id) > 1) {
      const [prevRows] = await db.query(
        `SELECT remaining_budget FROM projection_remaining WHERE site_id = ? AND desc_id = ? AND projection_id = ? ORDER BY created_at DESC LIMIT 1`,
        [site_id, desc_id, parseInt(projection_id) - 1]
      );
      if (prevRows.length > 0) {
        effective_budget += parseFloat(prevRows[0].remaining_budget) || 0;
      }
    }

    res.status(200).json({
      success: true,
      data: { ...remainingData, effective_budget },
    });
  } catch (error) {
    console.error("Error fetching projection remaining:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch remaining budget",
    });
  }
};






// Updated: getSubmissionStatuses - Check actual_budget presence per projection_id via po_budget_id, and projection_status
exports.getSubmissionStatuses = async (req, res) => {
  const { site_id, desc_id } = req.query;

  if (!site_id || !desc_id) {
    return res.status(400).json({
      success: false,
      message: "site_id and desc_id are required",
    });
  }

  try {
    // Fetch all po_budget records for site/desc to get projection_ids
    const [poRows] = await db.query(
      `SELECT id AS po_budget_id, projection_id, projection_status 
       FROM po_budget 
       WHERE site_id = ? AND desc_id = ? ORDER BY projection_id ASC`,
      [site_id, desc_id]
    );

    // Check actual_budget for submission (presence indicates submitted)
    const submittedProjectionIds = new Set();
    const [actualRows] = await db.query(
      `SELECT DISTINCT ab.po_budget_id, pb.projection_id 
       FROM actual_budget ab
       JOIN po_budget pb ON ab.po_budget_id = pb.id
       WHERE pb.site_id = ? AND pb.desc_id = ?`,
      [site_id, desc_id]
    );
    actualRows.forEach(row => submittedProjectionIds.add(row.projection_id));

    // Build statuses: submitted if in actual_budget OR projection_status=1 (but prioritize actual_budget for disable)
    const statuses = poRows.map(row => ({
      projection_id: row.projection_id,
      submitted: submittedProjectionIds.has(row.projection_id) || row.projection_status === 1,
      po_budget_id: row.po_budget_id  // Include for frontend reference
    }));

    res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error fetching submission statuses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission statuses",
    });
  }
};



// New: updateOverhead - For editing labour/dynamic overheads (before submission)
exports.updateOverhead = async (req, res) => {
  const { site_id, desc_id, projection_id, overhead_type_id, total_cost, budget_percentage, overhead_type } = req.body;

  if (!site_id || !desc_id || !projection_id || !overhead_type_id || total_cost === undefined || budget_percentage === undefined) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Check if submitted (actual_budget exists for this po_budget_id)
    const [poBudgetRows] = await db.query(
      'SELECT id FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
      [site_id, desc_id, projection_id]
    );
    if (poBudgetRows.length === 0) {
      return res.status(404).json({ success: false, message: 'PO budget not found' });
    }
    const po_budget_id = poBudgetRows[0].id;

    const [actualRows] = await db.query(
      'SELECT id FROM actual_budget WHERE po_budget_id = ?',
      [po_budget_id]
    );
    if (actualRows.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot edit after submission' });
    }

    // Update projection_allocated
    await db.query(
      'UPDATE projection_allocated SET total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ? AND projection_id = ?',
      [total_cost, budget_percentage, site_id, desc_id, overhead_type_id, projection_id]
    );

    // If labour, also update labour_overhead
    if (overhead_type === 'labours') {
      await db.query(
        'UPDATE labour_overhead SET total_cost = ?, updated_at = CURRENT_TIMESTAMP WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [total_cost, site_id, desc_id, projection_id]
      );
    }

    res.json({ success: true, message: `${overhead_type} updated successfully` });
  } catch (err) {
    console.error('Error updating overhead:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


// New: deleteOverhead - For deleting labour/dynamic overheads (before submission)
exports.deleteOverhead = async (req, res) => {
  const { site_id, desc_id, projection_id, overhead_type_id, overhead_type } = req.body;

  if (!site_id || !desc_id || !projection_id || !overhead_type) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  let conn;
  try {
    conn = await db.getConnection();
    await conn.beginTransaction();

    // Step 1: Get actual overhead_type_id from expense_name (robust against invalid frontend id)
    const [overheadRows] = await conn.query(
      'SELECT id FROM overhead WHERE expense_name = ? LIMIT 1',
      [overhead_type]
    );
    if (overheadRows.length === 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Invalid overhead type' });
    }
    const actual_overhead_type_id = overheadRows[0].id;

    // Step 2: Check if submitted
    const [poBudgetRows] = await conn.query(
      'SELECT id FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
      [site_id, desc_id, parseInt(projection_id)]
    );
    if (poBudgetRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ success: false, message: 'PO budget not found' });
    }
    const po_budget_id = poBudgetRows[0].id;

    const [actualRows] = await conn.query(
      'SELECT id FROM actual_budget WHERE po_budget_id = ?',
      [po_budget_id]
    );
    if (actualRows.length > 0) {
      await conn.rollback();
      return res.status(400).json({ success: false, message: 'Cannot delete after submission' });
    }

    // Step 3: Delete from projection_allocated using actual_overhead_type_id
    await conn.query(
      'DELETE FROM projection_allocated WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ? AND projection_id = ?',
      [site_id, desc_id, actual_overhead_type_id, parseInt(projection_id)]
    );

    // Step 4: If labour, delete from labour_overhead
    if (overhead_type === 'labours') {
      await conn.query(
        'DELETE FROM labour_overhead WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [site_id, desc_id, parseInt(projection_id)]
      );
    }

    await conn.commit();
    res.json({ success: true, message: `${overhead_type} deleted successfully` });
  } catch (err) {
    if (conn) await conn.rollback();
    console.error('Error deleting overhead:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  } finally {
    if (conn) conn.release();
  }
};














// Add this to projectionController.js
exports.getActualMaterial = async (req, res) => {
  const { siteId, descId } = req.params;

  if (!siteId || !descId) {
    return res.status(400).json({
      success: false,
      message: "siteId and descId are required parameters",
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT IFNULL(SUM(mu.overall_qty * ma.rate), 0) AS material_used_actual_value
       FROM material_usage mu
       JOIN material_acknowledgement mak ON mu.material_ack_id = mak.id
       JOIN material_dispatch md ON mak.material_dispatch_id = md.id
       JOIN material_assign ma ON md.material_assign_id = ma.id
       WHERE ma.site_id = ? AND ma.desc_id = ?`,
      [siteId, descId]
    );

    const material_used_actual_value = parseFloat(rows[0].material_used_actual_value) || 0;

    res.status(200).json({
      success: true,
      data: {
        material_used_actual_value: material_used_actual_value.toFixed(2)
      }
    });
  } catch (error) {
    console.error("Error fetching actual material value:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch actual material value",
      error: error.message,
    });
  }
};





// Add this function to projectionController.js (particular module only)
exports.getSubmissionStatuses = async (req, res) => {
  try {
    const { site_id, desc_id } = req.query;
    
    if (!site_id || !desc_id) {
      return res.status(400).json({
        success: false,
        message: 'site_id and desc_id are required',
      });
    }

    // Query to get projection statuses; assumes 'submitted' based on existence of projection_allocated for materials overhead
    // Adjust if you have a direct 'submitted' flag in po_budget
    const [rows] = await db.query(
      `SELECT 
         pb.projection_id, 
         pb.id as po_budget_id,
         CASE 
           WHEN EXISTS (
             SELECT 1 FROM projection_allocated pa 
             WHERE pa.site_id = pb.site_id 
               AND pa.desc_id = pb.desc_id 
               AND pa.projection_id = pb.projection_id
               AND pa.overhead_type_id = (SELECT id FROM overhead WHERE expense_name = 'materials' LIMIT 1)
           ) THEN 1 
           ELSE 0 
         END as submitted
       FROM po_budget pb
       WHERE pb.site_id = ? AND pb.desc_id = ? 
       ORDER BY pb.projection_id`,
      [site_id, desc_id]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching submission statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission statuses',
      error: error.message,
    });
  }
};




// exports.checkFinalSubmissionStatus = async (req, res) => {
//   try {
//     const { site_id, desc_id } = req.query;
    
//     if (!site_id || !desc_id) {
//       return res.status(400).json({
//         success: false,
//         message: 'site_id and desc_id are required',
//       });
//     }

//     // Step 1: Fetch all po_budget records for the site and desc
//     const [poBudgetRows] = await db.query(
//       `SELECT id AS po_budget_id, projection_id 
//        FROM po_budget 
//        WHERE site_id = ? AND desc_id = ? 
//        ORDER BY projection_id ASC`,
//       [site_id, desc_id]
//     );

//     if (poBudgetRows.length === 0) {
//       return res.status(200).json({
//         success: true,
//         data: [],
//       });
//     }

//     // Step 2: Get all po_budget_ids that have entries in actual_budget (existence means submitted)
//     const submittedPoBudgetIds = new Set();
//     const placeholders = poBudgetRows.map(() => '?').join(',');
//     const [actualRows] = await db.query(
//       `SELECT DISTINCT po_budget_id 
//        FROM actual_budget 
//        WHERE po_budget_id IN (${placeholders})`,
//       poBudgetRows.map(row => row.po_budget_id)
//     );
//     actualRows.forEach(row => {
//       submittedPoBudgetIds.add(row.po_budget_id);
//     });

//     // Step 3: Build statuses array - submitted if po_budget_id exists in actual_budget
//     const statuses = poBudgetRows.map(row => ({
//       projection_id: row.projection_id,
//       submitted: submittedPoBudgetIds.has(row.po_budget_id),  // true if submitted (has actual_budget entries)
//       po_budget_id: row.po_budget_id
//     }));

//     res.status(200).json({
//       success: true,
//       data: statuses,  // Array of { projection_id, submitted (boolean), po_budget_id }
//     });
//   } catch (error) {
//     console.error('Error checking final submission statuses:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to check final submission statuses',
//       error: error.message,
//     });
//   }
// };




exports.checkFinalSubmissionStatus = async (req, res) => {
  try {
    const { site_id, desc_id } = req.query;
    
    if (!site_id || !desc_id) {
      return res.status(400).json({
        success: false,
        message: 'site_id and desc_id are required',
      });
    }

    // Step 1: Fetch all po_budget records for the site and desc
    const [poBudgetRows] = await db.query(
      `SELECT id AS po_budget_id, projection_id 
       FROM po_budget 
       WHERE site_id = ? AND desc_id = ? 
       ORDER BY projection_id ASC`,
      [site_id, desc_id]
    );

    if (poBudgetRows.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Step 2: Get all po_budget_ids that have entries in actual_budget (existence means submitted)
    const submittedPoBudgetIds = new Set();
    const placeholders = poBudgetRows.map(() => '?').join(',');
    const [actualRows] = await db.query(
      `SELECT DISTINCT po_budget_id 
       FROM actual_budget 
       WHERE po_budget_id IN (${placeholders})`,
      poBudgetRows.map(row => row.po_budget_id)
    );
    actualRows.forEach(row => {
      submittedPoBudgetIds.add(row.po_budget_id);
    });

    // Step 3: Build statuses array - submitted if po_budget_id exists in actual_budget
    const statuses = poBudgetRows.map(row => ({
      projection_id: row.projection_id,
      submitted: submittedPoBudgetIds.has(row.po_budget_id),  // true if submitted (has actual_budget entries)
      po_budget_id: row.po_budget_id
    }));

    // Step 4: New logic - If the latest projection (last in array) is submitted true, set all previous to true in response only
    if (statuses.length > 0 && statuses[statuses.length - 1].submitted === true) {
      statuses.forEach(status => {
        status.submitted = true;
      });
    }

    res.status(200).json({
      success: true,
      data: statuses,  // Array with adjusted submitted flags for response only
    });
  } catch (error) {
    console.error('Error checking final submission statuses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check final submission statuses',
      error: error.message,
    });
  }
};