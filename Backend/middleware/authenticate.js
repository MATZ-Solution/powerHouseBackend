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
    if (decoded.email == "admin@powerhouse.com") {
      result = await queryRunner(selectQuery("admin", "id"), [decoded.id]);
    } else {
      result = await queryRunner(selectQuery("scout_member", "id"), [
        decoded.id,
      ]);
    }
    req.user = {
      email: decoded.email,
      userId: result[0][0].id,
      name: result[0][0].name,
    };
    next();
  } catch (err) {
    console.error(err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "token expired" });
    }
    return res.status(400).json({
      message: "Invalid Token",
      error: err.message,
    });
  }
};
module.exports = {
  verifyToken,
};
