const express = require("express");
const router = express.Router();

const notificationsController = require("../controllers/notifications.controller");

// Send notification to all flats or a specific flat
router.post("/send", notificationsController.sendNotification);
router.get("/", notificationsController.getNotifications);
router.post("/read", notificationsController.markAsRead);
router.get("/unread-count", notificationsController.getUnreadCount);

module.exports = router;
