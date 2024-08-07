const {
  selectQuery,
  deleteQuery,
  insertScoutQuery,
  countScoutQuery,
  insertCityQuery,
  insertAreaQuery,
  insertSubAreaQuery,
  getAllAloctedLocationQuery,
  insertArchitectureQuery,
  insertBuilderQuery,
  insertElectricianQuery,
  updateScouteStatusQuery,
  monthlyScoutingQuery
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
// const { captureLog } = require("../helper/captureLog.js");


exports.getscoutsByID = async (req, res) => {
  try {
    const { id } = req.params;
   
    let query = `SELECT s.*,A.id as architectureID, A.architectureName as architectureName,B.id as builderID, B.builderName,E.id as electricianID, E.electricianName 
from scout s 
LEFT JOIN Architecture A ON s.Architectures = A.id
LEFT JOIN Builders B ON s.Builders = B.id 
LEFT JOIN Electricians E ON s.Electricians = E.id 
WHERE s.id = ${id}`
    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({ data: selectResult[0], message: "No Scout Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout",
      error: error.message,
    });
  }
};


exports.AddReferralProject = async (req, res) => {
  try {
    const { userId } = req.user;
    
    let insertQuery;
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
      Architectures,
      Builders,
      Electricians
    } = req.body;

    const currentDate = new Date();

    insertQuery = `
        INSERT INTO referral (
          projectName, projectType, city, area, block, buildingType, size, address, pinLocation, contractorName,
          contractorNumber, status, created_at, updated_at, refferedBy, type,Architectures,Builders,Electricians
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?,?,?,?)`;
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
      Architectures,
      Builders,
      Electricians
    ];

    //   // Execute insert query
    const insertResult = await queryRunner(insertQuery, queryParams);

    //   // Check if the insertion was successful
    if (insertResult[0].affectedRows > 0) {
      const scoutId = insertResult[0].insertId;
      // refrenceId += scoutId;
      // const updateRefrenceIdQuery = `UPDATE scout SET refrenceId = ? WHERE id = ?`;
      // const updateRefrenceIdResult = await queryRunner(updateRefrenceIdQuery, [
      //   refrenceId,
      //   scoutId,
      // ]);
      //   if (updateRefrenceIdResult[0].affectedRows <= 0) {
      //     const deleteQuery = `DELETE FROM scout WHERE id = ?`;
      //     await queryRunner(deleteQuery, [scoutId]);
      //     return res.status(500).json({
      //       statusCode: 500,
      //       message: "Failed to Create Scout",
      //     });
      //   }
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
      // const notificationInserted = await insertNotification(
      //   userId,
      //   `New location scouted - ${projectName}`,
      //   scoutId
      // );

      // if (notificationInserted && assignedTo) {
      //   const assignedToArray = assignedTo.split(",");
      //   for (const assignedToId of assignedToArray) {
      //     const result = await insertNotification(
      //       assignedToId,
      //       `New location Allotted - ${projectName}`,
      //       scoutId
      //     );
      //     // console.log("Notification Inserted:", result);
      //   }
      // }
      // console.log("Notification Inserted:", notificationInserted);
      return res.status(200).json({
        statusCode: 200,
        message: "Referral Created successfully",
      });
    }
    else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Create Referral",
      });
    }
  } catch (error) {
    
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Create Referral",
      error: error.message,
    });
  }
};

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
      scoutType,
      Architectures,
      Builders,
      Electricians,
      // scoutType
    } = req.body;

    // // console.log("Request body:", req.body);
    let isSop=false
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
    let sopIds = [];

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
          contractorNumber, status, created_at, updated_at, scoutedBy, assignedTo, type, sops,scoutType,Architectures,Builders,Electricians
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, ?,?,?,?,?,?)`;
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
        sops,
        scoutType,
        Architectures,
        Builders,
        Electricians,
        // scoutType
      ];
      isSop=true
    } else {
      insertQuery = `
        INSERT INTO scout (
          projectName, projectType, city, area, block, buildingType, size, address, pinLocation, contractorName,
          contractorNumber, status, created_at, updated_at, scoutedBy, type,scoutType, Architectures,Builders,Electricians 
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?,?,?,?,?,?)`;
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
        scoutType,
        Architectures,
        Builders,
        Electricians,

      ];
      isSop=false
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
        const insertInCaptureLog1 = await queryRunner(
          "INSERT INTO ChangeLog(changed_data, locationId,table_name) VALUES (?, ?, ?)",
          [sops, scoutId,'sops']
        );
        const insertInCaptureLog2 = await queryRunner(
          "INSERT INTO ChangeLog(changed_data, locationId,table_name) VALUES (?, ?, ?)",
          [assignedTo, scoutId,'scout_members_sop']
        );
        
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
    let query = `SELECT 
    s.city,
    s.refrenceId,
    s.id,
    s.assignedTo,
    s.projectType,
    s.projectName,
    s.buildingType,
    s.size,
    s.status,
    s.address,
    s.contractorName,
    s.contractorNumber,
    s.refrenceId,
    s.scoutedBy,
    ar.architectureName,
    ar.architectureNumber,
    b.builderName,
    b.builderNumber,
    e.electricianName,
    e.electricianNumber,
    s.Builders,
    s.Electricians,
    sm.name as scoutedBy,
    s.created_at,
    -- Aggregated names from scout_member based on assignedTo IDs
    (SELECT GROUP_CONCAT(sm2.name SEPARATOR ', ')
     FROM scout_member sm2
     WHERE FIND_IN_SET(sm2.id, s.assignedTo)) AS assignedToNames
FROM scout s
LEFT JOIN Architecture AS ar ON s.Architectures = ar.id
LEFT JOIN Builders AS b ON s.Builders = b.id
LEFT JOIN Electricians AS e ON s.Electricians = e.id
LEFT JOIN scout_member sm ON s.scoutedBy = sm.id
ORDER BY s.id DESC;
`;
    
      
    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res
        .status(200)
        .json({ data: selectResult[0], message: "Scout Data Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Data",
      error: error.message,
    });
  }
};

// TOP SCOUT MEMBERS
exports.topscouts = async (req, res) => {
  try {
    // const { userId } = req.user;
    const query = "SELECT sm.id, sm.name, COUNT(s.scoutedBy) as scout_count FROM scout_member sm LEFT JOIN scout s ON sm.id = s.scoutedBy GROUP BY sm.id, sm.name ORDER BY scout_count DESC LIMIT 5;";

    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res
        .status(200)
        .json({ data: selectResult[0], message: "Top Scout Data Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Top Scout Data",
      error: error.message,
    });
  }
};

// GETTING SCOUTS PER EACH MONTH IN ASCENDING ORDER
exports.monthlyscouts = async (req, res) => {
  try {
    // const { userId } = req.user;
    const query = monthlyScoutingQuery;

    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res
        .status(200)
        .json({ data: selectResult[0], message: "Scout Data Per Month Not Found" });
    }
  } 
  catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Monthly Scout Data",
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

// GETTING SCOUTS PER EACH MONTH IN ASCENDING ORDER
exports.monthlyscouts = async (req, res) => {
  try {
    // const { userId } = req.user;
    const query = monthlyScoutingQuery;

    const selectResult = await queryRunner(query);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res
        .status(200)
        .json({ data: selectResult[0], message: "Scout Data Per Month Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Monthly Scout Data",
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

// ###################### Get All Areas  #######################################
exports.getAllAreas = async (req, res) => {
  try {
    const getAreasQuery =  `SELECT  a.AreaName, c.cityName FROM  area a JOIN city c ON a.cityId = c.id`;
    
    selectResult = await queryRunner(getAreasQuery);
    const data = selectResult[0];
  
    if (data.length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: data,
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
    
    let selectResult = await queryRunner(getAllAloctedLocationQuery);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({ data: selectResult[0], message: "No Location Found" });
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
    let query1 = `Select s.id, s.projectName, s.projectType, s.buildingType, s.city, s.address, s.contractorName, s.contractorNumber,s.assignedTo, s.refrenceId, s.scoutedBy, sm.name as scouter
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
      res
        .status(200)
        .json({ data: selectResult[0], message: "No Location Found" });
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
      const insertInCaptureLog = await queryRunner(
        "INSERT INTO ChangeLog(changed_data, locationId,operation_type) VALUES (?, ?, ?)",
        [setScoutId, projectID,'assigned']
      );
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
      return res.status(500).json({
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
    
    const { limit = 5, page=1, search = "", projectType } = req.query; // Default search to an empty string
    const offset = (page - 1) * limit;
    // // console.log("this is limit", req.query);
    const totalCount=`SELECT COUNT(*) AS totalCount
FROM scout
JOIN scout_member ON scout.scoutedBy = scout_member.id
WHERE scout.assignedTo IS NOT NULL
  AND FIND_IN_SET(?, scout.assignedTo)
  AND scout.projectName LIKE ?`
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
  scout.status,
  scout.updated_at,
  scout.scoutType,
  scout_member.name AS scouter,
  scout_member.role AS scouterRole,
  (
    SELECT
      COUNT(ML.meetingId)
    FROM
      scout S
    LEFT JOIN
      meetings M ON S.id = M.locationId
    LEFT JOIN
      meeting_logs ML ON M.id = ML.meetingId
    WHERE
      S.sops IS NOT NULL
      AND S.id = scout.id
  ) AS totalMeeting,
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
JOIN
  scout_member ON scout.scoutedBy = scout_member.id
WHERE
  scout.assignedTo IS NOT NULL
  AND FIND_IN_SET(?, scout.assignedTo)
  AND scout.projectName LIKE ?
`;

    // Add projectType filter if provided
    const queryParams = [userId, `%${search}%`, parseInt(limit), offset];
    if (projectType && projectType !== "All") {
      if (projectType !== "Market") {
        query += ` AND scout.buildingType = ?`;
        queryParams.splice(2, 0, projectType);
      } else {
        query += ` AND scout.projectType = ?`;
        queryParams.splice(2, 0, projectType);
      }
      // Insert projectType at the correct position
    }

    query += ` ORDER BY scout.created_at DESC LIMIT ? OFFSET ?`;

    const selectResult = await queryRunner(query, queryParams);
    const totalCountResult = await queryRunner(totalCount, [userId, `%${search}%`]);
    if (selectResult[0].length > 0) {
      const locationFiles = [];
      for (const location of selectResult[0]) {
        const filesQuery = `SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?`;
        const filesResult = await queryRunner(filesQuery, [location.id]);
        locationFiles.push(filesResult[0].length > 0 ? filesResult[0] : []);

        location.files = filesResult[0];
        // // console.log("this is files", location);

        if (location.sops) {
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
        totalCount: totalCountResult[0][0]?.totalCount,
        data: selectResult[0],
      });
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        totalCount: 0,
        data: [],
      });
    }
  } catch (error) {
    console.error("Error fetching allocated locations:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
exports.getAllocatedLocationById = async (req, res) => {
  try {
    const { userId } = req.user;
    const locationId = req.params.id;
    
    const { limit = 5, page=1, search = "", projectType } = req.query; // Default search to an empty string
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
  scout.status,
  scout.updated_at,
  scout_member.name AS scouter,
  scout_member.role AS scouterRole,
  A.architectureName,
  B.builderName,
  E.electricianName,
  (
    SELECT
      COUNT(ML.meetingId)
    FROM
      scout S1
    LEFT JOIN
      meetings M ON S1.id = M.locationId
    LEFT JOIN
      meeting_logs ML ON M.id = ML.meetingId
    WHERE
      S1.sops IS NOT NULL
      AND S1.id = scout.id
  ) AS totalMeeting,
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
JOIN
  scout_member ON scout.scoutedBy = scout_member.id
LEFT JOIN
  Architecture A ON A.id = scout.Architectures
LEFT JOIN
  Builders B ON B.id = scout.Builders
LEFT JOIN
  Electricians E ON E.id = scout.Electricians
WHERE
  scout.id = ?;
`;

const queryParams = [locationId];

    

   

    const selectResult = await queryRunner(query, queryParams);
    
    if (selectResult[0].length > 0) {
      const locationFiles = [];
      for (const location of selectResult[0]) {
        const filesQuery = `SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?`;
        const filesResult = await queryRunner(filesQuery, [location.id]);
        locationFiles.push(filesResult[0].length > 0 ? filesResult[0] : []);

        location.files = filesResult[0];
        // // console.log("this is files", location);

        if (location.sops) {
          // // console.log("this is ", location.sops);
          const sopQuery = `SELECT sop.id, sop.projectType, sop.projectDomain, sop.city, sop.area, sop.scoutMemberID, sm.name AS scoutMemberName FROM sop JOIN scout_member sm ON sop.scoutMemberID = sm.id WHERE sop.id IN (?)`;
          const sopResult = await queryRunner(sopQuery, [location.sops]);
          location.sops = sopResult[0];
        }
      }
     

      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0][0],
      });
    } else {
      res.status(404).json({ message: "Location Not Found" });
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
  } catch (error) { }
};

exports.getLongAndLat = async (req, res) => {
  try {
    // const query = `SELECT id, buildingType, pinLocation FROM scout`;
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
    const { limit = 5, page=1, search = "", projectType, locationId } = req.query;
    const offset = (page - 1) * limit;
    
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
`;

    let queryParams = [];
    if (locationId) {
      query += ` WHERE scout.id = ?`;
      queryParams.push(locationId);
    } else {
      query += ` WHERE scout.scoutedBy = ?`;
      queryParams.push(userId);
    }
    if (search) {
      query += ` AND scout.projectName LIKE ?`;
      queryParams.push(`%${search}%`);
    }
    if (projectType) {
      if (projectType === "Market") {
        query += ` AND scout.projectType = ?`;
        queryParams.push(projectType);
      } else if (projectType !== "All") {
        query += ` AND scout.buildingType = ?`;
        queryParams.push(projectType);
      }
    }
    query += ` ORDER BY scout.created_at DESC LIMIT ? OFFSET ?`;
    queryParams.push(parseInt(limit), offset);
    // console.log("this is query", query, queryParams);\
    const totalQuery = `SELECT COUNT(*) AS totalCount FROM scout WHERE scout.scoutedBy = ?`;
    const totalResult = await queryRunner(totalQuery, [userId]);
    const selectResult = await queryRunner(query, queryParams);
    // console.log("this is allocated location", selectResult[0]);
    if (selectResult[0].length > 0) {
      try {
        await Promise.all(
          selectResult[0].map(async (location) => {
            const meetingandmeetinglogq =
              "SELECT meetings.id, meeting_logs.id, meeting_logs.startTime, meeting_logs.endTime, meeting_logs.inProgress FROM meetings JOIN meeting_logs ON meetings.id = meeting_logs.meetingId WHERE meetings.locationId = ?";
            const meetingandmeetinglog = await queryRunner(
              meetingandmeetinglogq,
              [location.id]
            );
            location.meeting = meetingandmeetinglog[0];

            const filesQuery =
              "SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?";
            const filesResult = await queryRunner(filesQuery, [location.id]);
            
            location.files = filesResult[0];

            if (location.sops) {
              const sopQuery = `SELECT sop.id, sop.projectType, sop.projectDomain, sop.city, sop.area, sop.scoutMemberID, sm.name AS scoutMemberName FROM sop JOIN scout_member sm ON sop.scoutMemberID = sm.id WHERE sop.id IN (?)`;
              const sopResult = await queryRunner(sopQuery, [location.sops]);
              location.sops = sopResult[0];
            }

            if (location.assignedTo) {
              const assignedToQuery =
                "SELECT id, name, email, phoneNumber,role As scouterRole FROM scout_member WHERE id IN (?)";
              const assignedToResult = await queryRunner(assignedToQuery, [
                location.assignedTo,
              ]);
              location.assignedTo = assignedToResult[0];
            }
          })
        );

        // console.log("this is allocated location", selectResult[0][0].assignedTo);
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          total: totalResult[0][0].totalCount,
          data: selectResult[0],
        });
      } catch (error) {
        console.error("Error processing locations", error);
        res.status(500).json({
          statusCode: 500,
          message: "Internal Server Error",
        });
      }
    } else {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        total:0,
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

exports.getScoutByIdWithAllInformation = async (req, res) => {
  try {
    const { userId } = req.user;
    const locationId = req.params.id;
    let query = `
  SELECT
 S.id,
    S.refrenceId,
    S.projectName,
    S.buildingType,
    S.city,
    S.address,
    S.contractorName,
    S.contractorNumber,
    S.assignedTo,
    S.sops,
    S.scoutedBy,
    S.projectType,
    S.created_at,
    S.pinLocation,
     A.architectureName,
      B.builderName,
      E.electricianName
      FROM
		scout S
      LEFT JOIN Architecture A ON A.id = S.Architectures
      LEFT JOIN Builders B ON B.id = S.Builders
      LEFT JOIN Electricians E ON E.id = S.Electricians
`;
    let queryParams = [];
    if (locationId) {
      query += ` WHERE S.id = ?`;
      queryParams.push(locationId);
    }
    
    
    // console.log("this is query", query, queryParams);
    const selectResult = await queryRunner(query, queryParams);
    // console.log("this is allocated location", selectResult[0]);
    if (selectResult[0].length > 0) {
      try {
        await Promise.all(
          selectResult[0].map(async (location) => {
            const meetingandmeetinglogq =
              "SELECT meetings.id, meeting_logs.id, meeting_logs.startTime, meeting_logs.endTime, meeting_logs.inProgress FROM meetings JOIN meeting_logs ON meetings.id = meeting_logs.meetingId WHERE meetings.locationId = ?";
            const meetingandmeetinglog = await queryRunner(
              meetingandmeetinglogq,
              [location.id]
            );
            location.meeting = meetingandmeetinglog[0];

            const filesQuery =
              "SELECT fileUrl, fileKey FROM location_files WHERE scouted_location = ?";
            const filesResult = await queryRunner(filesQuery, [location.id]);
          
            location.files = filesResult[0];

            if (location.sops) {
              const sopQuery = `SELECT sop.id, sop.projectType, sop.projectDomain, sop.city, sop.area, sop.scoutMemberID, sm.name AS scoutMemberName FROM sop JOIN scout_member sm ON sop.scoutMemberID = sm.id WHERE sop.id IN (?)`;
              const sopResult = await queryRunner(sopQuery, [location.sops]);
              location.sops = sopResult[0];
            }

            if (location.assignedTo) {
              const assignedToQuery =
                "SELECT id, name, email, phoneNumber,role As scouterRole FROM scout_member WHERE id IN (?)";
              const assignedToResult = await queryRunner(assignedToQuery, [
                location.assignedTo,
              ]);
              location.assignedTo = assignedToResult[0];
            }
          })
        );

        // console.log("this is allocated location", selectResult[0][0].assignedTo);
        res.status(200).json({
          statusCode: 200,
          message: "Success",
          data: selectResult[0][0],
        });
      } catch (error) {
        console.error("Error processing locations", error);
        res.status(500).json({
          statusCode: 500,
          message: "Internal Server Error",
        });
      }
    } else {
      res.status(404).json({
        statusCode: 404,
        message: "Not found",
        
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

exports.getLatAndLongMarker = async (req, res) => {
  const { id } = req.params
  try {
    const query = `SELECT id, buildingType, projectName, pinLocation, scoutedBy FROM scout where scoutedBy = ${id}`;
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
        data: selectResult[0],
      });
    } else {
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

// ###################### EDIT SCOUT LOCATION #######################################
exports.UpdateScoutedLocation = async (req, res) => {
  const { id } = req.params;
  const {userId} = req.user;
  const { projectName,
    type,
    size,
    city,
    area,
    block,
    address,
    contractorName,
    contractorNumber,
    buildingType,
    Architectures,
        Builders,
        Electricians
  } = req.body;
 // first we get the old data
  const oldData = await queryRunner(selectQuery("scout", "id"), [id]);

  let query = `
  UPDATE scout set 
  projectName=?,
  type=?,
  size=?,
  city=?,
  area=?,
  block=?,
  address=?,
  contractorName=?,
  contractorNumber=?,
  buildingType=?,
  Architectures=?,
        Builders=?,
        Electricians=?
  where id = ${id}`;
  try {
    if(oldData[0].length>0){
      let insertResult = await queryRunner(query, [
        projectName,
        type,
        size,
        city,
        area,
        block,
        address,
        contractorName,
        contractorNumber,
        buildingType,
        Architectures,
          Builders,
          Electricians
      ]);
      if (insertResult[0].affectedRows > 0) {
        // now we compare the old data with the new data
        const changes = [];
        Object.keys(req.body).forEach(key => {
          
          if (oldData[0][0][key] != req.body[key]) {
            if(oldData[0][0][key]){
              changes.push({
                name: key,
                oldValue: oldData[0][0][key],
                newValue: req.body[key]
              });
            }
          }
        });
        
        if (changes?.length > 0) {
          const strigifiedChangedData = JSON.stringify(changes);
          await queryRunner(
            "INSERT INTO ChangeLog (message, locationId, table_name, operation_type, changedBy, changed_data) VALUES (?, ?, ?, ?, ?, ?)",
            [`Location is updated`, id, 'scout', 'update', userId, strigifiedChangedData]
          );
        }
        
        
        return res.status(200).json({
          statusCode: 200,
          message: "Successfully Edit Scout",
          id: insertResult[0].insertId,
        });
      } else {
        return res.status(500).json({
          statusCode: 500,
          message: "Failed to Update Scout",
        });
      }
    }
    else{
      return res.status(404).json({
        statusCode: 404,
        message: "No Data Found",
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

exports.deleteScout = async (req, res) => {
  const { id } = req.params;
  let query = `DELETE FROM scout where id = ${id}`;
  try {
    let insertResult = await queryRunner(query);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Successfully Delete Scout",
        id: insertResult[0].insertId,
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Delete Scout",
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


// ###################### Add Architecture #######################################
exports.AddArchitecture = async (req, res) => {
  const { architectureName, architecturePhoneNumber } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("Architecture", "architectureName"), [
      architectureName,
    ]);
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Architecture is already exist ${architectureName}`,
      });
    }
    const insertResult = await queryRunner(insertArchitectureQuery, [architectureName, architecturePhoneNumber]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "Architecture added successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add Architecture",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add Architecture",
      message: error.message,
    });
  }
};
// ###################### Add architecture #######################################

// ############################# Add Architecture using pdf Start ##########################################
exports.AddArchitectureCSV = async (req, res) => {
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

    const Architectureies = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        Architectureies.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const Architecture of Architectureies) {
            const ArchitectureName = Architecture.ArchitectureName;
            const ArchitectureNumber = Architecture.ArchitectureNumber;
            const selectResult = await queryRunner(
              selectQuery("Architecture", "architectureName"),
              [ArchitectureName]
            );

            if (selectResult[0].length === 0) {
              await queryRunner(insertArchitectureQuery, [ArchitectureName, ArchitectureNumber]);
            }
          }

          return res
            .status(200)
            .json({ message: "Architecture processed successfully" });
        } catch (error) {
          return res.status(500).json({
            message: "Failed to process Architecture",
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
// ############################# Add Architecture using pdf END ##########################################


// ###################### Add Builder #######################################
exports.AddBuilder = async (req, res) => {
  const { builderName, builderPhoneNumber } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("Builders", "BuilderName"), [
      builderName,
    ]);
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Builder is already exist ${builderName}`,
      });
    }
    const insertResult = await queryRunner(insertBuilderQuery, [builderName, builderPhoneNumber]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "Builder added successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add Builder",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add Builder",
      message: error.message,
    });
  }
};
// ###################### Add Builder #######################################

// ############################# Add Builder using pdf Start ##########################################
exports.AddBuilderCSV = async (req, res) => {
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

    const Builders = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        Builders.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const Builder of Builders) {
            const BuilderName = Builder.BuilderName;
            const BuilderNumber = Builder.BuilderNumber;
            const selectResult = await queryRunner(
              selectQuery("Builders", "BuilderName"),
              [BuilderName]
            );

            if (selectResult[0].length === 0) {
              await queryRunner(insertBuilderQuery, [BuilderName, BuilderNumber]);
            }
          }

          return res
            .status(200)
            .json({ message: "Builder processed successfully" });
        } catch (error) {
          return res.status(500).json({
            message: "Failed to process Builder",
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
// ############################# Add Builder using pdf END ##########################################


// ###################### Add Electrician #######################################
exports.AddElectrician = async (req, res) => {
  const { electricianName, electricianPhoneNumber } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("Electricians", "electricianName"), [
      electricianName,
    ]);
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Electrician is already exist ${electricianName}`,
      });
    }
    const insertResult = await queryRunner(insertElectricianQuery, [electricianName, electricianPhoneNumber]);
    if (insertResult[0].affectedRows > 0) {
      return res.status(200).json({
        message: "Electrician added successfully",
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add Electrician",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add Electrician",
      message: error.message,
    });
  }
};
// ###################### Add Electrician #######################################

// ############################# Add Electrician using pdf Start ##########################################
exports.AddElectricianCSV = async (req, res) => {
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

    const Electricians = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        Electricians.push(row);
      })
      .on("end", async () => {
        try {
          // Process each city in the CSV file
          for (const Electrician of Electricians) {
            const ElectricianName = Electrician.ElectricianName;
            const ElectricianNumber = Electrician.ElectricianNumber;
            const selectResult = await queryRunner(
              selectQuery("Electricians", "ElectricianName"),
              [ElectricianName]
            );

            if (selectResult[0].length === 0) {
              await queryRunner(insertElectricianQuery, [ElectricianName, ElectricianNumber]);
            }
          }

          return res
            .status(200)
            .json({ message: "Electrician processed successfully" });
        } catch (error) {
          return res.status(500).json({
            message: "Failed to process Electrician",
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
// ############################# Add Electrician using pdf END ##########################################


// ############################# Get Architecture ##########################################
exports.getArchitecture = async (req, res) => {
  try {
    const selectResult = await queryRunner(selectQuery("Architecture"));
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Success`,
        data: selectResult[0],
      });
    } else {
      return res.status(200).json({
        message: `No data Found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get Architecture Members",
      message: error.message,
    });
  }
};
// ############################# Get Architecture ##########################################

// ############################# Get Architecture ##########################################
exports.getBuilder = async (req, res) => {
  try {
    const selectResult = await queryRunner(selectQuery("Builders"));
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Success`,
        data: selectResult[0],
      });
    } else {
      return res.status(200).json({
        message: `No data Found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get Builders Members",
      message: error.message,
    });
  }
};
// ############################# Get Architecture ##########################################

// ############################# Get Electrician ##########################################
exports.getElectrician = async (req, res) => {
  try {
    const selectResult = await queryRunner(selectQuery("Electricians"));
    if (selectResult[0].length > 0) {
      return res.status(200).json({
        statusCode: 200,
        message: `Success`,
        data: selectResult[0],
      });
    } else {
      return res.status(200).json({
        message: `No data Found`,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to Get Electricians Members",
      message: error.message,
    });
  }
};
// ############################# Get Electrician ##########################################

// ###################### UPDATE SCOUTE Status End #######################################

exports.updateScoutStatus = async (req, res) => {
  const { scoutId, status } = req.body;
  const {userId}=req?.user
  
  try {
    const Result = await queryRunner(updateScouteStatusQuery, [
      status,
      scoutId,
    ]);
    if (Result[0].affectedRows > 0) {
      const insertInCaptureLog = await queryRunner(
        "INSERT INTO ChangeLog(message, locationId,table_name,operation_type,changedBy) VALUES (?, ?, ?,?,?)",
        [`Status$${status}`, scoutId,'scout','update',userId]
      );
      return res.status(200).json({
        statusCode: 200,
        message: "Successfully Update Scout Status",
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to Update Scout Status",
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

// ###################### UPDATE SCOUTE Status End #######################################
exports.getLogsById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id, order = 'DESC', search, date } = req.query;

    

    if (!id) {
      return res.status(400).json({ statusCode: 400, message: 'ID is required' });
    }

    const formattedDate = (date && date !== 'null') ? new Date(date).toISOString().split('T')[0] : null;

    // Fetch scout information
    const scoutQuery = 'SELECT * FROM scout WHERE id = ?';
    const [scoutResult] = await queryRunner(scoutQuery, [id]);
    if (scoutResult.length === 0) throw new Error('Scout not found');
    const scout = scoutResult[0];

    // Fetch scout member information
    const scoutMemberQuery = 'SELECT * FROM scout_member WHERE id = ?';
    const [scoutMemberResult] = await queryRunner(scoutMemberQuery, [scout.scoutedBy]);

    // Prepare ChangeLog query
    let changeLogQuery = `SELECT * FROM ChangeLog WHERE locationId = ?`;
    const queryParams = [id];

    if (formattedDate) {
      changeLogQuery += ' AND DATE(timestamp) = ?';
      queryParams.push(formattedDate);
    }

    changeLogQuery += ` ORDER BY timestamp ${order}`;

    // Fetch ChangeLog
    const [changeLogResult] = await queryRunner(changeLogQuery, queryParams);
    console.log('changeLogResult', changeLogResult.length, queryParams, changeLogQuery);

    if (changeLogResult.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: 'Success',
        data: (date && date !== 'null') ? [{
          log:{
            projectName: scout.projectName,
          }
        }] : [{
          date: scout.created_at,
          log: {
            type: 'Scouted',
            buildingType: scout.buildingType,
            projectName: scout.projectName,
            created_at: scout.created_at,
            message: `${scout.projectName} scouted at ${scout.area}, ${scout.city}`,
            created_by: scoutMemberResult[0],
          }
        }],
      });
    }

    // Process ChangeLogs
    const logsArray = await Promise.all(changeLogResult.map(async (log) => {
      switch (log.table_name) {
        case 'scout_members_sop': {
          const [allotedUsers] = await queryRunner('SELECT * FROM scout_member WHERE FIND_IN_SET(id, ?) > 0', [log.changed_data]);
          return {
            date: log.timestamp,
            log: {
              type: 'Alloted',
              buildingType: scout.buildingType,
              projectName: scout.projectName,
              message: `Location alloted to ${allotedUsers.map(u => u.name).join(', ')}`,
              allotedUsers,
            },
          };
        }
        case 'sops': {
          const [sop] = await queryRunner('SELECT * FROM sop WHERE FIND_IN_SET(id, ?) > 0', [log.changed_data]);
          return {
            date: log.timestamp,
            log: {
              type: 'SOP',
              buildingType: scout.buildingType,
              projectName: scout.projectName,
              message: `Location connected to SOP(s)- ${sop.map(s => s.area).join(', ')}`,
              sop,
            },
          };
        }
        case 'handshake': {
          const [handShake] = await queryRunner('SELECT * FROM handshake WHERE id = ? AND locationId = ?', [log.record_id, id]);
          const [handShakeRequestedBy] = await queryRunner('SELECT * FROM scout_member WHERE id = ?', [handShake[0].requestedBy]);

          if (log.message === 'requested') {
            const [handShakeRequestedTo] = await queryRunner('SELECT * FROM scout_member WHERE FIND_IN_SET(id, ?) > 0', [log.changed_data]);
            return {
              date: log.timestamp,
              log: {
                type: 'Handshake',
                subType: 'Requested',
                buildingType: scout.buildingType,
                projectName: scout.projectName,
                message: `Handshake requested on ${scout.projectName} project by ${handShakeRequestedBy[0].name}`,
                handShakeRequestedBy: handShakeRequestedBy[0],
                handShakeRequestedTo: handShakeRequestedTo,
              },
            };
          } else if (['accepted', 'rejected'].includes(log.message)) {
            const [handShakeRequestedTo] = await queryRunner('SELECT * FROM scout_member WHERE id = ?', [log.changed_data]);
            return {
              date: log.timestamp,
              log: {
                type: 'Handshake',
                subType: log.message.charAt(0).toUpperCase() + log.message.slice(1),
                buildingType: scout.buildingType,
                projectName: scout.projectName,
                message: `Handshake request ${log.message} on ${scout.projectName} project by ${handShakeRequestedTo.name}`,
                handShakeRequestedBy: handShakeRequestedBy[0],
                handShakeRequestedTo: handShakeRequestedTo,
              },
            };
          }
          break;
        }
        case 'meetings': {
          const [meeting] = await queryRunner('SELECT * FROM meetings WHERE locationId = ?', [id]);
          const [meetingLogs] = await queryRunner('SELECT * FROM meeting_logs WHERE id = ?', [log.record_id]);
          const [meetingMembers] = await queryRunner('SELECT * FROM scout_member WHERE FIND_IN_SET(id, ?) > 0', [meetingLogs[0].members]);

          return {
            date: log.timestamp,
            log: {
              type: 'Meeting',
              subType: log.message.charAt(0).toUpperCase() + log.message.slice(1),
              buildingType: scout.buildingType,
              projectName: scout.projectName,
              message: `Meeting ${log.message} on ${scout.projectName} project`,
              meeting: meeting[0],
              meetingLogs: meetingLogs[0],
              meetingMembers: meetingMembers,
            },
          };
        }
        case 'scout': {
          if (log.operation_type === 'update') {
            const [updatedBy] = await queryRunner('SELECT * FROM scout_member WHERE id = ?', [log.changedBy]);
            if(log?.message?.includes('$')){
              return {
                date: log.timestamp,
                log: {
                  type: 'Updates',
                  buildingType: scout.buildingType,
                  projectName: scout.projectName,
                  message: `${log.message.split('$')[0]} is updated to ${log.message.split('$')[1]}`,
                  updatedBy: updatedBy[0],
                },
              };
            }else{
              return {
                date: log.timestamp,
                log: {
                  type: 'Updates',
                  buildingType: scout.buildingType,
                  projectName: scout.projectName,
                  message: `Following updates are made on ${scout.projectName} project`,
                  updates: JSON.parse(log.changed_data),
                  updatedBy: updatedBy[0],
                },
              };
            }
          }
          break;
        }
        case 'assigned': {
          const [assignedTo] = await queryRunner('SELECT * FROM scout_member WHERE FIND_IN_SET(id, ?) > 0', [log.changed_data]);
          return {
            date: log.timestamp,
            log: {
              type: 'Assigned',
              buildingType: scout.buildingType,
              projectName: scout.projectName,
              message: `Location assigned to ${assignedTo.map(a => a.name).join(', ')}`,
              allotedUsers:assignedTo,
            },
          };
        }
      }
    }));

    // Filter and respond
    let filteredLogs = logsArray.filter(Boolean);
    if (search) {
      filteredLogs = filteredLogs.filter(log => log.log.message.toLowerCase().includes(search.toLowerCase()));
    }

    return res.status(200).json({
      statusCode: 200,
      message: 'Success',
      data: (date && date !== 'null') ? [
        ...filteredLogs,
        {
          log:{
            projectName: scout.projectName,
          }
        }
      ] : [
        ...filteredLogs,
        {
          date: scout.created_at,
          log: {
            type: 'Scouted',
            buildingType: scout.buildingType,
            projectName: scout.projectName,
            created_at: scout.created_at,
            message: `${scout.projectName} scouted at ${scout.area}, ${scout.city}`,
            created_by: scoutMemberResult[0],
          }
        }
      ],
    });

  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: error.message });
  }
};
