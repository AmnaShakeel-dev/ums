const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },

        content: {
            type: String,
            required: [true, "Content is required"],
            trim: true,
        },

        priority: {
            type: String,
            required: [true, "Priority is required"],
            enum: ["low", "medium", "high"],
            default: "medium",
        },

        targetAudience: {
            type: String,
            required: [true, "Target audience is required"],
            enum: ["all", "specific", "individual"],
            default: "all",
        },

        targetIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Created by is required"],
        },

        readBy: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Announcement", announcementSchema);