const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: String,
            required: [true, "Subject code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },

        subjectName: {
            type: String,
            required: [true, "Subject name is required"],
            trim: true,
        },

        credits: {
            type: Number,
            required: [true, "Credits are required"],
            min: [1, "Credits must be at least 1"],
            max: [6, "Credits cannot exceed 6"],
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Subject", subjectSchema);