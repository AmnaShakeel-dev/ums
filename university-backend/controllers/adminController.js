const User = require("../models/User");
const Subject = require("../models/Subject");
const Enrollment = require("../models/Enrollment");
const Announcement = require("../models/Announcement");

// =====================
// USER MANAGEMENT
// =====================

// @desc    Create new user (teacher or student)
// @route   POST /api/admin/users
// @access  Admin only
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, department, phone } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide name, email, password and role.",
            });
        }

        // Email pehle se exist karta hai?
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists.",
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            department: department || "",
            phone: phone || "",
        });

        res.status(201).json({
            success: true,
            message: "User created successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
            },
        });

    } catch (error) {
        console.error("Create user error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;

        let query = {};

        // Role filter
        if (role) {
            query.role = role;
        }

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { department: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query).select("-password").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: users.length,
            users,
        });

    } catch (error) {
        console.error("Get all users error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Admin only
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("Get user error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Admin only
const updateUser = async (req, res) => {
    try {
        const { name, email, role, department, phone } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Email change ho rahi hai to check karo duplicate na ho
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use.",
                });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.department = department || user.department;
        user.phone = phone || user.phone;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User updated successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
            },
        });

    } catch (error) {
        console.error("Update user error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        // Admin khud ko delete na kar sake
        if (user._id.toString() === req.user.id.toString()) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account.",
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });

    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// SUBJECT MANAGEMENT
// =====================

// @desc    Create subject
// @route   POST /api/admin/subjects
// @access  Admin only
const createSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName, credits, description, teacher } = req.body;

        if (!subjectCode || !subjectName || !credits) {
            return res.status(400).json({
                success: false,
                message: "Please provide subject code, name and credits.",
            });
        }

        const existingSubject = await Subject.findOne({ subjectCode: subjectCode.toUpperCase() });

        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: "Subject with this code already exists.",
            });
        }

        const subject = await Subject.create({
            subjectCode,
            subjectName,
            credits,
            description: description || "",
            teacher: teacher || null,
        });

        res.status(201).json({
            success: true,
            message: "Subject created successfully.",
            subject,
        });

    } catch (error) {
        console.error("Create subject error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Admin only
const getAllSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate("teacher", "name email department")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: subjects.length,
            subjects,
        });

    } catch (error) {
        console.error("Get all subjects error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Update subject
// @route   PUT /api/admin/subjects/:id
// @access  Admin only
const updateSubject = async (req, res) => {
    try {
        const { subjectCode, subjectName, credits, description, teacher } = req.body;

        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        subject.subjectCode = subjectCode || subject.subjectCode;
        subject.subjectName = subjectName || subject.subjectName;
        subject.credits = credits || subject.credits;
        subject.description = description || subject.description;
        subject.teacher = teacher || subject.teacher;

        await subject.save();

        res.status(200).json({
            success: true,
            message: "Subject updated successfully.",
            subject,
        });

    } catch (error) {
        console.error("Update subject error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Delete subject
// @route   DELETE /api/admin/subjects/:id
// @access  Admin only
const deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        await Subject.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Subject deleted successfully.",
        });

    } catch (error) {
        console.error("Delete subject error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ENROLLMENT MANAGEMENT
// =====================

// @desc    Enroll student in subject
// @route   POST /api/admin/enrollments
// @access  Admin only
const enrollStudent = async (req, res) => {
    try {
        const { studentId, subjectId } = req.body;

        if (!studentId || !subjectId) {
            return res.status(400).json({
                success: false,
                message: "Please provide student and subject.",
            });
        }

        // Student exist karta hai?
        const student = await User.findById(studentId);
        if (!student || student.role !== "student") {
            return res.status(404).json({
                success: false,
                message: "Student not found.",
            });
        }

        // Subject exist karta hai?
        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject not found.",
            });
        }

        // Pehle se enrolled hai?
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            subject: subjectId,
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: "Student is already enrolled in this subject.",
            });
        }

        const enrollment = await Enrollment.create({
            student: studentId,
            subject: subjectId,
        });

        res.status(201).json({
            success: true,
            message: "Student enrolled successfully.",
            enrollment,
        });

    } catch (error) {
        console.error("Enroll student error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Admin only
const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find()
            .populate("student", "name email department")
            .populate("subject", "subjectCode subjectName credits")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: enrollments.length,
            enrollments,
        });

    } catch (error) {
        console.error("Get enrollments error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Remove enrollment
// @route   DELETE /api/admin/enrollments/:id
// @access  Admin only
const removeEnrollment = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id);

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "Enrollment not found.",
            });
        }

        await Enrollment.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Enrollment removed successfully.",
        });

    } catch (error) {
        console.error("Remove enrollment error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// =====================
// ANALYTICS
// =====================

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Admin only
const getAnalytics = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalTeachers = await User.countDocuments({ role: "teacher" });
        const totalSubjects = await Subject.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();

        res.status(200).json({
            success: true,
            analytics: {
                totalStudents,
                totalTeachers,
                totalSubjects,
                totalEnrollments,
            },
        });

    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
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
};