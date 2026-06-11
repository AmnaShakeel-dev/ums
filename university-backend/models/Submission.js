const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Assignment",
            required: [true, "Assignment is required"],
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student is required"],
        },

        fileUrl: {
            type: String,
            required: [true, "File is required"],
        },

        status: {
            type: String,
            enum: ["submitted", "graded"],
            default: "submitted",
        },

        marks: {
            type: Number,
            default: null,
        },

        feedback: {
            type: String,
            trim: true,
            default: "",
        },

        submittedAt: {
            type: Date,
            default: Date.now,
        },

        gradedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Ek student ek assignment mein sirf ek baar submit kar sake
submissionSchema.index(
    { assignment: 1, student: 1 },
    { unique: true }
);

module.exports = mongoose.model("Submission", submissionSchema);