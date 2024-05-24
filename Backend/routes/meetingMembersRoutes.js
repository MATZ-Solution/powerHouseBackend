const express = require("express");
const router = express.Router();
const meetingMembersController = require("../controllers/meetingMembersController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");


// router.post("/scouts", verifyToken , jobController.Job); 
// router.post("/createMeetingMembers", verifyToken , meetingMembersController.createMeetingMembers ); 
router.post("/createMeetingMembers", verifyToken ,meetingMembersController.createMeetingMembers ); 
// router.get("/getscouts", verifyToken , scoutController.getscouts);


module.exports = router; 