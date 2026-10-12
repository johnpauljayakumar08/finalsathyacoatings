const db = require('../config/db');

exports.test = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Notification Test API is working',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPendingAcknowledgements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        md.*, 
        ma_assign.site_id, 
        ma_assign.desc_id,
        em.full_name,
        em.emp_id,
        mm.item_name,
        um.uom_name
      FROM material_dispatch md
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      INNER JOIN material_master mm ON ma_assign.item_id = mm.item_id
      INNER JOIN uom_master um ON ma_assign.uom_id = um.uom_id
      LEFT JOIN material_acknowledgement ma ON md.id = ma.material_dispatch_id
      LEFT JOIN siteincharge_assign sia ON sia.site_id = ma_assign.site_id 
        AND sia.desc_id = ma_assign.desc_id 
        AND CURDATE() BETWEEN sia.from_date AND sia.to_date
      LEFT JOIN employee_master em ON em.emp_id = sia.emp_id
      WHERE ma.id IS NULL
      ORDER BY ma_assign.desc_id, md.id
    `);

    const grouped = rows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push(row);
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Pending acknowledgements fetched successfully',
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPendingUsages = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ma.id as ack_id,
        ma.overall_quantity,
        ma.remarks as ack_remarks,
        ma.created_at as ack_created_at,
        md.id as dispatch_id,
        md.dc_no,
        md.dispatch_date,
        md.dispatch_qty,
        md.vendor_code,
        md.order_no,
        ma_assign.site_id, 
        ma_assign.desc_id,
        em.full_name,
        em.emp_id,
        mm.item_name,
        um.uom_name
      FROM material_acknowledgement ma
      INNER JOIN material_dispatch md ON ma.material_dispatch_id = md.id
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      INNER JOIN material_master mm ON ma_assign.item_id = mm.item_id
      INNER JOIN uom_master um ON ma_assign.uom_id = um.uom_id
      LEFT JOIN material_usage mu ON mu.material_ack_id = ma.id AND DATE(mu.created_at) = CURDATE()
      LEFT JOIN siteincharge_assign sia ON sia.site_id = ma_assign.site_id 
        AND sia.desc_id = ma_assign.desc_id 
        AND CURDATE() BETWEEN sia.from_date AND sia.to_date
      LEFT JOIN employee_master em ON em.emp_id = sia.emp_id
      WHERE mu.id IS NULL
      ORDER BY ma_assign.desc_id, ma.id
    `);

    const grouped = rows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push(row);
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Pending usages fetched successfully',
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getPendingExpenseEntries = async (req, res) => {
  try {
    // Fetch all actual_budget with joins
    const [abRows] = await db.query(`
      SELECT 
        ab.id as actual_budget_id,
        ab.overhead_id,
        ab.actual_value,
        ab.difference_value,
        ab.remarks as actual_remarks,
        ab.created_at as actual_created_at,
        ab.splitted_budget,
        o.expense_name,
        o.is_default,
        pb.id as po_budget_id,
        pb.site_id,
        pb.desc_id,
        pb.total_po_value,
        pb.total_budget_value
      FROM actual_budget ab
      INNER JOIN overhead o ON ab.overhead_id = o.id
      INNER JOIN po_budget pb ON ab.po_budget_id = pb.id
      ORDER BY pb.desc_id, ab.id
    `);

    // Fetch all history
    const [historyRows] = await db.query(`
      SELECT actual_budget_id, entry_date
      FROM actual_budget_history
    `);

    const historyMap = {};
    historyRows.forEach(row => {
      const dateStr = row.entry_date.toISOString().split('T')[0];
      if (!historyMap[row.actual_budget_id]) {
        historyMap[row.actual_budget_id] = new Set();
      }
      historyMap[row.actual_budget_id].add(dateStr);
    });

    // Process missing dates
    const currentDateStr = new Date().toISOString().split('T')[0];
    const processed = abRows
      .map(row => {
        const startDateStr = new Date(row.actual_created_at).toISOString().split('T')[0];
        const missingDates = [];
        let currentDate = new Date(startDateStr);
        while (currentDate <= new Date(currentDateStr)) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!historyMap[row.actual_budget_id] || !historyMap[row.actual_budget_id].has(dateStr)) {
            missingDates.push(dateStr);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        if (missingDates.length > 0) {
          return {
            ...row,
            missing_dates: missingDates
          };
        }
        return null;
      })
      .filter(Boolean);

    // Fetch site incharge assignments for current date (simplification; can be adjusted for specific dates)
    const [siaRows] = await db.query(`
      SELECT 
        sia.site_id, 
        sia.desc_id, 
        sia.emp_id, 
        em.full_name
      FROM siteincharge_assign sia
      LEFT JOIN employee_master em ON sia.emp_id = em.emp_id
      WHERE CURDATE() BETWEEN sia.from_date AND sia.to_date
    `);

    const siaMap = {};
    siaRows.forEach(row => {
      const key = `${row.site_id}_${row.desc_id}`;
      siaMap[key] = {
        full_name: row.full_name,
        emp_id: row.emp_id
      };
    });

    // Add assignment info
    processed.forEach(item => {
      const key = `${item.site_id}_${item.desc_id}`;
      const assignment = siaMap[key];
      item.full_name = assignment ? assignment.full_name : null;
      item.emp_id = assignment ? assignment.emp_id : null;
    });

    // Group by desc_id
    const grouped = processed.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push(row);
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Pending expense entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.getPendingCompletionEntries = async (req, res) => {
  try {
    // Fetch completion_status records with joins
    const [rows] = await db.query(`
      SELECT 
        cs.completion_id,
        cs.rec_id,
        cs.area_completed,
        cs.rate,
        cs.value,
        cs.remarks as completion_remarks,
        cs.created_at as completion_created_at,
        pr.site_id,
        pr.desc_id,
        ic.category_name,
        isc.subcategory_name,
        em.full_name,
        em.emp_id
      FROM completion_status cs
      INNER JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
      INNER JOIN item_category ic ON pr.category_id = ic.category_id
      INNER JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
      LEFT JOIN siteincharge_assign sia ON sia.site_id = pr.site_id 
        AND sia.desc_id = pr.desc_id 
        AND CURDATE() BETWEEN sia.from_date AND sia.to_date
      LEFT JOIN employee_master em ON em.emp_id = sia.emp_id
      ORDER BY pr.desc_id, cs.rec_id
    `);

    // Fetch all history to build map
    const [historyRows] = await db.query(`
      SELECT rec_id, entry_date
      FROM completion_entries_history
    `);

    const historyMap = {};
    historyRows.forEach(row => {
      const dateStr = row.entry_date.toISOString().split('T')[0];
      if (!historyMap[row.rec_id]) {
        historyMap[row.rec_id] = new Set();
      }
      historyMap[row.rec_id].add(dateStr);
    });

    // Process missing dates up to yesterday (previous dates only)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const processed = rows
      .map(row => {
        const startDate = new Date(row.completion_created_at);
        const startDateStr = startDate.toISOString().split('T')[0];
        
        // Only process if start date is before or on yesterday
        if (new Date(startDateStr) > yesterday) {
          return null;
        }

        const missingDates = [];
        let currentDate = new Date(startDateStr);
        while (currentDate <= yesterday) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!historyMap[row.rec_id] || !historyMap[row.rec_id].has(dateStr)) {
            missingDates.push(dateStr);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        if (missingDates.length > 0) {
          return {
            ...row,
            missing_dates: missingDates
          };
        }
        return null;
      })
      .filter(Boolean);

    // Group by desc_id
    const grouped = processed.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push(row);
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Pending completion entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getPendingCompletionEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Updated getPendingAttendanceEntries
exports.getPendingAttendanceEntries = async (req, res) => {
  try {
    // Fetch labour_assignment records with LEFT JOIN to labour
    const [rows] = await db.query(`
      SELECT 
        la.id as labour_assignment_id,
        la.site_id,
        la.desc_id,
        la.from_date,
        la.to_date,
        la.created_at,
        la.salary,
        la.labour_id,
        l.full_name
      FROM labour_assignment la
      LEFT JOIN labour l ON la.labour_id = l.id
      ORDER BY la.desc_id, la.id
    `);

    // Fetch all attendance history to build map
    const [historyRows] = await db.query(`
      SELECT labour_assignment_id, entry_date
      FROM labour_attendance
    `);

    const historyMap = {};
    historyRows.forEach(row => {
      const dateStr = formatDate(row.entry_date);
      if (!historyMap[row.labour_assignment_id]) {
        historyMap[row.labour_assignment_id] = new Set();
      }
      historyMap[row.labour_assignment_id].add(dateStr);
    });

    // Process missing dates up to yesterday
    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const processed = rows
      .map(row => {
        // Handle null full_name
        row.full_name = row.full_name || 'Unknown Labor';
        
        const startDateStr = formatDate(row.from_date);
        const toDateStr = formatDate(row.to_date);
        const missingDates = [];
        let currentDateStr = startDateStr;
        let tempDate = new Date(row.from_date.getTime());
        while (currentDateStr <= yesterdayStr && currentDateStr <= toDateStr) {
          if (!historyMap[row.labour_assignment_id] || !historyMap[row.labour_assignment_id].has(currentDateStr)) {
            missingDates.push(currentDateStr);
          }
          tempDate.setDate(tempDate.getDate() + 1);
          currentDateStr = formatDate(tempDate);
        }
        if (missingDates.length > 0) {
          return {
            ...row,
            missing_dates: missingDates
          };
        }
        return null;
      })
      .filter(Boolean);

    // Group by desc_id
    const grouped = processed.reduce((acc, row) => {
      const descId = row.desc_id;
      if (descId !== null && descId !== undefined) {
        if (!acc[descId]) {
          acc[descId] = [];
        }
        acc[descId].push(row);
      }
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Pending attendance entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getPendingAttendanceEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




// New endpoint for edited acknowledgements
exports.getEditedAcknowledgements = async (req, res) => {
  try {
    // Fetch main acknowledgements that have history
    const [mainRows] = await db.query(`
      SELECT DISTINCT
        ma.id,
        ma.overall_quantity,
        ma.remarks,
        ma.created_by,
        ma.updated_by,
        ma.created_at,
        ma.updated_at,
        cu.user_name as created_user,
        uu.user_name as updated_user,
        md.id as dispatch_id,
        md.dispatch_date,
        md.dispatch_qty,
        ma_assign.site_id, 
        ma_assign.desc_id,
        mm.item_name,
        um.uom_name
      FROM material_acknowledgement ma
      INNER JOIN material_acknowledgement_history mah ON ma.id = mah.material_acknowledgement_id
      INNER JOIN material_dispatch md ON ma.material_dispatch_id = md.id
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      INNER JOIN material_master mm ON ma_assign.item_id = mm.item_id
      INNER JOIN uom_master um ON ma_assign.uom_id = um.uom_id
      LEFT JOIN users cu ON cu.user_id = CAST(ma.created_by AS UNSIGNED)
      LEFT JOIN users uu ON uu.user_id = CAST(ma.updated_by AS UNSIGNED)
      ORDER BY ma_assign.desc_id, ma.id
    `);

    const historyIds = [...new Set(mainRows.map(r => r.id))];

    let histories = [];
    if (historyIds.length > 0) {
      const [histRows] = await db.query(`
        SELECT 
          mah.overall_quantity,
          mah.remarks,
          mah.created_by,
          mah.updated_by,
          mah.created_at,
          mah.updated_at,
          hcu.user_name as hist_created_user,
          huu.user_name as hist_updated_user
        FROM material_acknowledgement_history mah
        LEFT JOIN users hcu ON hcu.user_id = CAST(mah.created_by AS UNSIGNED)
        LEFT JOIN users huu ON huu.user_id = CAST(mah.updated_by AS UNSIGNED)
        WHERE material_acknowledgement_id IN (?)
        ORDER BY mah.updated_at ASC
      `, [historyIds]);
      histories = histRows;
    }

    const historyMap = {};
    histories.forEach(h => {
      const ackId = h.material_acknowledgement_id; // Wait, need to select material_acknowledgement_id in hist query
      // Correction: add mah.material_acknowledgement_id to SELECT
    });

    // Fixed query with material_acknowledgement_id
    const [histRowsFixed] = await db.query(`
      SELECT 
        mah.material_acknowledgement_id,
        mah.overall_quantity,
        mah.remarks,
        mah.created_by,
        mah.updated_by,
        mah.created_at,
        mah.updated_at,
        hcu.user_name as hist_created_user,
        huu.user_name as hist_updated_user
      FROM material_acknowledgement_history mah
      LEFT JOIN users hcu ON hcu.user_id = CAST(mah.created_by AS UNSIGNED)
      LEFT JOIN users huu ON huu.user_id = CAST(mah.updated_by AS UNSIGNED)
      WHERE mah.material_acknowledgement_id IN (?)
      ORDER BY mah.material_acknowledgement_id, mah.updated_at ASC
    `, [historyIds]);

    const historyMapFixed = {};
    histRowsFixed.forEach(h => {
      const ackId = h.material_acknowledgement_id;
      if (!historyMapFixed[ackId]) {
        historyMapFixed[ackId] = [];
      }
      historyMapFixed[ackId].push({
        overall_quantity: h.overall_quantity,
        remarks: h.remarks,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: h.created_at,
        updated_at: h.updated_at,
        created_user: h.hist_created_user,
        updated_user: h.hist_updated_user
      });
    });

    // Group main data
    const grouped = mainRows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push({
        ...row,
        histories: historyMapFixed[row.id] || []
      });
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Edited acknowledgements fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getEditedAcknowledgements:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getEditedUsages = async (req, res) => {
  try {
    // Fetch main usage history that have edit history
    const [mainRows] = await db.query(`
      SELECT DISTINCT
        muh.entry_id as usage_id,
        muh.material_ack_id as ack_id,
        muh.entry_date,
        muh.overall_qty,
        muh.remarks,
        muh.created_by,
        muh.updated_by,
        muh.created_at,
        muh.updated_at,
        cu.user_name as created_user,
        COALESCE(uu.user_name, 'Unknown') as updated_user,
        md.id as dispatch_id,
        md.dispatch_date,
        md.dispatch_qty,
        ma_assign.site_id, 
        ma_assign.desc_id,
        mm.item_name,
        um.uom_name
      FROM material_usage_history muh
      INNER JOIN material_usage_edit_history mueh ON muh.entry_id = mueh.material_usage_history_id
      INNER JOIN material_acknowledgement ma ON muh.material_ack_id = ma.id
      INNER JOIN material_dispatch md ON ma.material_dispatch_id = md.id
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      INNER JOIN material_master mm ON ma_assign.item_id = mm.item_id
      INNER JOIN uom_master um ON ma_assign.uom_id = um.uom_id
      LEFT JOIN users cu ON cu.user_id = muh.created_by
      LEFT JOIN users uu ON uu.user_id = CAST(muh.updated_by AS SIGNED)
      ORDER BY ma_assign.desc_id, muh.entry_date DESC, muh.entry_id
    `);

    const usageIds = [...new Set(mainRows.map(r => r.usage_id))];

    let histories = [];
    if (usageIds.length > 0) {
      const [histRows] = await db.query(`
        SELECT 
          mueh.material_usage_history_id,
          mueh.overall_qty,
          mueh.remarks,
          mueh.created_by,
          mueh.updated_by,
          mueh.created_at,
          mueh.updated_at,
          COALESCE(hcu.user_name, 'Unknown') as hist_created_user,
          COALESCE(huu.user_name, 'Unknown') as hist_updated_user
        FROM material_usage_edit_history mueh
        LEFT JOIN users hcu ON hcu.user_id = CAST(mueh.created_by AS SIGNED)
        LEFT JOIN users huu ON huu.user_id = CAST(mueh.updated_by AS SIGNED)
        WHERE mueh.material_usage_history_id IN (?)
        ORDER BY mueh.material_usage_history_id, mueh.updated_at ASC
      `, [usageIds]);
      histories = histRows;
    }

    const historyMap = {};
    histories.forEach(h => {
      const usageId = h.material_usage_history_id;
      if (!historyMap[usageId]) {
        historyMap[usageId] = [];
      }
      historyMap[usageId].push({
        overall_qty: h.overall_qty,
        remarks: h.remarks,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: h.created_at,
        updated_at: h.updated_at,
        created_user: h.hist_created_user,
        updated_user: h.hist_updated_user
      });
    });

    // Group main data
    const grouped = mainRows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push({
        ...row,
        histories: historyMap[row.usage_id] || []
      });
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Edited usages fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getEditedUsages:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




// New endpoint for edited expenses
exports.getEditedExpenseEntries = async (req, res) => {
  try {
    // Fetch main budget history that have edit history
    const [mainRows] = await db.query(`
      SELECT DISTINCT
        abh.id as history_id,
        abh.actual_budget_id,
        abh.entry_date,
        abh.actual_value,
        abh.remarks,
        abh.created_by,
        abh.updated_by,
        abh.created_at,
        abh.updated_at,
        cu.user_name as created_user,
        COALESCE(uu.user_name, 'Unknown') as updated_user,
        ab.overhead_id,
        ab.difference_value,
        ab.splitted_budget,
        o.expense_name,
        o.is_default,
        pb.id as po_budget_id,
        pb.site_id,
        pb.desc_id,
        pb.total_po_value,
        pb.total_budget_value
      FROM actual_budget_history abh
      INNER JOIN actual_budget_edit_history abeh ON abh.id = abeh.actual_budget_history_id
      INNER JOIN actual_budget ab ON abh.actual_budget_id = ab.id
      INNER JOIN overhead o ON ab.overhead_id = o.id
      INNER JOIN po_budget pb ON ab.po_budget_id = pb.id
      LEFT JOIN users cu ON cu.user_id = CAST(abh.created_by AS SIGNED)
      LEFT JOIN users uu ON uu.user_id = CAST(abh.updated_by AS SIGNED)
      ORDER BY pb.desc_id, abh.entry_date DESC, abh.id
    `);

    const historyIds = [...new Set(mainRows.map(r => r.history_id))];

    let editHistories = [];
    if (historyIds.length > 0) {
      const [editHistRows] = await db.query(`
        SELECT 
          abeh.actual_budget_history_id,
          abeh.actual_value,
          abeh.remarks,
          abeh.created_by,
          abeh.updated_by,
          abeh.created_at,
          abeh.updated_at,
          COALESCE(hcu.user_name, 'Unknown') as hist_created_user,
          COALESCE(huu.user_name, 'Unknown') as hist_updated_user
        FROM actual_budget_edit_history abeh
        LEFT JOIN users hcu ON hcu.user_id = CAST(abeh.created_by AS SIGNED)
        LEFT JOIN users huu ON huu.user_id = CAST(abeh.updated_by AS SIGNED)
        WHERE abeh.actual_budget_history_id IN (?)
        ORDER BY abeh.actual_budget_history_id, abeh.updated_at ASC
      `, [historyIds]);
      editHistories = editHistRows;
    }

    const editHistoryMap = {};
    editHistories.forEach(h => {
      const histId = h.actual_budget_history_id;
      if (!editHistoryMap[histId]) {
        editHistoryMap[histId] = [];
      }
      editHistoryMap[histId].push({
        actual_value: h.actual_value,
        remarks: h.remarks,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: h.created_at,
        updated_at: h.updated_at,
        created_user: h.hist_created_user,
        updated_user: h.hist_updated_user
      });
    });

    // Fetch site incharge assignments
    const [siaRows] = await db.query(`
      SELECT 
        sia.site_id, 
        sia.desc_id, 
        sia.emp_id, 
        em.full_name
      FROM siteincharge_assign sia
      LEFT JOIN employee_master em ON sia.emp_id = em.emp_id
      WHERE CURDATE() BETWEEN sia.from_date AND sia.to_date
    `);

    const siaMap = {};
    siaRows.forEach(row => {
      const key = `${row.site_id}_${row.desc_id}`;
      siaMap[key] = {
        full_name: row.full_name,
        emp_id: row.emp_id
      };
    });

    // Add assignment info
    mainRows.forEach(item => {
      const key = `${item.site_id}_${item.desc_id}`;
      const assignment = siaMap[key];
      item.full_name = assignment ? assignment.full_name : null;
      item.emp_id = assignment ? assignment.emp_id : null;
    });

    // Group main data
    const grouped = mainRows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push({
        ...row,
        histories: editHistoryMap[row.history_id] || []
      });
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Edited expense entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getEditedExpenseEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// New endpoint for edited completions
exports.getEditedCompletionEntries = async (req, res) => {
  try {
    // Fetch main completion_status that have edit history
    const [mainRows] = await db.query(`
      SELECT DISTINCT
        cs.completion_id,
        cs.rec_id,
        cs.area_completed,
        cs.rate,
        cs.value,
        cs.remarks,
        cs.created_by,
        cs.updated_by,
        cs.created_at,
        cs.updated_at,
        cu.user_name as created_user,
        COALESCE(uu.user_name, 'Unknown') as updated_user,
        pr.site_id,
        pr.desc_id,
        ic.category_name,
        isc.subcategory_name,
        em.full_name,
        em.emp_id
      FROM completion_status cs
      INNER JOIN completion_edit_entries_history ceh ON cs.completion_id = ceh.completion_status_id
      INNER JOIN po_reckoner pr ON cs.rec_id = pr.rec_id
      INNER JOIN item_category ic ON pr.category_id = ic.category_id
      INNER JOIN item_subcategory isc ON pr.subcategory_id = isc.subcategory_id
      LEFT JOIN siteincharge_assign sia ON sia.site_id = pr.site_id 
        AND sia.desc_id = pr.desc_id 
        AND CURDATE() BETWEEN sia.from_date AND sia.to_date
      LEFT JOIN employee_master em ON em.emp_id = sia.emp_id
      LEFT JOIN users cu ON cu.user_id = CAST(cs.created_by AS SIGNED)
      LEFT JOIN users uu ON uu.user_id = CAST(cs.updated_by AS SIGNED)
      ORDER BY pr.desc_id, cs.rec_id
    `);

    const completionIds = [...new Set(mainRows.map(r => r.completion_id))];

    let editHistories = [];
    if (completionIds.length > 0) {
      const [editHistRows] = await db.query(`
        SELECT 
          ceh.completion_status_id,
          ceh.area_completed,
          ceh.rate,
          ceh.value,
          ceh.remarks,
          ceh.created_by,
          ceh.updated_by,
          ceh.created_at,
          ceh.updated_at,
          COALESCE(hcu.user_name, 'Unknown') as hist_created_user,
          COALESCE(huu.user_name, 'Unknown') as hist_updated_user
        FROM completion_edit_entries_history ceh
        LEFT JOIN users hcu ON hcu.user_id = CAST(ceh.created_by AS SIGNED)
        LEFT JOIN users huu ON huu.user_id = CAST(ceh.updated_by AS SIGNED)
        WHERE ceh.completion_status_id IN (?)
        ORDER BY ceh.completion_status_id, ceh.updated_at ASC
      `, [completionIds]);
      editHistories = editHistRows;
    }

    const editHistoryMap = {};
    editHistories.forEach(h => {
      const compId = h.completion_status_id;
      if (!editHistoryMap[compId]) {
        editHistoryMap[compId] = [];
      }
      editHistoryMap[compId].push({
        area_completed: h.area_completed,
        rate: h.rate,
        value: h.value,
        remarks: h.remarks,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: h.created_at,
        updated_at: h.updated_at,
        created_user: h.hist_created_user,
        updated_user: h.hist_updated_user
      });
    });

    // Group main data
    const grouped = mainRows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push({
        ...row,
        histories: editHistoryMap[row.completion_id] || []
      });
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Edited completion entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getEditedCompletionEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


// New endpoint for edited attendance entries
exports.getEditedAttendanceEntries = async (req, res) => {
  try {
    // Fetch main attendance records that have edit history
    const [mainRows] = await db.query(`
      SELECT DISTINCT
        la_att.id,
        la_att.labour_assignment_id,
        la_att.shift,
        la_att.entry_date,
        la_att.remarks,
        la_att.created_by,
        la_att.updated_by,
        la_att.created_at,
        la_att.updated_at,
        cu.user_name as created_user,
        COALESCE(uu.user_name, 'Unknown') as updated_user,
        la.site_id,
        la.desc_id,
        l.full_name,
        em.full_name as assigned_full_name,
        em.emp_id as assigned_emp_id
      FROM labour_attendance la_att
      INNER JOIN labour_attendance_edit_history laeh ON la_att.id = laeh.labour_attendance_id
      INNER JOIN labour_assignment la ON la_att.labour_assignment_id = la.id
      LEFT JOIN labour l ON la.labour_id = l.id
      LEFT JOIN siteincharge_assign sia ON sia.site_id = la.site_id 
        AND sia.desc_id = la.desc_id 
        AND CURDATE() BETWEEN sia.from_date AND sia.to_date
      LEFT JOIN employee_master em ON em.emp_id = sia.emp_id
      LEFT JOIN users cu ON cu.user_id = CAST(la_att.created_by AS UNSIGNED)
      LEFT JOIN users uu ON uu.user_id = CAST(la_att.updated_by AS UNSIGNED)
      ORDER BY la.desc_id, la_att.entry_date DESC, la_att.id
    `);

    const attendanceIds = [...new Set(mainRows.map(r => r.id))];

    let histories = [];
    if (attendanceIds.length > 0) {
      const [histRows] = await db.query(`
        SELECT 
          laeh.labour_attendance_id,
          laeh.shift,
          laeh.remarks,
          laeh.created_by,
          laeh.updated_by,
          laeh.created_at,
          laeh.updated_at,
          COALESCE(hcu.user_name, 'Unknown') as hist_created_user,
          COALESCE(huu.user_name, 'Unknown') as hist_updated_user
        FROM labour_attendance_edit_history laeh
        LEFT JOIN users hcu ON hcu.user_id = CAST(laeh.created_by AS UNSIGNED)
        LEFT JOIN users huu ON huu.user_id = CAST(laeh.updated_by AS UNSIGNED)
        WHERE laeh.labour_attendance_id IN (?)
        ORDER BY laeh.labour_attendance_id, laeh.updated_at ASC
      `, [attendanceIds]);
      histories = histRows;
    }

    const historyMap = {};
    histories.forEach(h => {
      const attId = h.labour_attendance_id;
      if (!historyMap[attId]) {
        historyMap[attId] = [];
      }
      historyMap[attId].push({
        shift: h.shift,
        remarks: h.remarks,
        created_by: h.created_by,
        updated_by: h.updated_by,
        created_at: h.created_at,
        updated_at: h.updated_at,
        created_user: h.hist_created_user,
        updated_user: h.hist_updated_user
      });
    });

    // Group main data
    const grouped = mainRows.reduce((acc, row) => {
      const descId = row.desc_id;
      if (!acc[descId]) {
        acc[descId] = [];
      }
      acc[descId].push({
        ...row,
        histories: historyMap[row.id] || []
      });
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      message: 'Edited attendance entries fetched successfully',
      data: grouped
    });
  } catch (error) {
    console.error('Error in getEditedAttendanceEntries:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update getNotificationCounts to include edited_attendance
exports.getNotificationCounts = async (req, res) => {
  try {
    const [ackCountRows] = await db.query(`
      SELECT COUNT(*) as count 
      FROM material_dispatch md
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      LEFT JOIN material_acknowledgement ma ON md.id = ma.material_dispatch_id
      WHERE ma.id IS NULL
    `);

    const [usageCountRows] = await db.query(`
      SELECT COUNT(*) as count
      FROM material_acknowledgement ma
      INNER JOIN material_dispatch md ON ma.material_dispatch_id = md.id
      INNER JOIN material_assign ma_assign ON md.material_assign_id = ma_assign.id
      LEFT JOIN material_usage mu ON mu.material_ack_id = ma.id AND DATE(mu.created_at) = CURDATE()
      WHERE mu.id IS NULL
    `);

    // For expenses, calculate total missing dates
    const [abRowsCount] = await db.query(`
      SELECT id, created_at
      FROM actual_budget
    `);

    const [historyRowsCount] = await db.query(`
      SELECT actual_budget_id, entry_date
      FROM actual_budget_history
    `);

    const historyMapCount = {};
    historyRowsCount.forEach(row => {
      const dateStr = formatDate(row.entry_date);
      if (!historyMapCount[row.actual_budget_id]) {
        historyMapCount[row.actual_budget_id] = new Set();
      }
      historyMapCount[row.actual_budget_id].add(dateStr);
    });

    let expensesCount = 0;
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentDateStr = formatDate(currentDate);
    abRowsCount.forEach(row => {
      const startDateStr = formatDate(row.created_at);
      let currentDateStrLoop = startDateStr;
      let tempDate = new Date(row.created_at.getTime());
      while (currentDateStrLoop <= currentDateStr) {
        if (!historyMapCount[row.id] || !historyMapCount[row.id].has(currentDateStrLoop)) {
          expensesCount++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
        currentDateStrLoop = formatDate(tempDate);
      }
    });

    // For completions, calculate total missing dates up to yesterday
    const [csRowsCount] = await db.query(`
      SELECT completion_id, rec_id, created_at
      FROM completion_status
    `);

    const [completionHistoryRows] = await db.query(`
      SELECT rec_id, entry_date
      FROM completion_entries_history
    `);

    const completionHistoryMap = {};
    completionHistoryRows.forEach(row => {
      const dateStr = formatDate(row.entry_date);
      if (!completionHistoryMap[row.rec_id]) {
        completionHistoryMap[row.rec_id] = new Set();
      }
      completionHistoryMap[row.rec_id].add(dateStr);
    });

    let completionsCount = 0;
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);
    csRowsCount.forEach(row => {
      const startDateStr = formatDate(row.created_at);
      let currentDateStrLoop = startDateStr;
      let tempDate = new Date(row.created_at.getTime());
      while (currentDateStrLoop <= yesterdayStr) {
        if (!completionHistoryMap[row.rec_id] || !completionHistoryMap[row.rec_id].has(currentDateStrLoop)) {
          completionsCount++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
        currentDateStrLoop = formatDate(tempDate);
      }
    });

    // For attendances, calculate total missing dates up to yesterday
    const [laRowsCount] = await db.query(`
      SELECT id, from_date, to_date, desc_id
      FROM labour_assignment
      WHERE desc_id IS NOT NULL
    `);

    const [attendanceHistoryRows] = await db.query(`
      SELECT labour_assignment_id, entry_date
      FROM labour_attendance
    `);

    const attendanceHistoryMap = {};
    attendanceHistoryRows.forEach(row => {
      const dateStr = formatDate(row.entry_date);
      if (!attendanceHistoryMap[row.labour_assignment_id]) {
        attendanceHistoryMap[row.labour_assignment_id] = new Set();
      }
      attendanceHistoryMap[row.labour_assignment_id].add(dateStr);
    });

    let attendanceCount = 0;
    const attYesterdayStr = yesterdayStr;
    laRowsCount.forEach(row => {
      const startDateStr = formatDate(row.from_date);
      const toDateStr = formatDate(row.to_date);
      let currentDateStrLoop = startDateStr;
      let tempDate = new Date(row.from_date.getTime());
      while (currentDateStrLoop <= attYesterdayStr && currentDateStrLoop <= toDateStr) {
        if (!attendanceHistoryMap[row.id] || !attendanceHistoryMap[row.id].has(currentDateStrLoop)) {
          attendanceCount++;
        }
        tempDate.setDate(tempDate.getDate() + 1);
        currentDateStrLoop = formatDate(tempDate);
      }
    });

    // Edited acknowledgements count
    const [editedAcksCountRows] = await db.query(`
      SELECT COUNT(DISTINCT ma.id) as count
      FROM material_acknowledgement ma
      INNER JOIN material_acknowledgement_history mah ON ma.id = mah.material_acknowledgement_id
    `);

    // Edited usages count
    const [editedUsagesCountRows] = await db.query(`
      SELECT COUNT(DISTINCT muh.entry_id) as count
      FROM material_usage_history muh
      INNER JOIN material_usage_edit_history mueh ON muh.entry_id = mueh.material_usage_history_id
    `);

    // Edited expenses count
    const [editedExpensesCountRows] = await db.query(`
      SELECT COUNT(DISTINCT abh.id) as count
      FROM actual_budget_history abh
      INNER JOIN actual_budget_edit_history abeh ON abh.id = abeh.actual_budget_history_id
    `);

    // Edited completions count
    const [editedCompletionsCountRows] = await db.query(`
      SELECT COUNT(DISTINCT cs.completion_id) as count
      FROM completion_status cs
      INNER JOIN completion_edit_entries_history ceh ON cs.completion_id = ceh.completion_status_id
    `);

    // Edited attendance count
    const [editedAttendanceCountRows] = await db.query(`
      SELECT COUNT(DISTINCT la_att.id) as count
      FROM labour_attendance la_att
      INNER JOIN labour_attendance_edit_history laeh ON la_att.id = laeh.labour_attendance_id
    `);

    const acksCount = ackCountRows[0].count;
    const usagesCount = usageCountRows[0].count;
    const editedAcksCount = editedAcksCountRows[0].count;
    const editedUsagesCount = editedUsagesCountRows[0].count;
    const editedExpensesCount = editedExpensesCountRows[0].count;
    const editedCompletionsCount = editedCompletionsCountRows[0].count;
    const editedAttendanceCount = editedAttendanceCountRows[0].count;
    const totalCount = acksCount + usagesCount + expensesCount + completionsCount + attendanceCount + editedAcksCount + editedUsagesCount + editedExpensesCount + editedCompletionsCount + editedAttendanceCount;

    res.status(200).json({
      status: 'success',
      message: 'Notification counts fetched successfully',
      data: { 
        acks: acksCount, 
        usages: usagesCount, 
        expenses: expensesCount, 
        completions: completionsCount,
        attendance: attendanceCount,
        edited_acks: editedAcksCount,
        edited_usages: editedUsagesCount,
        edited_expenses: editedExpensesCount,
        edited_completions: editedCompletionsCount,
        edited_attendance: editedAttendanceCount,
        total: totalCount 
      }
    });
  } catch (error) {
    console.error('Error in getNotificationCounts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};