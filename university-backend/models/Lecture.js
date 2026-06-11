const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },

        description: {
            type: String,
            trim: true,
            default: "",
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

        fileUrl: {
            type: String,
            required: [true, "File is required"],
        },

        fileType: {
            type: String,
            enum: ["pdf", "ppt", "video", "doc", "docx"],
            required: [true, "File type is required"],
        },

        downloadCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Lecture", lectureSchema);