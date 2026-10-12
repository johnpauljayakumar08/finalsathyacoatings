const express = require("express");
const router = express.Router();
const sheetController = require("../controllers/sheetController");

// Create a new consumable
router.post("/consumables", sheetController.createConsumable);
// Get all consumables
router.get("/consumables", sheetController.getAllConsumable);
// Get a single consumable by ID
router.get("/consumables/:id", sheetController.getConsumableById);
// Update a consumable
router.put("/consumables/:id", sheetController.updateConsumable);
// Delete a consumable
router.delete("/consumables/:id", sheetController.deleteConsumable);


// Process all sites and generate reports
router.get('/process', sheetController.processSiteReports);
// router.get('/process/:site_id', sheetController.processSiteReportsById);

router.get('/process/:po_number', sheetController.processSiteReportsByPO);
// Get reports for specific site
router.get('/fetch/:site_id', sheetController.getSiteReports);




// Get worksheet data for a site
router.get('/worksheet/:site_id', sheetController.getWorksheetData);
// Get worksheet data for a site filtered by report type
router.get('/worksheet/:site_id/:report_type_id', sheetController.getWorksheetDataByReportType);

// update data from worksheet to db table
router.patch('/worksheet/update', sheetController.updateWorksheetData);

module.exports = router;
