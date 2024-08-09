const express = require("express");
const router = express.Router();
const meetingMembersController = require("../controllers/meetingMembersController");
const { verifyToken } = require("../middleware/authenticate");

/**
 * @swagger
 * /meetingmembers/createMeetingMembers:
 *   post:
 *     summary: Create a New Meeting Member
 *     tags: [Meeting Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 description: Name of meeting member to be registered
 *               phoneNumber:
 *                 type: integer
 *                 description: Phone Number of User
 *               email:
 *                 type: string
 *                 description: Email of User
 *               address:
 *                 type: string
 *                 description: Address of User
 *               position:
 *                 type: string
 *                 description: Position of User
 *               cityId:
 *                 type: string
 *                 description: IDs of Cities
 *               areasId:
 *                 type: string
 *                 description: IDs of Areas
 *               subareasId:
 *                 type: string
 *                 description: IDs of Sub Areas
 *     responses:
 *       409:
 *         description: Meeting member already exists
 *       200:
 *         description: Meeting Members Created successfully
 *       500:
 *         description: Failed to Create Meeting Members
 */
router.post("/createMeetingMembers", verifyToken, meetingMembersController.createMeetingMembers);

/**
 * @swagger
 * /meetingmembers/addMeeting:
 *   post:
 *     summary: Create a Meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               locationId:
 *                 type: integer
 *                 description: ID of Location
 *               members:
 *                 type: string
 *                 description: IDs of Members
 *               meetingLocation:
 *                 type: string
 *                 description: Meeting Location
 *               meetingTopic:
 *                 type: string
 *                 description: Meeting Topic
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Date & Time of Meeting
 *     responses:
 *       200:
 *         description: Meeting Created successfully
 *       500:
 *         description: Failed to Create Meeting
 */
router.post('/addMeeting', verifyToken, meetingMembersController.addMeeting);

/**
 * @swagger
 * /meetingmembers/updateMeeting:
 *   put:
 *     summary: Update Meeting Details
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingLogId:
 *                 type: integer
 *                 description: ID of Meeting Log to be updated
 *               meetingId:
 *                 type: integer
 *                 description: ID of Meeting
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: Date & Time of Meeting
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: Date & Time of Meeting
 *               inProgress:
 *                 type: integer
 *                 description: Check if meeting is in Progress
 *               meetingNotes:
 *                 type: string
 *                 description: Meeting Notes
 *               members:
 *                 type: string
 *                 description: Meeting Members
 *               startedBy:
 *                 type: string
 *                 description: Meeting started by
 *               nextMeetingDate:
 *                 type: string
 *                 description: Next Meeting Date
 * 
 *     responses:
 *       200:
 *         description: Meeting Updated successfully
 *       500:
 *         description: Failed to Update Meeting
 */
router.put('/updateMeeting', verifyToken, meetingMembersController.updateMeetingLogs);

/**
 * @swagger
 * /meetingmembers/getMeeting
 *   get:
 *     summary: Get Meetings by Date
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: date
 *         in: query
 *         description: The date of the meeting logs to retrieve (format: YYYY-MM-DD).
 *         required: true
 *         schema:
 *           type: string
 *           example: "2024-08-08"
 *       - name: search
 *         in: query
 *         description: Search term to filter meetings by project name, contractor name, or address.
 *         required: false
 *         schema:
 *           type: string
 *           example: "projectX"
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of meetings per page for pagination.
 *         required: false
 *         schema:
 *           type: integer
 *           format: int32
 *           example: 3
 *     responses:
 *       200:
 *         description: List of meetings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       meetingId:
 *                         type: integer
 *                       locationId:
 *                         type: integer
 *                       projectName:
 *                         type: string
 *                       address:
 *                         type: string
 *                       contractorName:
 *                         type: string
 *                       contractorNumber:
 *                         type: string
 *                       longitude:
 *                         type: string
 *                       latitude:
 *                         type: string
 *                       log:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           meetingId:
 *                             type: integer
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           inProgress:
 *                             type: integer
 *       400:
 *         description: Bad request (e.g., missing date)
 *       404:
 *         description: No Meeting Logs Found
 *       500:
 *         description: Failed to Retrieve Meetings
 */
router.get('/getMeetings', verifyToken, meetingMembersController.getMeetingLogsByDate);


/**
 * @swagger
 * /meetingmembers/getMeetings/{id}:
 *   get:
 *     summary: Get Meeting by ID
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Meeting details
 *       404:
 *         description: Meeting not found
 *       500:
 *         description: Failed to Retrieve Meeting
 */
router.get('/getMeetings/:id', verifyToken, meetingMembersController.getMeetingLogsById);

/**
 * @swagger
 * /meetingmembers/getMeeting:
 *   get:
 *     summary: Get Meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Meeting details
 *       500:
 *         description: Failed to Retrieve Meeting
 */
router.get("/getMeeting", verifyToken, meetingMembersController.getMeetings);

/**
 * @swagger
 * /meetingmembers/getSingleMeetingLogs/{meetingID}:
 *   get:
 *     summary: Get Single Meeting Logs
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: meetingID
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Single meeting logs
 *       404:
 *         description: Meeting logs not found
 *       500:
 *         description: Failed to Retrieve Meeting Logs
 */
router.get("/getSingleMeetingLogs/:meetingID", verifyToken, meetingMembersController.getSingleMeetingsLogs);

/**
 * @swagger
 * /meetingmembers/getMeetingLogList:
 *   get:
 *     summary: Get Meeting Log List
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meeting logs
 *       500:
 *         description: Failed to Retrieve Meeting Logs
 */
router.get("/getMeetingLogList", verifyToken, meetingMembersController.getMeetingLogsByMeetingIdForApp);

/**
 * @swagger
 * /meetingmembers/getMeetingLogs:
 *   get:
 *     summary: Get Meeting Logs
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of meeting logs
 *       500:
 *         description: Failed to Retrieve Meeting Logs
 */
router.get("/getMeetingLogs", verifyToken, meetingMembersController.getMeetingLogs);


router.get('/getMeetingDates', verifyToken, meetingMembersController.getMeetingDates);
module.exports = router;
