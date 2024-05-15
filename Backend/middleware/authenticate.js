
const jwt = require("jsonwebtoken");
const { queryRunner } = require("../helper/queryRunner");
const { selectQuery } = require("../constants/queries");
const config = process.env;
const verifyToken = async (req, res, next) => {
  try { 
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res.status(401).send("Access Denied");
  }
    const decoded = jwt.verify(token, "11madklfnqo3393");
    const result = await queryRunner(selectQuery("user", "id"), [
      decoded.id,
    ]);
    req.user = {
      email: decoded.email,
      userId: result[0][0].id,
      name : result[0][0].firstName  + ' '+ result[0][0].lastName , 
      userType: result[0][0].userType,
      profileImage: result[0][0].profileImage,

    };
    next();
  } catch (err) {
    console.error(err);

    return res.status(400).json({
      message: "Invalid Token",
      error: err.message
    });
  }
};
module.exports = {
  verifyToken,
};
