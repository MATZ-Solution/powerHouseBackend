const express = require("express");
const router = express.Router();
const scoutController = require("../controllers/scoutController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");
const { uploadCSV } = require("../middleware/uploadCSV");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');

// router.post("/scouts", verifyToken , jobController.Job); 
router.post("/scout", verifyToken,s3Upload.array('files', 5) , scoutController.scout); 
router.get("/getscouts", verifyToken , scoutController.getscouts);
router.get("/countScout", verifyToken , scoutController.countScout);
router.post('/AddCity', verifyToken , scoutController.AddCity);
router.post('/AddCityCSV', verifyToken , uploadCSV.single('file'), scoutController.AddCityCSV);
router.post('/AddArea', verifyToken , scoutController.AddArea);
router.post('/AddSubArea', verifyToken , scoutController.AddSubArea);
router.get('/getCities', verifyToken , scoutController.getCities);
// router.get('/getAreas', scoutController.getAreas);
router.get('/getAreas', verifyToken , scoutController.getAreas);
router.get('/getSubAreas', verifyToken , scoutController.getSubAreas);
// router.get('/getSubAreas', scoutController.getSubAreas);


module.exports = router; 
