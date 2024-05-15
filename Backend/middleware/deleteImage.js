const fs = require('fs');
const path = require('path');

const folderPath = 'uploads/';

imageToDelete = (fileNames) => {
  // console.log(fileNames)
  fileNames.forEach((fileName) => {
    const imagePath = path.join(folderPath, fileName);
    if (fs.existsSync(imagePath)) {
      // Delete the image file
      fs.unlinkSync(imagePath);
      console.log(`Deleted image: ${fileName}`);
    } else {
      console.log(`Image not found: ${fileName}`);
    }
  });
}

module.exports = imageToDelete;
