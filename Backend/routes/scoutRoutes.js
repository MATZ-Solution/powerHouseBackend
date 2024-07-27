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
router.get('/getScoutByID/:id', verifyToken , scoutController.getscoutsByID)

router.get('/getSingleScoutUser/:userID', verifyToken , scoutController.getSingleScoutMember);
router.get('/getLongAndLat', verifyToken , scoutController.getLongAndLat);

router.get('/getLatAndLongMarker/:id', verifyToken , scoutController.getLatAndLongMarker);


router.put('/updateScouteMember', verifyToken , scoutController.updateScoutMember);
router.get('/getAllocatedLocation', verifyToken , scoutController.getAllocatedLocation);
router.get('/getScoutedLocation', verifyToken , scoutController.getScoutsByUserIdWithAllInformation);
router.get('/scoutMap', scoutController.scoutMap);

// router.get('/getSubAreas', scoutController.getSubAreas);
router.put('/editScout/:id', verifyToken,s3Upload.array('files', 5),scoutController.UpdateScoutedLocation);

router.delete('/deleteScout/:id',scoutController.deletScout);




router.post('/AddArchitecture', verifyToken , scoutController.AddArchitecture);
router.post('/AddArchitectureCSV', verifyToken , uploadCSV.single('file'), scoutController.AddArchitectureCSV);
router.post('/AddBuilder', verifyToken , scoutController.AddBuilder);
router.post('/AddBuilderCSV', verifyToken , uploadCSV.single('file'), scoutController.AddBuilderCSV);
router.post('/AddElectrician', verifyToken , scoutController.AddElectrician);
router.post('/AddElectricianCSV', verifyToken , uploadCSV.single('file'), scoutController.AddElectricianCSV);
router.get('/getArchitecture', verifyToken ,scoutController.getArchitecture);
router.get('/getBuilder', verifyToken ,scoutController.getBuilder);
router.get('/getElectricians', verifyToken ,scoutController.getElectrician);
router.put('/updateScouteStatus', verifyToken , scoutController.updateScoutStatus);
// router.put('/updateScouteStatus', scoutController.updateScoutStatus);




module.exports = router; 
