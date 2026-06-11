require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const connectDB = require("./config/db");

const seedAdmin = async () => {
    await connectDB();

    const existing = await User.findOne({ email: "admin@uni.edu" });

    if (existing) {
        console.log("Admin already exists!");
        process.exit();
    }

    await User.create({
        name: "Super Admin",
        email: "admin@uni.edu",
        password: "admin123",
        role: "admin",
        department: "Administration",
        phone: "0300-0000000",
    });

    console.log("Admin created successfully!");
    console.log("Email: admin@uni.edu");
    console.log("Password: admin123");
    process.exit();
};

seedAdmin();