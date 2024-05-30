exports.normalizeAreaName = (area) => {
    let normalizedArea = area.trim().toLowerCase();
    normalizedArea = normalizedArea.replace(/\s+/g, ' ');
    normalizedArea = normalizedArea.replace(/[^\w\s]/gi, '');
    return normalizedArea;
  };