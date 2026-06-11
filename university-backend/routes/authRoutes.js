const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const { login, getMe, changePassword } = require("../controllers/authController");

// @route   POST /api/auth/login
// @access  Public
router.post("/login", login);

// @route   GET /api/auth/me
// @access  Private
router.get("/me", authenticateJWT, getMe);

// @route   PUT /api/auth/change-password
// @access  Private
router.put("/change-password", authenticateJWT, changePassword);

module.exports = router;