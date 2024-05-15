const {
  selectQuery,
  deleteQuery,
  insertScoutQuery,
  countScoutQuery
} = require("../constants/queries.js");
const { queryRunner } = require("../helper/queryRunner.js");


// ###################### Scout Start #######################################
exports.scout = async (req, res)=> {
  try {
    console.log("1");
    const {projectName,projectType,city,area,block,buildingType,
      size,address,pinLocation,contractorName,contractorNumber} = req.body;
    // const {userId} = req.user;
    const currentDate = new Date();

    const insertResult = await queryRunner(insertScoutQuery, 
      [projectName,projectType,city,area,block,buildingType,
        size,address,pinLocation,contractorName,contractorNumber,'Pending',currentDate]);
        if (insertResult[0].affectedRows > 0) {
          const id = insertResult[0].insertId;
          
        return res.status(200).json({ 
      statusCode : 200,
      message: "Scout Created successfully",
      id : insertResult[0].insertId
    });          
        } else {
          return res.status(500).json({ statusCode : 500,message : "Failed to Create Scout "});
        }
  } catch (error) {
    return res.status(500).json({
      statusCode : 500,
      message: "Failed to Create Scout",
      error: error.message
    });
  }
};
// ###################### create Scout END #######################################

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



// ###################### Get Scout Count start #######################################
exports.countScout = async (req, res) => {
  try {
    // const { userId } = req.user;
    const selectResult = await queryRunner(countScoutQuery);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0]
      });
    } else {
      res.status(404).json({ message: "Scout Data Count Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode : 500,
      message: "Failed to Get Scout Count",
      error: error.message
    });
  }
};
// ###################### Get Scout Count End #######################################
