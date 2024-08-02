const {
    selectQuery,
    deleteQuery,
    dashboardPieChartQuery,
    dashboardLinearChartQuery
  } = require("../constants/queries.js");
  const { queryRunner } = require("../helper/queryRunner.js");


exports.pieChart = async (req, res) => {
    try {
      const selectResult = await queryRunner(dashboardPieChartQuery);
      if (selectResult[0].length > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: `Success`,
          data: selectResult[0],
        });
      }else{
        return res.status(200).json({
            statusCode: 200,
            message: `No data Found`,
          });
      }
      
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to Get data for pie chart",
        error: error.message
      });
    }
};


exports.linearChart = async (req, res) => {
    try {
      const selectResult = await queryRunner(dashboardLinearChartQuery);
      if (selectResult[0].length > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: `Success`,
          data: selectResult[0],
        });
      }else{
        return res.status(200).json({
            statusCode: 200,
            message: `No data Found`,
          });
      }
      
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to Get data for Linear chart",
        error: error.message
      });
    }
};