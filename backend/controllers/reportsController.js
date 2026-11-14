const db = require('../config/db');

const isValidDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value);

const buildFilters = (req, siteColumn, descriptionColumn, dateColumn) => {
  const { site_id, desc_id, date, start_date, end_date } = req.query;
  const clauses = [];
  const params = [];

  if (site_id) {
    clauses.push(`${siteColumn} = ?`);
    params.push(site_id);
  }
  if (desc_id) {
    clauses.push(`${descriptionColumn} = ?`);
    params.push(desc_id);
  }

  if (date && !isValidDate(date)) {
    const error = new Error('date must be in YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }
  if (start_date && !isValidDate(start_date)) {
    const error = new Error('start_date must be in YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }
  if (end_date && !isValidDate(end_date)) {
    const error = new Error('end_date must be in YYYY-MM-DD format');
    error.statusCode = 400;
    throw error;
  }
  if (date && (start_date || end_date)) {
    const error = new Error('Use either a single date or a date range, not both');
    error.statusCode = 400;
    throw error;
  }
  if (start_date && end_date && start_date > end_date) {
    const error = new Error('start_date cannot be later than end_date');
    error.statusCode = 400;
    throw error;
  }
  if (date) {
    clauses.push(`${dateColumn} = ?`);
    params.push(date);
  } else {
    if (start_date) {
      clauses.push(`${dateColumn} >= ?`);
      params.push(start_date);
    }
    if (end_date) {
      clauses.push(`${dateColumn} <= ?`);
      params.push(end_date);
    }
  }

  return {
    sql: clauses.length ? ` AND ${clauses.join(' AND ')}` : '',
    params
  };
};

exports.getReportFilters = async (req, res) => {
  try {
    const siteId = req.query.site_id || null;
    const [sites] = await db.query(
      `SELECT sd.site_id, sd.site_name, sd.po_number, pd.project_name
       FROM site_details sd
       LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
       ORDER BY sd.site_name, sd.site_id`
    );
    const [descriptions] = await db.query(
      `SELECT DISTINCT wd.desc_id, wd.desc_name
       FROM work_descriptions wd
       JOIN (
         SELECT desc_id, site_id FROM po_reckoner
         UNION
         SELECT desc_id, site_id FROM material_assign WHERE desc_id IS NOT NULL
         UNION
         SELECT desc_id, site_id FROM labour_assignment
         UNION
         SELECT pb.desc_id, pb.site_id FROM po_budget pb
       ) report_work ON report_work.desc_id = wd.desc_id
       WHERE (? IS NULL OR report_work.site_id = ?)
       ORDER BY wd.desc_name`,
      [siteId, siteId]
    );

    res.status(200).json({ status: 'success', data: { sites, descriptions } });
  } catch (error) {
    console.error('Error in getReportFilters:', error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.statusCode ? error.message : 'Failed to load report filters'
    });
  }
};

exports.getSiteOperationsReports = async (req, res) => {
  try {
    const completionFilter = buildFilters(req, 'sd.site_id', 'pr.desc_id', 'ceh.entry_date');
    const labourFilter = buildFilters(req, 'la.site_id', 'la.desc_id', 'lat.entry_date');
    const materialFilter = buildFilters(
      req,
      'ma.site_id',
      'COALESCE(md.desc_id, ma.desc_id)',
      'muh.entry_date'
    );
    const expenseFilter = buildFilters(req, 'sd.site_id', 'pb.desc_id', 'abh.entry_date');
    const budgetFilter = buildFilters(req, 'sd.site_id', 'pb.desc_id', 'ab.created_at');
    const dateJoinClauses = [];
    const budgetParams = budgetFilter.params.slice(0, (req.query.site_id ? 1 : 0) + (req.query.desc_id ? 1 : 0));
    const dateParams = [];

    if (req.query.date) {
      dateJoinClauses.push('abh.entry_date = ?');
      dateParams.push(req.query.date);
    } else {
      if (req.query.start_date) {
        dateJoinClauses.push('abh.entry_date >= ?');
        dateParams.push(req.query.start_date);
      }
      if (req.query.end_date) {
        dateJoinClauses.push('abh.entry_date <= ?');
        dateParams.push(req.query.end_date);
      }
    }
    const budgetHistoryDateFilter = dateJoinClauses.length
      ? ` AND ${dateJoinClauses.join(' AND ')}`
      : '';
    const budgetWhere = budgetFilter.sql
      .replace(/ AND ab\.created_at (?:=|>=|<=) \?/g, '');

    const [
      [completion],
      [labour],
      [materials],
      [expenses],
      [budgetSummary]
    ] = await Promise.all([
      db.query(
        `SELECT sd.site_id, sd.site_name, pd.project_name,
                wd.desc_id, wd.desc_name AS work_description,
                ceh.entry_id, ceh.entry_date, ceh.area_added AS completed_quantity,
                pr.uom, ceh.rate, ceh.value_added AS completed_work_cost, ceh.remarks
         FROM completion_entries_history ceh
         JOIN po_reckoner pr ON pr.rec_id = ceh.rec_id
         JOIN site_details sd ON sd.site_id = pr.site_id
         LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
         LEFT JOIN work_descriptions wd ON wd.desc_id = pr.desc_id
         WHERE 1 = 1${completionFilter.sql}
         ORDER BY sd.site_name, wd.desc_name, ceh.entry_date, ceh.entry_id`,
        completionFilter.params
      ),
      db.query(
        `SELECT sd.site_id, sd.site_name, pd.project_name,
                wd.desc_id, wd.desc_name AS work_description,
                lat.id AS entry_id, lat.entry_date, l.full_name AS labour_name,
                lat.shift, COALESCE(lat.shift_cost, NULLIF(la.salary, 0), l.approved_salary, 0) AS shift_cost,
                ROUND(lat.shift * COALESCE(lat.shift_cost, NULLIF(la.salary, 0), l.approved_salary, 0), 2) AS labour_cost,
                lat.remarks
         FROM labour_attendance lat
         JOIN labour_assignment la ON la.id = lat.labour_assignment_id
         JOIN site_details sd ON sd.site_id = la.site_id
         LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
         LEFT JOIN work_descriptions wd ON wd.desc_id = la.desc_id
         LEFT JOIN labour l ON l.id = la.labour_id
         WHERE 1 = 1${labourFilter.sql}
         ORDER BY sd.site_name, wd.desc_name, lat.entry_date, l.full_name`,
        labourFilter.params
      ),
      db.query(
        `SELECT sd.site_id, sd.site_name, pd.project_name,
                wd.desc_id, wd.desc_name AS work_description,
                muh.entry_id, muh.entry_date, mm.item_name, um.uom_name,
                muh.overall_qty AS quantity, ma.rate,
                ROUND(COALESCE(muh.overall_qty, 0) * COALESCE(ma.rate, 0), 2) AS material_cost,
                muh.remarks
         FROM material_usage_history muh
         JOIN material_acknowledgement ack ON ack.id = muh.material_ack_id
         JOIN material_dispatch md ON md.id = ack.material_dispatch_id
         JOIN material_assign ma ON ma.id = md.material_assign_id
         JOIN site_details sd ON sd.site_id = ma.site_id
         LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
         LEFT JOIN work_descriptions wd ON wd.desc_id = COALESCE(md.desc_id, ma.desc_id)
         LEFT JOIN material_master mm ON mm.item_id = ma.item_id
         LEFT JOIN uom_master um ON um.uom_id = ma.uom_id
         WHERE 1 = 1${materialFilter.sql}
         ORDER BY sd.site_name, wd.desc_name, muh.entry_date, mm.item_name`,
        materialFilter.params
      ),
      db.query(
        `SELECT sd.site_id, sd.site_name, pd.project_name,
                wd.desc_id, wd.desc_name AS work_description,
                abh.id AS entry_id, abh.entry_date, o.expense_name AS budget_head,
                abh.item_description, abh.quantity, abh.uom, abh.rate,
                abh.actual_value AS expense_cost, abh.remarks
         FROM actual_budget_history abh
         JOIN actual_budget ab ON ab.id = abh.actual_budget_id
         JOIN overhead o ON o.id = ab.overhead_id
         JOIN po_budget pb ON pb.id = ab.po_budget_id
         JOIN site_details sd ON sd.site_id = pb.site_id
         LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
         LEFT JOIN work_descriptions wd ON wd.desc_id = pb.desc_id
         WHERE 1 = 1${expenseFilter.sql}
         ORDER BY sd.site_name, wd.desc_name, abh.entry_date, o.expense_name`,
        expenseFilter.params
      ),
      db.query(
        `SELECT sd.site_id, sd.site_name, pd.project_name,
                wd.desc_id, wd.desc_name AS work_description,
                o.expense_name AS budget_head,
                SUM(COALESCE(ab.splitted_budget, 0)) AS allocated_budget,
                SUM(COALESCE(abh.period_spent, 0)) AS spent,
                SUM(COALESCE(ab.splitted_budget, 0)) - SUM(COALESCE(abh.period_spent, 0)) AS balance
         FROM actual_budget ab
         JOIN overhead o ON o.id = ab.overhead_id
         JOIN po_budget pb ON pb.id = ab.po_budget_id
         JOIN site_details sd ON sd.site_id = pb.site_id
         LEFT JOIN project_details pd ON pd.pd_id = sd.pd_id
         LEFT JOIN work_descriptions wd ON wd.desc_id = pb.desc_id
         LEFT JOIN (
           SELECT actual_budget_id, SUM(actual_value) AS period_spent
           FROM actual_budget_history abh
           WHERE 1 = 1${budgetHistoryDateFilter}
           GROUP BY actual_budget_id
         ) abh ON abh.actual_budget_id = ab.id
         WHERE 1 = 1${budgetWhere}
         GROUP BY sd.site_id, sd.site_name, pd.project_name, wd.desc_id, wd.desc_name, o.expense_name
         ORDER BY sd.site_name, wd.desc_name, o.expense_name`,
        [...dateParams, ...budgetParams]
      )
    ]);

    res.status(200).json({
      status: 'success',
      data: { completion, labour, materials, expenses, budgetSummary }
    });
  } catch (error) {
    console.error('Error in getSiteOperationsReports:', error);
    res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.statusCode ? error.message : 'Failed to generate reports'
    });
  }
};
