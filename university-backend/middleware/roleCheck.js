const checkRole = (...roles) => {
    return (req, res, next) => {
        // auth.js pehle chalna chahiye
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login first.",
            });
        }

        // User ka role allowed roles mein hai ya nahi
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Only ${roles.join(" or ")} can access this.`,
            });
        }

        next();
    };
};

module.exports = checkRole;