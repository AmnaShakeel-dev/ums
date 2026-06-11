const express = require("express");
const router = express.Router();
const authenticateJWT = require("../middleware/auth");
const checkRole = require("../middleware/roleCheck");
const {
    createAnnouncement,
    getAllAnnouncements,
    deleteAnnouncement,
    markAsRead,
} = require("../controllers/announcementController");

router.post("/", authenticateJWT, checkRole("admin", "teacher"), createAnnouncement);
router.get("/", authenticateJWT, getAllAnnouncements);
router.delete("/:id", authenticateJWT, checkRole("admin", "teacher"), deleteAnnouncement);
router.put("/:id/read", authenticateJWT, markAsRead);

module.exports = router;