const normalizeAreaName = (area) => {
    // Convert to lowercase, trim whitespace, remove special characters, handle common abbreviations
    return area.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/gi, '');
  };
  