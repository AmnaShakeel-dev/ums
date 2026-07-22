const Grade = require("../models/Grades");
const Subject = require("../models/Subject");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

// ─── helpers ────────────────────────────────────────────────────────────────

const isTeacherOfSubject = async (teacherId, subjectId) => {
    const subject = await Subject.findById(subjectId);
    return subject && subject.teacher.toString() === teacherId.toString();
};

// ─── TEACHER: get subjects with enrolled students ────────────────────────────

// GET /api/grades/teacher/subjects-students
const getSubjectsWithStudents = async (req, res) => {
    try {
        const subjects = await Subject.find({ teacher: req.user.id });

        const result = await Promise.all(
            subjects.map(async (sub) => {
                const enrollments = await Enrollment.find({ subject: sub._id })
                    .populate("student", "name email department phone");
                return {
                    subject: sub,
                    students: enrollments.map((e) => e.student),
                };
            })
        );

        res.status(200).json({ success: true, data: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: upsert grade for a student in a subject ───────────────────────

// POST /api/grades/teacher/enter
const enterGrade = async (req, res) => {
    try {
        const { studentId, subjectId, component, totalMarks, obtainedMarks } = req.body;

        // Validate component
        const allowed = ["assignment", "quiz", "mid", "final"];
        if (!allowed.includes(component)) {
            return res.status(400).json({ success: false, message: "Invalid component." });
        }

        // Validate marks
        if (obtainedMarks < 0 || totalMarks < 0) {
            return res.status(400).json({ success: false, message: "Marks cannot be negative." });
        }
        if (obtainedMarks > totalMarks) {
            return res.status(400).json({
                success: false,
                message: "Obtained marks cannot exceed total marks.",
            });
        }

        // Verify teacher is assigned to this subject
        const isAssigned = await isTeacherOfSubject(req.user.id, subjectId);
        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Access denied. Not your subject." });
        }

        // Find or create grade record
        let grade = await Grade.findOne({ student: studentId, subject: subjectId });

        if (!grade) {
            // Verify student is enrolled
            const enrollment = await Enrollment.findOne({
                student: studentId,
                subject: subjectId,
            });
            if (!enrollment) {
                return res.status(400).json({
                    success: false,
                    message: "Student is not enrolled in this subject.",
                });
            }

            grade = new Grade({
                student: studentId,
                subject: subjectId,
                teacher: req.user.id,
            });
        }

        // Check lock
        if (grade.isLocked) {
            return res.status(400).json({
                success: false,
                message: "Grades are locked. Contact admin to unlock.",
            });
        }

        // Update component
        grade[component] = {
            totalMarks: Number(totalMarks),
            obtainedMarks: Number(obtainedMarks),
            isEntered: true,
        };

        await grade.save();

        res.status(200).json({
            success: true,
            message: `${component} marks saved successfully.`,
            grade,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: get grades for a student in their subject ─────────────────────

// GET /api/grades/teacher/student/:studentId/subject/:subjectId
const getStudentGradeForTeacher = async (req, res) => {
    try {
        const { studentId, subjectId } = req.params;

        const isAssigned = await isTeacherOfSubject(req.user.id, subjectId);
        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const grade = await Grade.findOne({ student: studentId, subject: subjectId })
            .populate("student", "name email department phone")
            .populate("subject", "subjectCode subjectName");

        // Attendance summary for this student in this subject
        const attendanceRecords = await Attendance.find({
            student: studentId,
            subject: subjectId,
        });
        const total = attendanceRecords.length;
        const present = attendanceRecords.filter((a) => a.status === "present").length;
        const absent = attendanceRecords.filter((a) => a.status === "absent").length;
        const late = attendanceRecords.filter((a) => a.status === "late").length;
        const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

        res.status(200).json({
            success: true,
            grade: grade || null,
            attendance: { total, present, absent, late, percentage: attendancePct },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: lock grades ────────────────────────────────────────────────────

// PUT /api/grades/teacher/lock
const lockGrades = async (req, res) => {
    try {
        const { subjectId } = req.body;

        const isAssigned = await isTeacherOfSubject(req.user.id, subjectId);
        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        await Grade.updateMany(
            { subject: subjectId, isLocked: false },
            { isLocked: true, lockedAt: new Date(), lockedBy: req.user.id }
        );

        res.status(200).json({ success: true, message: "All grades for this subject are now locked." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: search students in their subjects ──────────────────────────────

// GET /api/grades/teacher/search-students?q=...
const searchStudents = async (req, res) => {
    try {
        const q = req.query.q || "";

        // Get all subjects of this teacher
        const subjects = await Subject.find({ teacher: req.user.id });
        const subjectIds = subjects.map((s) => s._id);

        // Get enrolled students in these subjects
        const enrollments = await Enrollment.find({ subject: { $in: subjectIds } })
            .populate("student", "name email department phone rollNumber registrationNumber")
            .populate("subject", "subjectCode subjectName");

        // Filter by search query
        const filtered = enrollments.filter((e) => {
            const s = e.student;
            const search = q.toLowerCase();
            return (
                s.name?.toLowerCase().includes(search) ||
                s.email?.toLowerCase().includes(search) ||
                s.rollNumber?.toLowerCase().includes(search) ||
                s.registrationNumber?.toLowerCase().includes(search)
            );
        });

        // Deduplicate students
        const seen = new Set();
        const students = [];
        filtered.forEach((e) => {
            if (!seen.has(e.student._id.toString())) {
                seen.add(e.student._id.toString());
                students.push({
                    student: e.student,
                    subject: e.subject,
                });
            }
        });

        res.status(200).json({ success: true, students });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: get full student detail ───────────────────────────────────────

// GET /api/grades/teacher/student-detail/:studentId
const getStudentDetail = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Subjects taught by this teacher
        const subjects = await Subject.find({ teacher: req.user.id });
        const subjectIds = subjects.map((s) => s._id);

        // Check this student is enrolled in at least one of teacher's subjects
        const enrollment = await Enrollment.findOne({
            student: studentId,
            subject: { $in: subjectIds },
        });
        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "This student is not enrolled in any of your subjects.",
            });
        }

        const student = await User.findById(studentId).select("-password");

        // All enrollments for this student in teacher's subjects
        const enrollments = await Enrollment.find({
            student: studentId,
            subject: { $in: subjectIds },
        }).populate("subject", "subjectCode subjectName credits");

        // Grades for each subject
        const gradesData = await Promise.all(
            enrollments.map(async (e) => {
                const grade = await Grade.findOne({
                    student: studentId,
                    subject: e.subject._id,
                });

                const attRecords = await Attendance.find({
                    student: studentId,
                    subject: e.subject._id,
                });
                const total = attRecords.length;
                const present = attRecords.filter((a) => a.status === "present").length;
                const attPct = total > 0 ? Math.round((present / total) * 100) : 0;

                return {
                    subject: e.subject,
                    grade: grade || null,
                    attendance: { total, present, absent: total - present, percentage: attPct },
                };
            })
        );

        res.status(200).json({ success: true, student, gradesData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── TEACHER: analytics for a subject ───────────────────────────────────────

// GET /api/grades/teacher/analytics/:subjectId
const getTeacherSubjectAnalytics = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const isAssigned = await isTeacherOfSubject(req.user.id, subjectId);
        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Access denied." });
        }

        const grades = await Grade.find({ subject: subjectId })
            .populate("student", "name email");

        if (!grades.length) {
            return res.status(200).json({ success: true, analytics: null, message: "No grades entered yet." });
        }

        const entered = grades.filter((g) => g.totalMarks > 0);
        const percentages = entered.map((g) => g.overallPercentage);

        const classAvg = percentages.length
            ? Math.round((percentages.reduce((a, b) => a + b, 0) / percentages.length) * 100) / 100
            : 0;
        const highest = percentages.length ? Math.max(...percentages) : 0;
        const lowest = percentages.length ? Math.min(...percentages) : 0;
        const passCount = entered.filter((g) => g.passFail === "Pass").length;
        const failCount = entered.filter((g) => g.passFail === "Fail").length;
        const passPct = entered.length ? Math.round((passCount / entered.length) * 100) : 0;
        const atRisk = entered.filter((g) => g.overallPercentage < 50);

        // Grade distribution
        const gradeDistribution = {};
        entered.forEach((g) => {
            gradeDistribution[g.overallGrade] = (gradeDistribution[g.overallGrade] || 0) + 1;
        });

        // Per-student performance
        const studentPerformance = entered.map((g) => ({
            name: g.student?.name || "Unknown",
            percentage: g.overallPercentage,
            grade: g.overallGrade,
            passFail: g.passFail,
            assignment: g.assignment?.percentage || 0,
            quiz: g.quiz?.percentage || 0,
            mid: g.mid?.percentage || 0,
            final: g.final?.percentage || 0,
        }));

        res.status(200).json({
            success: true,
            analytics: {
                totalStudents: grades.length,
                gradedStudents: entered.length,
                classAverage: classAvg,
                highestMarks: highest,
                lowestMarks: lowest,
                passCount,
                failCount,
                passPercentage: passPct,
                failPercentage: 100 - passPct,
                studentsAtRisk: atRisk.map((g) => ({
                    name: g.student?.name,
                    percentage: g.overallPercentage,
                })),
                gradeDistribution,
                studentPerformance,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── ADMIN: lock / unlock / edit grades ─────────────────────────────────────

// PUT /api/grades/admin/unlock
const adminUnlockGrades = async (req, res) => {
    try {
        const { subjectId, studentId } = req.body;
        const filter = { subject: subjectId };
        if (studentId) filter.student = studentId;

        await Grade.updateMany(filter, { isLocked: false, lockedAt: null, lockedBy: null });

        res.status(200).json({ success: true, message: "Grades unlocked successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// PUT /api/grades/admin/enter  (same as teacher but admin can bypass lock)
const adminEnterGrade = async (req, res) => {
    try {
        const { studentId, subjectId, component, totalMarks, obtainedMarks } = req.body;

        const allowed = ["assignment", "quiz", "mid", "final"];
        if (!allowed.includes(component)) {
            return res.status(400).json({ success: false, message: "Invalid component." });
        }
        if (obtainedMarks < 0 || totalMarks < 0) {
            return res.status(400).json({ success: false, message: "Marks cannot be negative." });
        }
        if (obtainedMarks > totalMarks) {
            return res.status(400).json({ success: false, message: "Obtained cannot exceed total." });
        }

        const subject = await Subject.findById(subjectId);
        if (!subject) return res.status(404).json({ success: false, message: "Subject not found." });

        let grade = await Grade.findOne({ student: studentId, subject: subjectId });
        if (!grade) {
            grade = new Grade({
                student: studentId,
                subject: subjectId,
                teacher: subject.teacher,
            });
        }

        grade[component] = {
            totalMarks: Number(totalMarks),
            obtainedMarks: Number(obtainedMarks),
            isEntered: true,
        };

        await grade.save();

        res.status(200).json({ success: true, message: "Grade saved by admin.", grade });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// GET /api/grades/admin/all-grades?subjectId=...
const adminGetAllGrades = async (req, res) => {
    try {
        const filter = {};
        if (req.query.subjectId) filter.subject = req.query.subjectId;
        if (req.query.studentId) filter.student = req.query.studentId;

        const grades = await Grade.find(filter)
            .populate("student", "name email department")
            .populate("subject", "subjectCode subjectName")
            .populate("teacher", "name");

        res.status(200).json({ success: true, count: grades.length, grades });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── STUDENT: view own grades ────────────────────────────────────────────────

// GET /api/grades/student/my-grades
const getMyGrades = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate("subject", "subjectCode subjectName credits");

        const gradesData = await Promise.all(
            enrollments.map(async (e) => {
                const grade = await Grade.findOne({
                    student: req.user.id,
                    subject: e.subject._id,
                }).populate("subject", "subjectCode subjectName credits");

                return {
                    subject: e.subject,
                    grade: grade || null,
                };
            })
        );

        res.status(200).json({ success: true, gradesData });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// ─── STUDENT: analytics ──────────────────────────────────────────────────────

// GET /api/grades/student/analytics
const getStudentAnalytics = async (req, res) => {
    try {
        const grades = await Grade.find({ student: req.user.id })
            .populate("subject", "subjectCode subjectName credits");

        const entered = grades.filter((g) => g.totalMarks > 0);

        const overallPct = entered.length
            ? Math.round(
                (entered.reduce((s, g) => s + g.overallPercentage, 0) / entered.length) * 100
            ) / 100
            : 0;

        const calculateGrade = (pct) => {
            if (pct >= 90) return "A+";
            if (pct >= 85) return "A";
            if (pct >= 80) return "A-";
            if (pct >= 75) return "B+";
            if (pct >= 70) return "B";
            if (pct >= 65) return "B-";
            if (pct >= 60) return "C+";
            if (pct >= 55) return "C";
            if (pct >= 50) return "C-";
            if (pct >= 45) return "D";
            return "F";
        };

        const subjectPerformance = entered.map((g) => ({
            subject: g.subject?.subjectName || "N/A",
            code: g.subject?.subjectCode || "N/A",
            percentage: g.overallPercentage,
            grade: g.overallGrade,
            passFail: g.passFail,
            assignment: g.assignment?.percentage || 0,
            quiz: g.quiz?.percentage || 0,
            mid: g.mid?.percentage || 0,
            final: g.final?.percentage || 0,
        }));

        const passCount = entered.filter((g) => g.passFail === "Pass").length;
        const failCount = entered.filter((g) => g.passFail === "Fail").length;

        res.status(200).json({
            success: true,
            analytics: {
                totalSubjects: grades.length,
                gradedSubjects: entered.length,
                overallPercentage: overallPct,
                overallGrade: calculateGrade(overallPct),
                passCount,
                failCount,
                subjectPerformance,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

module.exports = {
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
};