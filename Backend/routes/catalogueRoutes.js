const express = require("express");
const router = express.Router();
const catalogueController = require("../controllers/catalogueController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');

router.post("/create", catalogueController.createCatalogue);
// router.get("/linearChart", dashboardController.linearChart);

module.exports = router;
