const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');

router.get("/pieChart", dashboardController.pieChart);
router.get("/linearChart", dashboardController.linearChart);
// router.get("/scoutsMember", verifyToken, userController.getScoutsMember);

module.exports = router;
