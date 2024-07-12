const express = require("express");
const router = express.Router();
const meetingMembersController = require("../controllers/meetingMembersController");
const { verifyToken } = require("../middleware/authenticate");
const { uploads } = require("../middleware/imageUploads");


// router.post("/scouts", verifyToken , jobController.Job); 
// router.post("/createMeetingMembers", verifyToken , meetingMembersController.createMeetingMembers ); 
router.post("/createMeetingMembers", verifyToken ,meetingMembersController.createMeetingMembers ); 
router.post('/addMeeting', verifyToken, meetingMembersController.addMeeting);
router.put('/updateMeeting', verifyToken, meetingMembersController.updateMeetingLogs);
router.get('/getMeetings', verifyToken, meetingMembersController.getMeetingLogsByDate);
router.get('/getMeetings/:id', verifyToken, meetingMembersController.getMeetingLogsById);
// router.get("/getscouts", verifyToken , scoutController.getscouts);
router.get("/getMeeting", verifyToken ,meetingMembersController.getMeetings ); 
router.get("/getSingleMeetingLogs/:meetingID", verifyToken ,meetingMembersController.getSingleMeetingsLogs ); 
router.get("/getMeetingLogList", verifyToken ,meetingMembersController.getMeetingLogsByMeetingIdForApp );

module.exports = router; 
