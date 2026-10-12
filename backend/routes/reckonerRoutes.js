const express = require("express");
const router = express.Router();
const reckonerController = require("../controllers/reckonerController");

// Category CRUD routes
router.get("/categories", reckonerController.getAllCategories);
router.get("/categories/:id", reckonerController.getCategoryById);
router.post("/categories", reckonerController.createCategory);
router.put("/categories/:id", reckonerController.updateCategory);
router.delete("/categories/:id", reckonerController.deleteCategory);

// Subcategory CRUD routes
router.get("/subcategories", reckonerController.getAllSubcategories);
router.get("/subcategories/:id", reckonerController.getSubcategoryById);
router.post("/subcategories", reckonerController.createSubcategory);
router.put("/subcategories/:id", reckonerController.updateSubcategory);
router.delete("/subcategories/:id", reckonerController.deleteSubcategory);

// Work Items routes
router.get("/work-items", reckonerController.getAllWorkItems);
router.get("/work-items/:id", reckonerController.getWorkItemById);
router.post("/work-items", reckonerController.createWorkItem);
router.post("/work-items/bulk", reckonerController.createMultipleWorkItems);
router.put("/work-items/:id", reckonerController.updateWorkItem);
router.delete("/work-items/:id", reckonerController.deleteWorkItem);

// Reckoner operations

router.post("/reckoner", reckonerController.saveReckonerData);

// get site_id by po_number
router.get("/sites/:poNumber", reckonerController.getSiteByPoNumber);

// Add these routes along with your existing routes
router.get("/reckoner", reckonerController.getAllReckonerWithStatus);
router.get(
  "/reckoner/:poNumber",
  reckonerController.getReckonerByPoNumberWithStatus
);

router.put(
  "/completion_status/:rec_id",
  reckonerController.updateCompletionStatus
);


// check if po-reckoner exists 
router.get('/check-po-reckoner/:site_id', reckonerController.checkPoReckoner);


router.get("/sites-by-id/:site_id", reckonerController.getSiteById);


// **********************************************



// Company routes
router.get("/companies", reckonerController.getAllCompanies);

// Project routes
router.get("/projects/:company_id", reckonerController.getProjectsByCompanyId);

// Site routes
router.get("/sites-by-project/:pd_id", reckonerController.getSitesByProjectId);

// Site routes
router.get("/sites", reckonerController.getAllSites);

router.get('/sites-by-company/:companyId', reckonerController.getSitesByCompany);

router.get('/site-reckoner/:siteId', reckonerController.getReckonerBySiteId);

router.put("/sites/:site_id", reckonerController.updateSiteDetails);

// New routes for locations, incharge types, and reckoner types
router.get("/locations", reckonerController.getAllLocations);
router.get("/incharge-types", reckonerController.getAllInchargeTypes);
router.get("/reckoner-types", reckonerController.getAllReckonerTypes);


module.exports = router;
