const {
    selectQuery,
    deleteQuery,
    insertScoutQuery,
    insertMeetingMembersQuery
  } = require("../constants/queries.js");
  const { queryRunner } = require("../helper/queryRunner.js");
  
  // ###################### Meeting Members Start #######################################
  exports.createMeetingMembers = async (req, res)=> {
    try {
      const { Name,phoneNumber,email,address,position,cityId,areasId,subareasId } = req.body;
      const selectResult = await queryRunner(selectQuery("meetingmembers","phoneNumber"),[phoneNumber]);
      if (selectResult[0].length > 0) {
        
        return res.status(409).json({
          statusCode: 409,
          message: `Meeting member already exist on this Number ${phoneNumber}`,
        });
      }
      const currentDate = new Date();
      const cityIdStr = cityId.toString();
      const areasIdStr = areasId.toString();
      const subareasIdStr = subareasId.toString();
      const insertResult = await queryRunner(insertMeetingMembersQuery, 
        [Name,phoneNumber,email,address,position,cityIdStr,areasIdStr,subareasIdStr,currentDate]);
          if (insertResult[0].affectedRows > 0) {
            const id = insertResult[0].insertId;
            
          return res.status(200).json({ 
        statusCode : 200,
        message: "Meeting Members Created successfully",
        id : insertResult[0].insertId
      });          
          } else {
            return res.status(500).json({ statusCode : 500,message : "Failed to Create Meeting Members "});
          }
    } catch (error) {
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Create Meeting Members",
        error: error.message
      });
    }
  };
  // ###################### create Meeting Members END #######################################

  exports.addMeeting= async (req, res)=> {
    try {
      const {
        locationId,
        assignedTo
    } = req.body;
    const checkAlreadyExist = await queryRunner(selectQuery("meetings","locationId"),[locationId]);
    if (checkAlreadyExist[0].length > 0) {
      return res.status(409).json({
        statusCode: 409,
        message: `Meeting already exist on this location ${locationId}`,
      });
    }
    const insertQuery = `INSERT INTO meetings (locationId,assignedTo) VALUES (?,?)`;
    const insertResult = await queryRunner(insertQuery, [locationId,assignedTo]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Meeting Created successfully",
        id: insertResult[0].insertId,
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Create Meeting",
      });
    }
    } catch (error) {
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Create Meeting Members",
        error: error.message
      });
    }
  }
  exports.updateMeetingLogs = async (req, res)=> {
    try {
      const {
        meetingLogId,
        meetingId,
        startTime,
        endTime,
        inProgress,
        meetingNotes,
        members,
        startedBy
    } = req.body;

    //  if start time is available then insert in meeting logs
    if(startTime){
      const insertQuery = `INSERT INTO meeting_logs (meetingId,startTime,members,startedBy) VALUES (?,?,?,?)`;
      const insertResult = await queryRunner(insertQuery, [meetingId,startTime,members,startedBy]);
      if (insertResult[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: "Meeting Logs Created successfully",
          id: insertResult[0].insertId,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Create Meeting Logs",
        });
      }

    }
    // now if meetingLogId is available then update the meeting logs
    if(meetingLogId){
      // make a dynamic query to update the meeting logs
      let updateQuery = `UPDATE meeting_logs SET `;
      if(endTime){
        updateQuery += `endTime = '${endTime}',`;
      }
      if(inProgress){
        updateQuery += `inProgress = '${inProgress}',`;
      }
      if(meetingNotes){
        updateQuery += `meetingNotes = '${meetingNotes}'`;
      }
      updateQuery += ` WHERE meetingLogId = ${meetingLogId}`;
      const updateResult = await queryRunner(updateQuery);
      if (updateResult[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: "Meeting Logs Updated successfully",
          id: meetingLogId,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Update Meeting Logs",
        });
      }

    }

    } catch (error) {
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Update Meeting Logs",
        error: error.message
      });
    }
  }
