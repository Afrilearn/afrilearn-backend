import express from "express";
import fs from "fs";
import https from "https";
import cors from "cors";
import { config } from "dotenv";
import morgan from "morgan";
import logger from "./config";
import "./db";
import v1Router from "./routes";
import { CronJob } from "cron";
import ChallengeUtility from "./services/challenge.services";
import socketio from "socket.io";
import "../src/controllers/studentRequest.controller";

import chat from "./events/chat";
import login from "./events/login";
import challenge from "./events/challenge";
import disconnect from "./events/disconnect";
import bodyParser from "body-parser";
// scheduled creation of challenges on sunday
// const job = new CronJob("0 1 * * sun", ChallengeUtility.createNewChallenges);
// job.start();

config();

const app = express();
const options = {
  key: fs.readFileSync(`${__dirname}/secure/certificates/s1-local.key`),
  cert: fs.readFileSync(`${__dirname}/secure/certificates/s1-local.pem`),
}

const server = https.createServer(options, app)

// const io = socketio(server, {
//   cors: {
//     origin: process.env.CLIENT_URL,
//     methods: ["GET", "POST"],
//   },
//   pingTimeout: 6000000,
//   pingInterval: 30000,
// });

const port = 3301;
// global.logger = logger;
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(cors({
  credentials: true,
  origin: [`https://s1.local:3000`, `https://s1.local:3301`, `https://s1.local:3302`, `https://s1.local:3303`],
}));
app.use(morgan("combined"));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.get("/api/v2", (req, res) =>
  res
    .status(200)
    .json({ status: "success", message: "Welcome to Afrilearn API" })
);
app.use("/api/v2", v1Router);

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
  console.log(`Server running at port ${port} on ${process.env.NODE_ENV}`);
});

const users = {};
// const onConnection = (socket) => {
//   chat(io, socket);
//   login(io, socket, users);
//   challenge(io, socket, users);
//   disconnect(io, socket, users);
// };

// io.of("/").on("connection", onConnection);
export default app;
