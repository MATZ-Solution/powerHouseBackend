// const express = require("express");
// const router = express.Router();

// const { verifyToken } = require("../middleware/authenticate");
// // const fileUpload = require("../helper/S3Bucket");

// router.post("/requestHandshake",verifyToken, requestHandShake);

// module.exports = router;
const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authenticate");

const { requestHandShake, acceptHandshake } = require("../controllers/handshakeController");
router.post("/requestHandshake",verifyToken, requestHandShake);
router.post('/acceptrejectHandshake',verifyToken,acceptHandshake)
module.exports = router;

