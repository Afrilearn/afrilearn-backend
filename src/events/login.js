const {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
} = require("../chat/dummyuser");
module.exports = (io, socket, users) => {
  const login = (data) => {
    users[socket.id] = data;
    io.emit("get_users_online", users);
  };

  socket.on("login", login);
};
