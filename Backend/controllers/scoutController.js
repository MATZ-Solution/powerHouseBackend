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

// ###################### Scout Start #######################################
exports.scout = async (req, res) => {
  try {
    console.log("1");
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
    } = req.body;
    // const {userId} = req.user;
    const currentDate = new Date();

    const insertResult = await queryRunner(insertScoutQuery, [
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
      "Pending",
      currentDate,
    ]);
    if (insertResult[0].affectedRows > 0) {
      const id = insertResult[0].insertId;

      return res.status(200).json({
        statusCode: 200,
        message: "Scout Created successfully",
        id: insertResult[0].insertId,
      });
    } else {
      return res
        .status(500)
        .json({ statusCode: 500, message: "Failed to Create Scout " });
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
    const selectResult = await queryRunner(selectQuery("scout"));
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
// ###################### Add Area #######################################

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
    console.log(cityId)
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
