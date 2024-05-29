const buildDynamicQuery = (city, area, projectType, buildingType) => {
    let query = 'SELECT scoutMemberID, city, area, projectType, projectDomain  FROM sop WHERE 1=1';
    let queryParams = [];
  
    if (city) {
      query += ' AND city LIKE ?';
      queryParams.push(`%${city}%`);
    }
    if (area) {
      query += ' AND area LIKE ?';
      queryParams.push(`%${normalizeAreaName(area)}%`);
    }
    if (projectType) {
      query += ' AND projectDomain LIKE ?';
      queryParams.push(`%${projectType}%`);
    }
    if (buildingType) {
      query += ' AND projectType LIKE ?';
      queryParams.push(`%${buildingType}%`);
    }
  
    query += ' LIMIT 10'; // Adjust as needed
    return { query, queryParams };
  };
  