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
 * /notify/notifications:
 *   put:
 *     summary: Mark a Notification as Read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         description: ID of the notification to be marked as read
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notification marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Notification marked as read
 *       400:
 *         description: Bad Request - Missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: Missing id parameter
 *       404:
 *         description: Not Found - No notification found with the provided ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: No Notifications found
 *       500:
 *         description: Internal Server Error - Failed to mark notification as read
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: Failed to mark notification as read
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */
    router.put("/notifications/:id", verifyToken, notificationController.markNotificationAsRead);

    router.put("/notifications", verifyToken, notificationController.markAllNotificationsAsRead);
    router.get('/checkAllRead', verifyToken, notificationController.checkAllRead)
    module.exports = router;