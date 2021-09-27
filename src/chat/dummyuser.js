const c_users = [];

// joins the user to the specific chatroom
function join_User(id, username, room, user) {
  const p_user = { id, username, room, user };

  c_users.push(p_user);

  const usersInThisRoom = c_users.filter((u) => u.room === room);
  return { p_user, c_users: usersInThisRoom };
}
function remove_User(id, room) {
  const p_user = { id, room };

  c_users.push(p_user);

  const usersInThisRoom = c_users.filter((u) => u.room === room && u.id);
  return { p_user, c_users: usersInThisRoom };
}

// Gets a particular user id to return the current user
function get_Current_User(id) {
  return c_users.find((p_user) => p_user.id === id);
}
// Gets a particular user id to return the current user with userId
function get_Current_User_socket_id_with_userId(userId, users) {
  let toSearch = null;
  for (key in users) {
    if (users[key].userId === userId) {
      toSearch = { socketId: key, user: users[key] };
    }
  }
  return toSearch;
}

// called when the user leaves the chat and its user object deleted from array
function user_Disconnect(id) {
  const index = c_users.findIndex((p_user) => p_user.id === id);

  if (index !== -1) {
    return c_users.splice(index, 1)[0];
  }
}

module.exports = {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
};
