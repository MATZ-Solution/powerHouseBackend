const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const scoutRoutes = require("./routes/scoutRoutes");
const MeetingMembersRoutes = require("./routes/meetingMembersRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const catalogueRoutes = require("./routes/catalogueRoutes");
const handshakeRoutes = require("./routes/handshakeRoutes");
const { getConnectionFromPool } = require("./config/connection");
const http = require("http");
const { Server } = require("socket.io");

const { swaggerUi, swaggerSpec } = require('./swagger/swaggerDef');

const app = express();
const server = http.createServer(app); // Use http.createServer to create the server

app.use(cookieParser());
app.use(bodyParser.json());
// app.use(cors()); 
// app.use(cors({ credentials: true, origin: '*' }))
app.use(cors({ credentials: true, origin: "*" }))

app.use((req, res, next) => {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  next();
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
getConnectionFromPool();

app.use("/", userRoutes);
app.use("/scout", scoutRoutes);
app.use("/MeetingMembers", MeetingMembersRoutes);
app.use("/notify", notificationRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/catalogue", catalogueRoutes);
app.use("/handshake", handshakeRoutes);


server.listen(2300, () => {
  console.log("Server is running on port 2300");
});
