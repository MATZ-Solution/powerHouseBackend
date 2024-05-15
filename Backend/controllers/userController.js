// const {
//   sendMail,
//   ForgetsendMail,
// } = require("../sendmail/sendmail.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const imageToDelete = require("./../middleware/deleteImage.js");
const { serialize } = require("cookie");
const {
  selectQuery,
  deleteQuery,
  insertScoutUserQuery,
  addResetToken,
  updatePassword

} = require("../constants/queries");

const { hashedPassword } = require("../helper/hash");
const { queryRunner } = require("../helper/queryRunner");
// const userServices = require("../Services/userServices");
const imageUploads = require("./../middleware/imageUploads")
const { log } = require("console");
const config = process.env;





// ###################### user Create #######################################
exports.createUser = async function (req, res) {
  const { Name,phoneNumber, email,address,position, password } = req.body;
  const currentDate = new Date();
  try {
    const selectResult = await queryRunner(selectQuery("scout_member","phoneNumber"),[phoneNumber]);
  
    if (selectResult[0].length > 0) {
      
      return res.status(200).json({
        statusCode : 200, 
        message: `user already exists on this Number ${phoneNumber}`,
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
      hashPassword,
      currentDate,
    ]);
    if (insertResult[0].affectedRows > 0) {      
      // const mailSubject = "PowerHouse Welcome Email";
      // await sendMail(email, mailSubject, name);
     
      return res.status(200).json({ 
        message: "User added successfully",
        id : insertResult[0].insertid
      });
    } else {
      return res.status(200).json({
        statusCode : 200, 
        message: "Failed to add user",
      });
      // return res.status(500).send("Failed to add user");
    }
  } catch (error) {
    return res.status(500).json({
      message : "Failed to add user",
       message: error.message 
      });
  }
};
// ###################### Scout user Create #######################################



// ###################### SignIn user start #######################################
exports.signIn = async function (req, res) {

  const { email, password } = req.body;
  try {
    let table;
    let column;
    if(email == "admin@powerhouse.com"){
      table = "admin";
      column = "email"
    }else{
      table = "scout_member";
      column = "phoneNumber"

    }
    const selectResult = await queryRunner(selectQuery(table, column), [
      email,
    ]);
      if (selectResult[0].length === 0) {
        return res.status(200).json({
          statusCode : 200, 
          message: "Email not found",
        });
      } else if (await bcrypt.compare(password, selectResult[0][0].password)) {
        const id = selectResult[0][0].id;

        const token = jwt.sign({ email, id }, "11madklfnqo3393", {
          expiresIn: "3h",
        });
        return res.status(200).json({ 
          message: "SignIn successfully",
          id,
          token,
          data : selectResult[0] 
        });
        
      } else {
        return res.status(500).json({
          statusCode : 500, 
          message: "Incorrect Password",
        });
      }
    
  } catch (error) {
    return res.status(500).json({
      statusCode : 500,
      message: "Failed to SignIn",
      error: error.message
    });
  }
};
// ###################### SignIn user End #######################################


// ###################### Forget Password start #######################################
exports.ForgetPassword = async function (req, res) {
  const { email } = req.body;
  try {
      const selectResult = await queryRunner(selectQuery("user", "email"), [
        email,
      ]);
      if (selectResult[0].length === 0) {
        return res.status(200).json({
          statusCode : 200, 
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
          data : selectResult[0] 
        });
        
      } else {
        return res.status(500).json({
          statusCode : 500, 
          message: "Incorrect Password",
        });
      }
  } catch (error) {
    return res.status(500).json({
      statusCode : 500,
      message: "Failed to Forget password",
      error: error.message
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
    const {email, mailSubject, name} = req.body
        const asdfg = await sendMail(email, mailSubject, name)
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
      statusCode : 500,
      message: "Failed to Get Dashboard Data",
      error: error.message
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
      const name = selectResult[0][0].firstName + " " + selectResult[0][0].lastName;
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
        res.status(200).json({ message: "Successfully Email Sended", id: userid });
      }
    } else if (selectResult[0].length === 0) {
      res.status(200).json({ message: "Email not found"});

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
    const selectResult = await queryRunner(
      selectQuery("user", "id", "token"),
      [id, token]
    );
    if (selectResult[0].length > 0) {
      const now = new Date(selectResult[0][0].updatedAt);
      const now2 = new Date();
      const formattedDate = now2.toISOString().slice(0, 19).replace("T", " ");
      const time = new Date(formattedDate) - now;
      console.log(time);
      const time2 = time / 1000;
      console.log(time2);
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
