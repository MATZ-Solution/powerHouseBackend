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
  
  // ###################### Get Scout data start #######################################
  exports.getscouts = async (req, res) => {
    try {
      // const { userId } = req.user;
      const selectResult = await queryRunner(selectQuery("scout"));
      if (selectResult[0].length > 0) {
        
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0]
        });
      } else {
        res.status(404).json({ message: "Scout Data Not Found" });
      }
    } catch (error) {
      return res.status(500).json({
        statusCode : 500,
        message: "Failed to Get Scout Data",
        error: error.message
      });
    }
  };
  // ###################### Get Scout data End #######################################
  