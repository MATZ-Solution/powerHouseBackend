const calculateScore = (sopRow, criteria) => {
    let score = 0;
  
    // Exact match gives higher score
    if (sopRow.city === criteria.city) score += 2;
    if (sopRow.projectDomain === criteria.projectType) score += 2;
    if (sopRow.projectType === criteria.buildingType) score += 2;
    
    // Partial match gives moderate score
    if (sopRow.area.includes(criteria.area) || criteria.area.includes(sopRow.area)) {
      score += 3;
    } else if (sopRow.area.toLowerCase().includes(criteria.area.toLowerCase())) {
      // Lower score for case-insensitive partial match
      score += 1;
    }
  
    return score;
  };
  