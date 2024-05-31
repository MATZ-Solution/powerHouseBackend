// this is the file where we define the routes for the notification
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authenticate");
router.get("/notifications", verifyToken, notificationController.getAllNotifications);
router.put("/notifications/:id", verifyToken, notificationController.markNotificationAsRead);
router.put("/notifications", verifyToken, notificationController.markAllNotificationsAsRead);
router.get('/checkAllRead', verifyToken, notificationController.checkAllRead)
module.exports = router;