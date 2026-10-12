const reckonerModel = require("../models/reckonerModel");

// ==================== Response Helpers ====================

const successResponse = (res, data, message = "Success", status = 200) => {
  res.status(status).json({ success: true, message, data });
};

const errorResponse = (
  res,
  message = "Internal server error",
  status = 500,
  error = null
) => {
  console.error(message, error);
  res.status(status).json({
    success: false,
    message,
    error: error?.message || message,
  });
};

// ==================== Company Controllers ====================

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await reckonerModel.fetchAllCompanies();
    successResponse(res, companies, "Companies fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching companies", 500, error);
  }
};

// ==================== Project Controllers ====================

exports.getProjectsByCompanyId = async (req, res) => {
  try {
    const { company_id } = req.params;
    if (!company_id) {
      return errorResponse(res, "Company ID is required", 400);
    }
    const projects = await reckonerModel.fetchProjectsByCompanyId(company_id);
    successResponse(res, projects, "Projects fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching projects", 500, error);
  }
};

// ==================== Site Controllers ====================

exports.getSitesByProjectId = async (req, res) => {
  try {
    const { pd_id } = req.params;
    if (!pd_id) {
      return errorResponse(res, "Project ID is required", 400);
    }
    const sites = await reckonerModel.fetchSitesByProjectId(pd_id);
    successResponse(res, sites, "Sites fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching sites", 500, error);
  }
};

// ==================== Category Controllers ====================

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await reckonerModel.fetchAllCategories();
    successResponse(res, categories, "Categories fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching categories", 500, error);
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await reckonerModel.fetchCategoryById(req.params.id);
    if (!category) return errorResponse(res, "Category not found", 404);
    successResponse(res, category, "Category fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching category", 500, error);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;
    if (!category_name)
      return errorResponse(res, "Category name is required", 400);
    const newCategory = await reckonerModel.createCategory(category_name);
    successResponse(res, newCategory, "Category created successfully", 201);
  } catch (error) {
    errorResponse(res, "Error creating category", 500, error);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name } = req.body;
    if (!category_name)
      return errorResponse(res, "Category name is required", 400);
    const updatedCategory = await reckonerModel.updateCategory(id, category_name);
    if (!updatedCategory) return errorResponse(res, "Category not found", 404);
    successResponse(res, updatedCategory, "Category updated successfully");
  } catch (error) {
    errorResponse(res, "Error updating category", 500, error);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await reckonerModel.deleteCategory(id);
    if (!deleted) return errorResponse(res, "Category not found", 404);
    successResponse(res, null, "Category deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting category", 500, error);
  }
};

// ==================== Subcategory Controllers ====================

exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await reckonerModel.fetchAllSubcategories();
    successResponse(res, subcategories, "Subcategories fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching subcategories", 500, error);
  }
};

exports.getSubcategoryById = async (req, res) => {
  try {
    const subcategory = await reckonerModel.fetchSubcategoryById(req.params.id);
    if (!subcategory) return errorResponse(res, "Subcategory not found", 404);
    successResponse(res, subcategory, "Subcategory fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching subcategory", 500, error);
  }
};

exports.createSubcategory = async (req, res) => {
  try {
    const { subcategory_name } = req.body;
    if (!subcategory_name)
      return errorResponse(res, "Subcategory name is required", 400);
    const newSubcategory = await reckonerModel.createSubcategory(subcategory_name);
    successResponse(res, newSubcategory, "Subcategory created successfully", 201);
  } catch (error) {
    errorResponse(res, "Error creating subcategory", 500, error);
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { subcategory_name } = req.body;
    if (!subcategory_name)
      return errorResponse(res, "Subcategory name is required", 400);
    const updatedSubcategory = await reckonerModel.updateSubcategory(id, subcategory_name);
    if (!updatedSubcategory) return errorResponse(res, "Subcategory not found", 404);
    successResponse(res, updatedSubcategory, "Subcategory updated successfully");
  } catch (error) {
    errorResponse(res, "Error updating subcategory", 500, error);
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await reckonerModel.deleteSubcategory(id);
    if (!deleted) return errorResponse(res, "Subcategory not found", 404);
    successResponse(res, null, "Subcategory deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting subcategory", 500, error);
  }
};

// ==================== Work Items Controllers ====================

exports.getAllWorkItems = async (req, res) => {
  try {
    const workItems = await reckonerModel.fetchAllWorkItems();
    successResponse(res, workItems, "Work descriptions fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching work descriptions", 500, error);
  }
};

exports.getWorkItemById = async (req, res) => {
  try {
    const workItem = await reckonerModel.fetchWorkItemById(req.params.id);
    if (!workItem) return errorResponse(res, "Work description not found", 404);
    successResponse(res, workItem, "Work description fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching work description", 500, error);
  }
};

exports.createWorkItem = async (req, res) => {
  try {
    const { desc_name } = req.body;
    if (!desc_name) return errorResponse(res, "Description name is required", 400);
    const newItem = await reckonerModel.createSingleWorkItem(desc_name);
    successResponse(res, newItem, "Work description created successfully", 201);
  } catch (error) {
    errorResponse(res, "Error creating work description", 500, error);
  }
};

exports.createMultipleWorkItems = async (req, res) => {
  try {
    const { descriptions } = req.body;
    if (!descriptions || !Array.isArray(descriptions)) {
      return errorResponse(res, "Descriptions array is required", 400);
    }
    const newItems = await reckonerModel.createMultipleWorkItems(descriptions);
    successResponse(res, newItems, "Work descriptions created successfully", 201);
  } catch (error) {
    errorResponse(res, "Error creating work descriptions", 500, error);
  }
};

exports.updateWorkItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { desc_name } = req.body;
    if (!desc_name) return errorResponse(res, "Description name is required", 400);
    const updatedWorkItem = await reckonerModel.updateWorkItem(id, desc_name);
    if (!updatedWorkItem) return errorResponse(res, "Work description not found", 404);
    successResponse(res, updatedWorkItem, "Work description updated successfully");
  } catch (error) {
    errorResponse(res, "Error updating work description", 500, error);
  }
};

exports.deleteWorkItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await reckonerModel.deleteWorkItem(id);
    if (!deleted) return errorResponse(res, "Work description not found", 404);
    successResponse(res, null, "Work description deleted successfully");
  } catch (error) {
    errorResponse(res, "Error deleting work description", 500, error);
  }
};

// ==================== Reckoner Controllers ====================

exports.getSiteByPoNumber = async (req, res) => {
  try {
    const { poNumber } = req.params;
    const site = await reckonerModel.getSiteByPoNumber(poNumber);
    if (!site) return errorResponse(res, "Site not found for the given PO number", 404);
    successResponse(res, site, "Site fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching site by PO number", 500, error);
  }
};

exports.getSiteById = async (req, res) => {
  try {
    const { site_id } = req.params;
    if (!site_id) return errorResponse(res, "Site ID is required", 400);
    const site = await reckonerModel.getSiteById(site_id);
    if (!site) return errorResponse(res, "Site not found for the given site ID", 404);
    successResponse(res, site, "Site fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching site by site ID", 500, error);
  }
};


// exports.saveReckonerData = async (req, res) => {
//   try {
//     const { poNumber, siteId, categories } = req.body;
//     if (!poNumber || !siteId || !categories) {
//       return errorResponse(res, "PO number, site ID, and categories are required", 400);
//     }

//     const site = await reckonerModel.getSiteById(siteId);
//     if (!site) {
//       return errorResponse(res, "Site not found for the given site ID", 404);
//     }

//     const reckonerData = [];
//     categories.forEach((category) => {
//       category.subcategories.forEach((subcategory) => {
//         subcategory.items.forEach((item) => {
//           reckonerData.push({
//             site_id: siteId,
//             category_id: category.categoryId,
//             subcategory_id: subcategory.subcategoryId,
//             item_id: item.itemId,
//             desc_id: item.descId,
//             po_quantity: parseFloat(item.poQuantity) || 0,
//             uom: item.uom || "",
//             rate: parseFloat(item.rate) || 0,
//             value: parseFloat(item.value) || 0,
//           });
//         });
//       });
//     });

//     if (reckonerData.length === 0) {
//       return errorResponse(res, "No valid items to save", 400);
//     }

//     const insertedIds = await reckonerModel.saveReckonerData(reckonerData);
//     successResponse(
//       res,
//       {
//         message: "Reckoner data saved successfully",
//         insertedRecords: insertedIds.length,
//       },
//       "Operation completed successfully"
//     );
//   } catch (error) {
//     errorResponse(res, "Error saving reckoner data", 500, error);
//   }
// };



exports.saveReckonerData = async (req, res) => {
  try {
    const { poNumber, siteId, categories, created_by } = req.body;

    // Validate required fields
    // if (!poNumber || !siteId || !categories || !created_by) {
    //   return errorResponse(res, "PO number, site ID, categories, and created_by are required", 400);
    // }

    // // Validate created_by format
    // if (typeof created_by !== 'string' || created_by.trim() === '' || created_by.length > 30) {
    //   return errorResponse(res, "Invalid created_by: must be a non-empty string with maximum length of 30 characters", 400);
    // }

    // Optional: Validate created_by against a reference table (e.g., employee_master)
    /*
    const [user] = await db.query('SELECT emp_id FROM employee_master WHERE emp_id = ?', [created_by]);
    if (user.length === 0) {
      return errorResponse(res, `Invalid created_by: ${created_by} does not exist in employee_master`, 400);
    }
    */

    const site = await reckonerModel.getSiteById(siteId);
    if (!site) {
      return errorResponse(res, "Site not found for the given site ID", 404);
    }

    const reckonerData = [];
    categories.forEach((category) => {
      category.subcategories.forEach((subcategory) => {
        subcategory.items.forEach((item) => {
          reckonerData.push({
            site_id: siteId,
            category_id: category.categoryId,
            subcategory_id: subcategory.subcategoryId,
            item_id: item.itemId,
            desc_id: item.descId,
            po_quantity: parseFloat(item.poQuantity) || 0,
            uom: item.uom || "",
            rate: parseFloat(item.rate) || 0,
            value: parseFloat(item.value) || 0,
            created_by: created_by, // Include created_by
          });
        });
      });
    });

    if (reckonerData.length === 0) {
      return errorResponse(res, "No valid items to save", 400);
    }

    const insertedIds = await reckonerModel.saveReckonerData(reckonerData);
    successResponse(
      res,
      {
        message: "Reckoner data saved successfully",
        insertedRecords: insertedIds.length,
      },
      "Operation completed successfully"
    );
  } catch (error) {
    console.error('Error in saveReckonerData:', {
      message: error.message,
      sqlMessage: error.sqlMessage || 'No SQL message available',
      stack: error.stack
    });
    errorResponse(res, "Error saving reckoner data", 500, error);
  }
};

exports.getAllReckonerWithStatus = async (req, res) => {
  try {
    const reckonerData = await reckonerModel.getAllReckonerWithStatus();
    successResponse(res, reckonerData, "Reckoner data with status fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching reckoner data with status", 500, error);
  }
};

exports.getReckonerByPoNumberWithStatus = async (req, res) => {
  try {
    const { poNumber } = req.params;
    if (!poNumber) return errorResponse(res, "PO number is required", 400);
    const reckonerData = await reckonerModel.getReckonerByPoNumberWithStatus(poNumber);
    if (!reckonerData) return errorResponse(res, "No data found for this PO number", 404);
    successResponse(res, reckonerData, "Reckoner data with status fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching reckoner data by PO", 500, error);
  }
};

exports.updateCompletionStatus = async (req, res) => {
  try {
    const { rec_id } = req.params;
    const {
      area_completed,
      rate,
      value,
      billed_area,
      billed_value,
      balance_area,
      balance_value,
      work_status,
      billing_status,
      created_by, // Expect created_by from the request body
    } = req.body;

    if (!rec_id) return errorResponse(res, "Record ID is required", 400);
    if (!created_by) return errorResponse(res, "Created by ID is required", 400);

    // ✅ Call model method instead of writing raw query here
    const recExists = await reckonerModel.checkRecIdExistsInPO(rec_id);
    if (!recExists) {
      return errorResponse(
        res,
        `Invalid rec_id (${rec_id}): does not exist in po_reckoner`,
        400
      );
    }

    const updateData = {
      area_completed: parseFloat(area_completed) || 0,
      rate: parseFloat(rate) || 0,
      value: parseFloat(value) || 0,
      billed_area: parseFloat(billed_area) || 0,
      billed_value: parseFloat(billed_value) || 0,
      balance_area: parseFloat(balance_area) || 0,
      balance_value: parseFloat(balance_value) || 0,
      work_status: work_status || 'In Progress',
      billing_status: billing_status || 'Not Billed',
      created_by, // Use the provided created_by
    };

    await reckonerModel.updateCompletionStatus(rec_id, updateData);

    successResponse(res, null, "Completion status updated successfully");
  } catch (error) {
    errorResponse(res, "Error updating completion status", 500, error);
  }
};


exports.checkPoReckoner = async (req, res) => {
  try {
    const site_id = req.params.site_id;
    if (!site_id) {
      return res.status(400).json({
        status: "error",
        message: "site_id parameter is required",
      });
    }
    const result = await reckonerModel.checkPoReckonerExists(site_id);
    res.status(200).json({
      status: "success",
      message: result.exists ? "po_reckoner created" : "po_reckoner not created",
      data: {
        site_id: result.site_id,
        site_name: result.site_name,
      },
    });
  } catch (error) {
    if (error.message === "Site not found") {
      res.status(404).json({
        status: "error",
        message: "Site not found",
      });
    } else {
      console.error("Error checking PO Reckoner:", error);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    }
  }
};



exports.getAllSites = async (req, res) => {
  try {
    const sites = await reckonerModel.fetchAllSites();
    successResponse(res, sites, "Sites fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching sites", 500, error);
  }
};






exports.getSitesByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Validate companyId
    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID provided.',
      });
    }

    // Fetch sites using the model
    const sites = await reckonerModel.fetchSitesByCompany(companyId);

    // Check if sites were found
    if (!sites || sites.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No sites found for the specified company.',
        data: [],
      });
    }

    // Return the sites in the expected format
    res.status(200).json({
      success: true,
      data: sites,
    });
  } catch (error) {
    console.error('Error fetching sites by company:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sites. Please try again later.',
    });
  }
};




exports.getReckonerBySiteId = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID is required'
      });
    }

    const reckonerData = await reckonerModel.getReckonerBySiteId(siteId);
    
    if (!reckonerData || reckonerData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reckoner data found for this site'
      });
    }

    res.status(200).json({
      success: true,
      data: reckonerData,
      message: 'Reckoner data fetched successfully'
    });
  } catch (error) {
    console.error('Error in getReckonerBySiteId controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reckoner data',
      error: error.message
    });
  }
};



exports.updateSiteDetails = async (req, res) => {
  try {
    const { site_id } = req.params;
    const { site_name, po_number, start_date, end_date, incharge_id, location_id, reckoner_type_id } = req.body;
    
    if (!site_id || !site_name || !po_number) {
      return errorResponse(res, "Site ID, name, and PO number are required", 400);
    }
    
    const updated = await reckonerModel.updateSiteDetails(site_id, {
      site_name,
      po_number,
      start_date,
      end_date,
      incharge_id,
      location_id,
      reckoner_type_id
    });
    
    if (!updated) {
      return errorResponse(res, "Site not found", 404);
    }
    
    successResponse(res, null, "Site details updated successfully");
  } catch (error) {
    errorResponse(res, "Error updating site details", 500, error);
  }
};





exports.getAllLocations = async (req, res) => {
  try {
    const locations = await reckonerModel.fetchAllLocations();
    successResponse(res, locations, "Locations fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching locations", 500, error);
  }
};

// ==================== Incharge Type Controllers ====================
exports.getAllInchargeTypes = async (req, res) => {
  try {
    const inchargeTypes = await reckonerModel.fetchAllInchargeTypes();
    successResponse(res, inchargeTypes, "Incharge types fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching incharge types", 500, error);
  }
};

// ==================== Reckoner Type Controllers ====================
exports.getAllReckonerTypes = async (req, res) => {
  try {
    const reckonerTypes = await reckonerModel.fetchAllReckonerTypes();
    successResponse(res, reckonerTypes, "Reckoner types fetched successfully");
  } catch (error) {
    errorResponse(res, "Error fetching reckoner types", 500, error);
  }
};