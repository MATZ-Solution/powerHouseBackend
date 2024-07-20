const { google } = require('googleapis');
// const dotenv = require('dotenv');
const nodemailer=require('nodemailer')
// const constants=require('../../constants')
// dotenv.config()
const constants=process.env
const OAuth2 = google.auth.OAuth2;
// const { google } = require('googleapis');
// console.log(constants.CLIENT_ID);
exports.createTransporter = async () => {
    const oauth2Client = new OAuth2(
      // constants.CLIENT_ID,
      "148416344022-n0ur9iaiaoos4nvig9jhsfubjdrdsu90.apps.googleusercontent.com",
      // constants.CLIENT_SECRET,
      "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",
      // constants.AUTH_URL
      "https://developers.google.com/oauthplayground"
    );
    oauth2Client.setCredentials({
      // refresh_token: constants.REFRESH_TOKEN
      refresh_token: "1//04zYh-Z0O-s_SCgYIARAAGAQSNwF-L9Ir8OalRilhcVDdf1siseaXVmxbUuE6SexH5lRXhHWJggJ9VFGpHq46hX9RjFbL8wV4hHE"
    });
    
  
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token :(" + err);
        }
        resolve(token);
      });
    });
  
    // const accessToken = await oauth2Client.getAccessToken();


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        // user: constants.EMAIL_HOST,
        user: 'freelancinghr0@gmail.com',
        accessToken,
        // clientId: constants.CLIENT_ID,
        // clientSecret: constants.CLIENT_SECRET,
        // refreshToken: constants.REFRESH_TOKEN
        clientId: "148416344022-n0ur9iaiaoos4nvig9jhsfubjdrdsu90.apps.googleusercontent.com",
        clientSecret: "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",
        refreshToken: "1//04zYh-Z0O-s_SCgYIARAAGAQSNwF-L9Ir8OalRilhcVDdf1siseaXVmxbUuE6SexH5lRXhHWJggJ9VFGpHq46hX9RjFbL8wV4hHE"
      }
    });
  
    return transporter;
  };