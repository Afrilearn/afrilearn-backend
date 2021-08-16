import express from "express";
import http from "http";
import cors from "cors";
import { config } from "dotenv";
import morgan from "morgan";
import logger from "./config";
import "./db";
import v1Router from "./routes";
import {CronJob} from 'cron';
import ChallengeUtility from './services/challenge.services';
import socketio  from 'socket.io';

// scheduled creation of challenges on sunday
const job = new CronJob('0 59 23 * * 0', ChallengeUtility.createNewChallenges);
job.start();

config();

const app = express();

const server = http.createServer(app);

const corsOptions={
  cors: true,
  origins:["http://localhost:5000/api/v1/"],
}
const io = socketio(server);

//socket
io.on('connection', (socket) => {
  console.log('connected to socket')
  // socket.on('join', ({ name, room }, callback) => {
  //   const { error, user } = addUser({ id: socket.id, name, room });

  //   if(error) return callback(error);

  //   socket.join(user.room);

  //   socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});
  //   socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });

  //   io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

  //   callback();
  // });

  // socket.on('sendMessage', (message, callback) => {
  //   const user = getUser(socket.id);

  //   io.to(user.room).emit('message', { user: user.name, text: message });

  //   callback();
  // });

  // socket.on('disconnect', () => {
  //   const user = removeUser(socket.id);

  //   if(user) {
  //     io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
  //     io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
  //   }
  // })
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

export default app;
