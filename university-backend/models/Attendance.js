const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student is required"],
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: [true, "Subject is required"],
        },

        date: {
            type: Date,
            required: [true, "Date is required"],
        },

        status: {
            type: String,
            required: [true, "Status is required"],
            enum: ["present", "absent", "late"],
        },

        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Marked by is required"],
        },
    },
    {
        timestamps: true,
    }
);

// Ek student ki ek subject mein ek din mein sirf ek attendance ho
attendanceSchema.index(
    { student: 1, subject: 1, date: 1 },
    { unique: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);