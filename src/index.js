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
import "../src/controllers/studentRequest.controller";
import {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
} from "./chat/dummyuser";
import sendEmail from "./utils/email.utils";

// scheduled creation of challenges on sunday
const job = new CronJob("0 59 23 * * 0", ChallengeUtility.createNewChallenges);
job.start();

config();

const app = express();

const server = http.createServer(app);

const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
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
  //for a new user joining the room

  socket.on("joinRoom", ({ username, roomname, user }) => {
    socket.join(roomname);
    //* create user
    const { p_user, c_users } = join_User(socket.id, username, roomname, user);
    //display a welcome message to the user who have joined a room
    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}`,
    });

    //Send connected users to everyone
    io.to(p_user.room).emit("connected_users", c_users);
    //displays a joined room message to all other room users except that particular user
    socket.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `${p_user.username} has joined the chat`,
    });
  });

  //user inviting others
  socket.on("invite", ({ guest, host }) => {
    //check if user is connected
    const socketReturned = get_Current_User_socket_id_with_userId(
      guest._id,
      users
    );
    //if connected
    if (socketReturned.socketId) {
      //emit a prompt to show invite modal to user
      io.to(socketReturned.socketId).emit("promt_invite", {
        guest,
        host,
      });
      //send email to user with the user
      if (guest.email) {
        sendEmail(
          guest.email,
          `${host.fullName} challenged you`,
          `Your friend, ${host.fullName} has invited you to a challenge on Afrilearn. Log in on your afrilearn App to Accept the challenge.`
        );
      }
      //record challenge request for guest
    }
    //else send email to user with the user
    if (guest.email) {
      sendEmail(
        guest.email,
        `${host.fullName} challenged you`,
        `Your friend, ${host.fullName} has invited you to a challenge on Afrilearn. Log in on your afrilearn App to Accept the challenge.`
      );
    }
    //record challenge request for guest
  });

  //user sending message
  socket.on("record_challenge_result", ({ challengeId, data }) => {
    io.to(challengeId).emit("updateChallengeResults", data);
  });

  //user sending message
  socket.on("chat", (text) => {
    //gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: text,
    });
  });

  //register login to manage users online and those offline
  socket.on("login", function (data) {
    users[socket.id] = data;
    io.emit("get_users_online", users);
  });

  socket.on("disconnecting", () => {
    console.log(socket.rooms); // the Set contains at least the socket ID
  });

  socket.on("disconnect", (reason) => {
    //the user is deleted from array of users and a left room message displayed
    const p_user = user_Disconnect(socket.id);

    if (p_user) {
      io.to(p_user.room).emit("message", {
        userId: p_user.id,
        username: p_user.username,
        text: `${p_user.username} has left the room`,
      });
    }
    if (reason === "io server disconnect") {
      // the disconnection was initiated by the server, you need to reconnect manually
      socket.connect();
    }
    delete users[socket.id];
    io.emit("get_users_online", users);
  });
});

export default app;
