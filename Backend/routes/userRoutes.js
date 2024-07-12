const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authenticate");
// const fileUpload = require("../helper/S3Bucket");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();
const s3Upload = require('../middleware/s3Upload');
router.post("/createScoutUser", userController.createScoutUser);
router.post("/signIn", userController.signIn);
router.post("/createSOP", verifyToken, userController.createSOP);
router.get("/viewSOP", verifyToken, userController.viewSOP);

router.get("/scoutsMember", verifyToken, userController.getScoutsMember);
router.get("/protected", verifyToken, userController.getUser);
router.get('/getProfile', verifyToken, userController.getProfile);
router.put('/updateProfile', verifyToken,s3Upload.single(
    'profile'
) ,userController.updateProfile);
router.put('/updateLocation', verifyToken, userController.updateLocation);
router.get('/getNearByMembers', verifyToken, userController.getNearByMembers);
router.get('/getMembers', verifyToken, userController.getMembers);
router.get('/statistics', verifyToken, userController.statistics);
module.exports = router;
