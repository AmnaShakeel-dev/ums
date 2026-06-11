const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const { uploadSingle, uploadPhoto } = require("../middleware/upload");
const {
    getProfile,
    updateProfile,
    getMySubjects,
    getSubjectLectures,
    downloadLecture,
    getMyAssignments,
    submitAssignment,
    getMyAttendance,
    getMyAnnouncements,
    markAnnouncementRead,
} = require("../controllers/studentController");

// Har route pe JWT aur student role check hoga
const studentAuth = [authenticateJWT, checkRole("student")];

// =====================
// PROFILE ROUTES
// =====================
router.get("/profile", studentAuth, getProfile);
router.put("/profile", studentAuth, uploadPhoto, updateProfile);

// =====================
// SUBJECT ROUTES
// =====================
router.get("/subjects", studentAuth, getMySubjects);

// =====================
// LECTURE ROUTES
// =====================
router.get("/lectures/:subjectId", studentAuth, getSubjectLectures);
router.put("/lectures/:id/download", studentAuth, downloadLecture);

// =====================
// ASSIGNMENT ROUTES
// =====================
router.get("/assignments", studentAuth, getMyAssignments);
router.post("/assignments/:id/submit", studentAuth, uploadSingle, submitAssignment);

// =====================
// ATTENDANCE ROUTES
// =====================
router.get("/attendance", studentAuth, getMyAttendance);

// =====================
// ANNOUNCEMENT ROUTES
// =====================
router.get("/announcements", studentAuth, getMyAnnouncements);
router.put("/announcements/:id/read", studentAuth, markAnnouncementRead);

module.exports = router;