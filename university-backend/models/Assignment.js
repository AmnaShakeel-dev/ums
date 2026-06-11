const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },

        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: [true, "Subject is required"],
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Teacher is required"],
        },

        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },

        maxMarks: {
            type: Number,
            required: [true, "Max marks are required"],
            min: [1, "Max marks must be at least 1"],
        },

        guidelinesFile: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Assignment", assignmentSchema);