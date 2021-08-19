import socketio from "socket.io";
import app from "..";
// const server = http.createServer(app);
import { server } from "..";

const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
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
