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

exports.insertScoutQuery = "INSERT INTO scout (projectName,projectType,city,area,block,buildingType,size,address,pinLocation,contractorName,contractorNumber,status,created_at,scoutedBy) VALUES (?,?,?, ?, ?, ?,?,?,?, ?, ?, ?,?,?)";
exports.insertScoutUserQuery = "INSERT INTO scout_member (name,phoneNumber,email,address,position,password,created_at) VALUES (?,?,?,?,?,?,?)";
exports.countScoutQuery = `
Select COUNT(*)as total,
(select count(*) from scout_member) as user,
(select count(*) FROM scout WHERE assignedTo IS NULL) as UnAllotedLocation,
(select count(*) FROM scout WHERE assignedTo IS NOT NULL) as AllotedLocation
 from scout
`;
exports.updateUserProfileImage = `UPDATE user SET profileImage = ?, ProfileImageKey = ? WHERE id = ?`;
exports.insertCityQuery = "INSERT INTO city (cityName) VALUES (?)";
exports.insertAreaQuery = "INSERT INTO area (cityId,areaName) VALUES (?,?)";
exports.insertSubAreaQuery = "INSERT INTO subarea (areaId,subAreaName) VALUES (?,?)";
exports.insertMeetingMembersQuery = "INSERT INTO meetingmembers (name,phoneNumber,email,address,position,cityId,areaIds,subAreaIds,created_at) VALUES (?,?,?,?,?,?,?,?,?)";
exports.dashboardPieChartQuery = "SELECT SM.name, COUNT(SM.name) AS entry_count FROM `scout` AS S JOIN `scout_member` AS SM ON S.scoutedBy = SM.id GROUP BY SM.name;";
exports.dashboardLinearChartQuery = "SELECT DATE_FORMAT(created_at, '%M') as month, COUNT(*) as count FROM `scout` GROUP BY month order by id ASC";
exports.SOPQuery = "SELECT * FROM `sop`order by id DESC;";
