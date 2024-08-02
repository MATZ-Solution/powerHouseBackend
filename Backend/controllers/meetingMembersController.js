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
        members,
        meetingLocation,
        meetingTopic,
        startTime
    } = req.body;
    const {userId} = req.user;
    const checkAlreadyExist = await queryRunner(selectQuery("meetings","locationId"),[locationId]);
    if (checkAlreadyExist[0].length > 0) {
      let insertInMeetingLog;
      let insertInMeetingLogResult;
      if(meetingTopic){
        insertInMeetingLog = `INSERT INTO meeting_logs (meetingId,startTime,members,meetingLocation,meetingTopic) VALUES (?,?,?,?,?)`;
        insertInMeetingLogResult = await queryRunner(insertInMeetingLog, [checkAlreadyExist[0][0].id,startTime,members+','+userId.toString(),meetingLocation,meetingTopic]);
  
      }else{
        insertInMeetingLog = `INSERT INTO meeting_logs (meetingId,startTime,members,meetingLocation) VALUES (?,?,?,?)`;
        insertInMeetingLogResult = await queryRunner(insertInMeetingLog, [checkAlreadyExist[0][0].id,startTime,members+','+userId.toString(),meetingLocation]);
  
      }
      if (insertInMeetingLogResult[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: "Meeting Created successfully",
          id: checkAlreadyExist[0][0].id,
        });
      }
      else{
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Create Meeting",
        });
      }
     
    }
    const insertQuery = `INSERT INTO meetings (locationId,assignedTo) VALUES (?,?)`;
    const insertResult = await queryRunner(insertQuery, [locationId,members]);
    if (insertResult[0].affectedRows > 0) {
      let createLogQuery;
      let createLogResult;
      if(meetingTopic){
        createLogQuery = `INSERT INTO meeting_logs (meetingId,startTime,members,meetingLocation,meetingTopic) VALUES (?,?,?,?,?)`;;
        createLogResult = await queryRunner(createLogQuery, [insertResult[0].insertId,startTime,members+','+userId.toString(),meetingLocation,meetingTopic]);
  
      }else{
        createLogQuery = `INSERT INTO meeting_logs (meetingId,startTime,members,meetingLocation) VALUES (?,?,?,?)`;;
        createLogResult = await queryRunner(createLogQuery, [insertResult[0].insertId,startTime,members+','+userId.toString(),meetingLocation]);
      }
      if (createLogResult[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: "Meeting Created successfully",
          id: insertResult[0].insertId,
        });
      }
      
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Create Meeting",
      });
    }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Create Meeting Members",
        error: error.message
      });
    }
  }
  exports.updateMeetingLogs = async (req, res)=> {
    const {userId} = req.user;
    try {
      const {
        meetingLogId,
        meetingId,
        startTime,
        endTime,
        inProgress,
        meetingNotes,
        members,
        startedBy,
        nextMeetingDate
    } = req.body;

    
    // now if meetingLogId is available then update the meeting logs
    if(meetingLogId){
      // make a dynamic query to update the meeting logs
      let updateQuery = `UPDATE meeting_logs SET `;
      if(startTime){
        updateQuery += `startTime = '${startTime}',`;
        updateQuery += `inProgress = '${inProgress??1}',`;
        updateQuery += `startedBy = '${userId}'`;
      }
      if(endTime){
        updateQuery += `endTime = '${endTime}',`;
        updateQuery += `inProgress = '${inProgress??0}'`;

      }
      
      if(meetingNotes){
        updateQuery += `,meetingNotes = '${meetingNotes}'`;
      }
      updateQuery += ` WHERE id = ${meetingLogId}`;
      const updateResult = await queryRunner(updateQuery);
      if (updateResult[0].affectedRows > 0) {
        if(nextMeetingDate){
          const createNextMeetingLogQuery = `INSERT INTO meeting_logs (meetingId,startTime) VALUES (?,?)`;
          const createNextMeetingLogResult = await queryRunner(createNextMeetingLogQuery, [meetingId,nextMeetingDate]);
          if (createNextMeetingLogResult[0].affectedRows > 0) {
            return res.status(200).json({
              statusCode: 200,
              message: "Meeting Logs Updated successfully",
              id: meetingLogId,
            });
          }

        }else{
          return res.status(200).json({
            statusCode: 200,
            message: "Meeting Logs Updated successfully",
            id: meetingLogId,
          });
        }
        // return res.status(200).json({
        //   statusCode: 200,
        //   message: "Meeting Logs Updated successfully",
        //   id: meetingLogId,
        // });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Update Meeting Logs",
        });
      }

    }
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Update Meeting Logs",
    });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Update Meeting Logs",
        error: error.message
      });
    }
  }


  exports.getMeetings= async (req, res) => {
  
    try {
      const query = `SELECT l.id, l.locationId, l.assignedTo , s.address, s.projectName,
      (SELECT group_concat(sm.name) from scout_member sm where find_in_set(sm.id, l.assignedTo)) As assignedToMemberName
      FROM meetings l 
      JOIN scout s
      ON l.locationId = s.id;`;
      let selectResult = await queryRunner(query);
      if (selectResult[0].length > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
        });
      } else {
        res.status(200).json({ data: selectResult[0], message: "No Meetings Found" });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };

  exports.getSingleMeetingsLogs= async (req, res) => {
  let {meetingID} = req.params
    try {
      const query = `SELECT ml.id, ml.meetingId, DATE_FORMAT(ml.startTime, '%e-%b-%y %h:%i %p') AS startTime, 
      DATE_FORMAT(ml.endTime, '%e-%b-%y %h:%i %p') AS endTime, ml.inProgress, ml.meetingNotes, ml.startedBy,ml.members,
      sm.id AS scout_member_id, sm.name AS startedByName
      FROM matzsolu_powerhouse_new.meeting_logs ml
      LEFT JOIN matzsolu_powerhouse_new.scout_member sm ON ml.startedBy = sm.id
      where ml.meetingId = ?`;
      let selectResult = await queryRunner(query, [meetingID]);
      if (selectResult[0].length > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
        });
      } else {
        res.status(404).json({ message: "No Meetings Logs Found" });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode: 500,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };


  exports.getMeetingLogsByDate = async (req, res) => {
    try {
      const { userId } = req.user;
      const { date, search,page=1,limit=3 } = req.query;

      const offset = (page - 1) * limit;
      // console.log("this is limit", req.query);
  
      // Construct the search condition
      const searchCondition = search
        ? `AND (scout.projectName LIKE ? OR scout.contractorName LIKE ? OR scout.address LIKE ?)`
        : '';
  
      // Updated query with search functionality
      const selectMeetingQuery = `
        SELECT 
            meetings.id, 
            meetings.locationId, 
            scout.projectName, 
            scout.address, 
            scout.contractorName, 
            scout.contractorNumber,
            scout.pinLocation,
            meeting_logs.id as meetingLogId
        FROM 
            meetings 
        JOIN 
            scout ON meetings.locationId = scout.id 
        JOIN 
            meeting_logs ON meeting_logs.meetingId = meetings.id
        WHERE 
            FIND_IN_SET(?, meeting_logs.members)
            ${searchCondition}
      `;
  
      // Build the parameters array
      const params = [userId];
      if (search) {
        const likeSearchTerm = `%${search}%`;
        params.push(likeSearchTerm, likeSearchTerm, likeSearchTerm);
      }
      // console.log(params);
      const selectMeetingResult = await queryRunner(selectMeetingQuery, params);
      let anyMeetingInProgress = false;
      if (selectMeetingResult[0].length > 0) {
        const meetingLogs = await Promise.all(selectMeetingResult[0].map(async (meeting) => {
          // Query to get the meeting logs
          const meetingLogQuery = `SELECT * FROM meeting_logs WHERE meetingId = ? AND DATE(startTime) = ? ORDER BY startTime DESC LIMIT ? OFFSET ?`;
          const meetingLogResult = await queryRunner(meetingLogQuery, [meeting.id, date,parseInt(limit), offset]);
          if (meetingLogResult[0].length > 0) {
            return meetingLogResult[0].map(log => {
              if (log.inProgress === 1) {
                anyMeetingInProgress = true;
              }
  
              return {
                meetingId: meeting.id,
                locationId: meeting.locationId,
                projectName: meeting.projectName,
                address: meeting.address,
                contractorName: meeting.contractorName,
                contractorNumber: meeting.contractorNumber,
                longitude: meeting.pinLocation.split(",")[1],
                latitude: meeting.pinLocation.split(",")[0],
                log: log,
              };
            });
          }
          return null; // Return null for meetings with no logs
        }));
        
        // Filter out null values from the meetingLogs
        const filteredMeetingLogs = meetingLogs.filter(logs => logs !== null);
  
        return res.status(200).json({
          statusCode: 200,
          message: "Meeting Logs",
          data: filteredMeetingLogs.flatMap(logs => logs),
          meetingInProgress: anyMeetingInProgress,
        });
      } else {
        return res.status(404).json({
          statusCode: 404,
          message: "No Meeting Logs Found",
        });
      }
    } catch (error) {
      console.error(error.message); // Log the error for debugging
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to get Meeting Logs",
        error: error.message,
      });
    }
  }
  
  
  exports.getMeetingLogsById = async (req, res) => {
    // in this i will send meetingId and meetinglogId and will get the specific meeting log
    try{
      const { id } = req.params;
      const { userId } = req.user;
      const meetingLogId=id;
      // console.log(meetingLogId);
      const selectMeetingQuery = `
      SELECT 
          meetings.id, 
          meetings.locationId, 
          scout.projectName, 
          scout.address, 
          scout.contractorName, 
          scout.contractorNumber,
          scout.pinLocation
      FROM 
          meetings 
      JOIN 
          scout ON meetings.locationId = scout.id 
      WHERE 
          FIND_IN_SET(?, meetings.assignedTo)
  `;
  const selectMeetingResult = await queryRunner(selectMeetingQuery, [userId]);
  // console.log(selectMeetingResult[0]);
  if (selectMeetingResult[0].length > 0) {
    const meetingLogQuery = `SELECT * FROM meeting_logs WHERE id = ?`;
    const meetingLogResult = await queryRunner(meetingLogQuery, [meetingLogId]);
    if (meetingLogResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Meeting Log",
        data: {
          meetingId: selectMeetingResult[0][0].id,
          locationId: selectMeetingResult[0][0].locationId,
          projectName: selectMeetingResult[0][0].projectName,
          address: selectMeetingResult[0][0].address,
          contractorName: selectMeetingResult[0][0].contractorName,
          contractorNumber: selectMeetingResult[0][0].contractorNumber,
          longitude: selectMeetingResult[0][0].pinLocation.split(",")[1],
          latitude: selectMeetingResult[0][0].pinLocation.split(",")[0],
          log: meetingLogResult[0][0],
        },
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "No Meeting Log Found",
      });
    }
  }
  else{
    return res.status(404).json({
      statusCode: 404,
      message: "No Meeting Log Found",
    });
  }

    }catch(e){
      console.log(e);
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to get Meeting Log",
        error: e.message,
      });
    }
  }
  exports.getMeetingLogsByMeetingIdForApp = async (req, res) => {
    try {
      const { locationId, page = 1, limit = 8,status } = req.query;
      console.log(req.query);
      const selectMeetingQuery = `SELECT * FROM meetings WHERE locationId = ? `;
      const selectMeetingResult = await queryRunner(selectMeetingQuery, [locationId]);
  
      if (selectMeetingResult[0].length > 0) {
        const meetingId = selectMeetingResult[0][0].id;
        if (!meetingId) {
          return res.status(400).json({
            statusCode: 400,
            message: "Meeting ID is required",
          });
        }
  
        const offset = (page - 1) * limit;
  
        let selectMeetingLogsQuery = `SELECT * FROM meeting_logs WHERE meetingId = ? `;
        let queryParams = [meetingId, parseInt(limit), offset];
        selectMeetingLogsQuery += `ORDER BY startTime DESC LIMIT ? OFFSET ?`;
  
        const selectMeetingLogsResult = await queryRunner(selectMeetingLogsQuery, queryParams);
  
        if (selectMeetingLogsResult[0].length > 0) {
          const result = await Promise.all(selectMeetingLogsResult[0].map(async (log) => {
            const memberIds = log?.members?.split(",");
  
            if (memberIds) {
              console.log(memberIds);
  
              const placeholders = memberIds.map(() => '?').join(',');
              const selectMembersQuery = `SELECT * FROM scout_member WHERE id IN (${placeholders})`;
              const selectMembersResult = await queryRunner(selectMembersQuery, memberIds);
  
              if (selectMembersResult[0].length > 0) {
                return {
                  ...log,
                  members: selectMembersResult[0],
                };
              } else {
                return {
                  ...log,
                  members: [],
                };
              }
            } else {
              console.log("no members");
              return {
                ...log,
                members: [],
              };
            }
          }));
          console.log(result);
          return res.status(200).json({
            statusCode: 200,
            message: "Meeting Logs",
            data: result,
          });
        } else {
          return res.status(200).json({
            statusCode: 200,
            message: "No meeting logs found",
            data: [],
          });
        }
      } else {
        return res.status(200).json({
          statusCode: 200,
          data: [],
          message: "No meetings found for the given location ID",
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to get Meeting Log",
        error: e.message,
      });
    }
  };
  
  