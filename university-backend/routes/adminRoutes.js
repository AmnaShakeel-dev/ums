const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    createSubject,
    getAllSubjects,
    updateSubject,
    deleteSubject,
    enrollStudent,
    getAllEnrollments,
    removeEnrollment,
    getAnalytics,
} = require("../controllers/adminController");

// Har route pe pehle JWT check hoga phir admin role check hoga
const adminAuth = [authenticateJWT, checkRole("admin")];

// =====================
// USER ROUTES
// =====================
router.post("/users", adminAuth, createUser);
router.get("/users", adminAuth, getAllUsers);
router.get("/users/:id", adminAuth, getUser);
router.put("/users/:id", adminAuth, updateUser);
router.delete("/users/:id", adminAuth, deleteUser);

// =====================
// SUBJECT ROUTES
// =====================
router.post("/subjects", adminAuth, createSubject);
router.get("/subjects", adminAuth, getAllSubjects);
router.put("/subjects/:id", adminAuth, updateSubject);
router.delete("/subjects/:id", adminAuth, deleteSubject);

// =====================
// ENROLLMENT ROUTES
// =====================
router.post("/enrollments", adminAuth, enrollStudent);
router.get("/enrollments", adminAuth, getAllEnrollments);
router.delete("/enrollments/:id", adminAuth, removeEnrollment);

// =====================
// ANALYTICS ROUTE
// =====================
router.get("/analytics", adminAuth, getAnalytics);

module.exports = router;