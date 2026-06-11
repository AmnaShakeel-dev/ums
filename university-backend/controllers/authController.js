const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Token banane ka function
const generateToken = (id, role, email) => {
    return jwt.sign(
        { id, role, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email aur password dono chahiye
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password.",
            });
        }

        // Database mein user dhundo
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Password check karo
        const isPasswordMatch = await user.matchPassword(password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Token banao
        const token = generateToken(user._id, user.role, user.email);

        // Response bhejo
        res.status(200).json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                phone: user.phone,
                photo: user.photo,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {
        console.error("GetMe error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide current and new password.",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "New password must be at least 6 characters.",
            });
        }

        // Database se user lo with password
        const user = await User.findById(req.user.id);

        // Current password check karo
        const isMatch = await user.matchPassword(currentPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect.",
            });
        }

        // Naya password save karo
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });

    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
    login,
    getMe,
    changePassword,
};