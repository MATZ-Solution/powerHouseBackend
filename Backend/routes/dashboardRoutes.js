const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');

/**
 * @swagger
 * /dashboard/piechart:
 *   get:
 *     summary: Get the Entry Count by Scouts to show on Pie Chart
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Scouts and their entry counts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/pieChart",verifyToken, dashboardController.pieChart);

/**
 * @swagger
 * /dashboard/linearchart:
 *   get:
 *     summary: Get the Entry Count Per Month to show on Linear Chart
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of Monthly counts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/linearChart",verifyToken, dashboardController.linearChart);
// router.get("/scoutsMember", verifyToken, userController.getScoutsMember);

module.exports = router;
