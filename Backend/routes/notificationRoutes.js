    // this is the file where we define the routes for the notification
    const express = require("express");
    const router = express.Router();
    const notificationController = require("../controllers/notificationController");
    const { verifyToken } = require("../middleware/authenticate");

/**
 * @swagger
 * /notify/notifications:
 *   get:
 *     summary: Get Notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           example: 15
 *         description: Number of notifications per page
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search notifications by message content
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Failed to get notifications
 */
    router.get("/notifications", verifyToken, notificationController.getAllNotifications);

/**
 * @swagger
 * /notify/notifications/{id}:
 *   put:
 *     summary: Mark a Notification as Read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *       404:
 *         description: No Notifications found
 *       500:
 *         description: Failed to mark notification as read
 */
    router.put("/notifications/:id", verifyToken, notificationController.markNotificationAsRead);

    router.put("/notifications", verifyToken, notificationController.markAllNotificationsAsRead);
    router.get('/checkAllRead', verifyToken, notificationController.checkAllRead)
    module.exports = router;