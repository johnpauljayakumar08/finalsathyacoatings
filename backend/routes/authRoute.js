const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/verify-md-otp", authController.verifyManagingDirectorOtp);
router.post("/logout", authController.logout);
router.post("/verify-token", authController.verifyToken);
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);

module.exports = router;