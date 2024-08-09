const express = require("express");
const router = express.Router();
const catalogueController = require("../controllers/catalogueController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');

/**
 * @swagger
 * /catalogue/create:
 *   post:
 *     summary: Create a new catalogue
 *     tags: [Catalogue]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catalogue created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/create",verifyToken,s3Upload.single( 'document' ) ,catalogueController.createCatalogue);

/**
 * @swagger
 * /catalogue/getCatalogue:
 *   get:
 *     summary: Get the list of catalogues
 *     tags: [Catalogue]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of catalogues
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/getCatalogue",verifyToken, catalogueController.getCatalogue);

module.exports = router;
