const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
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

        enrollmentDate: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

// Ek student ek subject mein sirf ek baar enroll ho sake
enrollmentSchema.index({ student: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);