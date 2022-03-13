const {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
} = require("../chat/dummyuser");
// module.exports = (io, socket, users) => {
//   const disconnect = (reason) => {
//     //the user is deleted from array of users and a left room message displayed
//     const p_user = user_Disconnect(socket.id);

//     if (p_user) {
//       io.to(p_user.room).emit("message", {
//         userId: p_user.id,
//         username: p_user.username,
//         text: `${p_user.username} has left the room`,
//       });
//     }
//     if (reason === "io server disconnect") {
//       // the disconnection was initiated by the server, you need to reconnect manually
//       socket.connect();
//     }
//     delete users[socket.id];
//     io.emit("get_users_online", users);
//   };

//   socket.on("disconnect", disconnect);
// };
