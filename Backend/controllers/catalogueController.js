const {
    selectQuery,
    deleteQuery,
    dashboardPieChartQuery,
    dashboardLinearChartQuery,
    insertCatalogueQuery
  } = require("../constants/queries.js");
  const { queryRunner } = require("../helper/queryRunner.js");


exports.createCatalogue = async (req, res) => {
    try {
        const { title,document } = req.body;
        const currentDate = new Date();
      const selectResult = await queryRunner(selectQuery("catalogue","title"),[title]);
      if (selectResult[0].length > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: `catalogue Already Exist`,
        });
      }
      const Result = await queryRunner(insertCatalogueQuery,[title,document,currentDate]);
      if (Result[0].affectedRows > 0) {
        return res.status(200).json({
          statusCode: 200,
          message: `catalogue Saved Successful`,
        });
      }else{
        return res.status(200).json({
            statusCode: 200,
            message: `Some Thing Wents Wrong to Add catalogue `,
          });
      } 
      
    } catch (error) {
      res.status(500).json({
        statusCode: 500,
        message: "Failed to Add create Catalogue",
        error: error.message
      });
    }
};


