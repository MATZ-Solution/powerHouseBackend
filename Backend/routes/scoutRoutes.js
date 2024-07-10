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
router.post('/AddCity', verifyToken , scoutController.AddCity);
router.post('/AddCityCSV', verifyToken , uploadCSV.single('file'), scoutController.AddCityCSV);
router.post('/AddArea', verifyToken , scoutController.AddArea);
router.post('/AddAreaCSV', verifyToken , uploadCSV.single('file'), scoutController.AddAreaCSV);
router.post('/AddSubArea', verifyToken , scoutController.AddSubArea);
router.post('/addUnassignedScouter', verifyToken , scoutController.addUnassignedScouter);
router.post('/AddSubAreaCSV', verifyToken , uploadCSV.single('file'), scoutController.AddSubAreaCSV);

// router.get('/getAreas', scoutController.getAreas);
// router.get("/getscouts", verifyToken , scoutController.getscouts);
router.get("/getscouts", verifyToken , scoutController.getscouts);
router.get('/getScoutsByUserId', verifyToken , scoutController.getScoutByUserId);
router.get("/countScout", verifyToken , scoutController.countScout);
router.get('/getCities', verifyToken , scoutController.getCities);
router.get('/getAreas', verifyToken , scoutController.getAreas);
router.get('/getSubAreas', verifyToken , scoutController.getSubAreas);

router.get('/getAllotedLocation', verifyToken , scoutController.getAllotedLocations);
router.get('/getUnAllotedLocation', verifyToken , scoutController.getUnAllotedLocations);


router.get('/getSingleScoutUser/:userID', verifyToken , scoutController.getSingleScoutMember);
router.get('/getLongAndLat', verifyToken , scoutController.getLongAndLat);
// router.get('/getScoutReport', verifyToken , scoutController.getLongAndLat);


router.put('/updateScouteMember', verifyToken , scoutController.updateScoutMember);
router.get('/getAllocatedLocation', verifyToken , scoutController.getAllocatedLocation);
router.get('/getScoutedLocation', verifyToken , scoutController.getScoutsByUserIdWithAllInformation);
router.get('/scoutMap', scoutController.scoutMap);

// router.get('/getSubAreas', scoutController.getSubAreas);


module.exports = router; 
