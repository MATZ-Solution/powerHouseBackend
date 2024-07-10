const {
  selectQuery,
  deleteQuery,
  insertScoutQuery,
  countScoutQuery,
  insertCityQuery,
  insertAreaQuery,
  insertSubAreaQuery,
  // getAreasQuery,
} = require("../constants/queries.js");
const { queryRunner } = require("../helper/queryRunner.js");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const { normalizeAreaName } = require("../helper/normalizeArea.js");
const { buildDynamicQuery } = require("../helper/dynamicQuery.js");
const { calculateScore } = require("../helper/calculateScore.js");
const { insertNotification } = require("../helper/insertNotification.js");


exports.scout = async (req, res) => {
  try {
    const { userId } = req.user;
    const {
      projectName,
      projectType,
      city,
      area,
      block,
      buildingType,
      size,
      address,
      pinLocation,
      contractorName,
      contractorNumber,
      type,
    } = req.body;

    // // console.log("Request body:", req.body);

    const currentDate = new Date();

    // Normalize area value
    const normalizedArea = normalizeAreaName(area);

    // Build dynamic query
    let { query, queryParams } = buildDynamicQuery(
      "SELECT scoutMemberID, city, area, projectType, projectDomain  FROM sop WHERE 1=1",
      city,
      area,
      projectType,
      buildingType ?? type
    );
    // console.log("Dynamic query:", query, queryParams);

    // Query SOP table
    const sopResults = await queryRunner(query, queryParams);
    // console.log("SOP Results:", sopResults);

    // Initialize scout member IDs array
    let scoutMemberIDs = [];
    let sopIds=[];

    // Define criteria for scoring
    const criteria = { city, area: normalizedArea, projectType, buildingType };

    // Calculate scores for SOP rows
    sopResults[0].forEach((row) => {
      row.score = calculateScore(row, criteria);
    });

    // Sort SOP rows by score in descending order
    sopResults[0].sort((a, b) => b.score - a.score);

    // Select top three rows for assignment
    const topThreeRows = sopResults[0].slice(0, 3);

    // Extract scoutMemberIDs from top three rows
    topThreeRows.forEach((row) => {
      scoutMemberIDs.push(row.scoutMemberID);
      sopIds.push(row.id);
    });

    // Assign scout members to the scout
    const assignedTo =
      scoutMemberIDs.length > 0 ? scoutMemberIDs.join(",") : null;
    const sops = sopIds.length > 0 ? sopIds.join(",") : null;

    // Construct insert query
    // refrence id should be alphanumeric like if type project than check for resedential or commercial (R-001,C-001) and then add refrence id accordingly if market add commercial only
    let refrenceId = `${buildingType[0].toUpperCase()}-`;

    let insertQuery;

    if (assignedTo) {
      insertQuery = `
        INSERT INTO scout (
          projectName, projectType, city, area, block, buildingType, size, address, pinLocation, contractorName,
          contractorNumber, status, created_at, updated_at, scoutedBy, assignedTo, type, sops
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?,?)`;
      queryParams = [
        projectName,
        projectType,
        city,
        area,
        block,
        buildingType,
        size,
        address,
        pinLocation,
        contractorName,
        contractorNumber,
        currentDate,
        currentDate,
        userId,
        assignedTo,
        type,
        sops
      ];
    } else {
      insertQuery = `
        INSERT INTO scout (
          projectName, projectType, city, area, block, buildingType, size, address, pinLocation, contractorName,
          contractorNumber, status, created_at, updated_at, scoutedBy, type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`;
      queryParams = [
        projectName,
        projectType,
        city,
        area,
        block,
        buildingType ?? type,
        size,
        address,
        pinLocation,
        contractorName,
        contractorNumber,
        currentDate,
        currentDate,
        userId,
        type,
      ];
    }

    // Execute insert query
    const insertResult = await queryRunner(insertQuery, queryParams);

    // Check if the insertion was successful
    if (insertResult[0].affectedRows > 0) {
      const scoutId = insertResult[0].insertId;
      refrenceId += scoutId;
      const updateRefrenceIdQuery = `UPDATE scout SET refrenceId = ? WHERE id = ?`;
      const updateRefrenceIdResult = await queryRunner(updateRefrenceIdQuery, [
        refrenceId,
        scoutId,
      ]);
      if (updateRefrenceIdResult[0].affectedRows <= 0) {
        const deleteQuery = `DELETE FROM scout WHERE id = ?`;
        await queryRunner(deleteQuery, [scoutId]);
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Create Scout",
        });
      }
      // Insert location files if any
      if (req.files.length > 0) {
        for (const file of req.files) {
          const insertFileResult = await queryRunner(
            "INSERT INTO location_files (scouted_location, fileUrl, fileKey) VALUES (?, ?, ?)",
            [scoutId, file.location, file.key]
          );

          if (insertFileResult.affectedRows <= 0) {
            return res.status(500).json({
              statusCode: 500,
              message: "Failed to Create Scout",
            });
          }
        }
      }

      // Insert notification for the user
      const notificationInserted = await insertNotification(
        userId,
        `New location scouted - ${projectName}`,
        scoutId
      );

      if (notificationInserted && assignedTo) {
        const assignedToArray = assignedTo.split(",");
        for (const assignedToId of assignedToArray) {
          const result = await insertNotification(
            assignedToId,
            `New location Allotted - ${projectName}`,
            scoutId
          );
          // console.log("Notification Inserted:", result);
        }
      }
      // console.log("Notification Inserted:", notificationInserted);
      return res.status(200).json({
        statusCode: 200,
        message: "Scout Created successfully",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Create Scout",
      });
    }
  } catch (error) {
    // console.log("Error:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Create Scout",
      error: error.message,
    });
  }
};

// ###################### create Scout END #######################################

// ###################### Get Scout data start #######################################
exports.getscouts = async (req, res) => {
  try {
    // const { userId } = req.user;
    let query = `SELECT s.id, s.projectType, s.projectName, s.address, s.contractorName, s.contractorNumber, s.refrenceId, s.scoutedBy, sm.name as scoutedBy, s.created_at
    FROM scout s
    LEFT JOIN scout_member sm ON s.scoutedBy = sm.id
    ORDER BY s.id DESC`

    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({data: selectResult[0], message: "Scout Data Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Data",
      error: error.message,
    });
  }
};

exports.getScoutByUserId = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit } = req.query;
    // sort by created at and also only select the records equal to the limit
    const selectResult = await queryRunner(
      `SELECT * FROM scout WHERE scoutedBy = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, parseInt(limit)]
    );
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "Scout Data Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Data",
      error: error.message,
    });
  }
};
// ###################### Get Scout data End #######################################

// ###################### Get Scout Count start #######################################
exports.countScout = async (req, res) => {
  try {
    // const { userId } = req.user;
    const selectResult = await queryRunner(countScoutQuery);
    // console.log("this is count api", selectResult[0]);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "Scout Data Count Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Count",
      error: error.message,
    });
  }
};
// ###################### Get Scout Count End #######################################

// ###################### Add City #######################################
exports.AddCity = async (req, res) => {
  const { cityName } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("city", "cityName"), [
      cityName,
    ]);
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `City is already exist ${cityName}`,
      });
    }
    const insertResult = await queryRunner(insertCityQuery, [cityName]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "City added successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add city",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add city",
      message: error.message,
    });
  }
};
// ###################### Add City #######################################

// ############################# Add Cities using pdf Start ##########################################
exports.AddCityCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or file extension is not valid" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname);

    if (ext !== ".csv") {
      // Remove the invalid file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete invalid file:", filePath);
        }
      });
      return res.status(400).json({ message: "File extension is not valid" });
    }

    const cities = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        cities.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const city of cities) {
            const cityName = city.cityName; // Assuming your CSV has a column named 'cityName'
            const selectResult = await queryRunner(
              selectQuery("city", "cityName"),
              [cityName]
            );

            if (selectResult[0].length === 0) {
              await queryRunner(insertCityQuery, [cityName]);
            }
          }

          return res
            .status(200)
            .json({ message: "Cities processed successfully" });
        } catch (error) {
          return res.status(500).json({
            message: "Failed to process cities",
            error: error.message,
          });
        } finally {
          // Clean up the uploaded file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Failed to delete file:", filePath);
            }
          });
        }
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to process file", error: error.message });
  }
};

// ############################# Add Cities using pdf END ##########################################

// ###################### Add Area #######################################
exports.AddArea = async (req, res) => {
  const { cityId, areaName } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("area", "areaName"), [
      areaName,
    ]);
    if (selectResult[0].length > 0) {
      return res.status(409).json({
        statusCode: 409,
        message: `Area is already exist ${areaName}`,
      });
    }
    const insertResult = await queryRunner(insertAreaQuery, [cityId, areaName]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "Area added successfully",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to add area",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add area",
      message: error.message,
    });
  }
};
// ###################### Add CSV Area #######################################

exports.AddAreaCSV = async (req, res) => {
  // console.log("this is city id", req.body.cityId);
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or file extension is not valid" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname);

    if (ext !== ".csv") {
      // Remove the invalid file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete invalid file:", filePath);
        }
      });
      return res.status(400).json({ message: "File extension is not valid" });
    }

    const areas = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        areas.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const area of areas) {
            const areaName = area.AreaName; // Assuming your CSV has a column named 'cityName'
            const selectResult = await queryRunner(
              selectQuery("area", "AreaName"),
              [areaName]
            );

            let query = "INSERT INTO area(cityId, AreaName) VALUES(?,?)";
            if (selectResult[0].length === 0) {
              await queryRunner(query, [req.body.cityId, areaName]);
            }
          }

          return res
            .status(200)
            .json({ message: "Areas processed successfully" });
        } catch (error) {
          // // console.log("this is error", error)
          return res.status(500).json({
            message: "Failed to process areas",
            error: error.message,
          });
        } finally {
          // Clean up the uploaded file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Failed to delete file:", filePath);
            }
          });
        }
      });
  } catch (error) {
    // console.log("this is error", err);
    return res
      .status(500)
      .json({ message: "Failed to process file", error: error.message });
  }
};

// ###################### END #######################################

// ###################### Add SubArea #######################################
exports.AddSubArea = async (req, res) => {
  const { areaId, subAreaName } = req.body;
  try {
    const selectResult = await queryRunner(
      selectQuery("subarea", "subAreaName"),
      [subAreaName]
    );
    if (selectResult[0].length > 0) {
      return res.status(409).json({
        statusCode: 409,
        message: `SubArea is already exist ${subAreaName}`,
      });
    }
    const insertResult = await queryRunner(insertSubAreaQuery, [
      areaId,
      subAreaName,
    ]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "SubArea added successfully",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to add subArea",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add subArea",
      message: error.message,
    });
  }
};
// ###################### Add SubArea #######################################

// ###################### Add CSV Area #######################################

exports.AddSubAreaCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded or file extension is not valid" });
    }

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname);

    if (ext !== ".csv") {
      // Remove the invalid file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Failed to delete invalid file:", filePath);
        }
      });
      return res.status(400).json({ message: "File extension is not valid" });
    }

    const subAreas = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        subAreas.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const subArea of subAreas) {
            const subAreaName = subArea.subAreaName; // Assuming your CSV has a column named 'cityName'
            const selectResult = await queryRunner(
              selectQuery("subarea", "subAreaName"),
              [subAreaName]
            );

            let query = "INSERT INTO subarea(areaId, subAreaName) VALUES(?,?)";
            if (selectResult[0].length === 0) {
              await queryRunner(query, [req.body.areaId, subAreaName]);
            }
          }

          return res
            .status(200)
            .json({ message: "Areas processed successfully" });
        } catch (error) {
          // // console.log("this is error", error)
          return res.status(500).json({
            message: "Failed to process Sub areas",
            error: error.message,
          });
        } finally {
          // Clean up the uploaded file
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error("Failed to delete file:", filePath);
            }
          });
        }
      });
  } catch (error) {
    // console.log("this is error", err);
    return res
      .status(500)
      .json({ message: "Failed to process file", error: error.message });
  }
};

// ###################### END #######################################

// ###################### Get Cities start #######################################
exports.getCities = async (req, res) => {
  try {
    const selectResult = await queryRunner(selectQuery("city"));
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "Cities List Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get cities list",
      error: error.message,
    });
  }
};
// ###################### Get Cities End #######################################

// ###################### Get Areas By id start #######################################
exports.getAreas = async (req, res) => {
  try {
    const { cityId } = req.query;
    // console.log(cityId);
    let cityArray = cityId.split(",");
    let selectResult;
    const placeholders = cityArray.map(() => "?").join(", ");
    const getAreasQuery = `SELECT * FROM area WHERE cityId IN (${placeholders})`;
    selectResult = await queryRunner(getAreasQuery, [...cityArray]);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "No data Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get area list",
      error: error.message,
    });
  }
};
// ###################### Get Areas By id End #######################################

// ###################### Get Sub Areas By id start #######################################
exports.getSubAreas = async (req, res) => {
  try {
    const { areaId } = req.query;
    let areaArray = areaId.split(",");
    let selectResult;
    const placeholders = areaArray.map(() => "?").join(", ");
    const getSubAreasQuery = `SELECT * FROM subarea WHERE areaId IN (${placeholders})`;
    selectResult = await queryRunner(getSubAreasQuery, [...areaArray]);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "No data Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Subarea list",
      error: error.message,
    });
  }
};
// ###################### Get Sub Areas By id End #######################################

// ###################### Get Sub Areas By id start #######################################

exports.getAllotedLocations = async (req, res) => {
  try {
      let query = `
      SELECT 
      scout.id,
      scout.refrenceId,
      scout.projectName,
      scout.buildingType,
      scout.city,
      scout.address,
      scout.contractorName,
      scout.contractorNumber,
      scout.assignedTo,
      scout.scoutedBy,
      SM1.name AS scouter,
    (
        SELECT 
        GROUP_CONCAT(SM2.name ORDER BY FIELD(SM2.id, scout.assignedTo))
        FROM 
        scout_member SM2 
        WHERE 
        FIND_IN_SET(SM2.id, scout.assignedTo)
    )   AS assignedToMember
      FROM
      scout scout
      JOIN
      scout_member SM1 ON SM1.id = scout.scoutedBy
      WHERE
      scout.assignedTo IS NOT NULL
      GROUP BY
      scout.id
      HAVING
      assignedToMember IS NOT NULL order by id desc`;

      let selectResult = await queryRunner(query);
      if (selectResult[0].length > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
        });
      } else {
        res.status(200).json({data: selectResult[0], message: "No Location Found" });
      }
    
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get location",
      error: error.message,
    });
  }
};

exports.getUnAllotedLocations = async (req, res) => {

  try {
      let query1 = `Select s.id, s.projectName, s.buildingType, s.city, s.address, s.contractorName, s.contractorNumber,s.assignedTo, s.refrenceId, s.scoutedBy, sm.name as scouter
      FROM scout s
     join scout_member sm 
      on s.scoutedBy = sm.id
      WHERE s.assignedTo IS NULL order by id desc`;

      let selectResult = await queryRunner(query1);
      if (selectResult[0].length > 0) {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
        });
      } else {
        res.status(200).json({data:selectResult[0], message: "No Location Found" });
      }
    
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get location",
      error: error.message,
    });
  }
};
// ###################### Get Sub Areas By id End #######################################

// ###################### Get Sub Areas By id start #######################################
exports.addUnassignedScouter = async (req, res) => {
  let { scoutID, projectID } = req.body;
  let setScoutId = scoutID.join(",");

  try {
    let query = `UPDATE scout SET assignedTo = ? WHERE id = ?`;

    let [selectResult] = await queryRunner(query, [setScoutId, projectID]);

    if (selectResult.affectedRows > 0) {
      return res.status(200).json({ message: "Successfully Assigned Scouter" });
    }
    res.status(500).json({ message: "Failed To Assigned Scouter" });
  } catch (error) {
    // console.log(error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Add Scouter",
      error: error.message,
    });
  }
};
// ###################### Get Sub Areas By id End #######################################

// ###################### Get Individual scout Member #######################################
exports.getSingleScoutMember = async (req, res) => {
  let { userID } = req.params;
  // console.log("this is userId", userID);

  try {
    const query = `SELECT email, password, phoneNumber, name, address, position FROM scout_member where id = ?`;
    let selectResult = await queryRunner(query, [userID]);
    // // console.log("this is password: ", selectResult[0])
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "No user data Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to User Data",
      error: error.message,
    });
  }
};
// ###################### UPDATE SCOUTE MEMBER #######################################

exports.updateScoutMember = async (req, res) => {
  let { Name, address, email, phoneNumber, position, userID } = req.body;
  // console.log("this is req.body", req.body);

  try {
    const query = `UPDATE scout_member SET name = ?, address = ?, email = ?, phoneNumber = ?, position= ?  where id = ?; `;
    let insertResult = await queryRunner(query, [
      Name,
      address,
      email,
      phoneNumber,
      position,
      userID,
    ]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Successfully Update User",
        id: insertResult[0].insertId,
      });
    } else {
      return res
        .status(500)
        .json({
          statusCode: 500,
          message: "Failed to Update User",
        });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
// ###################### UPDATE SCOUTE MEMBER End #######################################



exports.getAllocatedLocation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit=5, page, search = "", projectType } = req.query; // Default search to an empty string
    const offset = (page - 1) * limit;
    // // console.log("this is limit", req.query);
    // Base query
    let query = `
      SELECT
        scout.id,
        scout.refrenceId,
        scout.projectName,
        scout.buildingType,
        scout.city,
        scout.address,
        scout.contractorName,
        scout.contractorNumber,
        scout.assignedTo,
        scout.sops,
        scout.scoutedBy,
        scout.projectType,
        scout.created_at,
        scout.pinLocation,
       
        scout_member.name AS scouter,
        scout_member.role AS scouterRole,
        (
          SELECT
            GROUP_CONCAT(scout_member.name ORDER BY FIELD(scout_member.id, scout.assignedTo))
          FROM
            scout_member
          WHERE
            FIND_IN_SET(scout_member.id, scout.assignedTo)
        ) AS assignedToMember
      FROM
        scout
      JOIN scout_member ON scout.scoutedBy = scout_member.id
      
      WHERE
        scout.assignedTo IS NOT NULL
        AND FIND_IN_SET(?, scout.assignedTo)
        AND scout.projectName LIKE ?`;

    // Add projectType filter if provided
    const queryParams = [userId, `%${search}%`, parseInt(limit), offset];
    if (projectType && projectType !== "All") {
      if(projectType !== "Market"){
        query += ` AND scout.buildingType = ?`;
        queryParams.splice(2, 0, projectType);
      }else{query += ` AND scout.projectType = ?`;
      queryParams.splice(2, 0, projectType);}
       // Insert projectType at the correct position
    }

    query += ` ORDER BY scout.created_at DESC LIMIT ? OFFSET ?`;

    const selectResult = await queryRunner(query, queryParams);
    // // console.log("this is allocated location", selectResult[0]);
    if (selectResult[0].length > 0) {
      const locationFiles=[];
      for (const location of selectResult[0]) {
        const filesQuery = `SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?`;
        const filesResult = await queryRunner(filesQuery, [location.id]);
        locationFiles.push(filesResult[0].length > 0 ? filesResult[0] : []);

        location.files = filesResult[0];
        // // console.log("this is files", location);


        if(location.sops){
          // // console.log("this is ", location.sops);
          const sopQuery = `SELECT sop.id, sop.projectType, sop.projectDomain, sop.city, sop.area, sop.scoutMemberID, sm.name AS scoutMemberName FROM sop JOIN scout_member sm ON sop.scoutMemberID = sm.id WHERE sop.id IN (?)`;
        const sopResult = await queryRunner(sopQuery, [location.sops]);
        location.sops = sopResult[0];
        }

        
      }
      // console.log("this is location files", selectResult[0]
      
res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0],
        });
    }
    else{
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: [],
      });
    }
  } catch (error) {
    console.error("Error fetching allocated locations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllocatedLocationByLocationId = async (req, res) => {
  try {
    const { userId } = req.user;
    const { locationId } = req.params;
    const query = `
      SELECT
        scout.id,
        scout.refrenceId,
        scout.projectName,
        scout.buildingType,
        scout.city,
        scout.address,
        scout.contractorName,
        scout.contractorNumber,
        scout.assignedTo,
        scout.sops,
        scout.scoutedBy,
        scout.projectType,
        scout.created_at,
        scout.pinLocation,
        scout_member.name AS scouter,
        scout_member.role AS scouterRole,
        (
          SELECT
            GROUP_CONCAT(scout_member.name ORDER BY FIELD(scout_member.id, scout.assignedTo))
          FROM
            scout_member
          WHERE
            FIND_IN_SET(scout_member.id, scout.assignedTo)
        ) AS assignedToMember
      FROM
        scout
      JOIN scout_member ON scout.scoutedBy = scout_member.id
      WHERE
        scout.assignedTo IS NOT NULL
        AND FIND_IN_SET(?, scout.assignedTo)
        AND scout.id = ?`;

    const selectResult = await queryRunner(query, [userId, locationId]);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "Location Not Found" });
    }
  } catch (error) {
    
  }
}
exports.getLongAndLat = async (req, res) => {

  try {
    const query = `SELECT id, buildingType, pinLocation FROM scout`;
    let selectResult = await queryRunner(selectQuery("scout"));
    // // console.log("this is password: ", selectResult[0])
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "No Longitude And Latitude data Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get Longitude And Latitude",
      error: error.message,
    });
  }
};


exports.getScoutsByUserIdWithAllInformation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { limit=5, page, search = "", projectType } = req.query;
    const offset = (page - 1) * limit;
    console.log("this is limit", req.query)
    // now we have to select the scouts based on scoutedById with all the related info from all the tables
    let query = `
    SELECT
      scout.id,
      scout.refrenceId,
      scout.projectName,
      scout.buildingType,
      scout.city,
      scout.address,
      scout.contractorName,
      scout.contractorNumber,
      scout.assignedTo,
      scout.sops,
      scout.scoutedBy,
      scout.projectType,
      scout.created_at,
      scout.pinLocation
    FROM
      scout

      where scout.scoutedBy = ?`;
      let queryParams = [userId];
      if(search){
        query += ` AND scout.projectName LIKE ?`;
        queryParams.push(`%${search}%`);
      }
      if(projectType){
        if(projectType==="Market"){query += ` AND scout.projectType = ?`;
        queryParams.push(projectType);}
        else if(projectType!=="All"){
          query += ` AND scout.buildingType = ?`;
          queryParams.push(projectType);
        }
        
      }
      query += ` ORDER BY scout.created_at DESC LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);
      // console.log("this is query", query, queryParams);
      const selectResult = await queryRunner(query, queryParams);
      // console.log("this is allocated location", selectResult[0]);
      if (selectResult[0].length > 0) {
        try {
            await Promise.all(
                selectResult[0].map(async (location) => {
                    const meetingandmeetinglogq = 'SELECT meetings.id, meeting_logs.id, meeting_logs.startTime, meeting_logs.endTime, meeting_logs.inProgress FROM meetings JOIN meeting_logs ON meetings.id = meeting_logs.meetingId WHERE meetings.locationId = ?';
                    const meetingandmeetinglog = await queryRunner(meetingandmeetinglogq, [location.id]);
                    location.meeting = meetingandmeetinglog[0];
                    
                    const filesQuery = 'SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?';
                    const filesResult = await queryRunner(filesQuery, [location.id]);
                    console.log("this is files", filesResult[0]);
                    location.files = filesResult[0];
                    
                    if (location.sops) {
                        const sopQuery = `SELECT sop.id, sop.projectType, sop.projectDomain, sop.city, sop.area, sop.scoutMemberID, sm.name AS scoutMemberName FROM sop JOIN scout_member sm ON sop.scoutMemberID = sm.id WHERE sop.id IN (?)`;
                        const sopResult = await queryRunner(sopQuery, [location.sops]);
                        location.sops = sopResult[0];
                    }
                    
                    if (location.assignedTo) {
                        const assignedToQuery = 'SELECT id, name, email, phoneNumber,role As scouterRole FROM scout_member WHERE id IN (?)';
                        const assignedToResult = await queryRunner(assignedToQuery, [location.assignedTo]);
                        location.assignedTo = assignedToResult[0];
                    }
                })
            );
    
            // console.log("this is allocated location", selectResult[0][0].assignedTo);
            res.status(200).json({
                statusCode: 200,
                message: "Success",
                data: selectResult[0],
            });
        } catch (error) {
            console.error("Error processing locations", error);
            res.status(500).json({
                statusCode: 500,
                message: "Internal Server Error",
            });
        }
    }
     else {
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: [],
        });
      }
  } catch (error) {
    console.error("Error fetching allocated locations:", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Data",
      error: error.message,
    });
  }
};
// ###################### GET LONGITUDE AND LATITUDE END #######################################


// ###################### GET LONGITUDE AND LATITUDE START #######################################

exports.getScoutReport = async (req, res) => {
  try {
    const query = `SELECT id, buildingType, pinLocation FROM scout`;
    let selectResult = await queryRunner(query);
    // console.log("this is password: ", selectResult[0])
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "No Longitude And Latitude data Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to get Longitude And Latitude",
      error: error.message,
    });
  }
};

// ###################### GET LONGITUDE AND LATITUDE END #######################################




// ###################### scoutMap #######################################
exports.scoutMap = async (req, res) => {
  try {
    const selectResult = await queryRunner(selectQuery("scout"));
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Success`,
        data: selectResult[0]
      });
    }else{
      return res.status(200).json({
        message: `No data Found`,
      });
    }
    
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get Scouts",
      message: error.message,
    });
  }
};
// ###################### scoutMap #######################################