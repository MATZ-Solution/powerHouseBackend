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
exports.insertScoutUserQuery = "INSERT INTO scout_member (name,phoneNumber,email,address,position,department,password,created_at) VALUES (?,?,?,?,?,?,?,?)";
exports.countScoutQuery = `
SELECT 
    COUNT(*) AS total,
    (SELECT COUNT(*) FROM scout_member) AS user,
    (SELECT COUNT(*) FROM scout WHERE assignedTo IS NULL) AS UnAllotedLocation,
    (SELECT COUNT(*) FROM scout WHERE assignedTo IS NOT NULL) AS AllotedLocation,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Residential') AS Residential,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Commercial') AS Commercial,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Project') AS Project,
    (SELECT COUNT(*) FROM scout WHERE DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_total,
    (SELECT COUNT(*) FROM scout WHERE assignedTo IS NULL AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_UnAllotedLocation,
    (SELECT COUNT(*) FROM scout WHERE assignedTo IS NOT NULL AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_AllotedLocation,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Residential' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_Residential,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Commercial' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_Commercial,
    (SELECT COUNT(*) FROM scout WHERE buildingType = 'Project' AND DATE_FORMAT(created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')) AS current_month_Project
FROM scout;
`;
// `
// Select COUNT(*)as total,
// (select count(*) from scout_member) as user,
// (select count(*) FROM scout WHERE assignedTo IS NULL) as UnAllotedLocation,
// (select count(*) FROM scout WHERE assignedTo IS NOT NULL) as AllotedLocation,
// (select count(*) FROM scout WHERE buildingType = 'Residential') as Residential,
// (select count(*) FROM scout WHERE buildingType = 'Commercial') as Commercial,
// (select count(*) FROM scout WHERE buildingType = 'Project') as Project
//  from scout
// `;
// exports.topScoutMembers = ` SELECT 
//   sm.id,
//   sm.name,
//   COUNT(s.scoutedBy) as scout_count
// FROM 
//   scout sm
// LEFT JOIN 
//   scout s
// ON 
//   sm.id = s.scoutedBy
// GROUP BY 
//   sm.id, sm.name
// ORDER BY 
//   scout_count DESC
// LIMIT 5;
// `;
exports.updateUserProfileImage = `UPDATE user SET profileImage = ?, ProfileImageKey = ? WHERE id = ?`;
exports.insertCityQuery = "INSERT INTO city (cityName) VALUES (?)";
exports.insertAreaQuery = "INSERT INTO area (cityId,areaName) VALUES (?,?)";
exports.insertSubAreaQuery = "INSERT INTO subarea (areaId,subAreaName) VALUES (?,?)";
exports.insertMeetingMembersQuery = "INSERT INTO meetingmembers (name,phoneNumber,email,address,position,cityId,areaIds,subAreaIds,created_at) VALUES (?,?,?,?,?,?,?,?,?)";
exports.dashboardPieChartQuery = "SELECT SM.name, COUNT(SM.name) AS entry_count FROM `scout` AS S JOIN `scout_member` AS SM ON S.scoutedBy = SM.id GROUP BY SM.name ORDER BY entry_count DESC";
exports.dashboardLinearChartQuery = "SELECT DATE_FORMAT(created_at, '%M') as month, COUNT(*) as count FROM `scout` GROUP BY month order by id ASC";
exports.SOPQuery = "SELECT * FROM `sop`order by id DESC;";
exports.insertCatalogueQuery = "INSERT INTO catalogue (title,document,created_at) VALUES (?,?,?)";
exports.getAllAloctedLocationQuery = "SELECT scout.id, scout.refrenceId, scout.projectName, scout.buildingType, scout.city, scout.address, scout.contractorName, scout.contractorNumber,scout.assignedTo,scout.status, scout.updated_at,scout.scoutedBy,SM1.name AS scouter,(SELECT GROUP_CONCAT(SM2.name ORDER BY FIELD(SM2.id, scout.assignedTo)) FROM scout_member SM2 WHERE FIND_IN_SET(SM2.id, scout.assignedTo) ) AS assignedToMember FROM scout scout JOIN scout_member SM1 ON SM1.id = scout.scoutedBy WHERE scout.assignedTo IS NOT NULL GROUP BY scout.id HAVING assignedToMember IS NOT NULL order by id desc";
exports.insertArchitectureQuery = "INSERT INTO Architecture (architectureName,architectureNumber) VALUES (?,?)";
exports.insertBuilderQuery = "INSERT INTO Builders (builderName,builderNumber) VALUES (?,?)";
exports.insertElectricianQuery = "INSERT INTO Electricians (electricianName,ElectricianNumber) VALUES (?,?)";
exports.updateScouteStatusQuery = `UPDATE scout SET status = ? where id = ? `;
// queries.js

// meeting queries
exports.getScoutMembersbyMembersQuery = `
SELECT scout.*, meeting_logs.*
FROM scout
JOIN meetings ON scout.id = meetings.locationId
JOIN meeting_logs ON meeting_logs.meetingId = meetings.id
WHERE meetings.id = ?
ORDER BY meeting_logs.startTime DESC
LIMIT ?
OFFSET ?;
`;

// meeting queries