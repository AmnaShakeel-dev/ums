const Subject = require("../models/Subject");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Lecture = require("../models/Lecture");
const Announcement = require("../models/Announcement");
const path = require("path");

// =====================
// SUBJECTS
// =====================

// @desc    Get teacher ke assigned subjects
// @route   GET /api/teacher/subjects
// @access  Teacher only
const getMySubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ teacher: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects,
        });

    } catch (error) {
        console.error("Get my subjects error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get subject ke enrolled students
// @route   GET /api/teacher/subjects/:subjectId/students
// @access  Teacher only
const getEnrolledStudents = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        // Sirf assigned teacher access kar sake
        if (subject.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned to this subject.",
            });
        }

        const enrollments = await Enrollment.find({ subject: req.params.subjectId })
            .populate("student", "name email department phone");

        res.status(200).json({
            success: true,
            count: enrollments.length,
            students: enrollments.map((e) => e.student),
        });

    } catch (error) {
        console.error("Get enrolled students error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ATTENDANCE
// =====================

// @desc    Attendance mark karo
// @route   POST /api/teacher/attendance
// @access  Teacher only
const markAttendance = async (req, res) => {
    try {
        const { subjectId, date, attendanceData } = req.body;

        // attendanceData = [{ studentId, status }, ...]

        if (!subjectId || !date || !attendanceData || attendanceData.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide subject, date and attendance data.",
            });
        }

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        if (subject.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned to this subject.",
            });
        }

        // Har student ki attendance save karo
        const attendancePromises = attendanceData.map(async (item) => {
            return await Attendance.findOneAndUpdate(
                {
                    student: item.studentId,
                    subject: subjectId,
                    date: new Date(date),
                },
                {
                    student: item.studentId,
                    subject: subjectId,
                    date: new Date(date),
                    status: item.status,
                    markedBy: req.user.id,
                },
                { upsert: true, new: true }
            );
        });

        await Promise.all(attendancePromises);

        res.status(200).json({
            success: true,
            message: "Attendance marked successfully.",
        });

    } catch (error) {
        console.error("Mark attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Attendance history dekho
// @route   GET /api/teacher/attendance/:subjectId
// @access  Teacher only
const getAttendanceHistory = async (req, res) => {
    try {
        const attendance = await Attendance.find({
            subject: req.params.subjectId,
        })
            .populate("student", "name email")
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: attendance.length,
            attendance,
        });

    } catch (error) {
        console.error("Get attendance history error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// LECTURES
// =====================

// @desc    Lecture upload karo
// @route   POST /api/teacher/lectures
// @access  Teacher only
const uploadLecture = async (req, res) => {
    try {
        const { title, description, subjectId } = req.body;

        if (!title || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and subject.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a file.",
            });
        }

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        if (subject.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned to this subject.",
            });
        }

        // File type nikalo
        const ext = path.extname(req.file.originalname).toLowerCase().replace(".", "");
        const allowedTypes = ["pdf", "ppt", "pptx", "doc", "docx", "mp4", "mkv"];

        const fileType = allowedTypes.includes(ext) ? ext : "pdf";

        const lecture = await Lecture.create({
            title,
            description: description || "",
            subject: subjectId,
            teacher: req.user.id,
            fileUrl: req.file.path,
            fileType,
        });

        res.status(201).json({
            success: true,
            message: "Lecture uploaded successfully.",
            lecture,
        });

    } catch (error) {
        console.error("Upload lecture error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Teacher ke saare lectures
// @route   GET /api/teacher/lectures
// @access  Teacher only
const getMyLectures = async (req, res) => {
    try {
        const lectures = await Lecture.find({ teacher: req.user.id })
            .populate("subject", "subjectCode subjectName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: lectures.length,
            lectures,
        });

    } catch (error) {
        console.error("Get my lectures error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Lecture delete karo
// @route   DELETE /api/teacher/lectures/:id
// @access  Teacher only
const deleteLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found.",
            });
        }

        if (lecture.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only delete your own lectures.",
            });
        }

        await Lecture.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Lecture deleted successfully.",
        });

    } catch (error) {
        console.error("Delete lecture error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ASSIGNMENTS
// =====================

// @desc    Assignment create karo
// @route   POST /api/teacher/assignments
// @access  Teacher only
const createAssignment = async (req, res) => {
    try {
        const { title, description, subjectId, dueDate, maxMarks } = req.body;

        if (!title || !description || !subjectId || !dueDate || !maxMarks) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields.",
            });
        }

        const subject = await Subject.findById(subjectId);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        if (subject.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not assigned to this subject.",
            });
        }

        const assignment = await Assignment.create({
            title,
            description,
            subject: subjectId,
            teacher: req.user.id,
            dueDate,
            maxMarks,
            guidelinesFile: req.file ? req.file.path : "",
        });

        res.status(201).json({
            success: true,
            message: "Assignment created successfully.",
            assignment,
        });

    } catch (error) {
        console.error("Create assignment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Teacher ke saare assignments
// @route   GET /api/teacher/assignments
// @access  Teacher only
const getMyAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher: req.user.id })
            .populate("subject", "subjectCode subjectName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: assignments.length,
            assignments,
        });

    } catch (error) {
        console.error("Get my assignments error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Assignment delete karo
// @route   DELETE /api/teacher/assignments/:id
// @access  Teacher only
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found.",
            });
        }

        if (assignment.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You can only delete your own assignments.",
            });
        }

        await Assignment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Assignment deleted successfully.",
        });

    } catch (error) {
        console.error("Delete assignment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// GRADING
// =====================

// @desc    Assignment ki submissions dekho
// @route   GET /api/teacher/assignments/:id/submissions
// @access  Teacher only
const getSubmissions = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found.",
            });
        }

        if (assignment.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        const submissions = await Submission.find({ assignment: req.params.id })
            .populate("student", "name email department")
            .sort({ submittedAt: -1 });

        res.status(200).json({
            success: true,
            count: submissions.length,
            submissions,
        });

    } catch (error) {
        console.error("Get submissions error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Submission grade karo
// @route   PUT /api/teacher/submissions/:id/grade
// @access  Teacher only
const gradeSubmission = async (req, res) => {
    try {
        const { marks, feedback } = req.body;

        if (marks === undefined || marks === null) {
            return res.status(400).json({
                success: false,
                message: "Please provide marks.",
            });
        }

        const submission = await Submission.findById(req.params.id)
            .populate("assignment");

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: "Submission not found.",
            });
        }

        if (submission.assignment.teacher.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Access denied.",
            });
        }

        if (marks > submission.assignment.maxMarks) {
            return res.status(400).json({
                success: false,
                message: `Marks cannot exceed maximum marks (${submission.assignment.maxMarks}).`,
            });
        }

        submission.marks = marks;
        submission.feedback = feedback || "";
        submission.status = "graded";
        submission.gradedAt = Date.now();

        await submission.save();

        res.status(200).json({
            success: true,
            message: "Submission graded successfully.",
            submission,
        });

    } catch (error) {
        console.error("Grade submission error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ANNOUNCEMENTS
// =====================

// @desc    Announcement create karo
// @route   POST /api/teacher/announcements
// @access  Teacher only
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, priority, targetIds } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and content.",
            });
        }

        const announcement = await Announcement.create({
            title,
            content,
            priority: priority || "medium",
            targetAudience: targetIds && targetIds.length > 0 ? "specific" : "all",
            targetIds: targetIds || [],
            createdBy: req.user.id,
        });

        res.status(201).json({
            success: true,
            message: "Announcement created successfully.",
            announcement,
        });

    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Teacher ke announcements
// @route   GET /api/teacher/announcements
// @access  Teacher only
const getMyAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements,
        });

    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
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
};