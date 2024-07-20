const cloudinary = require('cloudinary').v2;
const toStream = require('buffer-to-stream');
cloudinary.config({
    cloud_name: "dao9gnwv4",
    api_key: "293985487255189",
    api_secret: "eFWpmHTPlBGh0z1ZC_mr62fKUXA",
  });

  exports.uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const upload =  cloudinary.uploader.upload_stream((error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    toStream(file.buffer).pipe(upload);
  });
};