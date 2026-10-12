// const db = require('../config/db');


// exports.addPettyCash = async (req, res) => {
//   try {
//     const assignments = Array.isArray(req.body) ? req.body : [req.body];

//     if (assignments.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "At least one petty cash assignment is required",
//       });
//     }

//     const validationErrors = [];
//     assignments.forEach((assignment, index) => {
//       const { pd_id, site_id, desc_id, assign_date, amount } = assignment;

//       if (!pd_id || typeof pd_id !== "string" || pd_id.trim() === "") {
//         validationErrors.push(`Assignment ${index + 1}: pd_id is required and must be a non-empty string`);
//       }
//       if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
//         validationErrors.push(`Assignment ${index + 1}: site_id is required and must be a non-empty string`);
//       }
//       if (!desc_id || typeof desc_id !== "string" || desc_id.trim() === "") {
//         validationErrors.push(`Assignment ${index + 1}: desc_id is required and must be a non-empty string`);
//       }
//       if (!assign_date || !/^\d{4}-\d{2}-\d{2}$/.test(assign_date)) {
//         validationErrors.push(`Assignment ${index + 1}: assign_date is required and must be in YYYY-MM-DD format`);
//       }
//       if (!amount || typeof amount !== "number" || amount <= 0) {
//         validationErrors.push(`Assignment ${index + 1}: amount is required and must be a positive number`);
//       }
//     });

//     if (validationErrors.length > 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Validation errors",
//         errors: validationErrors,
//       });
//     }

//     const insertedIds = [];
//     for (const { pd_id, site_id, desc_id, assign_date, amount } of assignments) {
//       // Check for existing record with same pd_id, site_id, desc_id, and assign_date
//       const [existingRecord] = await db.query(
//         "SELECT id FROM petty_cash WHERE pd_id = ? AND site_id = ? AND desc_id = ? AND assign_date = ?",
//         [pd_id, site_id, desc_id, assign_date]
//       );

//       if (existingRecord.length > 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Petty cash already allotted for project ${pd_id}, site ${site_id}, work description ${desc_id} on ${assign_date}`,
//         });
//       }

//       // Validate site_id and pd_id
//       const [site] = await db.query("SELECT site_id FROM site_details WHERE site_id = ? AND pd_id = ?", [
//         site_id,
//         pd_id,
//       ]);
//       if (site.length === 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Invalid site_id (${site_id}) or pd_id (${pd_id}): site does not exist for the given project`,
//         });
//       }

//       // Validate desc_id exists in po_reckoner for the given site_id
//       const [siteDesc] = await db.query(
//         "SELECT desc_id FROM po_reckoner WHERE site_id = ? AND desc_id = ?",
//         [site_id, desc_id]
//       );
//       if (siteDesc.length === 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Invalid desc_id (${desc_id}): work description does not exist for the given site`,
//         });
//       }

//       // Validate desc_id exists in work_descriptions
//       const [desc] = await db.query("SELECT desc_id FROM work_descriptions WHERE desc_id = ?", [desc_id]);
//       if (desc.length === 0) {
//         return res.status(400).json({
//           status: "error",
//           message: `Invalid desc_id (${desc_id}): work description does not exist`,
//         });
//       }

//       const [result] = await db.query(
//         "INSERT INTO petty_cash (pd_id, site_id, desc_id, assign_date, amount, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
//         [pd_id, site_id, desc_id, assign_date, amount]
//       );
//       insertedIds.push(result.insertId);
//     }

//     res.status(201).json({
//       status: "success",
//       message: "Petty cash assigned successfully",
//       data: { insertedIds },
//     });
//   } catch (error) {
//     console.error("Error in addPettyCash:", error);
//     if (error.code === "ER_NO_REFERENCED_ROW_2") {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid pd_id, site_id, or desc_id: referenced record does not exist",
//       });
//     }
//     res.status(500).json({
//       status: "error",
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };




// exports.updatePettyCash = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { amount } = req.body;

//     if (!id || isNaN(parseInt(id))) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid petty cash ID provided",
//       });
//     }

//     if (!amount || typeof amount !== "number" || amount <= 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Amount must be a positive number",
//       });
//     }

//     // Fetch current petty cash record
//     const [pettyCash] = await db.query("SELECT amount, site_id, desc_id FROM petty_cash WHERE id = ?", [id]);
//     if (pettyCash.length === 0) {
//       return res.status(404).json({
//         status: "error",
//         message: "Petty cash record not found for the provided ID",
//       });
//     }

//     // Validate desc_id exists in work_descriptions
//     const [desc] = await db.query("SELECT desc_id FROM work_descriptions WHERE desc_id = ?", [
//       pettyCash[0].desc_id,
//     ]);
//     if (desc.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid desc_id: work description does not exist",
//       });
//     }

//     // Validate desc_id exists in po_reckoner for the given site_id
//     const [siteDesc] = await db.query(
//       "SELECT desc_id FROM po_reckoner WHERE site_id = ? AND desc_id = ?",
//       [pettyCash[0].site_id, pettyCash[0].desc_id]
//     );
//     if (siteDesc.length === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Invalid desc_id: work description does not exist for the given site",
//       });
//     }

//     // Check existing expenses if trying to decrease amount
//     if (amount < pettyCash[0].amount) {
//       const [existingExpenses] = await db.query(
//         "SELECT SUM(amount) as total_expenses FROM siteincharge_exp_entry WHERE petty_cash_id = ?",
//         [id]
//       );
//       const totalExpenses = Number(existingExpenses[0].total_expenses) || 0;

//       if (totalExpenses > amount) {
//         return res.status(400).json({
//           status: "error",
//           message: `Cannot reduce amount below ₹${totalExpenses.toFixed(2)} as this amount has already been expensed`,
//         });
//       }
//     }

//     // Update the amount
//     const [result] = await db.query("UPDATE petty_cash SET amount = ?, updated_at = NOW() WHERE id = ?", [
//       amount,
//       id,
//     ]);
//     if (result.affectedRows === 0) {
//       return res.status(400).json({
//         status: "error",
//         message: "Failed to update petty cash amount: No changes applied",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       message: "Petty cash amount updated successfully",
//     });
//   } catch (error) {
//     console.error("Error in updatePettyCash:", error);
//     let message = "An unexpected error occurred while updating petty cash amount";
//     if (error.code === "ER_NO_REFERENCED_ROW_2") {
//       message = "Invalid reference data in the database (site_id or desc_id)";
//     } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
//       message = "Database access denied";
//     }
//     res.status(500).json({
//       status: "error",
//       message,
//       error: error.message,
//     });
//   }
// };


// exports.fetchPettyCash = async (req, res) => {
//   try {
//     const [rows] = await db.query(`
//       SELECT 
//         pc.id,
//         pc.pd_id,
//         pd.project_name,
//         pc.site_id,
//         sd.site_name,
//         sd.po_number,
//         pc.desc_id,
//         wd.desc_name,
//         pc.assign_date,
//         pc.amount,
//         pc.created_at
//       FROM petty_cash pc
//       LEFT JOIN project_details pd ON pc.pd_id = pd.pd_id
//       LEFT JOIN site_details sd ON pc.site_id = sd.site_id
//       LEFT JOIN work_descriptions wd ON pc.desc_id = wd.desc_id
//       ORDER BY pc.created_at DESC
//     `);

//     res.status(200).json({
//       status: "success",
//       message: rows.length > 0 ? "Petty cash records fetched successfully" : "No petty cash records found",
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error fetching petty cash:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch petty cash records",
//       error: error.message,
//     });
//   }
// };

// exports.fetchPettyCashBySite = async (req, res) => {
//   try {
//     const { site_id } = req.body;

//     if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
//       return res.status(400).json({
//         status: "error",
//         message: "site_id is required and must be a non-empty string",
//       });
//     }

//     const [rows] = await db.query(
//       `
//       SELECT 
//         pc.id,
//         pc.pd_id,
//         pd.project_name,
//         pc.site_id,
//         sd.site_name,
//         sd.po_number,
//         pc.desc_id,
//         wd.desc_name,
//         pc.assign_date,
//         pc.amount,
//         pc.created_at,
//         (SELECT SUM(amount) FROM siteincharge_exp_entry WHERE petty_cash_id = pc.id) as total_expenses
//       FROM petty_cash pc
//       LEFT JOIN project_details pd ON pc.pd_id = pd.pd_id
//       LEFT JOIN site_details sd ON pc.site_id = sd.site_id
//       LEFT JOIN work_descriptions wd ON pc.desc_id = wd.desc_id
//       WHERE pc.site_id = ?
//       ORDER BY pc.created_at DESC
//     `,
//       [site_id]
//     );

//     res.status(200).json({
//       status: "success",
//       message: rows.length > 0 ? "Petty cash records fetched successfully" : "No petty cash records found for this site",
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error fetching petty cash by site:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch petty cash records",
//       error: error.message,
//     });
//   }
// };


// exports.addSiteInchargeExpense = async (req, res) => {
//   try {
//     const { petty_cash_id, expense_category_id, expense_detail_id, amount } = req.body;

//     // Validate inputs
//     if (!petty_cash_id || typeof petty_cash_id !== 'number') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'petty_cash_id is required and must be a number'
//       });
//     }
//     if (!expense_category_id || typeof expense_category_id !== 'number') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'expense_category_id is required and must be a number'
//       });
//     }
//     if (!expense_detail_id || typeof expense_detail_id !== 'number') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'expense_detail_id is required and must be a number'
//       });
//     }
//     if (!amount || typeof amount !== 'number' || amount <= 0) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'amount is required and must be a positive number'
//       });
//     }

//     // Verify petty_cash record
//     const [pettyCash] = await db.query(`
//       SELECT amount
//       FROM petty_cash
//       WHERE id = ?
//     `, [petty_cash_id]);

//     if (pettyCash.length === 0) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid petty_cash_id: record does not exist'
//       });
//     }

//     // Validate expense_detail belongs to expense_category
//     const [detail] = await db.query(`
//       SELECT id
//       FROM expense_details
//       WHERE id = ? AND exp_category_id = ?
//     `, [expense_detail_id, expense_category_id]);

//     if (detail.length === 0) {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid expense_detail_id: does not belong to selected category'
//       });
//     }

//     // Validate amount against remaining balance for this petty_cash_id
//     const [existingExpenses] = await db.query(`
//       SELECT SUM(amount) as total_expenses
//       FROM siteincharge_exp_entry
//       WHERE petty_cash_id = ?
//     `, [petty_cash_id]);

//     const totalExpenses = existingExpenses[0].total_expenses || 0;
//     const remainingBalance = pettyCash[0].amount - totalExpenses;

//     if (amount > remainingBalance) {
//       return res.status(400).json({
//         status: 'error',
//         message: `Entered amount (${amount}) exceeds remaining balance (${remainingBalance}) for this petty cash allocation`
//       });
//     }

//     // Insert new record into siteincharge_exp_entry
//     await db.query(`
//       INSERT INTO siteincharge_exp_entry (
//         petty_cash_id,
//         expense_category_id,
//         expense_detail_id,
//         amount,
//         amount_created_at
//       ) VALUES (?, ?, ?, ?, NOW())
//     `, [petty_cash_id, expense_category_id, expense_detail_id, amount]);

//     res.status(201).json({
//       status: 'success',
//       message: 'Expense entry added successfully',
//     });
//   } catch (error) {
//     console.error('Error in addSiteInchargeExpense:', error);
//     if (error.code === 'ER_NO_REFERENCED_ROW_2') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'Invalid reference ID (petty_cash_id, expense_category_id, or expense_detail_id)',
//       });
//     }
//     res.status(500).json({
//       status: 'error',
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };

// exports.getExpenseCategories = async (req, res) => {
//   try {
//     const [rows] = await db.query('SELECT id, exp_category FROM expense_category ORDER BY exp_category ASC');
//     res.status(200).json({
//       status: 'success',
//       message: rows.length > 0 ? 'Categories fetched successfully' : 'No categories found',
//       data: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching categories:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch categories',
//       error: error.message,
//     });
//   }
// };

// exports.fetchExpenseDetails = async (req, res) => {
//   try {
//     const { exp_category_id } = req.body;

//     if (!exp_category_id || typeof exp_category_id !== 'number') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'exp_category_id is required and must be a number'
//       });
//     }

//     const [rows] = await db.query(`
//       SELECT id, details
//       FROM expense_details
//       WHERE exp_category_id = ?
//       ORDER BY details ASC
//     `, [exp_category_id]);

//     res.status(200).json({
//       status: 'success',
//       message: rows.length > 0 ? 'Details fetched successfully' : 'No details found for this category',
//       data: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching expense details:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch expense details',
//       error: error.message,
//     });
//   }
// };

// exports.fetchExpensesByPettyCash = async (req, res) => {
//   try {
//     const { petty_cash_id } = req.body;

//     if (!petty_cash_id || typeof petty_cash_id !== 'number') {
//       return res.status(400).json({
//         status: 'error',
//         message: 'petty_cash_id is required and must be a number'
//       });
//     }

//     const [rows] = await db.query(`
//       SELECT 
//         see.id,
//         see.petty_cash_id,
//         see.expense_category_id,
//         ec.exp_category,
//         see.expense_detail_id,
//         ed.details,
//         see.amount,
//         see.amount_created_at
//       FROM siteincharge_exp_entry see
//       LEFT JOIN expense_category ec ON see.expense_category_id = ec.id
//       LEFT JOIN expense_details ed ON see.expense_detail_id = ed.id
//       WHERE see.petty_cash_id = ?
//       ORDER BY see.amount_created_at DESC
//     `, [petty_cash_id]);

//     res.status(200).json({
//       status: 'success',
//       message: rows.length > 0 ? 'Expenses fetched successfully' : 'No expenses found for this petty cash',
//       data: rows,
//     });
//   } catch (error) {
//     console.error('Error fetching expenses by petty cash:', error);
//     res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch expenses',
//       error: error.message,
//     });
//   }
// };


// exports.fetchWorkDescriptionsBySite = async (req, res) => {
//   try {
//     const { site_id } = req.params;

//     if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
//       return res.status(400).json({
//         status: "error",
//         message: "site_id is required and must be a non-empty string",
//       });
//     }

//     const [rows] = await db.query(
//       `
//       SELECT pr.desc_id, wd.desc_name
//       FROM po_reckoner pr
//       INNER JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
//       WHERE pr.site_id = ? AND pr.desc_id IS NOT NULL
//       ORDER BY wd.desc_name ASC
//       `,
//       [site_id]
//     );

//     res.status(200).json({
//       status: "success",
//       message: rows.length > 0 ? "Work descriptions fetched successfully" : "No work descriptions found for this site",
//       data: rows,
//     });
//   } catch (error) {
//     console.error("Error fetching work descriptions:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to fetch work descriptions",
//       error: error.message,
//     });
//   }
// };




const db = require('../config/db');

exports.addPettyCash = async (req, res) => {
  try {
    const assignments = Array.isArray(req.body) ? req.body : [req.body];

    if (assignments.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "At least one petty cash assignment is required",
      });
    }

    const validationErrors = [];
    assignments.forEach((assignment, index) => {
      const { pd_id, site_id, desc_id, assign_date, amount } = assignment;

      if (!pd_id || typeof pd_id !== "string" || pd_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: pd_id is required and must be a non-empty string`);
      }
      if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: site_id is required and must be a non-empty string`);
      }
      if (!desc_id || typeof desc_id !== "string" || desc_id.trim() === "") {
        validationErrors.push(`Assignment ${index + 1}: desc_id is required and must be a non-empty string`);
      }
      if (!assign_date || !/^\d{4}-\d{2}-\d{2}$/.test(assign_date)) {
        validationErrors.push(`Assignment ${index + 1}: assign_date is required and must be in YYYY-MM-DD format`);
      }
      if (!amount || typeof amount !== "number" || amount <= 0) {
        validationErrors.push(`Assignment ${index + 1}: amount is required and must be a positive number`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validation errors",
        errors: validationErrors,
      });
    }

    const insertedIds = [];
    for (const { pd_id, site_id, desc_id, assign_date, amount } of assignments) {
      // Check for existing record with same pd_id, site_id, desc_id, and assign_date
      const [existingRecord] = await db.query(
        "SELECT id FROM petty_cash WHERE pd_id = ? AND site_id = ? AND desc_id = ? AND assign_date = ?",
        [pd_id, site_id, desc_id, assign_date]
      );

      if (existingRecord.length > 0) {
        return res.status(400).json({
          status: "error",
          message: `Petty cash already allotted for project ${pd_id}, site ${site_id}, work description ${desc_id} on ${assign_date}`,
        });
      }

      // Validate site_id and pd_id
      const [site] = await db.query("SELECT site_id FROM site_details WHERE site_id = ? AND pd_id = ?", [
        site_id,
        pd_id,
      ]);
      if (site.length === 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid site_id (${site_id}) or pd_id (${pd_id}): site does not exist for the given project`,
        });
      }

      // Validate desc_id exists in po_reckoner for the given site_id
      const [siteDesc] = await db.query(
        "SELECT desc_id FROM po_reckoner WHERE site_id = ? AND desc_id = ?",
        [site_id, desc_id]
      );
      if (siteDesc.length === 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid desc_id (${desc_id}): work description does not exist for the given site`,
        });
      }

      // Validate desc_id exists in work_descriptions
      const [desc] = await db.query("SELECT desc_id FROM work_descriptions WHERE desc_id = ?", [desc_id]);
      if (desc.length === 0) {
        return res.status(400).json({
          status: "error",
          message: `Invalid desc_id (${desc_id}): work description does not exist`,
        });
      }

      const [result] = await db.query(
        "INSERT INTO petty_cash (pd_id, site_id, desc_id, assign_date, amount, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [pd_id, site_id, desc_id, assign_date, amount]
      );
      insertedIds.push(result.insertId);
    }

    res.status(201).json({
      status: "success",
      message: "Petty cash assigned successfully",
      data: { insertedIds },
    });
  } catch (error) {
    console.error("Error in addPettyCash:", error);
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        status: "error",
        message: "Invalid pd_id, site_id, or desc_id: referenced record does not exist",
      });
    }
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.updatePettyCash = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        status: "error",
        message: "Invalid petty cash ID provided",
      });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Amount must be a positive number",
      });
    }

    // Fetch current petty cash record
    const [pettyCash] = await db.query("SELECT amount, site_id, desc_id FROM petty_cash WHERE id = ?", [id]);
    if (pettyCash.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Petty cash record not found for the provided ID",
      });
    }

    // Validate desc_id exists in work_descriptions
    const [desc] = await db.query("SELECT desc_id FROM work_descriptions WHERE desc_id = ?", [
      pettyCash[0].desc_id,
    ]);
    if (desc.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid desc_id: work description does not exist",
      });
    }

    // Validate desc_id exists in po_reckoner for the given site_id
    const [siteDesc] = await db.query(
      "SELECT desc_id FROM po_reckoner WHERE site_id = ? AND desc_id = ?",
      [pettyCash[0].site_id, pettyCash[0].desc_id]
    );
    if (siteDesc.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid desc_id: work description does not exist for the given site",
      });
    }

    // Check existing expenses if trying to decrease amount
    if (amount < pettyCash[0].amount) {
      const [existingExpenses] = await db.query(
        "SELECT SUM(amount) as total_expenses FROM siteincharge_exp_entry WHERE petty_cash_id = ?",
        [id]
      );
      const totalExpenses = Number(existingExpenses[0].total_expenses) || 0;

      if (totalExpenses > amount) {
        return res.status(400).json({
          status: "error",
          message: `Cannot reduce amount below ₹${totalExpenses.toFixed(2)} as this amount has already been expensed`,
        });
      }
    }

    // Update the amount
    const [result] = await db.query("UPDATE petty_cash SET amount = ?, updated_at = NOW() WHERE id = ?", [
      amount,
      id,
    ]);
    if (result.affectedRows === 0) {
      return res.status(400).json({
        status: "error",
        message: "Failed to update petty cash amount: No changes applied",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Petty cash amount updated successfully",
    });
  } catch (error) {
    console.error("Error in updatePettyCash:", error);
    let message = "An unexpected error occurred while updating petty cash amount";
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      message = "Invalid reference data in the database (site_id or desc_id)";
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      message = "Database access denied";
    }
    res.status(500).json({
      status: "error",
      message,
      error: error.message,
    });
  }
};

exports.fetchPettyCash = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        pc.id,
        pc.pd_id,
        pd.project_name,
        pc.site_id,
        sd.site_name,
        sd.po_number,
        pc.desc_id,
        wd.desc_name,
        pc.assign_date,
        pc.amount,
        pc.created_at
      FROM petty_cash pc
      LEFT JOIN project_details pd ON pc.pd_id = pd.pd_id
      LEFT JOIN site_details sd ON pc.site_id = sd.site_id
      LEFT JOIN work_descriptions wd ON pc.desc_id = wd.desc_id
      ORDER BY pc.created_at DESC
    `);

    res.status(200).json({
      status: "success",
      message: rows.length > 0 ? "Petty cash records fetched successfully" : "No petty cash records found",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching petty cash:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch petty cash records",
      error: error.message,
    });
  }
};

exports.fetchPettyCashBySite = async (req, res) => {
  try {
    const { site_id } = req.body;

    if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "site_id is required and must be a non-empty string",
      });
    }

    const [rows] = await db.query(
      `
      SELECT 
        pc.id,
        pc.pd_id,
        pd.project_name,
        pc.site_id,
        sd.site_name,
        sd.po_number,
        pc.desc_id,
        wd.desc_name,
        pc.assign_date,
        pc.amount,
        pc.created_at,
        (SELECT SUM(amount) FROM siteincharge_exp_entry WHERE petty_cash_id = pc.id) as total_expenses
      FROM petty_cash pc
      LEFT JOIN project_details pd ON pc.pd_id = pd.pd_id
      LEFT JOIN site_details sd ON pc.site_id = sd.site_id
      LEFT JOIN work_descriptions wd ON pc.desc_id = wd.desc_id
      WHERE pc.site_id = ?
      ORDER BY pc.created_at DESC
    `,
      [site_id]
    );

    res.status(200).json({
      status: "success",
      message: rows.length > 0 ? "Petty cash records fetched successfully" : "No petty cash records found for this site",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching petty cash by site:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch petty cash records",
      error: error.message,
    });
  }
};

exports.addSiteInchargeExpense = async (req, res) => {
  try {
    const { petty_cash_id, overhead_id, expense_details, amount } = req.body;

    // Validate inputs
    if (!petty_cash_id || typeof petty_cash_id !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'petty_cash_id is required and must be a number'
      });
    }
    if (!overhead_id || typeof overhead_id !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'overhead_id is required and must be a number'
      });
    }
    if (!expense_details || typeof expense_details !== 'string' || expense_details.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'expense_details is required and must be a non-empty string'
      });
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'amount is required and must be a positive number'
      });
    }

    // Verify petty_cash record
    const [pettyCash] = await db.query(`
      SELECT amount
      FROM petty_cash
      WHERE id = ?
    `, [petty_cash_id]);

    if (pettyCash.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid petty_cash_id: record does not exist'
      });
    }

    // Verify overhead exists
    const [overhead] = await db.query(`
      SELECT id
      FROM overhead
      WHERE id = ?
    `, [overhead_id]);

    if (overhead.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid overhead_id: record does not exist'
      });
    }

    // Validate amount against remaining balance for this petty_cash_id
    const [existingExpenses] = await db.query(`
      SELECT SUM(amount) as total_expenses
      FROM siteincharge_exp_entry
      WHERE petty_cash_id = ?
    `, [petty_cash_id]);

    const totalExpenses = existingExpenses[0].total_expenses || 0;
    const remainingBalance = pettyCash[0].amount - totalExpenses;

    if (amount > remainingBalance) {
      return res.status(400).json({
        status: 'error',
        message: `Entered amount (${amount}) exceeds remaining balance (${remainingBalance}) for this petty cash allocation`
      });
    }

    // Insert new record into siteincharge_exp_entry
    await db.query(`
      INSERT INTO siteincharge_exp_entry (
        petty_cash_id,
        overhead_id,
        expense_details,
        amount,
        amount_created_at
      ) VALUES (?, ?, ?, ?, NOW())
    `, [petty_cash_id, overhead_id, expense_details, amount]);

    res.status(201).json({
      status: 'success',
      message: 'Expense entry added successfully',
    });
  } catch (error) {
    console.error('Error in addSiteInchargeExpense:', error);
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid reference ID (petty_cash_id or overhead_id)',
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message,
    });
  }
};

// Keep these for backward compatibility if other parts of your app use them
exports.getExpenseCategories = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, exp_category FROM expense_category ORDER BY exp_category ASC');
    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Categories fetched successfully' : 'No categories found',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

exports.fetchExpenseDetails = async (req, res) => {
  try {
    const { exp_category_id } = req.body;

    if (!exp_category_id || typeof exp_category_id !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'exp_category_id is required and must be a number'
      });
    }

    const [rows] = await db.query(`
      SELECT id, details
      FROM expense_details
      WHERE exp_category_id = ?
      ORDER BY details ASC
    `, [exp_category_id]);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Details fetched successfully' : 'No details found for this category',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching expense details:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch expense details',
      error: error.message,
    });
  }
};

exports.fetchExpensesByPettyCash = async (req, res) => {
  try {
    const { petty_cash_id } = req.body;

    if (!petty_cash_id || typeof petty_cash_id !== 'number') {
      return res.status(400).json({
        status: 'error',
        message: 'petty_cash_id is required and must be a number'
      });
    }

    const [rows] = await db.query(`
      SELECT 
        see.id,
        see.petty_cash_id,
        see.overhead_id,
        oh.expense_name as exp_category,
        see.expense_details as details,
        see.amount,
        see.amount_created_at
      FROM siteincharge_exp_entry see
      LEFT JOIN overhead oh ON see.overhead_id = oh.id
      WHERE see.petty_cash_id = ?
      ORDER BY see.amount_created_at DESC
    `, [petty_cash_id]);

    res.status(200).json({
      status: 'success',
      message: rows.length > 0 ? 'Expenses fetched successfully' : 'No expenses found for this petty cash',
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching expenses by petty cash:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch expenses',
      error: error.message,
    });
  }
};

exports.fetchWorkDescriptionsBySite = async (req, res) => {
  try {
    const { site_id } = req.params;

    if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "site_id is required and must be a non-empty string",
      });
    }

    const [rows] = await db.query(
      `
      SELECT pr.desc_id, wd.desc_name
      FROM po_reckoner pr
      INNER JOIN work_descriptions wd ON pr.desc_id = wd.desc_id
      WHERE pr.site_id = ? AND pr.desc_id IS NOT NULL
      ORDER BY wd.desc_name ASC
      `,
      [site_id]
    );

    res.status(200).json({
      status: "success",
      message: rows.length > 0 ? "Work descriptions fetched successfully" : "No work descriptions found for this site",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching work descriptions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch work descriptions",
      error: error.message,
    });
  }
};

exports.fetchOverheadsBySite = async (req, res) => {
  try {
    const { site_id } = req.params;

    if (!site_id || typeof site_id !== "string" || site_id.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "site_id is required and must be a non-empty string",
      });
    }

    const [poBudgets] = await db.query(
      "SELECT id FROM po_budget WHERE site_id = ?",
      [site_id]
    );

    if (poBudgets.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No overheads found for this site",
        data: [],
      });
    }

    const poBudgetIds = poBudgets.map((pb) => pb.id);

    const [actualBudgets] = await db.query(
      "SELECT overhead_id FROM actual_budget WHERE po_budget_id IN (?)",
      [poBudgetIds]
    );

    if (actualBudgets.length === 0) {
      return res.status(200).json({
        status: "success",
        message: "No overheads found for this site",
        data: [],
      });
    }

    const overheadIds = [...new Set(actualBudgets.map((ab) => ab.overhead_id))]; // Unique IDs

    const [rows] = await db.query(
      "SELECT id, expense_name FROM overhead WHERE id IN (?) ORDER BY expense_name ASC",
      [overheadIds]
    );

    res.status(200).json({
      status: "success",
      message: rows.length > 0 ? "Overheads fetched successfully" : "No overheads found for this site",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching overheads by site:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch overheads",
      error: error.message,
    });
  }
};