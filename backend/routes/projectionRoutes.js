// projectionRoutes.js
const express = require('express');
const router = express.Router();
const projectionController = require('../controllers/projectionController');

// Route to get PO totals by site ID and desc ID
router.get('/po-total-budget/:siteId/:descId', projectionController.getPoTotalBudget);

router.get('/po-budget', projectionController.getPoBudget);

router.post('/save-po-budget', projectionController.savePoBudget);

// Route to get overheads
router.get('/overheads', projectionController.getOverheads);

// Route to save overhead
router.post('/save-overhead', projectionController.saveOverhead);

router.post('/save-dynamic-overhead-values', projectionController.saveDynamicOverheadValues);

// Route to save actual budget entries
router.post('/save-actual-budget', projectionController.saveActualBudget);

router.get('/actual-budget/:po_budget_id', projectionController.getActualBudgetEntries);

// Add the new route for fetching material planning budget
router.get('/fetch-material-planning-budget', projectionController.fetchMaterialPlanningBudget);

router.post('/save-labour-overhead', projectionController.saveLabourOverhead);

router.post('/final-projection-submission', projectionController.finalProjectionSubmission);

router.get('/saved-budgets', projectionController.getSavedBudgetsBySiteAndDesc);


// NEW: Route for saving material allocation (repurposed functionality)
router.post('/save-material-allocation', projectionController.saveMaterialAllocation);

// Add to existing router
router.get('/allocated', projectionController.getProjectionAllocated);
router.get('/remaining', projectionController.getProjectionRemaining);

// Add to existing router
router.post('/update-overhead', projectionController.updateOverhead);
router.delete('/delete-overhead', projectionController.deleteOverhead);



// Add this to projectionRoutes.js
router.get('/actual-material/:siteId/:descId', projectionController.getActualMaterial);

// Updated projectionRoutes.js - Add this line after the existing routes
router.get('/submission-statuses', projectionController.getSubmissionStatuses);


// Add this new route to projectionRoutes.js (after the existing routes)

router.get('/check-final-submission-status', projectionController.checkFinalSubmissionStatus);
module.exports = router;