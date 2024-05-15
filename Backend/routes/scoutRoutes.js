const express = require("express");
const router = express.Router();
const scoutController = require("../controllers/scoutController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();


// router.post("/scouts", verifyToken , jobController.Job); 
router.post("/scout", scoutController.scout); 
router.get("/getscouts", scoutController.getscouts);
router.get("/countScout", scoutController.countScout);

module.exports = router; 
