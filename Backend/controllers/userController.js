const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const imageToDelete = require("./../middleware/deleteImage.js");
const { serialize } = require("cookie");
const {
  selectQuery,
  deleteQuery,
  insertScoutUserQuery,
  addResetToken,
  updatePassword,
  SOPQuery,
  selectSOPByIdQuery
} = require("../constants/queries");

const { hashedPassword } = require("../helper/hash");
const { queryRunner } = require("../helper/queryRunner");
// const userServices = require("../Services/userServices");
const imageUploads = require("./../middleware/imageUploads");
const { log } = require("console");
const { normalizeAreaName } = require("../helper/normalizeArea.js");
const { buildDynamicQuery } = require("../helper/dynamicQuery.js");
const { insertNotification } = require("../helper/insertNotification.js");
const config = process.env;

// ###################### user Create #######################################
exports.createScoutUser = async function (req, res) {
  const { Name, phoneNumber, email, address, position, department, password } = req.body;
  console.log(req.body);
  const currentDate = new Date();
  try {
    
    const selectResult = await queryRunner(
      selectQuery("scout_member", "phoneNumber"),
      [phoneNumber]
    );

    if (selectResult[0].length > 0) {
      return res.status(404).json({
        statusCode: 200,
        message: `User already exists on this phoneNumber ${phoneNumber}`,
      });
    }

    const hashPassword = await hashedPassword(password);
    const salt = bcrypt.genSaltSync(10);
    const id = bcrypt
      .hashSync(Name + new Date().getTime().toString(), salt)
      .substring(0, 10);
    const insertResult = await queryRunner(insertScoutUserQuery, [
      Name,
      phoneNumber,
      email,
      address,
      position,
      department,
      hashPassword,
      currentDate,
    ]);
    if (insertResult[0].affectedRows > 0) {
      // const mailSubject = "PowerHouse Welcome Email";
      // await sendMail(email, mailSubject, name);

      return res.status(200).json({
        message: "User added successfully",
        id: insertResult[0].insertid,
      });
    } else {
      return res.status(200).json({
        statusCode: 200,
        message: "Failed to add user",
      });
      // return res.status(500).send("Failed to add user");
    }
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add user",
      message: error.message,
    });
  }
};
// ###################### Scout user Create #######################################

// ###################### SignIn user start #######################################
exports.signIn = async function (req, res) {
  // console.log(req.body);
  const { email, password } = req.body;
  try {
    let table;
    let column;
    if (email == "admin@powerhouse.com") {
      table = "admin";
      column = "email";
    } else {
      table = "scout_member";
      column = "phoneNumber";
    }
    // console.log(table, column);
    console.log(selectQuery(table, column));
    const selectResult = await queryRunner(selectQuery(table, column), [email]);
    if (selectResult[0].length === 0) {
      console.log("Email not found");
      return res.status(404).json({
        statusCode: 404,
        message: `${column} not found`,
      });
    } else if (await bcrypt.compare(password, selectResult[0][0].password)) {
      const id = selectResult[0][0].id;

      const token = jwt.sign({ email, id }, "11madklfnqo3393", {
        expiresIn: "7d",
      });
      return res.status(200).json({
        message: "SignIn successfully",
        id,
        token,
        data: selectResult[0],
      });
    } else {
      return res.status(404).json({
        statusCode: 404,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to SignIn",
      error: error.message,
    });
  }
};
// ###################### SignIn user End #######################################

// ###################### Get Scout Members start #######################################
exports.getScoutsMember = async (req, res) => {
  try {
    // const { userId } = req.user;
    const selectResult = await queryRunner(selectQuery("scout_member"));
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(200).json({ data: selectResult[0], message: "Scout Members Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Scout Members",
      error: error.message,
    });
  }
};
// ###################### Get Scout Members End #######################################

// ###################### Forget Password start #######################################
exports.ForgetPassword = async function (req, res) {
  const { email } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("user", "email"), [
      email,
    ]);
    if (selectResult[0].length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "Email not found",
      });
    } else if (await bcrypt.compare(password, selectResult[0][0].password)) {
      const id = selectResult[0][0].id;
      // const token = jwt.sign({ email, id }, config.JWT_SECRET_KEY, {
      const token = jwt.sign({ email, id }, "11madklfnqo3393", {
        expiresIn: "3h",
      });
      return res.status(200).json({
        message: "SignIn successfully",
        id,
        token,
        data: selectResult[0],
      });
    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Incorrect Password",
      });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Forget password",
      error: error.message,
    });
  }
};
// ###################### Forget Password End #######################################

// ###################### Protected user Start #######################################

exports.getUser = (req, res) => {
  // console.log(req.user);
  res.status(200).json(req.user);
};
// ###################### Protected user End #######################################

// ###################### Email start #######################################
exports.sendEmail = async (req, res) => {
  try {
    const { email, mailSubject, name } = req.body;
    const asdfg = await sendMail(email, mailSubject, name);
    // if(selectResult.length > 0){
    res.status(200).json({
      statusCode: 200,
      message: "Success",
    });
    // }else{
    // res.status(200).json({
    //   statusCode: 200,
    //   message: "Not Data Found",
    // });
    // }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get Dashboard Data",
      error: error.message,
    });
  }
};
// ###################### Email End #######################################

//  ############################# Reset Email ############################################################
exports.createResetEmail = async (req, res) => {
  const { email } = req.body;
  const mailSubject = "Freelance Reset Email";
  const random = Math.floor(100000 + Math.random() * 900000);
  try {
    const selectResult = await queryRunner(selectQuery("user", "email"), [
      email,
    ]);
    if (selectResult[0].length > 0) {
      const userid = selectResult[0][0].id;
      const name =
        selectResult[0][0].firstName + " " + selectResult[0][0].lastName;
      await ForgetsendMail(email, mailSubject, random, name);
      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
      const updateResult = await queryRunner(addResetToken, [
        random,
        formattedDate,
        userid,
      ]);
      if (updateResult[0].affectedRows === 0) {
        res.status(200).json({ message: "Token Not Updated in database" });
      } else {
        res
          .status(200)
          .json({ message: "Successfully Email Sended", id: userid });
      }
    } else if (selectResult[0].length === 0) {
      res.status(200).json({ message: "Email not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error", error: error.message });
  }
};
//  ############################# Reset Email ############################################################

//  ############################# Verify Reset Email Code ############################################################
exports.verifyResetEmailCode = async (req, res) => {
  const { id, token } = req.body;
  try {
    const selectResult = await queryRunner(selectQuery("user", "id", "token"), [
      id,
      token,
    ]);
    if (selectResult[0].length > 0) {
      const now = new Date(selectResult[0][0].updatedAt);
      const now2 = new Date();
      const formattedDate = now2.toISOString().slice(0, 19).replace("T", " ");
      const time = new Date(formattedDate) - now;
      // console.log(time);
      const time2 = time / 1000;
      // console.log(time2);
      if (time2 >= 120) {
        res.status(200).json({
          message: "Time out",
          id: id,
          token: token,
        });
      } else {
        res.status(200).json({
          message: "Successful",
          id: id,
          token: token,
        });
      }
    } else {
      res.status(200).json({
        message: "Cannot Validate!",
      });
    }
  } catch (error) {
    res.status(400).json({ message: "Error", error: error.message });
  }
};
//  ############################# Verify Reset Email Code ############################################################

//  ############################# Update Password ############################################################

exports.updatePassword = async (req, res) => {
  const { id, password, confirmpassword, token } = req.body;
  try {
    if (password === confirmpassword) {
      const hashPassword = await hashedPassword(password);
      const currentDate = new Date();
      const selectResult = await queryRunner(updatePassword, [
        hashPassword,
        currentDate,
        id,
        token,
      ]);
      if (selectResult[0].affectedRows > 0) {
        res.status(200).json({
          message: "Successful password saved",
        });
      } else {
        res.status(200).json({
          message: "Password not saved",
        });
      }
    } else {
      res.status(200).send({ message: "Password Does not match " });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error", error: error.message });
  }
};
//  ############################# Update Password ############################################################

//  ############################# resend Code ############################################################
exports.resendCode = async (req, res) => {
  const { id } = req.body;
  const mailSubject = "Freelance Reset Email";
  const random = Math.floor(100000 + Math.random() * 900000);
  try {
    const selectResult = await queryRunner(selectQuery("user", "id"), [id]);
    if (selectResult[0].length > 0) {
      const userid = selectResult[0][0].id;
      const name =
        selectResult[0][0].firstName + " " + selectResult[0][0].lastName;
      // console.log(selectResult[0][0])
      // sendMail(selectResult[0][0].Email, mailSubject, random, name);
      ForgetsendMail(selectResult[0][0].email, mailSubject, random, name);

      const now = new Date();
      const formattedDate = now.toISOString().slice(0, 19).replace("T", " ");
      const updateResult = await queryRunner(addResetToken, [
        random,
        formattedDate,
        userid,
      ]);
      if (updateResult[0].affectedRows === 0) {
        res.status(400).send("Error");
      } else {
        res.status(200).json({ message: "Sended" });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "Error", error: error.message });
    // console.log(error);
  }
};
//  ############################# resend Code ############################################################

// ###################### Create SOP #######################################
exports.createSOP = async (req, res) => {
  const { userIds, projectType, cityId, areasId, projectDomain } = req.body;
  // console.log(req.body);

  try {
    let user = userIds.join(",");
    let area = areasId.join(",");

    let insertQuery =
      "INSERT INTO sop(city, area, projectType, projectDomain, scoutMemberID) VALUES (?, ?, ?, ?, ?)";
    const insertSOP = await queryRunner(insertQuery, [
      cityId,
      area,
      projectType,
      projectDomain,
      user,
    ]);

    if (insertSOP[0].affectedRows > 0) {
      const normalizedArea = normalizeAreaName(area);
      let noScoutFound = true;
      const sopId=insertSOP[0].insertId;
      for (const areaId of areasId) {
        let { query, queryParams } = buildDynamicQuery(
          "SELECT * FROM scout WHERE 1=1",
          cityId,
          areaId,
          projectType,
          null,
          projectDomain ?? null
        );

        const scoutResult = await queryRunner(query, queryParams);
        // console.log("Scouts found:", scoutResult[0]);

        if (scoutResult[0].length > 0) {
          noScoutFound = false;

          await Promise.all(
            scoutResult[0].map(async (scout) => {
              // const result = await queryRunner(
              //   "UPDATE scout SET assignedTo=? WHERE id=?",
              //   [user, scout.id]
              // );

              // if (result[0].affectedRows > 0) {
              //   console.log("Scout assigned successfully");
              //   await Promise.all(
              //     userIds.map(async (userId) => {
              //       const insertNotificationResult = await insertNotification(
              //         userId,
              //         `New location Allotted - ${scout.projectName}`,
              //         scout.id
              //       );
              //       if (insertNotificationResult) {
              //         console.log("Notification added successfully");
              //       }
              //     })
              //   );
              // }
              try {
                const result = await queryRunner(
                  "UPDATE scout SET assignedTo=?, sops=? WHERE id=?",
                  [user,
                    scout.sops ? `${scout.sops},${sopId}` : sopId
                    ,scout.id]
                );

                if (result[0].affectedRows > 0) {
                  // console.log("Scout assigned successfully");
                  await Promise.all(
                    userIds.map(async (userId) => {
                      try {
                        const insertNotificationResult = await insertNotification(
                          userId,
                          `New location Allotted - ${scout.projectName}`,
                          scout.id
                        );
                        if (insertNotificationResult) {
                          // console.log("Notification added successfully");
                        }
                      } catch (notificationErr) {
                        console.error("Error adding notification:", notificationErr);
                      }
                    })
                  );
                }
              } catch (updateErr) {
                console.error("Error updating scout:", updateErr);
              }

            })
          );
        }
      }

      if (noScoutFound) {
        return res.status(200).json({
          statusCode: 200,
          message: "Sop added successfully but no scout found for these areas",
        });
      }
      
      return res.status(200).json({
        statusCode: 200,
        message: "Sop added and scouts assigned successfully",
      });

    } else {
      return res.status(500).json({
        statusCode: 500,
        message: "Failed to add SOP",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to add SOP",
      error: err.message,
    });
  }
};

// ######################################  View SOP  ########################################################
exports.viewSOP = async (req, res) => {
  try {
    const selectResult = await queryRunner(SOPQuery);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0],
      });
    } else {
      res.status(404).json({ message: "SOP Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get SOP",
      error: error.message,
    });
  }
}
// ##################################### View SOP #########################################################
// ##################################### Get By Id  SOP #########################################################

exports.GetSingleSop=async (req,res)=>{
  const { sopId } = req.params;
  // console.log(sopId,"sop")
  try {
    const selectResult =await queryRunner(selectSOPByIdQuery, [sopId]);
    if (selectResult[0].length > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0][0],
      });
    } else {
      res.status(404).json({ message: "SOP Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get SOP",
      error: error.message,
    });
  }
}
// ##################################### Get By Id  SOP #########################################################

// ###################### UPDATE SOP MEMBER #######################################

exports.updateSop = async (req, res) => {
 let { city, area, projectType, projectDomain, sopId,scoutMemberNames } = req.body;

 

try {
  const query = `UPDATE sop SET city = ?, area = ?, projectType = ?, projectDomain = ?, scoutMemberID=? WHERE id = ?;`;
  let insertResult = await queryRunner(query, [city, area, projectType, projectDomain, scoutMemberNames.join(","),sopId]);

  // console.log(insertResult);
  if (insertResult[0].affectedRows > 0) {
    return res.status(200).json({
      statusCode: 200,
      message: "Successfully Updated Sop",
    });
  } else {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Update Sop",
    });
  }
} catch (error) {
  return res.status(500).json({
    statusCode: 500,
    message: "Internal Server Error",
    error: error.message,
  });
}

};
// ###################### UPDATE SOP End #######################################

exports.getProfile = async (req, res) => {
  const { userId } = req.user;
  try {
    const selectResult = await queryRunner(selectQuery("scout_member", "id"), [
      userId,
    ]);
    if (selectResult[0].length > 0) {
      // dont include password in response
      delete selectResult[0][0].password;
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: selectResult[0][0],
      });
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get User",
      error: error.message,
    });
  }
}
exports.updateProfile = async (req, res) => {
  const { userId } = req.user;
  // const { Name, phoneNumber, email, address, position } = req.body;
  try {
    
    let profileImage = null;
    if (req.file) {
      
      profileImage = req.file.location;
    }
    const updateResult = await queryRunner(
      "UPDATE scout_member SET picture=? WHERE id=?",
      [profileImage, userId]
    );
    if (updateResult[0].affectedRows > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Profile Updated Successfully",
      });
    } else {
      res.status(404).json({ message: "Profile Not Updated" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Update Profile",
      error: error.message,
    });
  }
}


exports.updateLocation = async (req, res) => {
  const { userId } = req.user;
  const { latitude, longitude } = req.body;
  console.log(req.body);
  try {
    const updateResult = await queryRunner(
      "UPDATE scout_member SET latitude=? longitude=? WHERE id=?",
      [latitude,longitude, userId]
    );
    if (updateResult[0].affectedRows > 0) {
      res.status(200).json({
        statusCode: 200,
        message: "Location Updated Successfully",
      });
    } else {
      res.status(404).json({ message: "Location Not Updated" });
    }
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Update Location",
      error: error.message,
    });
  }
};

exports.getNearByMembers = async (req, res) => {
  const { latitude,longitude, radius = 5, page = 1, limit = 5, search = null } = req.query;
  
  const userId = req.user.userId;
  // Calculate offset
  const offset = (page - 1) * limit;
console.log(latitude,
  longitude,
  latitude,userId,
  search,
  search,
  radius,
  
  limit,
  offset,);
  try {
    const usersQuery = `
      SELECT id, name, latitude, longitude, picture, department, role,
       (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance
FROM scout_member
WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND id != ?
  AND (? IS NULL OR name LIKE CONCAT('%', ?, '%'))
HAVING distance < ?
ORDER BY distance
LIMIT ? OFFSET ?;
`;

    const users = await queryRunner(usersQuery, [
      latitude,
  longitude,
  latitude,
  userId,
  search,
  search,
  radius,
  limit,
  offset,
    ]);

    

    

    if (users[0].length > 0) {
      console.log(users[0]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: users[0],
        
      });
    } else {
      res.status(200).json({ data: [], message: "No users found" });
    }

  } catch (error) {
    console.error('Error fetching nearby users:', error);
    res.status(500).send('Error fetching nearby users');
  }
};

exports.getMembers = async (req, res) => {
  const { page = 1, limit = 10, search = null, department = null, role = null } = req.query;
  console.log(req.query);
  const userId = req.user.userId;
  // Calculate offset
  const offset = (page - 1) * limit;
  try {
    let usersQuery = `
      SELECT id, name, latitude, longitude, picture, department, role, email, phoneNumber
      FROM scout_member
      WHERE id != ?
    `;

    const queryParams = [userId];

    // Conditionally add WHERE clauses for optional parameters
    if (search) {
      usersQuery += ` AND name LIKE CONCAT('%', ?, '%')`;
      queryParams.push(search);
    }
    if (department) {
      usersQuery += ` AND department = ?`;
      queryParams.push(department);
    }
    if (role) {
      usersQuery += ` AND role = ?`;
      queryParams.push(role);
    }

    usersQuery += ` LIMIT ? OFFSET ?;`;

    queryParams.push(limit, offset);

    const users = await queryRunner(usersQuery, queryParams);

    if (users[0].length > 0) {
      console.log(users[0]);
      res.status(200).json({
        statusCode: 200,
        message: "Success",
        data: users[0],
      });
    } else {
      console.log(users[0]);
      res.status(200).json({ data: [], message: "No users found" });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Error fetching users');
  }
};
exports.statistics = async (req, res) => {
  const { userId } = req.user;
  try {
    // Get the user's details
    const selectResult = await queryRunner(selectQuery("scout_member", "id"), [userId]);
    
    if (selectResult.length === 0) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Get the total number of scouted locations
    const totalScoutedLocationsResult = await queryRunner("SELECT COUNT(*) as totalScoutedLocations FROM scout WHERE scoutedBy=?", [userId]);
    const totalScoutedLocations = totalScoutedLocationsResult[0][0].totalScoutedLocations;
    console.log(totalScoutedLocations);
    // Get the total number of assigned locations
    const totalAssignedLocationsResult = await queryRunner("SELECT COUNT(*) as totalAssignedLocations FROM scout WHERE assignedTo LIKE ?", [`%${userId}%`]);
    const totalAssignedLocations = totalAssignedLocationsResult[0][0].totalAssignedLocations;
    console.log(totalAssignedLocations);
    // Get the total number of meeting logs where the user is involved
    const meetingLogsResult = await queryRunner(`
      SELECT 
        COUNT(*) as totalMeetingLogs,
        SUM(CASE WHEN startTime IS NOT NULL AND endTime IS NULL THEN 1 ELSE 0 END) as totalPendingLogs,
        SUM(CASE WHEN endTime IS NOT NULL THEN 1 ELSE 0 END) as totalCompletedLogs,
        SUM(CASE WHEN startTime <= NOW() AND (endTime IS NULL OR endTime >= NOW()) THEN 1 ELSE 0 END) as totalActiveLogs
      FROM meeting_logs 
      WHERE startedBy = ? OR members LIKE ?
    `, [userId, `%${userId}%`]);

    const { totalMeetingLogs, totalPendingLogs, totalCompletedLogs, totalActiveLogs } = meetingLogsResult[0][0];
      console.log(meetingLogsResult);
    res.status(200).json({
      statusCode: 200,
      message: "Success",
      data: {
       
        totalScoutedLocations,
        totalAssignedLocations,
        totalMeetingLogs,
        totalPendingLogs,
        totalCompletedLogs,
        totalActiveLogs
      }
    });

  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      message: "Failed to Get User Statistics",
      error: error.message,
    });
  }
};
