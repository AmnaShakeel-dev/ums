const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");

const app = express();

// Database connection
connectDB();

// Security middleware
app.use(helmet());

// CORS setup — frontend ko backend se baat karne deta hai
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
}));

// Rate limiting — 15 minutes mein max 100 requests
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later."
});
app.use(limiter);

// Body parser — JSON data samajhne ke liye
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger — terminal mein requests dikhata hai
app.use(morgan("dev"));

// Uploads folder publicly accessible banao
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const announcementRoutes = require("./routes/announcementRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/announcements", announcementRoutes);

// Test route — server chal raha hai ya nahi check karne ke liye
app.get("/", (req, res) => {
    res.json({ message: "University Management System API is running!" });
});

// 404 handler — agar koi route na mile
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// Server start karo
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});