// const express = require("express");
// const router = express.Router();

// const { verifyToken } = require("../middleware/authenticate");
// // const fileUpload = require("../helper/S3Bucket");

// router.post("/requestHandshake",verifyToken, requestHandShake);

// module.exports = router;
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authenticate");

const { requestHandShake, acceptHandshake } = require("../controllers/handshakeController");

/**
 * @swagger
 * /handshake/requestHandshake:
 *   post:
 *     summary: Create a handshake request to cooperate with different department employees
 *     tags: [Handshake]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: List of user IDs to request handshake
 *               locationId:
 *                 type: integer
 *                 description: ID of the location for the handshake request
 *     responses:
 *       200:
 *         description: Request sent successfully
 *       400:
 *         description: Request not sent
 *       500:
 *         description: Internal server error
 */
router.post("/requestHandshake",verifyToken, requestHandShake);

/**
 * @swagger
 * /handshake/acceptrejectHandshake:
 *   post:
 *     summary: Accept or reject a handshake request
 *     tags: [Handshake]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               handshakeId:
 *                   type: integer
 *                   description: User ID to request handshake
 *               action:
 *                 type: string
 *                 enum: [accept, reject]
 *                 description: action to denote either "REJECTION" or ACCEPTION of a handshake.
 *     responses:
 *       200:
 *         description: Handshake request processed successfully
 *       400:
 *         description: Error updating handshake status
 *       404:
 *         description: Handshake request not found
 *       500:
 *         description: Internal server error
 */
router.post('/acceptrejectHandshake',verifyToken,acceptHandshake)
module.exports = router;

