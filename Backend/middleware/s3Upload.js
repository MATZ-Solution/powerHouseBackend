// upload.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config/s3');

// Configure AWS with your access and secret key.
AWS.config.update({
  accessKeyId: config.awsAccessKeyId,
  secretAccessKey: config.awsSecretAccessKey,
  region: config.region
});

// Create an S3 instance
const s3 = new AWS.S3();

// Configure multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: config.bucketName,
    acl: 'public-read',
    key: function (req, file, cb) {
        // console.log(file);
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

module.exports = upload;
