const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken } = require("../middleware/authenticate");
// const fileUpload = require("../helper/S3Bucket");
const { uploads } = require("../middleware/imageUploads");
const multer = require('multer');
const upload = multer();

router.post("/createScoutUser", userController.createScoutUser);
router.post("/signIn", userController.signIn);
router.post("/createSOP", verifyToken, userController.createSOP);

router.get("/scoutsMember", verifyToken, userController.getScoutsMember);
router.get("/protected", verifyToken, userController.getUser);




// router.post("/sendEmail", userController.sendEmail);
// router.post("/forgetPassword", userController.createResetEmail);
// router.post("/verifyResetEmailCode", userController.verifyResetEmailCode);
// router.put("/updatePassword", userController.updatePassword);
// router.put("/resendCode", userController.resendCode);

module.exports = router;
