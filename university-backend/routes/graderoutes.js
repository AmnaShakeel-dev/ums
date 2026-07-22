const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const {
    getSubjectsWithStudents,
    enterGrade,
    getStudentGradeForTeacher,
    lockGrades,
    searchStudents,
    getStudentDetail,
    getTeacherSubjectAnalytics,
    adminUnlockGrades,
    adminEnterGrade,
    adminGetAllGrades,
    getMyGrades,
    getStudentAnalytics,
} = require("../controllers/gradeController");

const teacher = [auth, checkRole("teacher")];
const admin = [auth, checkRole("admin")];
const student = [auth, checkRole("student")];

// Teacher routes
router.get("/teacher/subjects-students", ...teacher, getSubjectsWithStudents);
router.post("/teacher/enter", ...teacher, enterGrade);
router.get("/teacher/student/:studentId/subject/:subjectId", ...teacher, getStudentGradeForTeacher);
router.put("/teacher/lock", ...teacher, lockGrades);
router.get("/teacher/search-students", ...teacher, searchStudents);
router.get("/teacher/student-detail/:studentId", ...teacher, getStudentDetail);
router.get("/teacher/analytics/:subjectId", ...teacher, getTeacherSubjectAnalytics);

// Admin routes
router.put("/admin/unlock", ...admin, adminUnlockGrades);
router.put("/admin/enter", ...admin, adminEnterGrade);
router.get("/admin/all-grades", ...admin, adminGetAllGrades);

// Student routes
router.get("/student/my-grades", ...student, getMyGrades);
router.get("/student/analytics", ...student, getStudentAnalytics);

module.exports = router;