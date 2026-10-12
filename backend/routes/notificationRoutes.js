const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController'); // Adjust path as needed

router.get('/test', notificationController.test);
router.get('/pending-acknowledgements', notificationController.getPendingAcknowledgements);
router.get('/pending-usages', notificationController.getPendingUsages);
router.get('/pending-expense-entries', notificationController.getPendingExpenseEntries);
router.get('/pending-completion-entries', notificationController.getPendingCompletionEntries);
router.get('/pending-attendance-entries', notificationController.getPendingAttendanceEntries);
router.get('/edited-acknowledgements', notificationController.getEditedAcknowledgements);
router.get('/edited-usages', notificationController.getEditedUsages);
router.get('/edited-expenses', notificationController.getEditedExpenseEntries);
router.get('/edited-completion-entries', notificationController.getEditedCompletionEntries);
router.get('/edited-attendance-entries', notificationController.getEditedAttendanceEntries);
router.get('/counts', notificationController.getNotificationCounts);
module.exports = router;