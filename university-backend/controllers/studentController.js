const User = require("../models/User");
const Subject = require("../models/Subject");
const Enrollment = require("../models/Enrollment");
const Attendance = require("../models/Attendance");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const Lecture = require("../models/Lecture");
const Announcement = require("../models/Announcement");

// =====================
// PROFILE
// =====================

// @desc    Student profile dekho
// @route   GET /api/student/profile
// @access  Student only
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Student profile update karo
// @route   PUT /api/student/profile
// @access  Student only
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findById(req.user.id);

        user.name = name || user.name;
        user.phone = phone || user.phone;

        if (req.file) {
            user.photo = req.file.path;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                photo: user.photo,
                department: user.department,
                role: user.role,
            },
        });

    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// SUBJECTS
// =====================

// @desc    Student ke enrolled subjects
// @route   GET /api/student/subjects
// @access  Student only
const getMySubjects = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate({
                path: "subject",
                populate: {
                    path: "teacher",
                    select: "name email",
                },
            });

        const subjects = enrollments.map((e) => e.subject);

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

// =====================
// LECTURES
// =====================

// @desc    Enrolled subject ki lectures dekho
// @route   GET /api/student/lectures/:subjectId
// @access  Student only
const getSubjectLectures = async (req, res) => {
    try {
        // Pehle check karo student is subject mein enrolled hai
        const enrollment = await Enrollment.findOne({
            student: req.user.id,
            subject: req.params.subjectId,
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You are not enrolled in this subject.",
            });
        }

        const lectures = await Lecture.find({ subject: req.params.subjectId })
            .populate("teacher", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: lectures.length,
            lectures,
        });

    } catch (error) {
        console.error("Get subject lectures error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Lecture download count update karo
// @route   PUT /api/student/lectures/:id/download
// @access  Student only
const downloadLecture = async (req, res) => {
    try {
        const lecture = await Lecture.findById(req.params.id);

        if (!lecture) {
            return res.status(404).json({
                success: false,
                message: "Lecture not found.",
            });
        }

        lecture.downloadCount += 1;
        await lecture.save();

        res.status(200).json({
            success: true,
            message: "Download count updated.",
            fileUrl: lecture.fileUrl,
        });

    } catch (error) {
        console.error("Download lecture error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ASSIGNMENTS
// =====================

// @desc    Student ke enrolled subjects ke assignments
// @route   GET /api/student/assignments
// @access  Student only
const getMyAssignments = async (req, res) => {
    try {
        // Pehle enrolled subjects lo
        const enrollments = await Enrollment.find({ student: req.user.id });
        const subjectIds = enrollments.map((e) => e.subject);

        // Un subjects ke assignments lo
        const assignments = await Assignment.find({
            subject: { $in: subjectIds },
        })
            .populate("subject", "subjectCode subjectName")
            .populate("teacher", "name")
            .sort({ dueDate: 1 });

        // Har assignment ke saath submission status bhi do
        const assignmentsWithStatus = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await Submission.findOne({
                    assignment: assignment._id,
                    student: req.user.id,
                });

                return {
                    ...assignment.toObject(),
                    submission: submission || null,
                };
            })
        );

        res.status(200).json({
            success: true,
            count: assignmentsWithStatus.length,
            assignments: assignmentsWithStatus,
        });

    } catch (error) {
        console.error("Get my assignments error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Assignment submit karo
// @route   POST /api/student/assignments/:id/submit
// @access  Student only
const submitAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found.",
            });
        }

        // Due date check karo
        if (new Date() > new Date(assignment.dueDate)) {
            return res.status(400).json({
                success: false,
                message: "Assignment due date has passed.",
            });
        }

        // Pehle se submit kiya hai?
        const existingSubmission = await Submission.findOne({
            assignment: req.params.id,
            student: req.user.id,
        });

        if (existingSubmission) {
            return res.status(400).json({
                success: false,
                message: "You have already submitted this assignment.",
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload your assignment file.",
            });
        }

        const submission = await Submission.create({
            assignment: req.params.id,
            student: req.user.id,
            fileUrl: req.file.path,
            status: "submitted",
        });

        res.status(201).json({
            success: true,
            message: "Assignment submitted successfully.",
            submission,
        });

    } catch (error) {
        console.error("Submit assignment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ATTENDANCE
// =====================

// @desc    Student ki apni attendance dekho
// @route   GET /api/student/attendance
// @access  Student only
const getMyAttendance = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id })
            .populate("subject", "subjectCode subjectName");

        const attendanceData = await Promise.all(
            enrollments.map(async (enrollment) => {
                const attendance = await Attendance.find({
                    student: req.user.id,
                    subject: enrollment.subject._id,
                }).sort({ date: -1 });

                const total = attendance.length;
                const present = attendance.filter((a) => a.status === "present").length;
                const absent = attendance.filter((a) => a.status === "absent").length;
                const late = attendance.filter((a) => a.status === "late").length;
                const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

                return {
                    subject: enrollment.subject,
                    total,
                    present,
                    absent,
                    late,
                    percentage,
                    records: attendance,
                };
            })
        );

        // Overall attendance calculate karo
        const overallTotal = attendanceData.reduce((sum, a) => sum + a.total, 0);
        const overallPresent = attendanceData.reduce((sum, a) => sum + a.present, 0);
        const overallPercentage = overallTotal > 0
            ? Math.round((overallPresent / overallTotal) * 100)
            : 0;

        res.status(200).json({
            success: true,
            overallPercentage,
            overallTotal,
            overallPresent,
            attendanceData,
        });

    } catch (error) {
        console.error("Get my attendance error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ANNOUNCEMENTS
// =====================

// @desc    Student ke liye announcements
// @route   GET /api/student/announcements
// @access  Student only
const getMyAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({
            $or: [
                { targetAudience: "all" },
                { targetAudience: "individual", targetIds: req.user.id },
                { targetAudience: "specific", targetIds: req.user.id },
            ],
        })
            .populate("createdBy", "name role")
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

// @desc    Announcement read mark karo
// @route   PUT /api/student/announcements/:id/read
// @access  Student only
const markAnnouncementRead = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found.",
            });
        }

        // Pehle se read kiya hai?
        const alreadyRead = announcement.readBy.find(
            (r) => r.userId.toString() === req.user.id.toString()
        );

        if (!alreadyRead) {
            announcement.readBy.push({
                userId: req.user.id,
                readAt: Date.now(),
            });
            await announcement.save();
        }

        res.status(200).json({
            success: true,
            message: "Announcement marked as read.",
        });

    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
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
};