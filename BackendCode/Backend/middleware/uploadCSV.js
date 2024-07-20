const multer = require('multer');
// const path = require('path');

// Set up multer for file uploads
exports.uploadCSV = multer({
  dest: 'uploads/', // You can change this to any directory where you want to store the uploaded files
//   fileFilter: function (req, file, cb) {
//     const ext = path.extname(file.originalname);
//     if (ext !== '.csv') {
//       return cb(new Error('File extension is not valid'), false);
//     }
//     cb(null, true);
//   }
});