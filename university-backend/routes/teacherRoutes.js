const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const { uploadSingle } = require("../middleware/upload");
const {
    getMySubjects,
    getEnrolledStudents,
    markAttendance,
    getAttendanceHistory,
    uploadLecture,
    getMyLectures,
    deleteLecture,
    createAssignment,
    getMyAssignments,
    deleteAssignment,
    getSubmissions,
    gradeSubmission,
    createAnnouncement,
    getMyAnnouncements,
} = require("../controllers/teacherController");

// Har route pe JWT aur teacher role check hoga
const teacherAuth = [authenticateJWT, checkRole("teacher")];

// =====================
// SUBJECT ROUTES
// =====================
router.get("/subjects", teacherAuth, getMySubjects);
router.get("/subjects/:subjectId/students", teacherAuth, getEnrolledStudents);

// =====================
// ATTENDANCE ROUTES
// =====================
router.post("/attendance", teacherAuth, markAttendance);
router.get("/attendance/:subjectId", teacherAuth, getAttendanceHistory);

// =====================
// LECTURE ROUTES
// =====================
router.post("/lectures", teacherAuth, uploadSingle, uploadLecture);
router.get("/lectures", teacherAuth, getMyLectures);
router.delete("/lectures/:id", teacherAuth, deleteLecture);

// =====================
// ASSIGNMENT ROUTES
// =====================
router.post("/assignments", teacherAuth, uploadSingle, createAssignment);
router.get("/assignments", teacherAuth, getMyAssignments);
router.delete("/assignments/:id", teacherAuth, deleteAssignment);

// =====================
// GRADING ROUTES
// =====================
router.get("/assignments/:id/submissions", teacherAuth, getSubmissions);
router.put("/submissions/:id/grade", teacherAuth, gradeSubmission);

// =====================
// ANNOUNCEMENT ROUTES
// =====================
router.post("/announcements", teacherAuth, createAnnouncement);
router.get("/announcements", teacherAuth, getMyAnnouncements);

module.exports = router;