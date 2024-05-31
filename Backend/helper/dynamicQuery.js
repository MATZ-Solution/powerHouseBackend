const { normalizeAreaName } = require("./normalizeArea");

exports.buildDynamicQuery= (city, area, projectType, buildingType)=> {
    let query = 'SELECT scoutMemberID, city, area, projectType, projectDomain  FROM sop WHERE 1=1';
    let queryParams = [];
  
    if (city) {
      query += ' AND city LIKE ?';
      queryParams.push(`%${city}%`);
    }
   if (area) {
      // Normalize input area
      const normalizedArea = normalizeAreaName(area);
      query += ' AND LOWER(REPLACE(REPLACE(REPLACE(area, "-", " "), "_", " "), ".", "")) LIKE ?';
      queryParams.push(`%${normalizedArea}%`);
    }
    if (projectType) {
      query += ' AND projectType LIKE ?';
      queryParams.push(`%${projectType}%`);
    }
    if (buildingType) {
      query += ' AND projectDomain LIKE ?';
      queryParams.push(`%${buildingType}%`);
    }
  
    query += ' LIMIT 10'; // Adjust as needed
    return { query, queryParams };
  };