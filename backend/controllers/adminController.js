const db = require("../config/db");
const bcrypt = require("bcrypt");

// Fetch companies
exports.getCompanies = async (req, res) => {
  try {
    const [companies] = await db.query("SELECT company_id, company_name FROM company");
    res.status(200).json({ success: true, data: companies });
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ success: false, message: "Failed to fetch companies" });
  }
};

// Fetch projects by company ID
exports.getProjectsByCompany = async (req, res) => {
  const { companyId } = req.params;
  try {
    const [projects] = await db.query(
      "SELECT pd_id, project_name FROM project_details WHERE company_id = ?",
      [companyId]
    );
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

// Fetch sites by project ID
exports.getSitesByProject = async (req, res) => {
  const { projectId } = req.params;
  try {
    const [sites] = await db.query(
      "SELECT sd.site_id, sd.site_name, sd.po_number, sd.start_date, l.location_name " +
      "FROM site_details sd " +
      "LEFT JOIN location l ON sd.location_id = l.location_id " +
      "WHERE sd.pd_id = ?",
      [projectId]
    );
    res.status(200).json({ success: true, data: sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    res.status(500).json({ success: false, message: "Failed to fetch sites" });
  }
};

exports.getWorkDescriptions = async (req, res) => {
  const { siteId } = req.params;
  try {
    const [descriptions] = await db.query(
      `SELECT DISTINCT wd.desc_id, wd.desc_name
       FROM po_reckoner pr
       JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
       WHERE pr.site_id = ?`,
      [siteId]
    );
    res.status(200).json({ success: true, data: descriptions });
  } catch (error) {
    console.error("Error fetching work descriptions:", error);
    res.status(500).json({ success: false, message: "Failed to fetch work descriptions" });
  }
};


exports.getCompletionEntriesBySite = async (req, res) => {
  const { siteId, descId } = req.params;
  const { start_date, end_date } = req.query;

  try {
    if (start_date && !/^\d{4}-\d{2}-\d{2}$/.test(start_date)) {
      return res.status(400).json({
        status: "error",
        message: "start_date must be in YYYY-MM-DD format",
      });
    }
    if (end_date && !/^\d{4}-\d{2}-\d{2}$/.test(end_date)) {
      return res.status(400).json({
        status: "error",
        message: "end_date must be in YYYY-MM-DD format",
      });
    }
    if (start_date && end_date && start_date > end_date) {
      return res.status(400).json({
        status: "error",
        message: "start_date cannot be later than end_date",
      });
    }

    let query = `
      SELECT 
        ic.category_id,
        ic.category_name,
        isc.subcategory_name,
        isc.billing,
        DATE_FORMAT(ceh.entry_date, '%Y-%m-%d') as entry_date,
        ceh.entry_id,
        ceh.area_added,
        ceh.rate,
        ceh.value_added,
        ceh.created_by,
        pr.desc_id,
        DATE_FORMAT(CONVERT_TZ(ceh.created_at, '+00:00', '+05:30'), '%Y-%m-%d') as created_date,
        DATE_FORMAT(CONVERT_TZ(ceh.created_at, '+00:00', '+05:30'), '%H:%i:%s') as created_time
      FROM completion_entries_history ceh
      JOIN po_reckoner pr ON ceh.rec_id = pr.rec_id
      JOIN item_category ic ON pr.category_id = ic.category_id
      JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
      WHERE pr.site_id = ? AND pr.desc_id = ?
    `;
    const queryParams = [siteId, descId];

    if (start_date) {
      query += ' AND ceh.entry_date >= ?';
      queryParams.push(start_date);
    }
    if (end_date) {
      query += ' AND ceh.entry_date <= ?';
      queryParams.push(end_date);
    }

    query += ' ORDER BY ic.category_id, isc.subcategory_name, ceh.entry_date, ceh.created_at';

    const [rows] = await db.query(query, queryParams);

    let billing_area = 0;
    let billing_rate = 0;
    let billing_value = 0;

    const categoryMap = new Map();
    rows.forEach(row => {
      const { category_id, category_name, subcategory_name, billing, entry_date, desc_id, created_date, created_time, ...entry } = row;

      let category = categoryMap.get(category_id);
      if (!category) {
        category = { category_id, category_name, subcategories: new Map() };
        categoryMap.set(category_id, category);
      }

      let subcategory = category.subcategories.get(subcategory_name);
      if (!subcategory) {
        subcategory = { subcategory_name, billing, entries_by_date: new Map() };
        category.subcategories.set(subcategory_name, subcategory);
      }

      let dateEntry = subcategory.entries_by_date.get(entry_date);
      if (!dateEntry) {
        dateEntry = { entry_date, entries: [] };
        subcategory.entries_by_date.set(entry_date, dateEntry);
      }

      const entryData = {
        entry_id: row.entry_id,
        area_added: parseFloat(row.area_added) || 0,
        rate: parseFloat(row.rate) || 0,
        value_added: parseFloat(row.value_added) || 0,
        created_by: row.created_by,
        desc_id,
        created_date,
        created_time
      };

      dateEntry.entries.push(entryData);

      // Calculate billing totals for subcategories with billing = 1
      if (billing === 1) {
        billing_area += entryData.area_added;
        billing_rate += entryData.rate;
        billing_value += entryData.value_added;
      }
    });

    const groupedData = Array.from(categoryMap.values()).map(category => ({
      category_id: category.category_id,
      category_name: category.category_name,
      subcategories: Array.from(category.subcategories.values()).map(subcategory => ({
        subcategory_name: subcategory.subcategory_name,
        billing: subcategory.billing,
        entries_by_date: Array.from(subcategory.entries_by_date.values())
      }))
    }));

    res.status(200).json({
      status: "success",
      data: groupedData,
      billing_area: parseFloat(billing_area.toFixed(2)),
      billing_rate: parseFloat(billing_rate.toFixed(2)),
      billing_value: parseFloat(billing_value.toFixed(2))
    });
  } catch (error) {
    console.error("Error fetching completion entries:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch completion entries",
      error: error.message,
    });
  }
};

exports.getReckonerDailyCostDetails = async (req, res) => {
  const { project_id, site_id, desc_id, rec_id } = req.query;
  if (!project_id || !site_id || !desc_id || !rec_id || !/^\d+$/.test(String(rec_id))) {
    return res.status(400).json({
      status: "error",
      message: "project_id, site_id, desc_id, and a valid rec_id are required",
    });
  }

  try {
    const [reckonerRows] = await db.query(
      `SELECT pr.rec_id
       FROM po_reckoner pr
       JOIN site_details sd ON sd.site_id = pr.site_id
       WHERE pr.rec_id = ? AND pr.site_id = ? AND pr.desc_id = ? AND sd.pd_id = ?`,
      [rec_id, site_id, desc_id, project_id]
    );
    if (!reckonerRows.length) {
      return res.status(404).json({
        status: "error",
        message: "Work item was not found for the selected project, site, and description",
      });
    }

    const [completionRows, materialRows, labourRows] = await Promise.all([
      db.query(
        `SELECT
           DATE_FORMAT(entry_date, '%Y-%m-%d') AS entry_date,
           entry_id,
           area_added,
           rate,
           value_added,
           remarks
         FROM completion_entries_history
         WHERE rec_id = ?
         ORDER BY entry_date DESC, created_at DESC`,
        [rec_id]
      ),
      db.query(
        `SELECT
           DATE_FORMAT(muh.entry_date, '%Y-%m-%d') AS entry_date,
           muh.entry_id,
           mm.item_id,
           mm.item_name,
           um.uom_name,
           muh.overall_qty,
           ma.rate AS unit_rate,
           ROUND(COALESCE(muh.overall_qty, 0) * COALESCE(ma.rate, 0), 2) AS material_value,
           muh.remarks
         FROM material_usage_history muh
         JOIN material_acknowledgement mack ON mack.id = muh.material_ack_id
         JOIN material_dispatch md ON md.id = mack.material_dispatch_id
         JOIN material_assign ma ON ma.id = md.material_assign_id
         JOIN material_master mm ON mm.item_id = ma.item_id
         LEFT JOIN uom_master um ON um.uom_id = ma.uom_id
         WHERE ma.pd_id = ? AND ma.site_id = ? AND ma.desc_id = ?
         ORDER BY muh.entry_date DESC, muh.created_at DESC`,
        [project_id, site_id, desc_id]
      ),
      db.query(
        `SELECT
           DATE_FORMAT(lat.entry_date, '%Y-%m-%d') AS entry_date,
           lat.id AS attendance_id,
           la.id AS assignment_id,
           l.id AS labour_id,
           l.full_name,
           lat.shift,
           COALESCE(NULLIF(la.salary, 0), l.approved_salary, 0) AS shift_rate,
           ROUND(COALESCE(lat.shift, 0) * COALESCE(NULLIF(la.salary, 0), l.approved_salary, 0), 2) AS labour_cost,
           lat.remarks
         FROM labour_attendance lat
         JOIN labour_assignment la ON la.id = lat.labour_assignment_id
         JOIN labour l ON l.id = la.labour_id
         WHERE la.project_id = ? AND la.site_id = ? AND la.desc_id = ?
         ORDER BY lat.entry_date DESC, l.full_name`,
        [project_id, site_id, desc_id]
      ),
    ]);

    const dailyMap = new Map();
    const getDay = (date) => {
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { entry_date: date, completions: [], materials: [], labour: [] });
      }
      return dailyMap.get(date);
    };

    for (const row of completionRows[0]) {
      getDay(row.entry_date).completions.push({
        entry_id: row.entry_id,
        area_added: Number(row.area_added) || 0,
        rate: Number(row.rate) || 0,
        value_added: Number(row.value_added) || 0,
        remarks: row.remarks,
      });
    }
    for (const row of materialRows[0]) {
      getDay(row.entry_date).materials.push({
        entry_id: row.entry_id,
        item_id: row.item_id,
        item_name: row.item_name,
        uom_name: row.uom_name,
        quantity: Number(row.overall_qty) || 0,
        unit_rate: Number(row.unit_rate) || 0,
        material_value: Number(row.material_value) || 0,
        remarks: row.remarks,
      });
    }
    for (const row of labourRows[0]) {
      getDay(row.entry_date).labour.push({
        attendance_id: row.attendance_id,
        assignment_id: row.assignment_id,
        labour_id: row.labour_id,
        full_name: row.full_name,
        shifts: Number(row.shift) || 0,
        shift_rate: Number(row.shift_rate) || 0,
        labour_cost: Number(row.labour_cost) || 0,
        remarks: row.remarks,
      });
    }

    const daily = Array.from(dailyMap.values())
      .map((day) => ({
        ...day,
        completion_value: Number(day.completions.reduce((sum, entry) => sum + entry.value_added, 0).toFixed(2)),
        material_value: Number(day.materials.reduce((sum, entry) => sum + entry.material_value, 0).toFixed(2)),
        labour_cost: Number(day.labour.reduce((sum, entry) => sum + entry.labour_cost, 0).toFixed(2)),
      }))
      .sort((left, right) => right.entry_date.localeCompare(left.entry_date));

    return res.status(200).json({ status: "success", data: daily });
  } catch (error) {
    console.error("Error fetching daily completion and cost details:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch daily work, material, and labour costs",
    });
  }
};







exports.getPoReckonerTotals = async (req, res) => {
  const { siteId, descId } = req.params;
  try {
    // Fetch overall totals
    const [totals] = await db.query(
      `SELECT 
        MAX(po_quantity) AS total_po_quantity, 
        AVG(rate) AS total_rate,
        SUM(value) AS total_value
       FROM po_reckoner 
       WHERE site_id = ? AND desc_id = ?`,
      [siteId, descId]
    );

    if (totals.length === 0 || totals[0].total_po_quantity === null) {
      return res.status(200).json({
        success: true,
        data: { total_po_quantity: 0, total_rate: 0, total_value: 0, subcategory_totals: [] }
      });
    }

    const total_po_quantity = parseFloat(totals[0].total_po_quantity) || 0;
    const total_rate = parseFloat(totals[0].total_rate) || 0;
    const total_value = parseFloat(totals[0].total_value) || 0;

    // Fetch category, subcategory, and work description details
    const [records] = await db.query(
      `SELECT 
        ic.category_id,
        ic.category_name,
        isc.subcategory_name,
        pr.po_quantity,
        pr.rate,
        pr.value,
        pr.desc_id,
        wd.desc_name
       FROM po_reckoner pr
       JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
       JOIN item_category ic ON pr.category_id = ic.category_id
       LEFT JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
       WHERE pr.site_id = ? AND pr.desc_id = ?`,
      [siteId, descId]
    );

    // Group records by category, work description, and subcategory
    const categoryMap = new Map();
    records.forEach(record => {
      const { category_id, category_name, subcategory_name, po_quantity, rate, value, desc_id, desc_name } = record;
      if (!categoryMap.has(category_id)) {
        categoryMap.set(category_id, {
          category_id,
          category_name,
          descriptions: new Map()
        });
      }
      const category = categoryMap.get(category_id);
      if (!category.descriptions.has(desc_id)) {
        category.descriptions.set(desc_id, {
          desc_id,
          desc_name,
          subcategories: []
        });
      }
      category.descriptions.get(desc_id).subcategories.push({
        subcategory_name,
        po_quantity: parseFloat(po_quantity) || 0,
        rate: parseFloat(rate) || 0,
        value: parseFloat(value) || 0
      });
    });

    // Convert Map to array for response
    const subcategoryTotals = Array.from(categoryMap.values()).map(category => ({
      category_id: category.category_id,
      category_name: category.category_name,
      descriptions: Array.from(category.descriptions.values())
    }));

    // Prepare the response
    const responseData = {
      total_po_quantity,
      total_rate,
      total_value,
      subcategory_totals: subcategoryTotals
    };

    res.status(200).json({ success: true, data: responseData });
  } catch (error) {
    console.error("Error fetching po_reckoner totals:", error);
    res.status(500).json({ success: false, message: "Failed to fetch po_reckoner totals" });
  }
};

exports.getExpenseDetailsBySite = async (req, res) => {
  const { siteId, descId } = req.params;

  try {
    // Fetch total allocated amount from petty_cash
    let pettyCashQuery = `
      SELECT 
        SUM(amount) AS total_allocated
      FROM petty_cash
      WHERE site_id = ? AND desc_id = ?
    `;
    const pettyCashParams = [siteId, descId];

    const [pettyCashTotals] = await db.query(pettyCashQuery, pettyCashParams);
    const total_allocated = parseFloat(pettyCashTotals[0].total_allocated) || 0;

    // Fetch total spent amount from siteincharge_exp_entry
    let totalSpentQuery = `
      SELECT 
        SUM(siee.amount) AS total_spent
      FROM siteincharge_exp_entry siee
      JOIN petty_cash pc ON siee.petty_cash_id = pc.id
      WHERE pc.site_id = ? AND pc.desc_id = ?
    `;
    const totalSpentParams = [siteId, descId];

    const [totalSpentResult] = await db.query(totalSpentQuery, totalSpentParams);
    const total_spent = parseFloat(totalSpentResult[0].total_spent) || 0;

    // Fetch expenses grouped by work description
    let expensesByDescQuery = `
      SELECT 
        d.desc_name,
        SUM(siee.amount) AS total_expense,
        pc.desc_id
      FROM siteincharge_exp_entry siee
      JOIN petty_cash pc ON siee.petty_cash_id = pc.id
      JOIN work_descriptions d ON pc.desc_id = d.desc_id
      WHERE pc.site_id = ? AND pc.desc_id = ?
      GROUP BY d.desc_name, pc.desc_id
      ORDER BY d.desc_name
    `;
    const expensesByDescParams = [siteId, descId];

    const [expensesByDesc] = await db.query(expensesByDescQuery, expensesByDescParams);

    // Fetch expenses grouped by expense category
    let expensesByCategoryQuery = `
      SELECT 
        ec.exp_category AS expense_category_name,
        SUM(siee.amount) AS total_expense
      FROM siteincharge_exp_entry siee
      JOIN petty_cash pc ON siee.petty_cash_id = pc.id
      JOIN expense_category ec ON siee.expense_category_id = ec.id
      WHERE pc.site_id = ? AND pc.desc_id = ?
      GROUP BY ec.exp_category
      ORDER BY ec.exp_category
    `;
    const expensesByCategoryParams = [siteId, descId];

    const [expensesByCategory] = await db.query(expensesByCategoryQuery, expensesByCategoryParams);

    // Fetch date-wise expenses for line chart
    let expensesByDateQuery = `
      SELECT 
        DATE_FORMAT(siee.amount_created_at, '%Y-%m-%d') AS expense_date,
        SUM(siee.amount) AS total_expense
      FROM siteincharge_exp_entry siee
      JOIN petty_cash pc ON siee.petty_cash_id = pc.id
      WHERE pc.site_id = ? AND pc.desc_id = ?
      GROUP BY DATE_FORMAT(siee.amount_created_at, '%Y-%m-%d')
      ORDER BY expense_date
    `;
    const expensesByDateParams = [siteId, descId];

    const [expensesByDate] = await db.query(expensesByDateQuery, expensesByDateParams);

    res.status(200).json({
      success: true,
      data: {
        total_allocated,
        total_spent,
        expenses_by_work_description: expensesByDesc.map(record => ({
          desc_id: record.desc_id,
          desc_name: record.desc_name || "Unknown Description",
          total_expense: parseFloat(record.total_expense) || 0
        })),
        expenses_by_category: expensesByCategory.map(record => ({
          expense_category_name: record.expense_category_name || "Unknown Category",
          total_expense: parseFloat(record.total_expense) || 0
        })),
        expenses_by_date: expensesByDate.map(record => ({
          expense_date: record.expense_date,
          total_expense: parseFloat(record.total_expense) || 0
        }))
      }
    });
  } catch (error) {
    console.error("Error fetching expense details:", error);
    res.status(500).json({ success: false, message: "Failed to fetch expense details" });
  }
};

exports.getWorkDescriptionsBySite = async (req, res) => {
  const { siteId } = req.params;
  try {
    const [descriptions] = await db.query(
      `SELECT DISTINCT wd.desc_id, wd.desc_name
       FROM po_reckoner pr
       JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
       WHERE pr.site_id = ?`,
      [siteId]
    );
    res.status(200).json({ success: true, data: descriptions });
  } catch (error) {
    console.error("Error fetching work descriptions by site:", error);
    res.status(500).json({ success: false, message: "Failed to fetch work descriptions by site" });
  }
};

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

  try {
    // Check if a record already exists for the site_id, desc_id, and projection_id
    const [existing] = await db.query(
      `SELECT id, projection_id FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
      [site_id, desc_id, parsedProjectionId]
    );

    if (existing.length > 0) {
      // Update existing record (projection_id remains unchanged)
      await db.query(
        `UPDATE po_budget 
         SET total_po_value = ?, total_budget_value = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
        [total_po_value, total_budget_value, site_id, desc_id, parsedProjectionId]
      );
      return res.status(200).json({
        success: true,
        message: "Budget updated successfully (projection_id unchanged)",
        data: { projection_id: parsedProjectionId },
      });
    } else {
      // Insert new record with the provided projection_id
      await db.query(
        `INSERT INTO po_budget (site_id, desc_id, total_po_value, total_budget_value, projection_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [site_id, desc_id, total_po_value, total_budget_value, parsedProjectionId]
      );
      return res.status(201).json({
        success: true,
        message: "Budget saved successfully",
        data: { projection_id: parsedProjectionId },
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
    let query = `
      SELECT DISTINCT o.id, o.expense_name, o.is_default
      FROM overhead o
    `;
    let params = [];

    if (po_budget_id) {
      query = `
        SELECT DISTINCT o.id, o.expense_name, o.is_default
        FROM overhead o
        LEFT JOIN actual_budget ab ON o.id = ab.overhead_id AND ab.po_budget_id = ?
      `;
      params = [po_budget_id];
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

exports.saveOverheadValue = async (req, res) => {
  const { site_id, desc_id, value, overhead_type } = req.body;

  if (!site_id || !desc_id || !value || !overhead_type) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Find or create the po_budget entry
    let [poBudget] = await db.query(
      `SELECT id FROM po_budget WHERE site_id = ? AND desc_id = ?`,
      [site_id, desc_id]
    );

    if (!poBudget.length) {
      return res.status(400).json({
        success: false,
        message: "No budget found for the selected site and work description",
      });
    }

    const po_budget_id = poBudget[0].id;

    // Find the overhead ID based on the overhead_type
    const [overhead] = await db.query(
      `SELECT id FROM overhead WHERE expense_name = ?`,
      [overhead_type]
    );

    if (!overhead.length) {
      return res.status(400).json({
        success: false,
        message: `Overhead type '${overhead_type}' not found`,
      });
    }

    const overhead_id = overhead[0].id;

    // Save or update the overhead value in actual_budget
    await db.query(
      `INSERT INTO actual_budget (po_budget_id, overhead_id, splitted_budget)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE splitted_budget = ?`,
      [po_budget_id, overhead_id, value, value]
    );

    res.status(200).json({
      success: true,
      message: `${overhead_type} overhead saved successfully`,
    });
  } catch (error) {
    console.error(`Error saving ${overhead_type} overhead:`, error);
    res.status(500).json({
      success: false,
      message: `Failed to save ${overhead_type} overhead`,
      error: error.message,
    });
  }
};

exports.saveDynamicOverheadValues = async (req, res) => {
  const { site_id, desc_id, value, percentage, overhead_type } = req.body;

  // Enhanced validation
  if (!site_id || !desc_id || value === undefined || percentage === undefined || !overhead_type) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (isNaN(value) || isNaN(percentage)) {
    return res.status(400).json({
      success: false,
      message: "Value and percentage must be valid numbers",
    });
  }

  let conn;
  try {
    // Get a connection from the pool
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

    // Step 2: Find last projection_id and calculate next
    const [projectionRows] = await conn.query(
      "SELECT MAX(projection_id) AS lastProjectionId FROM projection_allocated WHERE site_id = ? AND desc_id = ? AND overhead_type_id = ?",
      [site_id, desc_id, overhead_type_id]
    );
    const nextProjectionId = (projectionRows[0]?.lastProjectionId || 0) + 1;

    // Step 3: Insert the new record
    await conn.query(
      "INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage) VALUES (?, ?, ?, ?, ?, ?)",
      [site_id, desc_id, overhead_type_id, nextProjectionId, parseFloat(value), parseFloat(percentage)]
    );

    // Commit transaction
    await conn.commit();

    // Success response
    return res.status(200).json({
      success: true,
      message: `${overhead_type} overhead saved successfully!`,
    });
  } catch (error) {
    // Rollback on error
    if (conn) await conn.rollback().catch(rollbackErr => console.error('Rollback failed:', rollbackErr));
    
    console.error('Error saving dynamic overhead:', error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while saving the overhead value. Please try again.",
    });
  } finally {
    // Always release the connection
    if (conn) conn.release();
  }
};

// Save or update actual budget entries (updated to allocate only once, no updates)
exports.saveActualBudget = async (req, res) => {
  const { po_budget_id, actual_budget_entries } = req.body;

  if (!po_budget_id || !Array.isArray(actual_budget_entries) || actual_budget_entries.length === 0) {
    return res.status(400).json({
      success: false,
      message: "po_budget_id and actual_budget_entries array are required",
    });
  }

  try {
    // Check if already allocated
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

    // Validate sum of splitted_budget values
    const total_splitted = actual_budget_entries.reduce((sum, entry) => {
      return entry.splitted_budget ? sum + parseFloat(entry.splitted_budget) : sum;
    }, 0);
    if (Math.abs(total_splitted - total_budget_value) > 0.01) {
      return res.status(400).json({
        success: false,
        message: `Sum of splitted budget values (${total_splitted.toFixed(2)}) must equal total budget value (${total_budget_value.toFixed(2)})`,
      });
    }

    // Insert new entries (no update)
    for (const entry of actual_budget_entries) {
      const { overhead_id, splitted_budget, actual_value, remarks } = entry;
      const difference_value = actual_value !== null && splitted_budget !== null
        ? parseFloat(splitted_budget) - parseFloat(actual_value)
        : null;

      await db.query(
        `INSERT INTO actual_budget (overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks]
      );
    }

    res.status(200).json({
      success: true,
      message: "Budget allocated successfully",
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

  try {
    const [rows] = await db.query(
      `SELECT ab.overhead_id, o.expense_name, ab.splitted_budget, ab.actual_value, ab.difference_value, ab.remarks, pb.site_id, pb.desc_id
       FROM actual_budget ab
       JOIN po_budget pb ON ab.po_budget_id = pb.id
       JOIN overhead o ON ab.overhead_id = o.id
       WHERE ab.po_budget_id = ?`,
      [po_budget_id]
    );
    
    const entries = {};
    rows.forEach((row) => {
      entries[row.overhead_id] = {
        expense_name: row.expense_name || "Unknown Expense",
        splitted_budget: row.splitted_budget !== null ? parseFloat(row.splitted_budget).toFixed(2) : null,
        actual_value: row.actual_value !== null ? parseFloat(row.actual_value).toFixed(2) : null,
        difference_value: row.difference_value !== null ? parseFloat(row.difference_value).toFixed(2) : null,
        remarks: row.remarks || "",
        site_id: row.site_id,
        desc_id: row.desc_id,
      };
    });

    res.status(200).json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching actual budget entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch actual budget entries",
      error: error.message,
    });
  }
};

exports.getActualBudget = async (req, res) => {
  const { po_budget_id } = req.params;

  try {
    const [entries] = await db.query(
      `SELECT overhead_id, po_budget_id, splitted_budget, actual_value, difference_value, remarks
       FROM actual_budget
       WHERE po_budget_id = ?`,
      [po_budget_id]
    );

    const formattedEntries = {};
    entries.forEach(entry => {
      formattedEntries[entry.overhead_id] = {
        overhead_id: entry.overhead_id,
        po_budget_id: entry.po_budget_id,
        splitted_budget: entry.splitted_budget ? parseFloat(entry.splitted_budget).toFixed(2) : null,
        actual_value: entry.actual_value ? parseFloat(entry.actual_value).toFixed(2) : null,
        difference_value: entry.difference_value ? parseFloat(entry.difference_value).toFixed(2) : null,
        remarks: entry.remarks || null,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedEntries,
    });
  } catch (error) {
    console.error("Error fetching actual budget entries:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch actual budget entries",
      error: error.message,
    });
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

// Fetch contractors
exports.getContractors = async (req, res) => {
  try {
    const [contractors] = await db.query("SELECT id, contractor_name FROM contractor");
    res.status(200).json({ success: true, data: contractors });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contractors" });
  }
};

exports.getSiteEngineers = async (req, res) => {
  try {
    const [siteEngineers] = await db.query(
      `SELECT em.emp_id, em.full_name
       FROM employee_master em
       JOIN emp_designation ed ON ed.id = em.designation_id
       WHERE LOWER(TRIM(ed.designation)) = 'site engineer'
       ORDER BY em.full_name`
    );
    res.status(200).json({ success: true, data: siteEngineers });
  } catch (error) {
    console.error("Error fetching site engineers:", error);
    res.status(500).json({ success: false, message: "Failed to fetch site engineers" });
  }
};

// Save labour data
// exports.addLabour = async (req, res) => {
//   const {
//     full_name, date_of_birth, date_of_joining, company, branch, mobile, company_email,
//     current_address, permanent_address, gender_id, dept_id, emp_type_id, designation_id,
//     status_id, esic_number, pf_number, contractor_id, approved_salary
//   } = req.body;

//   // Validate required fields
//   if (!full_name || !date_of_birth || !date_of_joining || !company || !branch || !mobile ||
//       !company_email || !current_address || !permanent_address || !gender_id || !dept_id ||
//       !emp_type_id || !designation_id || !status_id) {
//     return res.status(400).json({
//       success: false,
//       message: "Missing required fields"
//     });
//   }

//   try {
//     // Insert into labour table
//     const [result] = await db.query(
//       `INSERT INTO labour (
//         full_name, date_of_birth, date_of_joining, company, branch, mobile, company_email,
//         current_address, permanent_address, gender_id, dept_id, emp_type_id, designation_id,
//         status_id, esic_number, pf_number, contractor_id, approved_salary, created_at
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
//       [
//         full_name, date_of_birth, date_of_joining, company, branch, mobile, company_email,
//         current_address, permanent_address, gender_id, dept_id, emp_type_id, designation_id,
//         status_id, esic_number || null, pf_number || null, contractor_id || null,
//         approved_salary || null
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Labour added successfully",
//       data: { id: result.insertId, ...req.body }
//     });
//   } catch (error) {
//     console.error("Error adding labour:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to add labour",
//       error: error.message
//     });
//   }
// };


exports.addLabour = async (req, res) => {
  const {
    full_name, date_of_birth, date_of_joining, mobile, company_email,
    current_address, permanent_address, gender_id, emp_type_id, designation_id,
    status_id, esic_number, pf_number, site_engineer_emp_id, aadhaar_number,
    approved_salary, created_by
  } = req.body;
  const company = "Sathya Coatings";

  // Validate required fields
  if (!full_name || !date_of_birth || !date_of_joining || !mobile ||
      !company_email || !current_address || !permanent_address || !gender_id ||
      !emp_type_id || !designation_id || !status_id || !site_engineer_emp_id ||
      !aadhaar_number || !approved_salary || !created_by) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  if (!/^\d{12}$/.test(String(aadhaar_number))) {
    return res.status(400).json({
      success: false,
      message: "Aadhaar number must contain exactly 12 digits"
    });
  }

  const salaryValue = Number(approved_salary);
  if (!Number.isFinite(salaryValue) || salaryValue <= 0 || !/^\d+(\.\d{1,2})?$/.test(String(approved_salary))) {
    return res.status(400).json({
      success: false,
      message: "Approved salary per shift must be a positive number with up to 2 decimal places"
    });
  }

  // Additional validations (similar to addEmployee)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date_of_birth) || !dateRegex.test(date_of_joining)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid date format: date_of_birth and date_of_joining must be in YYYY-MM-DD format',
    });
  }

  const mobileRegex = /^(?:\+91)?\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid mobile number: must be 10 digits, with optional +91 prefix',
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(company_email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  // Validate created_by
  if (typeof created_by !== 'string' || created_by.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "Created By is required and must be a non-empty string",
    });
  }

  // Verify if created_by exists in the users table
  const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
  if (!userExists.length) {
    return res.status(400).json({
      success: false,
      message: "Invalid Created By: User does not exist",
    });
  }

  const [siteEngineer] = await db.query(
    `SELECT em.emp_id
     FROM employee_master em
     JOIN emp_designation ed ON ed.id = em.designation_id
     WHERE em.emp_id = ? AND LOWER(TRIM(ed.designation)) = 'site engineer'`,
    [site_engineer_emp_id]
  );
  if (!siteEngineer.length) {
    return res.status(400).json({
      success: false,
      message: "Selected employee is not a valid Site Engineer"
    });
  }

  // Validate foreign keys (add similar checks as in addEmployee if needed)
  // Assuming similar foreign key validations for gender_id, dept_id, etc.

  try {
    // Insert into labour table
    const [result] = await db.query(
      `INSERT INTO labour (
        full_name, date_of_birth, date_of_joining, company, branch, mobile, company_email,
        current_address, permanent_address, gender_id, dept_id, emp_type_id, designation_id,
        status_id, esic_number, pf_number, contractor_id, approved_salary, created_by, created_at,
        site_engineer_emp_id, aadhaar_number
      ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, NOW(), ?, ?)`,
      [
        full_name, date_of_birth, date_of_joining, company, mobile, company_email,
        current_address, permanent_address, gender_id, emp_type_id, designation_id,
        status_id, esic_number || null, pf_number || null, salaryValue, created_by,
        site_engineer_emp_id, aadhaar_number
      ]
    );

    res.status(201).json({
      success: true,
      message: "Labour added successfully",
      data: {
        id: result.insertId,
        ...req.body,
        company,
        branch: null,
        dept_id: null,
        contractor_id: null,
        approved_salary: salaryValue
      }
    });
  } catch (error) {
    console.error("Error adding labour:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry (e.g., email already exists)',
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Invalid foreign key reference',
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add labour",
      error: error.message
    });
  }
};

exports.importLabours = async (req, res) => {
  const { labours, created_by } = req.body;
  const company = "Sathya Coatings";

  if (!Array.isArray(labours) || labours.length === 0 || labours.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Upload must contain between 1 and 500 labour rows",
    });
  }

  if (typeof created_by !== "string" || !created_by.trim()) {
    return res.status(400).json({
      success: false,
      message: "Created By is required",
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [userExists] = await connection.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [created_by]
    );
    if (!userExists.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Invalid Created By: User does not exist",
      });
    }

    const [[genders], [employmentTypes], [designations], [statuses]] = await Promise.all([
      connection.query("SELECT id, gender AS name FROM emp_gender"),
      connection.query("SELECT id, type AS name FROM employment_type"),
      connection.query("SELECT id, designation AS name FROM emp_designation"),
      connection.query("SELECT id, status AS name FROM emp_status"),
    ]);

    const makeLookup = (rows) => new Map(
      rows.map((row) => [row.name.trim().toLowerCase(), row.id])
    );
    const lookupMaps = {
      gender: makeLookup(genders),
      employment_type: makeLookup(employmentTypes),
      designation: makeLookup(designations),
      status: makeLookup(statuses),
    };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^(?:\+91)?\d{10}$/;
    const aadhaarRegex = /^\d{12}$/;
    const esicRegex = /^\d{17}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const rowErrors = [];
    const normalizedLabours = [];
    const uploadedEmails = new Set();
    const uploadedAadhaars = new Set();

    const text = (value) => value === null || value === undefined ? "" : String(value).trim();
    const parseSalary = (value) => {
      const salaryText = text(value);
      if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(salaryText)) return null;
      const salary = Number(salaryText.replace(/,/g, ""));
      return Number.isFinite(salary) && salary > 0 ? salary : null;
    };
    const isRealDate = (value) => {
      if (!dateRegex.test(value)) return false;
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };

    labours.forEach((row, index) => {
      const spreadsheetRow = Number.isInteger(row?._spreadsheet_row) ? row._spreadsheet_row : index + 2;
      const labour = {
        full_name: text(row?.full_name),
        date_of_birth: text(row?.date_of_birth),
        date_of_joining: text(row?.date_of_joining),
        mobile: text(row?.mobile),
        company_email: text(row?.company_email).toLowerCase(),
        current_address: text(row?.current_address),
        permanent_address: text(row?.permanent_address),
        gender_id: lookupMaps.gender.get(text(row?.gender).toLowerCase()),
        emp_type_id: lookupMaps.employment_type.get(text(row?.employment_type).toLowerCase()),
        designation_id: lookupMaps.designation.get(text(row?.designation).toLowerCase()),
        status_id: lookupMaps.status.get(text(row?.status).toLowerCase()),
        site_engineer_emp_id: text(row?.site_engineer_emp_id),
        aadhaar_number: text(row?.aadhaar_number),
        approved_salary: text(row?.approved_salary),
        esic_number: text(row?.esic_number) || null,
        pf_number: text(row?.pf_number) || null,
      };
      const errors = [];

      for (const field of ["full_name", "mobile", "company_email", "current_address",
        "permanent_address", "site_engineer_emp_id", "aadhaar_number", "approved_salary"]) {
        if (!labour[field]) errors.push(`${field.replaceAll("_", " ")} is required`);
      }
      if (!isRealDate(labour.date_of_birth)) errors.push("date of birth must be a valid YYYY-MM-DD date");
      if (!isRealDate(labour.date_of_joining)) errors.push("date of joining must be a valid YYYY-MM-DD date");
      if (labour.mobile && !mobileRegex.test(labour.mobile)) errors.push("mobile must be 10 digits, optionally prefixed by +91");
      if (labour.company_email && !emailRegex.test(labour.company_email)) errors.push("company email is invalid");
      if (!labour.gender_id) errors.push(`unknown gender "${text(row?.gender)}"`);
      if (!labour.emp_type_id) errors.push(`unknown employment type "${text(row?.employment_type)}"`);
      if (!labour.designation_id) errors.push(`unknown designation "${text(row?.designation)}"`);
      if (!labour.status_id) errors.push(`unknown status "${text(row?.status)}"`);
      if (labour.aadhaar_number && !aadhaarRegex.test(labour.aadhaar_number)) errors.push("Aadhaar number must contain exactly 12 digits");
      if (labour.esic_number && !esicRegex.test(labour.esic_number)) errors.push("ESIC number must contain exactly 17 digits");
      const salary = parseSalary(labour.approved_salary);
      if (labour.approved_salary && salary === null) {
        errors.push("approved salary per shift must be a positive whole number or have up to 2 decimal places");
      }

      if (labour.company_email) {
        if (uploadedEmails.has(labour.company_email)) errors.push("duplicate company email in upload");
        uploadedEmails.add(labour.company_email);
      }
      if (labour.aadhaar_number) {
        if (uploadedAadhaars.has(labour.aadhaar_number)) errors.push("duplicate Aadhaar number in upload");
        uploadedAadhaars.add(labour.aadhaar_number);
      }
      if (errors.length) {
        rowErrors.push({ row: spreadsheetRow, errors });
      } else {
        normalizedLabours.push({ ...labour, approved_salary: salary, spreadsheet_row: spreadsheetRow });
      }
    });

    if (rowErrors.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Correct the listed rows and upload again. No labour records were added.",
        errors: rowErrors,
      });
    }

    const engineerIds = [...new Set(normalizedLabours.map((labour) => labour.site_engineer_emp_id))];
    const [siteEngineers] = await connection.query(
      `SELECT em.emp_id
       FROM employee_master em
       JOIN emp_designation ed ON ed.id = em.designation_id
       WHERE em.emp_id IN (?) AND LOWER(TRIM(ed.designation)) = 'site engineer'`,
      [engineerIds]
    );
    const validEngineerIds = new Set(siteEngineers.map((row) => row.emp_id));
    const invalidEngineerRows = normalizedLabours
      .map((labour) => validEngineerIds.has(labour.site_engineer_emp_id) ? null : {
        row: labour.spreadsheet_row,
        errors: [`"${labour.site_engineer_emp_id}" is not a valid Site Engineer employee ID`],
      })
      .filter(Boolean);
    if (invalidEngineerRows.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Correct the listed Site Engineer IDs and upload again. No labour records were added.",
        errors: invalidEngineerRows,
      });
    }

    const emails = normalizedLabours.map((labour) => labour.company_email);
    const aadhaars = normalizedLabours.map((labour) => labour.aadhaar_number);
    const [existingLabours] = await connection.query(
      "SELECT company_email, aadhaar_number FROM labour WHERE company_email IN (?) OR aadhaar_number IN (?)",
      [emails, aadhaars]
    );
    const existingEmails = new Set(existingLabours.map((row) => String(row.company_email).toLowerCase()));
    const existingAadhaars = new Set(existingLabours.map((row) => String(row.aadhaar_number || "")));
    const duplicateRows = normalizedLabours
      .map((labour) => {
        const errors = [];
        if (existingEmails.has(labour.company_email)) errors.push("company email already exists");
        if (existingAadhaars.has(labour.aadhaar_number)) errors.push("Aadhaar number already exists");
        return errors.length ? { row: labour.spreadsheet_row, errors } : null;
      })
      .filter(Boolean);
    if (duplicateRows.length) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Resolve existing duplicate records and upload again. No labour records were added.",
        errors: duplicateRows,
      });
    }

    for (const labour of normalizedLabours) {
      await connection.query(
        `INSERT INTO labour (
          full_name, date_of_birth, date_of_joining, company, branch, mobile, company_email,
          current_address, permanent_address, gender_id, dept_id, emp_type_id, designation_id,
          status_id, esic_number, pf_number, contractor_id, approved_salary, created_by,
          site_engineer_emp_id, aadhaar_number
        ) VALUES (?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, ?, ?, ?, ?)`,
        [
          labour.full_name, labour.date_of_birth, labour.date_of_joining, company, labour.mobile,
          labour.company_email, labour.current_address, labour.permanent_address, labour.gender_id,
          labour.emp_type_id, labour.designation_id, labour.status_id, labour.esic_number,
          labour.pf_number, labour.approved_salary, created_by, labour.site_engineer_emp_id,
          labour.aadhaar_number,
        ]
      );
    }

    await connection.commit();
    return res.status(201).json({
      success: true,
      message: `${normalizedLabours.length} labour record(s) imported successfully`,
      data: { imported_count: normalizedLabours.length },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error importing labour records:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import labour records",
    });
  } finally {
    if (connection) connection.release();
  }
};

exports.importEmployees = async (req, res) => {
  const { employees, created_by } = req.body || {};
  const company = "Sathya Coatings";

  if (!Array.isArray(employees) || employees.length === 0 || employees.length > 500) {
    return res.status(400).json({
      success: false,
      message: "Upload must contain between 1 and 500 fixed employee rows",
    });
  }
  if (typeof created_by !== "string" || !created_by.trim()) {
    return res.status(400).json({ success: false, message: "Created By is required" });
  }

  let connection;
  let transactionStarted = false;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();
    transactionStarted = true;

    const [userExists] = await connection.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [created_by]
    );
    if (!userExists.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: "Invalid Created By: User does not exist",
      });
    }

    const [[genders], [departments], [employmentTypes], [designations], [statuses]] = await Promise.all([
      connection.query("SELECT id, gender AS name FROM emp_gender"),
      connection.query("SELECT id, department AS name FROM emp_department"),
      connection.query("SELECT id, type AS name FROM employment_type"),
      connection.query("SELECT id, designation AS name FROM emp_designation"),
      connection.query("SELECT id, status AS name FROM emp_status"),
    ]);
    const makeLookup = (rows) => new Map(
      rows.map((row) => [String(row.name).trim().toLowerCase(), row.id])
    );
    const lookupMaps = {
      gender: makeLookup(genders),
      department: makeLookup(departments),
      employment_type: makeLookup(employmentTypes),
      designation: makeLookup(designations),
      status: makeLookup(statuses),
    };
    const designationRoles = {
      sitesupervisor: "siteincharge",
      accountant: "accounts_team",
      hrmanager: "admin",
      marketingexecutive: "admin",
      siteengineer: "siteincharge",
    };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const mobileRegex = /^(?:\+91)?\d{10}$/;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const rowErrors = [];
    const normalizedEmployees = [];
    const uploadedIds = new Set();
    const uploadedEmails = new Set();
    const text = (value) => value === null || value === undefined ? "" : String(value).trim();
    const parseSalary = (value) => {
      const salaryText = text(value);
      if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(salaryText)) return null;
      const salary = Number(salaryText.replace(/,/g, ""));
      return Number.isFinite(salary) && salary > 0 ? salary : null;
    };
    const isRealDate = (value) => {
      if (!dateRegex.test(value)) return false;
      const date = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    };

    employees.forEach((row, index) => {
      const spreadsheetRow = Number.isInteger(row?._spreadsheet_row) ? row._spreadsheet_row : index + 2;
      const designationName = text(row?.designation) || "Site Engineer";
      const employee = {
        emp_id: text(row?.emp_id),
        full_name: text(row?.full_name),
        date_of_birth: text(row?.date_of_birth),
        date_of_joining: text(row?.date_of_joining),
        gender_id: lookupMaps.gender.get(text(row?.gender).toLowerCase()),
        dept_id: lookupMaps.department.get((text(row?.department) || "Engineering").toLowerCase()),
        emp_type_id: lookupMaps.employment_type.get((text(row?.employment_type) || "Full-Time").toLowerCase()),
        designation_id: lookupMaps.designation.get(designationName.toLowerCase()),
        designation_name: designationName,
        status_id: lookupMaps.status.get(text(row?.status).toLowerCase()),
        mobile: text(row?.mobile),
        company_email: text(row?.company_email).toLowerCase(),
        user_password: text(row?.user_password),
        current_address: text(row?.current_address),
        permanent_address: text(row?.permanent_address),
        approved_salary: text(row?.approved_salary),
        esic_number: text(row?.esic_number) || null,
        pf_number: text(row?.pf_number) || null,
        spreadsheet_row: spreadsheetRow,
      };
      const errors = [];

      for (const field of ["emp_id", "full_name", "mobile", "company_email", "user_password",
        "current_address", "permanent_address", "approved_salary"]) {
        if (!employee[field]) errors.push(`${field.replaceAll("_", " ")} is required`);
      }
      if (!isRealDate(employee.date_of_birth)) errors.push("date of birth must be a valid YYYY-MM-DD date");
      if (!isRealDate(employee.date_of_joining)) errors.push("date of joining must be a valid YYYY-MM-DD date");
      if (!employee.gender_id) errors.push(`unknown gender "${text(row?.gender)}"`);
      if (!employee.dept_id) errors.push(`unknown department "${text(row?.department) || "Engineering"}"`);
      if (!employee.emp_type_id) errors.push(`unknown employment type "${text(row?.employment_type) || "Full-Time"}"`);
      if (!employee.designation_id) errors.push(`unknown designation "${designationName}"`);
      if (!employee.status_id) errors.push(`unknown status "${text(row?.status)}"`);
      if (employee.mobile && !mobileRegex.test(employee.mobile)) errors.push("mobile must be 10 digits, optionally prefixed by +91");
      if (employee.company_email && !emailRegex.test(employee.company_email)) errors.push("company email is invalid");
      if (employee.user_password && (
        employee.user_password.length < 8 || Buffer.byteLength(employee.user_password, "utf8") > 72
      )) errors.push("password must be at least 8 characters and no more than 72 bytes");
      const salary = parseSalary(employee.approved_salary);
      if (employee.approved_salary && salary === null) {
        errors.push("approved salary must be a positive whole number or have up to 2 decimal places");
      }
      if (employee.esic_number && !/^\d{17}$/.test(employee.esic_number)) errors.push("ESIC number must contain exactly 17 digits");
      if (employee.emp_id.length > 30) errors.push("employee ID must be no more than 30 characters");

      if (employee.emp_id) {
        if (uploadedIds.has(employee.emp_id)) errors.push("duplicate employee ID in upload");
        uploadedIds.add(employee.emp_id);
      }
      if (employee.company_email) {
        if (uploadedEmails.has(employee.company_email)) errors.push("duplicate company email in upload");
        uploadedEmails.add(employee.company_email);
      }
      if (!designationRoles[designationName.toLowerCase().replace(/[^a-z]/g, "")]) {
        errors.push(`no login role is configured for designation "${designationName}"`);
      }

      if (errors.length) {
        rowErrors.push({ row: spreadsheetRow, errors });
      } else {
        normalizedEmployees.push({ ...employee, approved_salary: salary });
      }
    });

    if (rowErrors.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: "Correct the listed rows and upload again. No fixed employees were added.",
        errors: rowErrors,
      });
    }

    const ids = normalizedEmployees.map((employee) => employee.emp_id);
    const emails = normalizedEmployees.map((employee) => employee.company_email);
    const [existingEmployees, existingUsers] = await Promise.all([
      connection.query(
        "SELECT emp_id, company_email FROM employee_master WHERE emp_id IN (?) OR company_email IN (?)",
        [ids, emails]
      ),
      connection.query("SELECT user_email FROM users WHERE user_email IN (?)", [emails]),
    ]);
    const existingIds = new Set(existingEmployees[0].map((row) => String(row.emp_id)));
    const existingEmails = new Set([
      ...existingEmployees[0].map((row) => String(row.company_email).toLowerCase()),
      ...existingUsers[0].map((row) => String(row.user_email).toLowerCase()),
    ]);
    const duplicateRows = normalizedEmployees.map((employee) => {
      const errors = [];
      if (existingIds.has(employee.emp_id)) errors.push("employee ID already exists");
      if (existingEmails.has(employee.company_email)) errors.push("company email already exists");
      return errors.length ? { row: employee.spreadsheet_row, errors } : null;
    }).filter(Boolean);
    if (duplicateRows.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: "Resolve existing duplicate records and upload again. No fixed employees were added.",
        errors: duplicateRows,
      });
    }

    const roleNames = [...new Set(normalizedEmployees.map((employee) =>
      designationRoles[employee.designation_name.toLowerCase().replace(/[^a-z]/g, "")]
    ))];
    const [roles] = await connection.query(
      "SELECT role_id, LOWER(role_name) AS role_name FROM roles WHERE LOWER(role_name) IN (?)",
      [roleNames]
    );
    const roleIds = new Map(roles.map((role) => [role.role_name, role.role_id]));
    const missingRoleRows = normalizedEmployees
      .map((employee) => {
        const roleName = designationRoles[employee.designation_name.toLowerCase().replace(/[^a-z]/g, "")];
        return roleIds.has(roleName) ? null : {
          row: employee.spreadsheet_row,
          errors: [`login role "${roleName}" is not configured in the database`],
        };
      })
      .filter(Boolean);
    if (missingRoleRows.length) {
      await connection.rollback();
      transactionStarted = false;
      return res.status(400).json({
        success: false,
        message: "Configure the listed employee login roles and upload again. No fixed employees were added.",
        errors: missingRoleRows,
      });
    }

    for (const employee of normalizedEmployees) {
      const roleName = designationRoles[employee.designation_name.toLowerCase().replace(/[^a-z]/g, "")];
      const hashedPassword = await bcrypt.hash(employee.user_password, 12);
      await connection.query(
        `INSERT INTO employee_master (
          emp_id, full_name, gender_id, date_of_birth, date_of_joining, status_id,
          company, dept_id, emp_type_id, designation_id, branch, mobile, company_email,
          current_address, permanent_address, esic_number, pf_number, approved_salary, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.emp_id, employee.full_name, employee.gender_id, employee.date_of_birth,
          employee.date_of_joining, employee.status_id, company, employee.dept_id,
          employee.emp_type_id, employee.designation_id, employee.mobile, employee.company_email,
          employee.current_address, employee.permanent_address, employee.esic_number,
          employee.pf_number, employee.approved_salary, created_by,
        ]
      );
      await connection.query(
        "INSERT INTO users (user_name, user_email, user_password, role_id) VALUES (?, ?, ?, ?)",
        [employee.company_email, employee.company_email, hashedPassword, roleIds.get(roleName)]
      );
    }

    await connection.commit();
    transactionStarted = false;
    return res.status(201).json({
      success: true,
      message: `${normalizedEmployees.length} fixed employee record(s) imported successfully`,
      data: { imported_count: normalizedEmployees.length },
    });
  } catch (error) {
    if (connection && transactionStarted) await connection.rollback();
    console.error("Error importing fixed employees:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A duplicate employee ID or login email already exists. No fixed employees were added.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to import fixed employees",
    });
  } finally {
    if (connection) connection.release();
  }
};

// Fetch all labour employees
exports.getLabourEmployees = async (req, res) => {
  try {
    const [labourEmployees] = await db.query(
      "SELECT id, full_name, approved_salary FROM labour WHERE status_id = 1"
    );
    res.status(200).json({ success: true, data: labourEmployees });
  } catch (error) {
    console.error("Error fetching labour employees:", error);
    res.status(500).json({ success: false, message: "Failed to fetch labour employees" });
  }
};

// Save labour assignments
exports.saveLabourAssignment = async (req, res) => {
  const {
    project_id,
    site_id,
    desc_id,
    labour_ids,
    from_date,
    to_date,
    created_by
  } = req.body;

  if (!project_id || !site_id || !desc_id || !labour_ids || !from_date || !to_date || !created_by) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields"
    });
  }

  try {
    // Get approved_salary for each labour_id
    const labourIdsString = labour_ids.join(",");
    const [labourData] = await db.query(
      `SELECT id, approved_salary FROM labour WHERE id IN (${labourIdsString})`
    );

    // Create assignment entries
    const assignments = labourData.map(labour => ({
      project_id,
      site_id,
      desc_id,
      labour_id: labour.id,
      salary: labour.approved_salary,
      from_date,
      to_date,
      created_by
    }));

    // Insert assignments
    for (const assignment of assignments) {
      await db.query(
        `INSERT INTO labour_assignment 
         (project_id, site_id, desc_id, labour_id, salary, from_date, to_date, created_by, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          assignment.project_id,
          assignment.site_id,
          assignment.desc_id,
          assignment.labour_id,
          assignment.salary,
          assignment.from_date,
          assignment.to_date,
          assignment.created_by
        ]
      );
    }

    res.status(201).json({
      success: true,
      message: "Labour assignments saved successfully"
    });
  } catch (error) {
    console.error("Error saving labour assignments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save labour assignments",
      error: error.message
    });
  }
};


// Fetch material graph with item names from material_master, dispatched quantities, acknowledged quantities, and used quantities
exports.materialgraph = async (req, res) => {
  const { siteId, descId } = req.params;

  try {
    const [planningRows] = await db.query(
      `SELECT 
         ma.item_id, 
         mm.item_name, 
         SUM(ma.quantity) AS total_planning,
         (SELECT SUM(md.dispatch_qty) 
          FROM material_dispatch md 
          WHERE md.material_assign_id IN 
            (SELECT ma2.id FROM material_assign ma2 
             WHERE ma2.item_id = ma.item_id 
             AND ma2.site_id = ? AND ma2.desc_id = ?)
         ) AS total_dispatched,
         (SELECT SUM(ma_ack.comp_a_qty + ma_ack.comp_b_qty + ma_ack.comp_c_qty) 
          FROM material_acknowledgement ma_ack
          JOIN material_dispatch md ON ma_ack.material_dispatch_id = md.id
          WHERE md.material_assign_id IN 
            (SELECT ma2.id FROM material_assign ma2 
             WHERE ma2.item_id = ma.item_id 
             AND ma2.site_id = ? AND ma2.desc_id = ?)
         ) AS total_acknowledged,
         (SELECT SUM(mu.overall_qty) 
          FROM material_usage mu
          JOIN material_acknowledgement ma_ack ON mu.material_ack_id = ma_ack.id
          JOIN material_dispatch md ON ma_ack.material_dispatch_id = md.id
          WHERE md.material_assign_id IN 
            (SELECT ma2.id FROM material_assign ma2 
             WHERE ma2.item_id = ma.item_id 
             AND ma2.site_id = ? AND ma2.desc_id = ?)
         ) AS total_used
       FROM material_assign ma
       JOIN material_master mm ON ma.item_id = mm.item_id
       WHERE ma.site_id = ? AND ma.desc_id = ?
       GROUP BY ma.item_id, mm.item_name`,
      [siteId, descId, siteId, descId, siteId, descId, siteId, descId]
    );

    const materialPlanning = planningRows.map(row => ({
      item_id: row.item_id,
      item_name: row.item_name || 'Unknown',
      total_planning: row.total_planning ? parseFloat(parseFloat(row.total_planning).toFixed(2)) : 0,
      total_dispatched: row.total_dispatched ? parseFloat(parseFloat(row.total_dispatched).toFixed(2)) : 0,
      total_acknowledged: row.total_acknowledged ? parseFloat(parseFloat(row.total_acknowledged).toFixed(2)) : 0,
      total_used: row.total_used ? parseFloat(parseFloat(row.total_used).toFixed(2)) : 0
    }));

    // Additional query for usage history, grouped by entry_date
    const [historyRows] = await db.query(
      `SELECT 
         muh.entry_date,
         ma.item_id,
         mm.item_name,
         SUM(muh.overall_qty) AS overall_qty
       FROM material_usage_history muh
       JOIN material_acknowledgement mack ON muh.material_ack_id = mack.id
       JOIN material_dispatch md ON mack.material_dispatch_id = md.id
       JOIN material_assign ma ON md.material_assign_id = ma.id
       JOIN material_master mm ON ma.item_id = mm.item_id
       WHERE ma.site_id = ? AND ma.desc_id = ?
       GROUP BY muh.entry_date, ma.item_id, mm.item_name
       ORDER BY muh.entry_date`,
      [siteId, descId]
    );

    const usageHistory = historyRows.map(row => ({
      entry_date: row.entry_date,
      item_id: row.item_id,
      item_name: row.item_name || 'Unknown',
      overall_qty: row.overall_qty ? parseFloat(parseFloat(row.overall_qty).toFixed(2)) : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        material_planning: materialPlanning,
        usage_history: usageHistory
      }
    });
  } catch (error) {
    console.error("Error fetching material graph:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch material graph"
    });
  }
};



// NEW: saveLabourOverhead (moved from routes)
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

    // Step 2: Insert into labour_overhead (add projection_id for tracking)
    console.log(`[${new Date().toISOString()}] Inserting into labour_overhead`);
    await connection.query(
      'INSERT INTO labour_overhead (site_id, desc_id, calculation_type, no_of_labours, total_shifts, rate_per_shift, total_cost, overhead_type, projection_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [site_id, desc_id, calculation_type, no_of_labours || null, total_shifts || null, rate_per_shift, total_cost, overhead_type_id, projection_id]
    );
    console.log(`[${new Date().toISOString()}] Labour overhead inserted`);

    // Step 3: Find last projection_id and ensure uniqueness (but since projection_id is provided, use it directly)
    // Note: Assuming projection_allocated has unique on (site_id, desc_id, overhead_type_id, projection_id)

    // Step 4: Insert into projection_allocated
    console.log(`[${new Date().toISOString()}] Inserting into projection_allocated`);
    await connection.query(
      'INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE total_cost = ?, budget_percentage = ?',
      [site_id, desc_id, overhead_type_id, projection_id, total_cost, labourBudgetPercentage || 0, total_cost, labourBudgetPercentage || 0]
    );
    console.log(`[${new Date().toISOString()}] Projection allocated inserted`);

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

// NEW: finalProjectionSubmission (stub; extend to save summary to a new table if needed)
exports.finalProjectionSubmission = async (req, res) => {
  const { site_id, desc_id, projection_id, projection_data } = req.body;

  if (!site_id || !desc_id || !projection_id || !projection_data) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    // Stub: Log the submission (extend: INSERT INTO projection_summary ...)
    console.log(`Final Submission for Projection ${projection_id}:`, { site_id, desc_id, projection_data });

    // Optional: Save to DB (example)
    // await db.query(
    //   'INSERT INTO projection_summary (site_id, desc_id, projection_id, summary_data) VALUES (?, ?, ?, ?)',
    //   [site_id, desc_id, projection_id, JSON.stringify(projection_data)]
    // );

    res.status(200).json({
      success: true,
      message: `Projection ${projection_id} submitted successfully`,
      data: { projection_id }
    });
  } catch (error) {
    console.error("Error in final projection submission:", error);
    res.status(500).json({ success: false, message: "Failed to submit projection" });
  }
};




// Get Top Sheet Overall Data - Final Version with Category & Subcategory + No Duplicates
exports.getTopSheetOverall = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.company_id,
        c.company_name,
        pd.pd_id AS project_id,
        pd.project_name,
        sd.site_id,
        sd.site_name,
        sd.po_number,
        wd.desc_id,
        wd.desc_name,
        ic.category_id,
        ic.category_name,
        isc.subcategory_id,
        isc.subcategory_name,
        pr.po_quantity,
        pr.rate,
        pr.value AS po_value,
        COALESCE(SUM(ceh.area_added), 0) AS completed_area,
        COALESCE(SUM(ceh.value_added), 0) AS completed_value,
        ROUND(
          COALESCE(SUM(ceh.area_added), 0) / NULLIF(pr.po_quantity, 0) * 100, 
          2
        ) AS completion_percentage
      FROM company c
      JOIN project_details pd ON c.company_id = pd.company_id
      JOIN site_details sd ON pd.pd_id = sd.pd_id
      JOIN po_reckoner pr ON sd.site_id = pr.site_id
      JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
      JOIN item_category ic ON pr.category_id = ic.category_id
      JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
      LEFT JOIN completion_entries_history ceh 
        ON pr.rec_id = ceh.rec_id
      GROUP BY 
        c.company_id,
        pd.pd_id,
        sd.site_id,
        wd.desc_id,
        ic.category_id,
        isc.subcategory_id,
        pr.rec_id
      ORDER BY c.company_name, pd.project_name, sd.site_name, wd.desc_name, ic.category_name, isc.subcategory_name
    `);

    // Calculate grand totals from unique records
    const grandTotalPOValue = rows.reduce((sum, row) => sum + parseFloat(row.po_value || 0), 0);
    const grandTotalCompletedValue = rows.reduce((sum, row) => sum + parseFloat(row.completed_value || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        records: rows,
        grand_total_po_value: parseFloat(grandTotalPOValue.toFixed(2)),
        grand_total_completed_value: parseFloat(grandTotalCompletedValue.toFixed(2)),
        total_records: rows.length
      }
    });
  } catch (error) {
    console.error("Error in getTopSheetOverall:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch top sheet overall data",
      error: error.message
    });
  }
};


module.exports = exports;