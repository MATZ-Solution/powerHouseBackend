const mySql2 = require('mysql2/promise');

let pool;

const createPool = async () => {
  if (pool) return pool;

  pool = await mySql2.createPool({
    // connectionLimit: 10, // adjust according to your needs
    // host: "153.92.7.247",
    // user:"matzsolu_freelancehr_root",
    // password:"Windows!@#$567",
    // database:"matzsolu_freelancehr"

  host: "localhost",
  port:"3306",
  user:"root",
    password:"password",
    database:"powerhouse"



  });

  return pool;
};

const getConnectionFromPool = async () => {
  const pool = await createPool();
  try {
    const connection = await pool.getConnection();
    console.log("Sql Connected");
    return connection;
  } catch (err) {
    console.error("Error getting connection from pool:", err);
    throw err; // rethrow the error to handle it elsewhere if needed
  }
};

module.exports = { createPool, getConnectionFromPool };

//   const mysql = require("mysql2/promise");
// let connection;
// const createConnection = async () => {
//   if (connection) return connection;
// connection = await mysql.createConnection({
//   // host: "localhost",
//   // port:"3306",
//   // user:"root",
//   //   password:"",
//   //   database:"freelancing"

  
//   host: "193.203.166.177",
//     user:"u426733178_root",
//     password:"Windows!@#$567",
//     database:"u426733178_freelancingdb"

//     // host: "localhost",
//     // port:"3306",
//     // user:"root",
//     // // password:"root",
//     // password:"password",
//     // database:"freelancing"

//   });

//   return connection;
// };
// const connect = async () => {
//   try {
//     const connection = await createConnection();
//     if (connection) {
//       console.log("Connected to Database");
//     }
//     // Use the connection object here
//   } catch (err) {
//     console.error("Error connecting to database:", err);
//   }
// };
// module.exports = { createConnection, connect };