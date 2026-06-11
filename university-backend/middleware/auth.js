const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateJWT = async (req, res, next) => {
    try {
        // Header se token lo
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        // Bearer ke baad wala token nikalo
        const token = authHeader.split(" ")[1];

        // Token verify karo
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Database se user dhundo
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found.",
            });
        }

        // User ko request mein attach karo
        req.user = user;
        next();

    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token.",
            });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired. Please login again.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = authenticateJWT;