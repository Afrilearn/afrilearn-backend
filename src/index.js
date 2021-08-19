import express from "express";
import http from "http";
import cors from "cors";
import { config } from "dotenv";
import morgan from "morgan";
import logger from "./config";
import "./db";
import v1Router from "./routes";
import { CronJob } from "cron";
import ChallengeUtility from "./services/challenge.services";
import socketio from "socket.io";
import User from "./db/models/users.model";
import "../src/controllers/studentRequest.controller";

// scheduled creation of challenges on sunday
const job = new CronJob("0 59 23 * * 0", ChallengeUtility.createNewChallenges);
job.start();

config();

const app = express();

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 5000;
global.logger = logger;
app.use(cors());
app.use(morgan("combined", { stream: logger.stream }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/api/v1", (req, res) =>
  res
    .status(200)
    .json({ status: "success", message: "Welcome to Afrilearn API" })
);
app.use("/api/v1", v1Router);

app.use((req, res, next) => {
  const err = new Error("No endpoint found");
  err.status = 404;
  next(err);
});

app.use((err, req, res) => {
  res.status(err.status || 500).json({
    status: "error",
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

//server
server.listen(port, () => {
  logger.info(`Server running at port ${port} on ${process.env.NODE_ENV}`);
});

const users = {};

io.of("/").on("connection", (socket) => {
  //register login
  socket.on("login", function (data) {
    console.log("a user " + data.userId + " connected");
    users[socket.id] = data;
    console.log("users", users);
    io.emit("get_users_online", users);
  });

  console.log("new client connected");
  console.log("users", users);

  socket.on("disconnect", (reason) => {
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    console.log("user disconnected");
    delete users[socket.id];
    console.log("users", users);
    io.emit("get_users_online", users);
  });
});
io.of("/challenge").on("connection", (socket) => {
  /* socket object may be used to send specific messages to the new connected client */
  //set user status as online
  console.log("new client connected for challenge");
  socket.on("disconnect", () => {
    console.log("user disconnected for challenge");
    //set user status as offline
  });
});
console.log("users", users);

export default app;
