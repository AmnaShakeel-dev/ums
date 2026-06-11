const Announcement = require("../models/Announcement");
const User = require("../models/User");

const createAnnouncement = async (req, res) => {
    try {
        const { title, content, priority, targetAudience, targetIds } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Please provide title and content.",
            });
        }

        const announcement = await Announcement.create({
            title,
            content,
            priority: priority || "medium",
            targetAudience: targetAudience || "all",
            targetIds: targetIds || [],
            createdBy: req.user.id,
        });

        const populated = await Announcement.findById(announcement._id)
            .populate("createdBy", "name role");

        res.status(201).json({
            success: true,
            message: "Announcement created successfully.",
            announcement: populated,
        });

    } catch (error) {
        console.error("Create announcement error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

const getAllAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate("createdBy", "name role")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: announcements.length,
            announcements,
        });

    } catch (error) {
        console.error("Get announcements error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found.",
            });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Announcement deleted successfully.",
        });

    } catch (error) {
        console.error("Delete announcement error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found.",
            });
        }

        const alreadyRead = announcement.readBy.find(
            (r) => r.userId.toString() === req.user.id.toString()
        );

        if (!alreadyRead) {
            announcement.readBy.push({
                userId: req.user.id,
                readAt: Date.now(),
            });
            await announcement.save();
        }

        res.status(200).json({
            success: true,
            message: "Marked as read.",
        });

    } catch (error) {
        console.error("Mark read error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
        });
    }
};

module.exports = {
    createAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,
    markAsRead,
};