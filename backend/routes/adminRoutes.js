const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Route to get all companies
router.get('/companies', adminController.getCompanies);

// Route to get projects by company ID
router.get('/projects/:companyId', adminController.getProjectsByCompany);

// Route to get sites by project ID
router.get('/sites/:projectId', adminController.getSitesByProject);

// Route to get work descriptions by site ID and category ID
router.get('/work-descriptions/:siteId', adminController.getWorkDescriptions);
// router.get('/completion-entries-by-site/:siteId', adminController.getCompletionEntriesBySite);

router.get('/completion-entries-by-site/:siteId/:descId', adminController.getCompletionEntriesBySite);
// Route to get PO reckoner totals by site ID
router.get('/po-reckoner-totals/:siteId/:descId', adminController.getPoReckonerTotals);
// Route to get expense details by site ID
router.get('/expense-details/:siteId/:descId', adminController.getExpenseDetailsBySite);

// Route to get work descriptions by site ID
router.get('/work-descriptions-by-site/:siteId', adminController.getWorkDescriptionsBySite);

// Route to get PO totals by site ID and desc ID
router.get('/po-total-budget/:siteId/:descId', adminController.getPoTotalBudget);


router.get('/po-budget', adminController.getPoBudget);

router.post('/save-po-budget', adminController.savePoBudget);

// Route to get overheads
router.get('/overheads', adminController.getOverheads);

// Route to save overhead
router.post('/save-overhead', adminController.saveOverhead);
router.post('/save-overhead-values', adminController.saveOverheadValue);

router.post('/save-dynamic-overhead-values', adminController.saveDynamicOverheadValues);

// Route to save actual budget entries
router.post('/save-actual-budget', adminController.saveActualBudget);

router.get('/actual-budget/:po_budget_id', adminController.getActualBudgetEntries);

// Add the new route for fetching material planning budget
router.get('/fetch-material-planning-budget', adminController.fetchMaterialPlanningBudget);


// Route to get contractors
router.get('/contractors', adminController.getContractors);

// Route to add labour
router.post('/add-labour', adminController.addLabour);

router.get("/labour", adminController.getLabourEmployees);
router.post("/save-labour-assignment", adminController.saveLabourAssignment);

// Updated route
router.get('/material-graph/:siteId/:descId', adminController.materialgraph);

router.post('/save-labour-overhead', adminController.saveLabourOverhead);

router.post('/final-projection-submission', adminController.finalProjectionSubmission);

// Top Sheet - Overall Data without filters
router.get('/top-sheet-overall', adminController.getTopSheetOverall);


module.exports = router;