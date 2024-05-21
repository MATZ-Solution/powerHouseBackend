exports.selectQuery = (table, ...field) => {
  if (field.length === 1) {
    return `SELECT * FROM ${table} WHERE ${field[0]} = ?`;
  } 
  else if (field.length > 1) {
    return `SELECT * FROM ${table} WHERE ${field[0]} = ? and ${field[1]} = ?`;
  } else {
    return `SELECT * FROM ${table}`;
  }
};

exports.deleteQuery = (table, ...field) => {
  if (field.length === 1) {
    return `DELETE FROM ${table} WHERE ${field[0]} = ?`;
  } else if (field.length === 2) {
    return `DELETE FROM ${table} WHERE ${field[0]} = ? AND ${field[1]} = ?`;
  }
};

exports.insertScoutQuery = "INSERT INTO scout (projectName,projectType,city,area,block,buildingType,size,address,pinLocation,contractorName,contractorNumber,status,created_at) VALUES (?,?,?, ?, ?, ?,?,?,?, ?, ?, ?,?)";
exports.insertScoutUserQuery = "INSERT INTO scout_member (name,phoneNumber,email,address,position,password,created_at) VALUES (?,?,?,?,?,?,?)";
exports.countScoutQuery = `select status, count(*) as count  from scout group BY status UNION ALL SELECT 'Total' AS status, COUNT(*) AS count FROM scout`;
exports.updateUserProfileImage = `UPDATE user SET profileImage = ?, ProfileImageKey = ? WHERE id = ?`;
exports.insertCityQuery = "INSERT INTO city (cityName) VALUES (?)";
exports.insertAreaQuery = "INSERT INTO area (cityId,areaName) VALUES (?,?)";
exports.insertSubAreaQuery = "INSERT INTO subArea (areaId,subAreaName) VALUES (?,?)";
exports.insertMeetingMembersQuery = "INSERT INTO meetingmembers (name,phoneNumber,email,address,position,cityId,areaIds,subAreaIds,created_at) VALUES (?,?,?,?,?,?,?,?,?)";
