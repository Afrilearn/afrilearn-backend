const {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
} = require("../chat/dummyuser");

module.exports = (io, socket) => {
  const joinRoom = ({ username, roomname, user }) => {
    socket.join(roomname);
    //* create user
    const { p_user, c_users } = join_User(socket.id, username, roomname, user);
    //display a welcome message to the user who have joined a room
    socket.emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: `Welcome ${p_user.username}`,
    });
    const clients = io.sockets.adapter.rooms.get(roomname);

    const listOfClients = [];
    for (const clientId of clients) {
      //this is the socket of each client in the room.

      if (get_Current_User(clientId)) {
        listOfClients.push(get_Current_User(clientId));
      }
    }

    io.to(roomname).emit("connected_users", listOfClients);
  };

  const chat = (text) => {
    //gets the room user and the message sent
    const p_user = get_Current_User(socket.id);

    io.to(p_user.room).emit("message", {
      userId: p_user.id,
      username: p_user.username,
      text: text,
    });
  };

  socket.on("joinRoom", joinRoom);
  socket.on("chat", chat);
};
