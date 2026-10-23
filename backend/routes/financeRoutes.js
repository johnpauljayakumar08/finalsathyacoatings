const express = require("express");
const router = express.Router();
const financeController = require("../controllers/financeController");
const purchaseRegisterController = require("../controllers/purchaseRegisterController");
const purchaseRegisterAuth = require("../middleware/purchaseRegisterAuth");

router.get("/test", financeController.test);

// Creditor Client Routes
router.post("/create-creditors-client", financeController.createCreditorsClient);
router.get('/existing-invoice-numbers', financeController.getExistingInvoiceNumbers);
router.get("/view-creditors-client", financeController.viewCreditorsClient);
router.put("/update-creditors-client/:id", financeController.updateCreditorsClient);
router.delete("/delete-creditors-client/:id", financeController.deleteCreditorsClient);

// Creditor Routes
router.post("/create-creditors", financeController.createCreditors);
router.get("/view-creditors", financeController.viewCreditors);
router.get("/creditors/:id", financeController.getCreditorById);
router.put("/update-creditors", financeController.updateCreditors);
router.delete("/delete-creditors/:id", financeController.deleteCreditors);
router.get("/overall-creditors-balance", financeController.fetchOverallCreditorsBalance);

// New route line in financeRoutes.js
router.get("/companies-with-projects", financeController.getCompaniesWithProjects);
router.get("/site-incharges", financeController.getSiteInchargesByPdId);
router.post("/siteincharge-attendance", financeController.upsertSiteInchargeAttendance);
router.get("/siteincharge-attendance", financeController.getSiteInchargeAttendanceByDate);
router.get("/siteincharge-attendance-history", financeController.getSiteInchargeAttendanceHistory);
router.get("/salary-payables-summary-by-attendance", financeController.getSiteInchargeSalarySummaryByAttendance);

router.get('/salary-transaction-logs', financeController.getSalaryTransactionLogs);


// Updated salary payables summary route ( manual paid_amount)
router.get("/salary-payables-summary", financeController.getSalaryPayablesSummary);
router.post("/update-salary-payable", financeController.updateSalaryPayable);



// Add these lines to financeRoutes.js

router.get("/cost-categories", financeController.getCostCategories);
router.post("/create-transport-payable", financeController.createTransportPayable);
router.get("/transport-payables", financeController.getTransportPayablesByPdId);
router.put("/update-transport-payable/:id", financeController.updateTransportPayable);
router.get('/existing-dc-numbers', financeController.getExistingMaterialDcNo);


router.post("/create-scaffolding-payable", financeController.createScaffoldingPayable);
router.put("/update-scaffolding-payable/:id", financeController.updateScaffoldingPayable);
router.get("/scaffolding-payables", financeController.getScaffoldingPayablesByPdId);

// Site Accommodation Payable Routes
router.post("/create-site-accommodation-payable", financeController.createSiteAccommodationPayable);
router.get("/site-accommodation-payables", financeController.getSiteAccommodationPayablesByPdId);
router.put("/update-site-accommodation-payable/:id", financeController.updateSiteAccommodationPayable);

// Commission Payable Routes

router.get("/marketing-persons", financeController.getMarketingPersons);
router.post("/create-commission-payable", financeController.createCommissionPayable);
router.get("/commission-payables", financeController.getCommissionPayablesByPdId);
router.put("/update-commission-payable/:id", financeController.updateCommissionPayable);


// TDS Payable Routes
router.post("/create-tds-payable", financeController.createTdsPayable);
// router.get("/tds-payables", financeController.getTdsPayablesByPdId);
router.get("/tds-payables", financeController.getAllTdsPayables);
router.put("/update-tds-payable/:id", financeController.updateTdsPayable);



// GST Payable Routes
router.get("/gst-companies", financeController.getGstCompanies);
router.post("/create-gst-company", financeController.createGstCompany);
router.post("/create-gst-payable", financeController.createOrUpdateGstPayable);
router.get("/gst-payables", financeController.getGstPayables);
router.put('/update-gst-payable/:id', financeController.updateGstPayable);



router.post("/create-credit-card-payable", financeController.createOrUpdateCreditCardPayable);
router.get("/credit-card-payables", financeController.getCreditCardPayablesByPdId); // name kept same for compatibility

router.put("/credit-card-payable/:id", financeController.updateCreditCardPayable); // New dedicated PUT

// Other Payables
router.post("/create-other-payable", financeController.createOrUpdateOtherPayable);
router.get("/other-payables", financeController.getOtherPayables);
router.get("/overall-payable", financeController.fetchOverallPayable);
router.get("/overall-receivable", financeController.fetchOverallReceivable);



// Billed Debtors Routes
router.get("/items", financeController.getItems);
router.post("/create-item", financeController.createItem);
router.get("/parties", financeController.getParties);
router.post("/create-party", financeController.createParty);
router.post("/create-billed-debtors", financeController.createBilledDebtors);
router.get("/view-billed-debtors", financeController.viewBilledDebtors);
router.put("/update-billed-debtors", financeController.updateBilledDebtors);
// Billed Debtors Routes (add this line if not already)
router.get("/uoms", financeController.getUoms);



// Bank Master Routes (CORRECT & SAFE)
router.get("/bank-masters", financeController.getBankMasters);
router.get(
  "/bank-details",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team', 'managing_director']),
  financeController.getBankDetails
);
router.post(
  "/bank-details",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['managing_director']),
  financeController.createBankDetails
);
router.put(
  "/bank-details/:id",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['managing_director']),
  financeController.updateBankDetails
);
router.post(
  "/create-bank-master",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['managing_director']),
  financeController.createBankMaster
);
router.put(
  "/update-bank-master",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['managing_director']),
  financeController.updateBankMaster
);

// CFS → Salary Payable - All Records (No Query Params)
router.get("/cfs-data", financeController.fetchCFSdata);
// routes/financeRoutes.js or similar
router.get("/cpe-data", financeController.fetchCPEdata);    



router.post("/create-custom-category", financeController.createCustomCategory);
router.get("/custom-categories", financeController.getCustomCategories);

router.post("/create-custom-payment", financeController.createCustomPayment);
router.put("/update-custom-payment/:id", financeController.updateCustomPayment);
router.delete("/delete-custom-payment/:id", financeController.deleteCustomPayment);
router.get("/custom-payments-by-category", financeController.getCustomPaymentsByCategory);
router.get("/all-custom-payments", financeController.getAllCustomPayments);
router.get("/salary-payable-transactions", financeController.getSalaryPayableTransactions);

router.get("/compound-purchase-entries", financeController.getCompoundPurchaseEntries);
router.post("/compound-purchase-entries", financeController.createCompoundPurchaseEntry);


// Paid & Received Details
router.get("/paid-received-details", financeController.getPaidReceivedDetails);

router.get("/bank-history/:id", financeController.getBankHistory);

// DEM (Daily Expense Management) entries
router.get("/dem/masters", financeController.getDemMasters);
router.post("/dem/masters", financeController.createDemMaster);
router.get("/dem/entries", financeController.getDemEntries);
router.post("/dem/entries", financeController.createDemEntry);
router.put(
  "/dem/entries/:id",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin']),
  financeController.updateDemEntry
);
router.get("/dem/entries/:id/history", financeController.getDemEntryHistory);

router.get("/paid-received-detailed", financeController.getPaidReceivedDetailed);

// Bill To Be Raise Routes
router.post("/create-bill-to-be-raise", financeController.createBillToBeRaise);
router.get("/bill-to-be-raise", financeController.getBillToBeRaise);   // ← For ViewBillToBeRaise component
router.put("/update-bill-to-be-raise/:id", financeController.updateBillToBeRaise);     // ← NEW
router.delete("/delete-bill-to-be-raise/:id", financeController.deleteBillToBeRaise); // ← NEW
router.get("/bill-to-be-raise-summary", financeController.getBillToBeRaiseSummary);


// ==================== BANK STATEMENT CONSOLIDATION ROUTES ====================
router.get("/financial-years", financeController.getFinancialYears);
router.get("/cost-centers", financeController.getCostCenters);
router.post("/cost-centers", financeController.createCostCenter);
router.post("/create-financial-year", financeController.createFinancialYear);
router.post("/create-bank-statement", financeController.createBankStatement);
router.get("/bank-statements", financeController.getBankStatements);
router.get("/bank-statements/:id", financeController.getBankStatementById);
router.put("/update-bank-statement/:id", financeController.updateBankStatement);
router.delete("/delete-bank-statement/:id", financeController.deleteBankStatement);

// ==================== PURCHASE REGISTER ROUTES ====================
router.use(
  "/purchase-registers",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team', 'managing_director'])
);
router.post(
  "/create-purchase-register",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.createPurchaseRegister
);
router.get("/purchase-registers", purchaseRegisterController.listPurchaseRegisters);
router.get(
  "/purchase-registers/sync-payments",
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.syncPurchasePayments
);
router.post(
  "/purchase-registers/extract-purchase-order-pdf",
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.extractPurchaseOrderPdf
);
router.get("/purchase-registers/:id", purchaseRegisterController.getPurchaseRegister);
router.put(
  "/update-purchase-register/:id",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.updatePurchaseRegister
);
router.patch(
  "/purchase-registers/:id/approval",
  purchaseRegisterAuth.authorize(['managing_director', 'superadmin']),
  purchaseRegisterController.setPurchaseApproval
);
router.patch(
  "/purchase-registers/:id/material-receipt",
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.setMaterialReceipt
);
router.post(
  "/purchase-registers/:id/purchase-order-pdf",
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.uploadPurchaseOrderPdf
);
router.get("/purchase-registers/:id/purchase-order-pdf", purchaseRegisterController.downloadPurchaseOrderPdf);
router.delete(
  "/delete-purchase-register/:id",
  purchaseRegisterAuth.authenticate,
  purchaseRegisterAuth.authorize(['admin', 'superadmin', 'accounts_team']),
  purchaseRegisterController.deletePurchaseRegister
);

// ==================== SALES REGISTER ROUTES ====================
router.post("/create-sales-invoice", financeController.createSalesInvoice);
router.post("/create-sales-register", financeController.createSalesRegister);
router.get("/sales-registers", financeController.getSalesRegisters);
router.get("/sales-registers/:id", financeController.getSalesRegisterById);
router.put("/update-sales-register/:id", financeController.updateSalesRegister);
router.delete("/delete-sales-register/:id", financeController.deleteSalesRegister);


// ==================== MATERIAL REGISTER ROUTES ====================
router.post("/create-material-register", financeController.createMaterialRegister);
router.get("/material-registers", financeController.getMaterialRegisters);
router.get("/material-registers/:id", financeController.getMaterialRegisterById);
router.put("/update-material-register/:id", financeController.updateMaterialRegister);
router.delete("/delete-material-register/:id", financeController.deleteMaterialRegister);

router.get('/sync-bank-statement', financeController.syncBankStatementToRegisters);

// Get sync status
router.get('/bank-statement-sync-status', financeController.getBankStatementSyncStatus);

module.exports = router;