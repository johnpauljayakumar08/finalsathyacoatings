const db = require('../config/db');

exports.test = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Material Test API is working',
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

exports.dispatchMaterialToSite = async (req, res) => {
  try {
    const assignments = Array.isArray(req.body) ? req.body : [req.body];

    if (assignments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one material assignment is required'
      });
    }

    const insertedIds = [];
    for (const { assign_date, dc_no, pd_id, site_id, item_id, uom_id, qty } of assignments) {
      if (!assign_date || !dc_no || !pd_id || !site_id || !item_id || !uom_id || qty == null) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: assign_date, dc_no, pd_id, site_id, item_id, uom_id, and qty are required'
        });
      }

      if (isNaN(dc_no) || isNaN(qty) || isNaN(uom_id)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid data types: dc_no, qty, and uom_id must be numbers'
        });
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(assign_date)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format: assign_date must be in YYYY-MM-DD format'
        });
      }

      const [result] = await db.query(
        'INSERT INTO material_dispatch (assign_date, dc_no, pd_id, site_id, item_id, uom_id, qty) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [assign_date, dc_no, pd_id, site_id, item_id, uom_id, qty]
      );
      insertedIds.push(result.insertId);
    }

    res.status(201).json({
      status: 'success',
      message: 'Materials assigned to site successfully',
      data: { insertedIds }
    });
  } catch (error) {
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pd_id, site_id, item_id, or uom_id: referenced record does not exist'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};




exports.fetchMaterialMaster = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT item_id, item_name FROM material_master');
    res.status(200).json({
      status: 'success',
      message: 'Material master records fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchProjects = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pd.pd_id,
        pd.project_name,
        c.company_name,
        c.vendor_code
      FROM project_details pd
      LEFT JOIN company c ON pd.company_id = c.company_id
    `);
    res.status(200).json({
      status: 'success',
      message: 'Projects fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};
exports.fetchSites = async (req, res) => {
  try {
    const { pd_id } = req.params;
    if (!pd_id) {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id is required'
      });
    }
    const [rows] = await db.query('SELECT site_id, site_name, po_number FROM site_details WHERE pd_id = ?', [pd_id]);
    res.status(200).json({
      status: 'success',
      message: 'Sites fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchMaterialAssignments = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        ma.assign_date,
        ma.dc_no,
        pd.project_name,
        sd.site_name,
        sd.po_number,
        mm.item_name,
        um.uom_name,
        ma.qty
      FROM material_dispatch ma
      JOIN project_details pd ON ma.pd_id = pd.pd_id
      JOIN site_details sd ON ma.site_id = sd.site_id
      JOIN material_master mm ON ma.item_id = mm.item_id
      JOIN uom_master um ON ma.uom_id = um.uom_id
    `);
    
    res.status(200).json({
      status: 'success',
      message: 'Material assignments fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchUomMaster = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT uom_id, uom_name FROM uom_master');
    res.status(200).json({
      status: 'success',
      message: 'UOM master records fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchDesignations = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, designation FROM emp_designation');
    const designations = rows.map(row => ({ id: row.id, designation: row.designation }));
    res.status(200).json({
      status: 'success',
      message: 'Designations fetched successfully',
      data: designations
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};


exports.fetchEmployees = async (req, res) => {
  try {
    const query = `
      SELECT 
        em.emp_id,
        em.full_name,
        COALESCE(eg.gender, 'Unknown') AS gender,
        em.date_of_birth,
        em.date_of_joining,
        COALESCE(es.status, 'Unknown') AS status,
        em.company,
        COALESCE(ed.department, 'Unknown') AS department,
        COALESCE(et.type, 'Unknown') AS employment_type,
        COALESCE(edg.designation, 'Unknown') AS designation,
        em.branch,
        em.mobile,
        em.company_email,
        em.current_address,
        em.permanent_address,
        em.esic_number,
        em.pf_number,
        em.created_at,
        em.approved_salary
      FROM employee_master em
      LEFT JOIN emp_gender eg ON em.gender_id = eg.id
      LEFT JOIN emp_department ed ON em.dept_id = ed.id
      LEFT JOIN employment_type et ON em.emp_type_id = et.id
      LEFT JOIN emp_designation edg ON em.designation_id = edg.id
      LEFT JOIN emp_status es ON em.status_id = es.id
      ORDER BY em.created_at DESC
    `;

    const [rows] = await db.query(query);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Employees fetched successfully' : 'No employees found',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching employees:', error.message, error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch employee details',
      error: error.message
    });
  }
};


exports.assignInchargeToSite = async (req, res) => {
  try {
    const assignments = Array.isArray(req.body) ? req.body : [req.body];

    if (assignments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one incharge assignment is required'
      });
    }

    const insertedIds = [];
    for (const { from_date, to_date, pd_id, site_id, emp_id, desc_id, created_by } of assignments) {
      // Validate required fields
      if (!from_date || !to_date || !pd_id || !site_id || !emp_id || !created_by) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing required fields: from_date, to_date, pd_id, site_id, emp_id, and created_by are required'
        });
      }

      // Validate date formats
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from_date) || !/^\d{4}-\d{2}-\d{2}$/.test(to_date)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid date format: from_date and to_date must be in YYYY-MM-DD format'
        });
      }

      // Validate date logic
      const fromDate = new Date(from_date);
      const toDate = new Date(to_date);
      if (toDate < fromDate) {
        return res.status(400).json({
          status: 'error',
          message: 'to_date must be after from_date'
        });
      }

      // Validate emp_id
      const [employee] = await db.query('SELECT emp_id FROM employee_master WHERE emp_id = ?', [emp_id]);
      if (employee.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid emp_id: ${emp_id} does not exist in employee_master`
        });
      }

      // Validate desc_id if provided
      if (desc_id) {
        const [desc] = await db.query('SELECT desc_id FROM work_descriptions WHERE desc_id = ?', [desc_id]);
        if (desc.length === 0) {
          return res.status(400).json({
            status: 'error',
            message: `Invalid desc_id: ${desc_id} does not exist in work_descriptions`
          });
        }
      }

      // Validate created_by format (VARCHAR(30))
      if (typeof created_by !== 'string' || created_by.trim() === '' || created_by.length > 30) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid created_by: must be a non-empty string with maximum length of 30 characters'
        });
      }

      // Optional: Validate created_by against a reference table (e.g., employee_master or users)
      // Uncomment and adjust if created_by references a specific table
      /*
      const [createdBy] = await db.query('SELECT emp_id FROM employee_master WHERE emp_id = ?', [created_by]);
      if (createdBy.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: `Invalid created_by: ${created_by} does not exist in employee_master`
        });
      }
      */

      // Insert into siteincharge_assign
      const [result] = await db.query(
        'INSERT INTO siteincharge_assign (from_date, to_date, pd_id, site_id, desc_id, emp_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [from_date, to_date, pd_id, site_id, desc_id || null, emp_id, created_by]
      );
      insertedIds.push(result.insertId);
    }

    res.status(201).json({
      status: 'success',
      message: 'Incharges assigned to site successfully',
      data: { insertedIds }
    });
  } catch (error) {
    console.error('Error in assignInchargeToSite:', {
      message: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
      stack: error.stack
    });
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid pd_id, site_id, desc_id, emp_id, or created_by: referenced record does not exist'
      });
    }
    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        status: 'error',
        message: 'Database schema error: check table structure for siteincharge_assign',
        error: error.message,
        sqlMessage: error.sqlMessage || 'No SQL message available'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available'
    });
  }
};


exports.addEmployee = async (req, res) => {
  try {
    const {
      emp_id, full_name, gender_id, date_of_birth, date_of_joining, status_id,
      company, dept_id, emp_type_id, designation_id, branch,
      mobile, company_email, current_address, permanent_address,
      esic_number, pf_number, approved_salary, created_by // Added created_by
    } = req.body;

    // Check for missing required fields
    if (
      !emp_id || !full_name || !gender_id || !date_of_birth || !date_of_joining ||
      !status_id || !company || !dept_id || !emp_type_id || !designation_id ||
      !branch || !mobile || !company_email || !current_address || !permanent_address ||
      !approved_salary || !created_by // Added to required check
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'All required fields (except ESIC and PF numbers) must be provided',
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date_of_birth) || !dateRegex.test(date_of_joining)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date format: date_of_birth and date_of_joining must be in YYYY-MM-DD format',
      });
    }

    // Validate mobile (allow +91 optional, 10 digits)
    const mobileRegex = /^(?:\+91)?\d{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid mobile number: must be 10 digits, with optional +91 prefix',
      });
    }

    // Validate email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(company_email)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid email format',
      });
    }

    // Validate approved_salary (positive number, up to 2 decimal places)
    const salaryRegex = /^\d+(\.\d{1,2})?$/;
    if (!salaryRegex.test(approved_salary) || parseFloat(approved_salary) <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid approved_salary: must be a positive number with up to 2 decimal places',
      });
    }

    // Validate created_by
    if (typeof created_by !== 'string' || created_by.trim() === '') {
      return res.status(400).json({
        status: "error",
        message: "Created By is required and must be a non-empty string",
      });
    }

    // Verify if created_by exists in the users table (assuming a users table exists)
    const [userExists] = await db.query('SELECT user_id FROM users WHERE user_id = ?', [created_by]);
    if (!userExists.length) {
      return res.status(400).json({
        status: "error",
        message: "Invalid Created By: User does not exist",
      });
    }

    // Check for duplicates
    const [existingEmpId] = await db.query('SELECT emp_id FROM employee_master WHERE emp_id = ?', [emp_id]);
    if (existingEmpId.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID already exists',
      });
    }

    const [existingEmail] = await db.query('SELECT company_email FROM employee_master WHERE company_email = ?', [company_email]);
    if (existingEmail.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Company email already exists',
      });
    }

    // Validate foreign keys
    const [gender] = await db.query('SELECT id FROM emp_gender WHERE id = ?', [gender_id]);
    if (gender.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid gender_id: gender does not exist',
      });
    }

    const [department] = await db.query('SELECT id FROM emp_department WHERE id = ?', [dept_id]);
    if (department.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid dept_id: department does not exist',
      });
    }

    const [empType] = await db.query('SELECT id FROM employment_type WHERE id = ?', [emp_type_id]);
    if (empType.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid emp_type_id: employment type does not exist',
      });
    }

    const [designation] = await db.query('SELECT id FROM emp_designation WHERE id = ?', [designation_id]);
    if (designation.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid designation_id: designation does not exist',
      });
    }

    const [status] = await db.query('SELECT id FROM emp_status WHERE id = ?', [status_id]);
    if (status.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status_id: status does not exist',
      });
    }

    // Insert employee
    const [result] = await db.query(
      `INSERT INTO employee_master (
        emp_id, full_name, gender_id, date_of_birth, date_of_joining, status_id,
        company, dept_id, emp_type_id, designation_id, branch,
        mobile, company_email, current_address, permanent_address,
        esic_number, pf_number, approved_salary, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        emp_id, full_name, gender_id, date_of_birth, date_of_joining, status_id,
        company, dept_id, emp_type_id, designation_id, branch,
        mobile, company_email, current_address, permanent_address,
        esic_number || null, pf_number || null, parseFloat(approved_salary), created_by // Handle optional fields and convert salary to float, add created_by
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Employee added successfully',
      data: { emp_id, full_name, designation_id, status_id, approved_salary },
    });
  } catch (error) {
    console.error('Error adding employee:', error.message, error.stack);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID or email already exists',
      });
    }
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid foreign key: one of gender_id, dept_id, emp_type_id, designation_id, or status_id does not exist',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Failed to add employee due to server error',
      error: error.message,
    });
  }
};

exports.getAssignedIncharges = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        sia.id,
        sia.pd_id,
        COALESCE(pd.project_name, 'Unknown') AS project_name,
        sia.site_id,
        COALESCE(sd.site_name, 'Unknown') AS site_name,
        COALESCE(sd.po_number, 'Unknown') AS po_number,
        sia.emp_id,
        COALESCE(em.full_name, 'Unknown') AS full_name,
        COALESCE(edg.designation, 'Unknown') AS designation,
        COALESCE(em.mobile, 'Unknown') AS mobile,
        COALESCE(es.status, 'Unknown') AS status,
        sia.from_date,
        sia.to_date,
        COALESCE(em.company_email, 'Unknown') AS company_email,
        COALESCE(em.current_address, 'Unknown') AS current_address,
        COALESCE(em.permanent_address, 'Unknown') AS permanent_address,
        COALESCE(em.dept_id, 'Unknown') AS dept_id,
        COALESCE(ed.department, 'Unknown') AS department
      FROM siteincharge_assign sia
      LEFT JOIN project_details pd ON sia.pd_id = pd.pd_id
      LEFT JOIN site_details sd ON sia.site_id = sd.site_id
      LEFT JOIN employee_master em ON sia.emp_id = em.emp_id
      LEFT JOIN emp_designation edg ON em.designation_id = edg.id
      LEFT JOIN emp_status es ON em.status_id = es.id
      LEFT JOIN emp_department ed ON em.dept_id = ed.id
      ORDER BY sia.from_date DESC
    `);

    if (!rows || rows.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No assigned incharges found',
        data: []
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Assigned incharges fetched successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching assigned incharges:', error.message, error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch assigned incharge details',
      error: error.message
    });
  }
};


exports.fetchGenders = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, gender FROM emp_gender');
    res.status(200).json({
      status: 'success',
      message: 'Genders fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchDepartments = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, department FROM emp_department');
    res.status(200).json({
      status: 'success',
      message: 'Departments fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchEmploymentTypes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, type FROM employment_type');
    res.status(200).json({
      status: 'success',
      message: 'Employment types fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.fetchStatuses = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, status FROM emp_status');
    res.status(200).json({
      status: 'success',
      message: 'Statuses fetched successfully',
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.addGender = async (req, res) => {
  try {
    const { gender } = req.body;
    if (!gender) {
      return res.status(400).json({
        status: 'error',
        message: 'Gender is required'
      });
    }

    const [existing] = await db.query('SELECT id FROM emp_gender WHERE gender = ?', [gender]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Gender already exists'
      });
    }

    const [result] = await db.query('INSERT INTO emp_gender (gender) VALUES (?)', [gender]);
    res.status(201).json({
      status: 'success',
      message: 'Gender added successfully',
      data: { id: result.insertId, gender }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Gender already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.addDepartment = async (req, res) => {
  try {
    const { department } = req.body;
    if (!department) {
      return res.status(400).json({
        status: 'error',
        message: 'Department is required'
      });
    }

    const [existing] = await db.query('SELECT id FROM emp_department WHERE department = ?', [department]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Department already exists'
      });
    }

    const [result] = await db.query('INSERT INTO emp_department (department) VALUES (?)', [department]);
    res.status(201).json({
      status: 'success',
      message: 'Department added successfully',
      data: { id: result.insertId, department }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Department already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.addEmploymentType = async (req, res) => {
  try {
    const { type } = req.body;
    if (!type) {
      return res.status(400).json({
        status: 'error',
        message: 'Employment type is required'
      });
    }

    const [existing] = await db.query('SELECT id FROM employment_type WHERE type = ?', [type]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Employment type already exists'
      });
    }

    const [result] = await db.query('INSERT INTO employment_type (type) VALUES (?)', [type]);
    res.status(201).json({
      status: 'success',
      message: 'Employment type added successfully',
      data: { id: result.insertId, type }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Employment type already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.addDesignation = async (req, res) => {
  try {
    const { designation } = req.body;
    if (!designation) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation is required'
      });
    }

    const [existing] = await db.query('SELECT id FROM emp_designation WHERE designation = ?', [designation]);
    if (existing.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Designation already exists'
      });
    }

    const [result] = await db.query('INSERT INTO emp_designation (designation) VALUES (?)', [designation]);
    res.status(201).json({
      status: 'success',
      message: 'Designation added successfully',
      data: { id: result.insertId, designation }
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Designation already exists'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

exports.getAssignedMaterials = async (req, res) => {
  const { site_id, desc_id, projection_id } = req.query;

  console.log('Fetching assignments with params:', { site_id, desc_id, projection_id });

  if (!site_id || !desc_id || !projection_id) {
    console.log('Invalid parameters provided:', { site_id, desc_id, projection_id });
    return res.status(400).json({ 
      status: "error", 
      message: "site_id, desc_id, and projection_id are required" 
    });
  }

  if (isNaN(desc_id) || isNaN(projection_id)) {
    console.log('Invalid desc_id or projection_id:', { desc_id, projection_id });
    return res.status(400).json({ 
      status: "error", 
      message: "desc_id and projection_id must be valid numbers" 
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT ma.id, ma.pd_id, ma.site_id, ma.item_id, ma.uom_id, ma.quantity, ma.created_at, 
              ma.comp_ratio_a, ma.comp_ratio_b, ma.comp_ratio_c, ma.desc_id, ma.rate, ma.created_by, ma.projection_id,
              mm.item_name, um.uom_name 
       FROM material_assign ma
       LEFT JOIN material_master mm ON ma.item_id = mm.item_id
       LEFT JOIN uom_master um ON ma.uom_id = um.uom_id
       WHERE ma.site_id = ? AND ma.desc_id = ? AND ma.projection_id = ?`,
      [site_id, parseInt(desc_id), parseInt(projection_id)]
    );

    console.log('Fetched assignments count:', rows.length);

    // If only one row, return as object; otherwise array
    const data = rows.length === 1 ? rows[0] : rows;

    res.status(200).json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching material assignments:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to fetch assignments",
      error: error.message 
    });
  }
};



exports.assignMaterial = async (req, res) => {
  let connection;
  try {
    const assignments = Array.isArray(req.body) ? req.body : [req.body];

    // Validate each assignment
    const validationErrors = [];
    assignments.forEach((assignment, index) => {
      const {
        id, // New: for update
        pd_id,
        site_id,
        item_id,
        uom_id,
        quantity,
        desc_id,
        comp_ratio_a,
        comp_ratio_b,
        comp_ratio_c,
        rate,
        materialTotalCost,
        materialBudgetPercentage,
        created_by,
        projection_id // Ensure projection_id is validated
      } = assignment;

      if (!pd_id || typeof pd_id !== "string" || pd_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: pd_id is required and must be a non-empty string`);
      }
      if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: site_id is required and must be a non-empty string`);
      }
      if (!item_id || typeof item_id !== "string" || item_id.trim() === "" || item_id === "N/A") {
        validationErrors.push(`Assignment ${index + 1}: item_id is required and must be a valid material ID (not 'N/A')`);
      }
      if (!Number.isInteger(uom_id) || uom_id <= 0) {
        validationErrors.push(`Assignment ${index + 1}: uom_id is required and must be a positive integer`);
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        validationErrors.push(`Assignment ${index + 1}: quantity is required and must be a positive integer`);
      }
      if (!desc_id || typeof desc_id !== "string" || desc_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: desc_id is required and must be a non-empty string`);
      }
      if (comp_ratio_a !== null && (!Number.isInteger(comp_ratio_a) || comp_ratio_a < 0)) {
        validationErrors.push(`Assignment ${index + 1}: comp_ratio_a must be a non-negative integer or null`);
      }
      if (comp_ratio_b !== null && (!Number.isInteger(comp_ratio_b) || comp_ratio_b < 0)) {
        validationErrors.push(`Assignment ${index + 1}: comp_ratio_b must be a non-negative integer or null`);
      }
      if (comp_ratio_c !== null && (!Number.isInteger(comp_ratio_c) || comp_ratio_c < 0)) {
        validationErrors.push(`Assignment ${index + 1}: comp_ratio_c must be a non-negative integer or null`);
      }
      if (rate === undefined || typeof rate !== "number" || rate < 0 || isNaN(rate)) {
        validationErrors.push(`Assignment ${index + 1}: rate is required and must be a non-negative number`);
      }
      if (!created_by || typeof created_by !== 'string' || created_by.trim() === '' || created_by.length > 30) {
        validationErrors.push(`Assignment ${index + 1}: created_by is required and must be a non-empty string with maximum length of 30 characters`);
      }
      if (!projection_id || isNaN(projection_id)) {
        validationErrors.push(`Assignment ${index + 1}: projection_id is required and must be a valid number`);
      }
      // For updates, validate id
      if (id && (isNaN(id) || id <= 0)) {
        validationErrors.push(`Assignment ${index + 1}: id must be a positive integer for updates`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    // Get materialTotalCost and materialBudgetPercentage from the first assignment (assuming they are the same for all)
    const { site_id, desc_id, materialTotalCost = 0, materialBudgetPercentage = 0 } = assignments[0];

    // Validate that materialTotalCost and materialBudgetPercentage are provided
    if (materialTotalCost === undefined || materialBudgetPercentage === undefined) {
      return res.status(400).json({
        status: "error",
        message: "materialTotalCost and materialBudgetPercentage are required",
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Step 1: Get overhead_type_id for material
    const [overheadRows] = await connection.query('SELECT id FROM overhead WHERE expense_name = ? LIMIT 1', ["materials"]);
    if (overheadRows.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid overhead type: 'materials' not found",
      });
    }
    const overhead_type_id = overheadRows[0].id;

    let insertedIds = [];
    let updatedIds = [];

    // Process each assignment (insert or update)
    for (const { id, pd_id, site_id, item_id, uom_id, quantity, desc_id, comp_ratio_a, comp_ratio_b, comp_ratio_c, rate, created_by, projection_id } of assignments) {
      const parsed_desc_id = parseInt(desc_id);
      if (isNaN(parsed_desc_id)) {
        await connection.rollback();
        return res.status(400).json({
          status: "error",
          message: `Invalid desc_id: must be convertible to integer`,
        });
      }

      if (id) {
        // Update existing
        const [updateResult] = await connection.query(
          `UPDATE material_assign 
           SET pd_id = ?, site_id = ?, item_id = ?, uom_id = ?, quantity = ?, desc_id = ?, comp_ratio_a = ?, comp_ratio_b = ?, comp_ratio_c = ?, rate = ?, projection_id = ?, updated_at = CURRENT_TIMESTAMP 
           WHERE id = ?`,
          [pd_id, site_id, item_id, uom_id, quantity, parsed_desc_id, comp_ratio_a || null, comp_ratio_b || null, comp_ratio_c || null, rate, projection_id, id]
        );
        if (updateResult.affectedRows === 0) {
          await connection.rollback();
          return res.status(404).json({ status: "error", message: `Assignment with id ${id} not found` });
        }
        updatedIds.push(id);
      } else {
        // Insert new
        const [insertResult] = await connection.query(
          `INSERT INTO material_assign (pd_id, site_id, item_id, uom_id, quantity, desc_id, comp_ratio_a, comp_ratio_b, comp_ratio_c, rate, created_by, created_at, projection_id) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)`,
          [pd_id, site_id, item_id, uom_id, quantity, parsed_desc_id, comp_ratio_a || null, comp_ratio_b || null, comp_ratio_c || null, rate, created_by, projection_id]
        );
        insertedIds.push(insertResult.insertId);
      }
    }

    // Update projection_allocated with recalculated total (always recalculate for the projection_id from first assignment)
    const firstProjectionId = assignments[0].projection_id;
    const [matSum] = await connection.query(
      `SELECT SUM(quantity * rate) AS total_cost FROM material_assign 
       WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
      [site_id, desc_id, firstProjectionId]
    );
    const total_cost = parseFloat(matSum[0].total_cost) || 0;
    const [budgetRows] = await connection.query(
      `SELECT total_budget_value FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?`,
      [site_id, desc_id, firstProjectionId]
    );
    const budget_value = parseFloat(budgetRows[0]?.total_budget_value) || 0;
    const budget_percentage = budget_value > 0 ? (total_cost / budget_value * 100) : 0;

    await connection.query(
      `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       ON DUPLICATE KEY UPDATE total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP`,
      [site_id, desc_id, overhead_type_id, firstProjectionId, total_cost, budget_percentage, total_cost, budget_percentage]
    );

    await connection.commit();
    res.status(201).json({
      status: "success",
      message: `Materials ${insertedIds.length > 0 ? 'assigned' : 'updated'} successfully`,
      data: { insertedIds, updatedIds },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in assignMaterial:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Invalid reference: pd_id, site_id, item_id, uom_id, or desc_id does not exist in the database",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
};
exports.checkDescAssigned = async (req, res) => {
  try {
    const { site_id, desc_id } = req.query;

    if (!site_id || !desc_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id and desc_id are required',
      });
    }

    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM material_assign WHERE site_id = ? AND desc_id = ?',
      [site_id, desc_id]
    );

    const isAssigned = rows[0].count > 0;

    res.status(200).json({
      status: 'success',
      message: isAssigned ? 'Description is assigned' : 'Description is not assigned',
      data: { isAssigned },
    });
  } catch (error) {
    console.error('Error checking description assignment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check description assignment',
      error: error.message,
    });
  }
};


exports.fetchWorkDescriptions = async (req, res) => {
  try {
    const { site_id } = req.query;

    if (!site_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id is required',
      });
    }

    // Fetch desc_ids from po_reckoner for the given site_id
    const [poRows] = await db.query(
      'SELECT DISTINCT desc_id FROM po_reckoner WHERE site_id = ?',
      [site_id]
    );

    if (poRows.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'No work descriptions found for the selected site',
        data: [],
      });
    }

    const descIds = poRows.map(row => row.desc_id);

    // Fetch already assigned desc_ids from material_assign for the site
    const [assignedRows] = await db.query(
      'SELECT DISTINCT desc_id FROM material_assign WHERE site_id = ? AND desc_id IS NOT NULL',
      [site_id]
    );
    const assignedDescIds = assignedRows.map(row => row.desc_id);

    // Filter out assigned desc_ids
    const availableDescIds = descIds.filter(desc_id => !assignedDescIds.includes(desc_id));

    if (availableDescIds.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'All work descriptions for this site are already assigned',
        data: [],
      });
    }

    // Fetch desc_name for available desc_ids
    const [descRows] = await db.query(
      'SELECT desc_id, desc_name FROM work_descriptions WHERE desc_id IN (?)',
      [availableDescIds]
    );

    res.status(200).json({
      status: 'success',
      message: 'Work descriptions fetched successfully',
      data: descRows,
    });
  } catch (error) {
    console.error('Error fetching work descriptions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch work descriptions',
      error: error.message,
    });
  }
};


exports.getNextDcNo = async function (req, res) {
  try {
    // Log incoming request details for debugging (optional, remove in production)
    console.log('Request query:', req.query);

    // Get site_id from query parameters
    const site_id = req.query.site_id;

    // Validate site_id
    if (!site_id) {
      return res.status(400).json({
        status: 'error',
        message: 'site_id is required and must be a valid number in query parameters'
      });
    }

    console.log('Using site_id:', site_id);

    // Step 1: Verify if the site has any assignments (optional check for early exit)
    const [assignCheck] = await db.query(
      'SELECT COUNT(*) as count FROM material_assign WHERE site_id = ?',
      [site_id]
    );

    if (assignCheck[0].count === 0) {
      // If no assignments for site, start DC No from 1
      return res.status(200).json({
        status: 'success',
        message: 'No prior assignments found; starting DC No from 1',
        data: { next_dc_no: 1, site_id: parseInt(site_id) }
      });
    }

    // Step 2: Fetch the maximum dc_no for all dispatches linked to this site
    // Using JOIN to link material_dispatch to material_assign via site_id
    const [dispatchRows] = await db.query(
      `SELECT MAX(md.dc_no) AS max_dc_no 
       FROM material_dispatch md 
       INNER JOIN material_assign ma ON md.material_assign_id = ma.id 
       WHERE ma.site_id = ?`,
      [site_id]
    );

    // Handle null max_dc_no (no prior dispatches for site)
    const maxDcNo = dispatchRows[0]?.max_dc_no || 0;
    const nextDcNo = maxDcNo + 1;

    console.log('Site-wise max_dc_no:', maxDcNo, 'Next DC No:', nextDcNo);

    res.status(200).json({
      status: 'success',
      message: 'Next site-wise DC No fetched successfully',
      data: { next_dc_no: nextDcNo, site_id: parseInt(site_id) }
    });
  } catch (error) {
    console.error('Error fetching next DC No:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch next DC No due to server error',
      error: error.message // Remove in production for security
    });
  }
};




exports.addMaterialDispatch = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { assignments, transport, created_by } = req.body;

    if (!created_by) {
      await connection.rollback();
      return res.status(400).json({
        status: "error",
        message: "Created By is required",
      });
    }

    // Validate dispatch assignments (if provided)
    let dispatchInsertedIds = [];
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      const validationErrors = [];
      const conflicts = [];
      for (const assignment of assignments) {
        const { material_assign_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty, comp_a_qty, comp_b_qty, comp_c_qty, comp_a_remarks, comp_b_remarks, comp_c_remarks } = assignment;

        if (!material_assign_id || isNaN(material_assign_id)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: material_assign_id is required and must be a number`);
        }
        if (!dc_no || isNaN(dc_no)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dc_no is required and must be a number`);
        }
        if (!dispatch_date || !/^\d{4}-\d{2}-\d{2}$/.test(dispatch_date)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dispatch_date is required and must be in YYYY-MM-DD format`);
        }
        if (!order_no || typeof order_no !== 'string' || order_no.trim() === '') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: order_no is required and must be a non-empty string`);
        }
        if (!vendor_code || typeof vendor_code !== 'string' || vendor_code.trim() === '') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: vendor_code is required and must be a non-empty string`);
        }
        if (!Number.isFinite(dispatch_qty) || dispatch_qty <= 0) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: dispatch_qty is required and must be a positive number`);
        }
        if (comp_a_qty !== null && (!Number.isInteger(comp_a_qty) || comp_a_qty < 0)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_a_qty must be a non-negative integer or null`);
        }
        if (comp_b_qty !== null && (!Number.isInteger(comp_b_qty) || comp_b_qty < 0)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_b_qty must be a non-negative integer or null`);
        }
        if (comp_c_qty !== null && (!Number.isInteger(comp_c_qty) || comp_c_qty < 0)) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_c_qty must be a non-negative integer or null`);
        }
        if (comp_a_remarks !== null && typeof comp_a_remarks !== 'string') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_a_remarks must be a string or null`);
        }
        if (comp_b_remarks !== null && typeof comp_b_remarks !== 'string') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_b_remarks must be a string or null`);
        }
        if (comp_c_remarks !== null && typeof comp_c_remarks !== 'string') {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: comp_c_remarks must be a string or null`);
        }

        const componentQuantities = [comp_a_qty, comp_b_qty, comp_c_qty];
        const hasComponentBreakdown = componentQuantities.some((quantity) => quantity !== null);
        const componentTotal = componentQuantities.reduce((sum, quantity) => sum + (quantity || 0), 0);
        if (hasComponentBreakdown && componentTotal !== dispatch_qty) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: Component quantities must add up to dispatch_qty`);
        }

        // Fetch assigned quantity and current dispatched
        const [maRow] = await connection.query('SELECT quantity FROM material_assign WHERE id = ?', [material_assign_id]);
        if (maRow.length === 0) {
          validationErrors.push(`Assignment for material_assign_id ${material_assign_id}: Invalid material_assign_id, does not exist`);
          continue;
        }
        const assigned_quantity = maRow[0].quantity;

        const [currentDispatched] = await connection.query(
          'SELECT COALESCE(SUM(dispatch_qty), 0) AS total_dispatched FROM material_dispatch WHERE material_assign_id = ?',
          [material_assign_id]
        );
        const total_dispatched = parseFloat(currentDispatched[0].total_dispatched);

        if (total_dispatched + dispatch_qty > assigned_quantity) {
          const [itemRow] = await connection.query(
            'SELECT mm.item_name FROM material_assign ma JOIN material_master mm ON ma.item_id = mm.item_id WHERE ma.id = ?',
            [material_assign_id]
          );
          conflicts.push({
            material_assign_id,
            item_name: itemRow[0]?.item_name || 'Unknown'
          });
        }
      }

      if (validationErrors.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Validation errors in dispatch assignments',
          errors: validationErrors,
        });
      }

      if (conflicts.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'already_dispatched',
          message: 'Some materials would exceed the assigned quantity if dispatched',
          conflicts,
        });
      }

      // Insert dispatch assignments
      dispatchInsertedIds = [];
      for (const { material_assign_id, desc_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty, comp_a_qty, comp_b_qty, comp_c_qty, comp_a_remarks, comp_b_remarks, comp_c_remarks } of assignments) {

        const [result] = await connection.query(
          'INSERT INTO material_dispatch (material_assign_id, desc_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty, comp_a_qty, comp_b_qty, comp_c_qty, comp_a_remarks, comp_b_remarks, comp_c_remarks, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)',
          [material_assign_id, desc_id, dc_no, dispatch_date, order_no, vendor_code, dispatch_qty, comp_a_qty, comp_b_qty, comp_c_qty, comp_a_remarks, comp_b_remarks, comp_c_remarks, created_by]
        );
        dispatchInsertedIds.push({ material_assign_id, dispatch_id: result.insertId });
      }
    }

    // Validate and insert transport details (if assignments exist)
    let transportInsertedIds = [];
    if (dispatchInsertedIds.length > 0 && transport) {
      let { transport_type_id, provider_id, vehicle_id, driver_id, destination, booking_expense, travel_expense, provider_address, provider_mobile, vehicle_model, vehicle_number, driver_mobile, driver_address } = transport;

      // Validate transport fields
      const transportValidationErrors = [];
      if (!transport_type_id || isNaN(transport_type_id)) {
        transportValidationErrors.push('Transport: transport_type_id is required and must be a number');
      } else {
        const [typeExists] = await connection.query('SELECT id FROM transport_type WHERE id = ? AND id IN (1, 2)', [transport_type_id]);
        if (!typeExists.length) {
          transportValidationErrors.push('Transport: transport_type_id must be 1 (Own Vehicle) or 2 (Rental Vehicle)');
        }
      }
      if (!provider_id || (typeof provider_id === 'string' && provider_id.trim() === '')) {
        transportValidationErrors.push('Transport: provider_id is required and must be a non-empty string or number');
      }
      if (!vehicle_id || (typeof vehicle_id === 'string' && vehicle_id.trim() === '')) {
        transportValidationErrors.push('Transport: vehicle_id is required and must be a non-empty string or number');
      }
      if (!driver_id || (typeof driver_id === 'string' && driver_id.trim() === '')) {
        transportValidationErrors.push('Transport: driver_id is required and must be a non-empty string or number');
      }
      if (!destination || typeof destination !== 'string' || destination.trim() === '') {
        transportValidationErrors.push('Transport: destination is required and must be a non-empty string');
      }
      if (transport_type_id === 2 && (booking_expense === null || isNaN(booking_expense) || booking_expense < 0)) {
        transportValidationErrors.push('Transport: booking_expense is required for Rental Vehicle and must be a non-negative number');
      }
      if (booking_expense !== null && (isNaN(booking_expense) || booking_expense < 0)) {
        transportValidationErrors.push('Transport: booking_expense must be a non-negative number or null');
      }
      if (!travel_expense || isNaN(travel_expense) || travel_expense < 0) {
        transportValidationErrors.push('Transport: travel_expense is required and must be a non-negative number');
      }

      if (transportValidationErrors.length > 0) {
        await connection.rollback();
        return res.status(400).json({
          status: 'error',
          message: 'Validation errors in transport details',
          errors: transportValidationErrors,
        });
      }

      // Handle provider_id
      if (typeof provider_id === 'string') {
        const [existingProvider] = await connection.query('SELECT id FROM provider_master WHERE provider_name = ?', [provider_id]);
        if (existingProvider.length > 0) {
          provider_id = existingProvider[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO provider_master (provider_name, address, mobile, transport_type_id) VALUES (?, ?, ?, ?)',
            [provider_id, provider_address || null, provider_mobile || null, transport_type_id]
          );
          provider_id = result.insertId;
        }
      } else {
        const [providerExists] = await connection.query('SELECT id FROM provider_master WHERE id = ?', [provider_id]);
        if (!providerExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid provider_id: Provider does not exist',
          });
        }
      }

      // Handle vehicle_id
      if (typeof vehicle_id === 'string') {
        const [existingVehicle] = await connection.query('SELECT id FROM vehicle_master WHERE vehicle_name = ? OR vehicle_number = ?', [vehicle_id, vehicle_id]);
        if (existingVehicle.length > 0) {
          vehicle_id = existingVehicle[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO vehicle_master (vehicle_name, vehicle_model, vehicle_number) VALUES (?, ?, ?)',
            [vehicle_id, vehicle_model || null, vehicle_number || vehicle_id]
          );
          vehicle_id = result.insertId;
        }
      } else {
        const [vehicleExists] = await connection.query('SELECT id FROM vehicle_master WHERE id = ?', [vehicle_id]);
        if (!vehicleExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid vehicle_id: Vehicle does not exist',
          });
        }
      }

      // Handle driver_id
      if (typeof driver_id === 'string') {
        const [existingDriver] = await connection.query('SELECT id FROM driver_master WHERE driver_name = ?', [driver_id]);
        if (existingDriver.length > 0) {
          driver_id = existingDriver[0].id;
        } else {
          const [result] = await connection.query(
            'INSERT INTO driver_master (driver_name, driver_mobile, driver_address) VALUES (?, ?, ?)',
            [driver_id, driver_mobile || null, driver_address || null]
          );
          driver_id = result.insertId;
        }
      } else {
        const [driverExists] = await connection.query('SELECT id FROM driver_master WHERE id = ?', [driver_id]);
        if (!driverExists.length) {
          await connection.rollback();
          return res.status(400).json({
            status: 'error',
            message: 'Invalid driver_id: Driver does not exist',
          });
        }
      }

      // Insert transport details for each dispatch
      for (const { dispatch_id } of dispatchInsertedIds) {
        const [result] = await connection.query(
          'INSERT INTO transport_master (dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense, travel_expense, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
          [dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense || null, travel_expense]
        );
        transportInsertedIds.push(result.insertId);
      }
    }

    await connection.commit();
    res.status(201).json({
      status: 'success',
      message: 'Materials dispatched and transport details saved successfully',
      data: {
        dispatchInsertedIds,
        transportInsertedIds
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('Add dispatch error:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reference: material_assign_id, provider_id, vehicle_id, or driver_id does not exist',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  } finally {
    connection.release();
  }
};





exports.fetchMaterialAssignmentsWithDispatch = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { pd_id, site_id } = req.query;

    // Base query
    let query = `
      SELECT 
        ma.id,
        ma.pd_id,
        ma.site_id,
        ma.item_id,
        ma.uom_id,
        ma.quantity,
        ma.comp_ratio_a,
        ma.comp_ratio_b,
        ma.comp_ratio_c,
        ma.desc_id,
        ma.created_at,
        mm.item_name,
        um.uom_name,
        wd.desc_name,
        pd.project_name,
        pd.company_id,
        cd.vendor_code,
        sd.site_name,
        sd.po_number,
        COALESCE(SUM(md.dispatch_qty), 0) AS total_dispatched,
        (ma.quantity - COALESCE(SUM(md.dispatch_qty), 0)) AS remaining_quantity,
        CASE 
          WHEN ma.quantity - COALESCE(SUM(md.dispatch_qty), 0) > 0 THEN 'not-dispatched'
          ELSE 'dispatched'
        END AS dispatch_status
      FROM material_assign ma
      LEFT JOIN material_master mm ON ma.item_id = mm.item_id
      LEFT JOIN uom_master um ON ma.uom_id = um.uom_id
      LEFT JOIN work_descriptions wd ON ma.desc_id = wd.desc_id
      LEFT JOIN project_details pd ON ma.pd_id = pd.pd_id
      LEFT JOIN company cd ON pd.company_id = cd.company_id
      LEFT JOIN site_details sd ON ma.site_id = sd.site_id
      LEFT JOIN material_dispatch md ON ma.id = md.material_assign_id
      WHERE 1=1
    `;
    const queryParams = [];

    // Add filters based on provided parameters
    if (pd_id && site_id) {
      query += ' AND ma.pd_id = ? AND ma.site_id = ?';
      queryParams.push(pd_id, site_id);
    } else if (pd_id) {
      query += ' AND ma.pd_id = ?';
      queryParams.push(pd_id);
    } else if (site_id) {
      query += ' AND ma.site_id = ?';
      queryParams.push(site_id);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'At least one of pd_id or site_id is required',
      });
    }

    // Group by all non-aggregated columns and filter for non-dispatched materials
    query += `
      GROUP BY 
        ma.id,
        ma.pd_id,
        ma.site_id,
        ma.item_id,
        ma.uom_id,
        ma.quantity,
        ma.comp_ratio_a,
        ma.comp_ratio_b,
        ma.comp_ratio_c,
        ma.desc_id,
        ma.created_at,
        mm.item_name,
        um.uom_name,
        wd.desc_name,
        pd.project_name,
        pd.company_id,
        cd.vendor_code,
        sd.site_name,
        sd.po_number
      HAVING remaining_quantity > 0
      ORDER BY ma.id
    `;

    const [rows] = await connection.query(query, queryParams);

    // Ensure rows is an array
    const result = Array.isArray(rows) ? rows : [];

    res.status(200).json({
      status: 'success',
      message: 'Non-dispatched material assignments fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error fetching material assignments with dispatch:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch material assignments',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  } finally {
    connection.release();
  }
};

exports.fetchMaterialDispatchDetails = async (req, res) => {
  try {
    const { pd_id, site_id, desc_id } = req.query;
    let query = `
      SELECT 
        md.id,
        md.material_assign_id,
        md.dc_no,
        md.dispatch_date,
        md.dispatch_qty,
        md.order_no,
        c.vendor_code,
        c.gst_number,
        md.comp_a_qty,
        md.comp_b_qty,
        md.comp_c_qty,
        md.comp_a_remarks,
        md.comp_b_remarks,
        md.comp_c_remarks,
        md.created_at,
        ma.quantity AS assigned_quantity,
        ma.comp_ratio_a,
        ma.comp_ratio_b,
        ma.comp_ratio_c,
        ma.desc_id,
        wd.desc_name,
        mm.item_id,
        pd.project_name,
        sd.site_name,
        sd.po_number,
        mm.item_name,
        um.uom_name,
        COALESCE(
          (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', tm.id,
              'destination', COALESCE(tm.destination, ''),
              'booking_expense', COALESCE(tm.booking_expense, 0),
              'travel_expense', COALESCE(tm.travel_expense, 0),
              'dispatch_id', tm.dispatch_id,
              'created_at', tm.created_at,
              'vehicle', JSON_OBJECT(
                'id', COALESCE(vm.id, 0),
                'vehicle_name', COALESCE(vm.vehicle_name, ''),
                'vehicle_model', COALESCE(vm.vehicle_model, ''),
                'vehicle_number', COALESCE(vm.vehicle_number, '')
              ),
              'driver', JSON_OBJECT(
                'id', COALESCE(dm.id, 0),
                'driver_name', COALESCE(dm.driver_name, ''),
                'driver_mobile', COALESCE(dm.driver_mobile, ''),
                'driver_address', COALESCE(dm.driver_address, '')
              ),
              'provider', JSON_OBJECT(
                'id', COALESCE(pm.id, 0),
                'provider_name', COALESCE(pm.provider_name, ''),
                'address', COALESCE(pm.address, ''),
                'mobile', COALESCE(pm.mobile, ''),
                'transport_type_id', COALESCE(pm.transport_type_id, 0)
              )
            )
          )
          FROM transport_master tm
          LEFT JOIN vehicle_master vm ON tm.vehicle_id = vm.id
          LEFT JOIN driver_master dm ON tm.driver_id = dm.id
          LEFT JOIN provider_master pm ON tm.provider_id = pm.id
          WHERE tm.dispatch_id = md.id),
          JSON_ARRAY()
        ) AS transport_details
      FROM material_dispatch md
      JOIN material_assign ma ON md.material_assign_id = ma.id
      JOIN project_details pd ON ma.pd_id = pd.pd_id
      JOIN site_details sd ON ma.site_id = sd.site_id
      JOIN material_master mm ON ma.item_id = mm.item_id
      JOIN uom_master um ON ma.uom_id = um.uom_id
      LEFT JOIN work_descriptions wd ON ma.desc_id = wd.desc_id
      LEFT JOIN company c ON pd.company_id = c.company_id
    `;
    const queryParams = [];

    if (pd_id && site_id && desc_id) {
      query += ' WHERE ma.pd_id = ? AND ma.site_id = ? AND ma.desc_id = ?';
      queryParams.push(pd_id, site_id, desc_id);
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'pd_id, site_id, and desc_id are required',
      });
    }

    // Fetch order_date from po_reckoner table
    const [poRows] = await db.query(
      `
      SELECT created_at AS order_date
      FROM po_reckoner
      WHERE site_id = ?
      LIMIT 1
      `,
      [site_id]
    );

    const order_date = poRows.length > 0 ? poRows[0].order_date : null;

    const [rows] = await db.query(query, queryParams);

    // Format data without parsing transport_details
    const formattedData = rows.map(row => ({
      ...row,
      order_date: order_date ? order_date.toISOString() : null,
      transport_details: row.transport_details ? row.transport_details : [],
      vendor_code: row.vendor_code || 'N/A',
      gst_number: row.gst_number || 'N/A',
      desc_name: row.desc_name || 'N/A',
      item_id: row.item_id || 'N/A',
    }));

    res.status(200).json({
      status: 'success',
      message: 'Material dispatch details fetched successfully',
      data: formattedData,
    });
  } catch (error) {
    console.error('Fetch dispatch details error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
    });
  }
};
exports.getTransportTypes = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, type FROM transport_type");
    res.status(200).json({ status: "success", message: "Transport types fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching transport types:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch transport types", error: error.message });
  }
};

exports.getProviders = async function(req, res) {
  const { transport_type_id } = req.query;
  try {
    let query = "SELECT id, provider_name FROM provider_master";
    const queryParams = [];
    if (transport_type_id && !isNaN(transport_type_id)) {
      query += " WHERE transport_type_id = ?";
      queryParams.push(transport_type_id);
    }
    const [rows] = await db.query(query, queryParams);
    res.status(200).json({ status: "success", message: "Providers fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch providers", error: error.message });
  }
};


exports.addProvider = async function(req, res) {
  const { provider_name, address, mobile, transport_type_id } = req.body;
  try {
    if (!provider_name || !transport_type_id) {
      return res.status(400).json({ status: "error", message: "Provider name and transport type ID are required" });
    }
    const [result] = await db.query(
      "INSERT INTO provider_master (provider_name, address, mobile, transport_type_id) VALUES (?, ?, ?, ?)",
      [provider_name, address, mobile, transport_type_id]
    );
    res.status(201).json({ status: "success", message: "Provider added successfully", data: { id: result.insertId, provider_name } });
  } catch (error) {
    console.error("Error adding provider:", error);
    res.status(500).json({ status: "error", message: "Failed to add provider", error: error.message });
  }
};

exports.addVehicle = async function(req, res) {
  const { vehicle_name, vehicle_model, vehicle_number } = req.body;
  try {
    if (!vehicle_name || !vehicle_number) {
      return res.status(400).json({ status: "error", message: "Vehicle name and number are required" });
    }
    const [result] = await db.query(
      "INSERT INTO vehicle_master (vehicle_name, vehicle_model, vehicle_number) VALUES (?, ?, ?)",
      [vehicle_name, vehicle_model, vehicle_number]
    );
    res.status(201).json({ status: "success", message: "Vehicle added successfully", data: { id: result.insertId, vehicle_name, vehicle_model, vehicle_number } });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ status: "error", message: "Failed to add vehicle", error: error.message });
  }
};

exports.addDriver = async function(req, res) {
  const { driver_name, driver_mobile, driver_address } = req.body;
  try {
    if (!driver_name) {
      return res.status(400).json({ status: "error", message: "Driver name is required" });
    }
    const [result] = await db.query(
      "INSERT INTO driver_master (driver_name, driver_mobile, driver_address) VALUES (?, ?, ?)",
      [driver_name, driver_mobile, driver_address]
    );
    res.status(201).json({ status: "success", message: "Driver added successfully", data: { id: result.insertId, driver_name, driver_mobile, driver_address } });
  } catch (error) {
    console.error("Error adding driver:", error);
    res.status(500).json({ status: "error", message: "Failed to add driver", error: error.message });
  }
};

exports.addTransport = async function(req, res) {
  const { dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense, travel_expense } = req.body;
  try {
    if (!dispatch_id || !provider_id || !destination || !vehicle_id || !driver_id || !travel_expense) {
      return res.status(400).json({ status: "error", message: "Dispatch ID, provider ID, destination, vehicle ID, driver ID, and travel expense are required" });
    }
    const [result] = await db.query(
      "INSERT INTO transport_master (dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense, travel_expense, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      [dispatch_id, provider_id, destination, vehicle_id, driver_id, booking_expense || null, travel_expense]
    );
    res.status(201).json({ status: "success", message: "Transport added successfully", data: { id: result.insertId } });
  } catch (error) {
    console.error("Error adding transport:", error);
    res.status(500).json({ status: "error", message: "Failed to add transport", error: error.message });
  }
};

exports.getVehicles = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, vehicle_name, vehicle_model, vehicle_number FROM vehicle_master");
    res.status(200).json({ status: "success", message: "Vehicles fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch vehicles", error: error.message });
  }
};

exports.getDrivers = async function(req, res) {
  try {
    const [rows] = await db.query("SELECT id, driver_name, driver_mobile, driver_address FROM driver_master");
    res.status(200).json({ status: "success", message: "Drivers fetched successfully", data: rows });
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch drivers", error: error.message });
  }
};


exports.addMaterial = async (req, res) => {
  try {
    const { item_name } = req.body;

    // Validation
    if (!item_name || typeof item_name !== 'string' || item_name.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'item_name is required and must be a non-empty string',
      });
    }

    // Generate next item_id
    const [existingRows] = await db.query('SELECT item_id FROM material_master ORDER BY CAST(SUBSTRING(item_id, 6) AS UNSIGNED) DESC LIMIT 1');
    
    let nextIdNum = 1; // Default if no records
    if (existingRows.length > 0) {
      const lastItemId = existingRows[0].item_id;
      const match = lastItemId.match(/^item_(\d+)$/);
      if (match) {
        nextIdNum = parseInt(match[1], 10) + 1;
      } else {
        // Fallback if pattern doesn't match (unlikely)
        nextIdNum = 1;
      }
    }
    
    const newItemId = `item_${nextIdNum.toString().padStart(5, '0')}`; // Padded to 3 digits for consistency (e.g., item_001, but based on your data, no padding needed; adjust if required)

    // Insert new material
    const [result] = await db.query(
      'INSERT INTO material_master (item_id, item_name) VALUES (?, ?)',
      [newItemId, item_name.trim()]
    );

    // Fetch the newly created record
    const [newMaterial] = await db.query('SELECT * FROM material_master WHERE item_id = ?', [newItemId]);

    res.status(201).json({
      status: 'success',
      message: 'Material added successfully',
      data: newMaterial[0],
    });
  } catch (error) {
    console.error('Error in addMaterial:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: 'error',
        message: 'Material with this item_id already exists',        
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};


exports.getMaterials = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM material_master');
    res.json({ status: 'success', data: rows });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch materials' });
  }
};


exports.getMasterDcNo = async (req, res) => {
  try {
    const { company_id } = req.query;
    if (!company_id) {
      return res.status(400).json({ status: "error", message: "Company ID is required" });
    }

    const [rows] = await db.query(
      "SELECT dc_no FROM master_dc_no WHERE company_id = ?",
      [company_id]
    );

    if (rows.length > 0) {
      return res.status(200).json({ status: "success", data: { dc_no: rows[0].dc_no } });
    } else {
      return res.status(200).json({ status: "success", data: null });
    }
  } catch (error) {
    console.error("Error fetching master DC No:", error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
};

exports.saveMasterDcNo = async (req, res) => {
  const { company_id, dc_no, created_by } = req.body;

  // 1. Better validation
  // if (!company_id || isNaN(company_id)) {
  //   return res.status(400).json({
  //     status: "error",
  //     message: "Valid company_id (number) is required"
  //   });
  // }

  if (!dc_no || typeof dc_no !== 'string' || dc_no.trim() === '') {
    return res.status(400).json({
      status: "error",
      message: "Master DC No (dc_no) is required and must be a non-empty string"
    });
  }

  if (!created_by || typeof created_by !== 'string' || created_by.trim() === '') {
    return res.status(400).json({
      status: "error",
      message: "created_by is required and must be a non-empty string"
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if record already exists for this company
    const [existing] = await connection.query(
      "SELECT dc_no FROM master_dc_no WHERE company_id = ?",
      [company_id]
    );

    if (existing.length > 0) {
      // Update existing record
      await connection.query(
        "UPDATE master_dc_no SET dc_no = ?, created_by = ?, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?",
        [dc_no.trim(), created_by.trim(), company_id]
      );
    } else {
      // Insert new record
      await connection.query(
        "INSERT INTO master_dc_no (company_id, dc_no, created_by, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
        [company_id, dc_no.trim(), created_by.trim()]
      );
    }

    await connection.commit();

    // Refresh the value in frontend
    return res.status(200).json({
      status: "success",
      message: "Master DC No saved successfully",
      data: { dc_no: dc_no.trim() }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error saving master DC No:", error);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: "error",
        message: "Invalid company_id: Company does not exist"
      });
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        status: "error",
        message: "Duplicate entry - please check constraints"
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to save Master DC No",
      error: error.message
    });
  } finally {
    if (connection) connection.release();
  }
};





// Get single material assignment by ID - Updated to use req.query.assignment_id
exports.getMaterialAssignmentById = async (req, res) => {
  const { assignment_id } = req.query; // Changed from req.params

  console.log('Fetching assignment with ID:', assignment_id);

  if (!assignment_id || assignment_id === 'undefined' || isNaN(assignment_id)) {
    console.log('Invalid assignment_id provided:', assignment_id);
    return res.status(400).json({ 
      status: "error", 
      message: "assignment_id is required and must be a valid number" 
    });
  }

  try {
    const [rows] = await db.query(
      `SELECT ma.*, mm.item_name, um.uom_name 
       FROM material_assign ma
       LEFT JOIN material_master mm ON ma.item_id = mm.item_id
       LEFT JOIN uom_master um ON ma.uom_id = um.uom_id
       WHERE ma.id = ?`,
      [parseInt(assignment_id)]
    );

    if (rows.length === 0) {
      console.log('Assignment not found for ID:', assignment_id);
      return res.status(404).json({ 
        status: "error", 
        message: "Assignment not found" 
      });
    }

    console.log('Fetched assignment:', rows[0].id);
    res.status(200).json({
      status: "success",
      data: rows[0],
    });
  } catch (error) {
    console.error("Error fetching material assignment:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to fetch assignment",
      error: error.message 
    });
  }
};


// Update material assignment - Updated to use req.body.assignment_id
exports.updateMaterialAssignment = async (req, res) => {
  const { assignment_id } = req.body; // Changed from req.params
  const { item_id, uom_id, quantity, comp_ratio_a, comp_ratio_b, comp_ratio_c, rate, projection_id } = req.body;

  console.log('Updating assignment ID:', assignment_id, 'with data:', { item_id, uom_id, quantity, rate, projection_id });

  if (!assignment_id || assignment_id === 'undefined' || isNaN(assignment_id)) {
    console.log('Invalid assignment_id for update:', assignment_id);
    return res.status(400).json({ 
      status: "error", 
      message: "assignment_id is required and must be a valid number" 
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if assignment has dispatches (prevent update if dispatched)
    const [dispatchCheck] = await connection.query(
      'SELECT COUNT(*) as dispatch_count FROM material_dispatch WHERE material_assign_id = ?',
      [assignment_id]
    );
    if (dispatchCheck[0].dispatch_count > 0) {
      await connection.rollback();
      return res.status(400).json({
        status: "error",
        message: "Cannot update assignment that has already been dispatched"
      });
    }

    // Validate inputs
    const validationErrors = [];
    if (!item_id || item_id === "N/A") {
      validationErrors.push("Valid item_id is required");
    }
    if (!Number.isInteger(uom_id) || uom_id <= 0) {
      validationErrors.push("Valid uom_id is required");
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      validationErrors.push("Valid quantity is required");
    }
    const parsedRate = parseFloat(rate);
    if (isNaN(parsedRate) || parsedRate < 0) {
      validationErrors.push("Valid rate is required (non-negative number)");
    }
    const parsedProjectionId = parseInt(projection_id);
    if (isNaN(parsedProjectionId) || parsedProjectionId <= 0) {
      validationErrors.push("Valid projection_id is required");
    }

    if (validationErrors.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        status: "error", 
        message: validationErrors.join(", ") 
      });
    }

    // Get site_id and desc_id for recalculation
    const [assignRows] = await connection.query(
      'SELECT site_id, desc_id FROM material_assign WHERE id = ?',
      [assignment_id]
    );
    
    if (assignRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        status: "error", 
        message: "Assignment not found" 
      });
    }
    
    const { site_id, desc_id } = assignRows[0];

    // Update the assignment
    const [result] = await connection.query(
      `UPDATE material_assign 
       SET item_id = ?, uom_id = ?, quantity = ?, comp_ratio_a = ?, comp_ratio_b = ?, comp_ratio_c = ?, rate = ?, projection_id = ? 
       WHERE id = ?`,
      [item_id, uom_id, quantity, comp_ratio_a || null, comp_ratio_b || null, comp_ratio_c || null, parsedRate, parsedProjectionId, assignment_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        status: "error", 
        message: "Assignment not found" 
      });
    }

    // Recalculate and update projection_allocated
    const [overheadRows] = await connection.query(
      'SELECT id FROM overhead WHERE expense_name = "materials" LIMIT 1'
    );
    
    if (overheadRows.length > 0) {
      const overhead_type_id = overheadRows[0].id;
      
      const [matSum] = await connection.query(
        'SELECT SUM(quantity * rate) AS total_cost FROM material_assign WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [site_id, desc_id, parsedProjectionId]
      );
      
      const total_cost = parseFloat(matSum[0].total_cost) || 0;
      
      const [budgetRows] = await connection.query(
        'SELECT total_budget_value FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [site_id, desc_id, parsedProjectionId]
      );
      
      const budget_value = parseFloat(budgetRows[0]?.total_budget_value) || 0;
      const budget_percentage = budget_value > 0 ? (total_cost / budget_value * 100) : 0;

      await connection.query(
        `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP`,
        [site_id, desc_id, overhead_type_id, parsedProjectionId, total_cost, budget_percentage, total_cost, budget_percentage]
      );
    }

    await connection.commit();
    
    console.log('Assignment updated successfully:', assignment_id);
    res.status(200).json({
      status: "success",
      message: "Assignment updated successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error updating material assignment:", error);
    
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Invalid reference: item_id, uom_id, or projection_id does not exist",
      });
    }
    
    res.status(500).json({ 
      status: "error", 
      message: "Failed to update assignment",
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};

// Delete material assignment - Updated to use req.body.assignment_id
exports.deleteMaterialAssignment = async (req, res) => {
  const { assignment_id } = req.body; // Changed from req.params

  console.log('Deleting assignment ID:', assignment_id);

  if (!assignment_id || assignment_id === 'undefined' || isNaN(assignment_id)) {
    console.log('Invalid assignment_id for delete:', assignment_id);
    return res.status(400).json({ 
      status: "error", 
      message: "assignment_id is required and must be a valid number" 
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if assignment has dispatches (prevent delete if dispatched)
    const [dispatchCheck] = await connection.query(
      'SELECT COUNT(*) as dispatch_count FROM material_dispatch WHERE material_assign_id = ?',
      [assignment_id]
    );
    if (dispatchCheck[0].dispatch_count > 0) {
      await connection.rollback();
      return res.status(400).json({
        status: "error",
        message: "Cannot delete assignment that has already been dispatched"
      });
    }

    // Get assignment details for recalculation
    const [assignRows] = await connection.query(
      'SELECT site_id, desc_id, projection_id FROM material_assign WHERE id = ?',
      [assignment_id]
    );
    
    if (assignRows.length === 0) {
      await connection.rollback();
      console.log('Assignment not found for delete:', assignment_id);
      return res.status(404).json({ 
        status: "error", 
        message: "Assignment not found" 
      });
    }
    
    const { site_id, desc_id, projection_id } = assignRows[0];
    const parsedProjectionId = parseInt(projection_id);

    // Delete the assignment
    const [deleteResult] = await connection.query(
      'DELETE FROM material_assign WHERE id = ?', 
      [assignment_id]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ 
        status: "error", 
        message: "Assignment not found" 
      });
    }

    // Recalculate projection_allocated
    const [overheadRows] = await connection.query(
      'SELECT id FROM overhead WHERE expense_name = "materials" LIMIT 1'
    );
    
    if (overheadRows.length > 0) {
      const overhead_type_id = overheadRows[0].id;
      
      const [matSum] = await connection.query(
        'SELECT SUM(quantity * rate) AS total_cost FROM material_assign WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [site_id, desc_id, parsedProjectionId]
      );
      
      const total_cost = parseFloat(matSum[0].total_cost) || 0;
      
      const [budgetRows] = await connection.query(
        'SELECT total_budget_value FROM po_budget WHERE site_id = ? AND desc_id = ? AND projection_id = ?',
        [site_id, desc_id, parsedProjectionId]
      );
      
      const budget_value = parseFloat(budgetRows[0]?.total_budget_value) || 0;
      const budget_percentage = budget_value > 0 ? (total_cost / budget_value * 100) : 0;

      await connection.query(
        `INSERT INTO projection_allocated (site_id, desc_id, overhead_type_id, projection_id, total_cost, budget_percentage, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
         ON DUPLICATE KEY UPDATE total_cost = ?, budget_percentage = ?, updated_at = CURRENT_TIMESTAMP`,
        [site_id, desc_id, overhead_type_id, parsedProjectionId, total_cost, budget_percentage, total_cost, budget_percentage]
      );
    }

    await connection.commit();
    
    console.log('Assignment deleted successfully:', assignment_id);
    res.status(200).json({
      status: "success",
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error deleting material assignment:", error);
    res.status(500).json({ 
      status: "error", 
      message: "Failed to delete assignment",
      error: error.message 
    });
  } finally {
    if (connection) connection.release();
  }
};