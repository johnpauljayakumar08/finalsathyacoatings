// Updated SiteInchargeRoutes.js - Added route for update-labour-assignment
const express = require("express");
const router = express.Router();
const SiteInchargeController = require("../controllers/SiteInchargeController");

router.get("/completion-entries", SiteInchargeController.getCompletionEntries);
router.post("/completion-status", SiteInchargeController.saveCompletionStatus);
router.put("/update-completion-entry", SiteInchargeController.updateCompletionEntry);
router.get("/completion-entries-by-site/:site_id", SiteInchargeController.getCompletionEntriesBySiteID);
router.post("/acknowledge-material", SiteInchargeController.saveMaterialAcknowledgement);
router.get("/acknowledgement-details", SiteInchargeController.getAcknowledgementDetails);
router.put("/update-acknowledgement", SiteInchargeController.updateMaterialAcknowledgement);
router.get("/material-usage-details", SiteInchargeController.getMaterialUsageDetails);
router.post("/save-material-usage", SiteInchargeController.saveMaterialUsage);
router.put("/update-material-usage-entry", SiteInchargeController.updateMaterialUsageEntry);
// Routes for labour assignment
router.get('/employees', SiteInchargeController.getEmployeesByDesignation);
router.post('/save-labour-assignment', SiteInchargeController.saveLabourAssignment);
router.get('/work-descriptions', SiteInchargeController.getWorkDescriptionsBySite);
router.get('/assigned-labours', SiteInchargeController.getAssignedLabours);
router.put('/update-labour-assignment', SiteInchargeController.updateLabourAssignment); // New route for update
router.post('/save-labour-attendance', SiteInchargeController.saveLabourAttendance);
router.get('/labour-attendance', SiteInchargeController.getLabourAttendance);

// New routes for budget expense entry
router.get("/budget-details", SiteInchargeController.getBudgetDetails);
router.get("/budget-expense-details", SiteInchargeController.getBudgetExpenseDetails);
router.post("/save-budget-expense", SiteInchargeController.saveBudgetExpense);
router.put("/update-budget-expense-entry", SiteInchargeController.updateBudgetExpenseEntry);
router.get("/budget-work-descriptions/:site_id", SiteInchargeController.getBudgetWorkDescriptionsBySite);
router.get("/labours", SiteInchargeController.getLabours);

router.get("/calculate-labour-budget", SiteInchargeController.calculateLabourBudget);


// view siteincharge history and edit
router.get("/acknowledgements-by-incharge/:incharge_id", SiteInchargeController.viewAcknowledgementsBySiteInchargeId);

router.get("/material-usage-by-incharge/:incharge_id", SiteInchargeController.viewMaterialUsageBySiteInchargeId);

// Add this route line to SiteInchargeRoutes.js (e.g., after the existing budget routes)

router.get("/expense-by-incharge/:incharge_id", SiteInchargeController.viewExpenseBySiteInchargeId);

// Add this route line to SiteInchargeRoutes.js (e.g., after the existing completion routes)

router.get("/completion-by-incharge/:incharge_id", SiteInchargeController.viewCompletionBySiteInchargeId);
// Add this route line to SiteInchargeRoutes.js (e.g., after the existing labour routes)

router.get("/labour-assignment-by-incharge/:incharge_id", SiteInchargeController.viewLabourAssignmentBySiteInchargeId);

// Add this route line to SiteInchargeRoutes.js (e.g., after the existing labour attendance routes)

router.get("/labour-attendance-by-incharge/:incharge_id", SiteInchargeController.viewLabourAttendanceBySiteInchargeId);





// New routes for fetching all site incharge entries with siteincharge_name
router.get("/all-acknowledgements", SiteInchargeController.viewAllAcknowledgements);
router.get("/all-material-usage", SiteInchargeController.viewAllMaterialUsage);
router.get("/all-expense", SiteInchargeController.viewAllExpense);
router.get("/all-completion", SiteInchargeController.viewAllCompletion);
router.get("/all-labour-assignment", SiteInchargeController.viewAllLabourAssignment);
router.get("/all-labour-attendance", SiteInchargeController.viewAllLabourAttendance);



// New admin edit routes (no 48-hour restriction)
router.put("/admin-update-completion-entry", SiteInchargeController.adminUpdateCompletionEntry);
router.put("/admin-update-acknowledgement", SiteInchargeController.adminUpdateMaterialAcknowledgement);
router.put("/admin-update-material-usage-entry", SiteInchargeController.adminUpdateMaterialUsageEntry);
router.put("/admin-update-labour-assignment", SiteInchargeController.adminUpdateLabourAssignment);
router.put("/admin-update-budget-expense-entry", SiteInchargeController.adminUpdateBudgetExpenseEntry);
router.post("/admin-save-labour-attendance", SiteInchargeController.adminSaveLabourAttendance);

module.exports = router;
