const {
  join_User,
  get_Current_User,
  user_Disconnect,
  get_Current_User_socket_id_with_userId,
} = require("../chat/dummyuser");
module.exports = (io, socket, users) => {
  const inviteFriend = (data) => {
    //check if user is connected
    const socketReturned = get_Current_User_socket_id_with_userId(
      data.guest._id,
      users
    );
    //if connected
    if (socketReturned && socketReturned.socketId) {
      //emit a prompt to show invite modal to user
      io.to(socketReturned.socketId).emit("promt_invite", data);
      //send email to user with the user
      // if (guest.email) {
      //   sendEmail(
      //     guest.email,
      //     `${host.fullName} challenged you`,
      //     `Your friend, ${host.fullName} has invited you to a challenge on Afrilearn. Log in on your afrilearn App to Accept the challenge.`
      //   );
      // }
      //record challenge request for guest
    }
    //else send email to user with the user
    // if (guest.email) {
    //   sendEmail(
    //     guest.email,
    //     `${host.fullName} challenged you`,
    //     `Your friend, ${host.fullName} has invited you to a challenge on Afrilearn. Log in on your afrilearn App to Accept the challenge.`
    //   );
    // }
    //record challenge request for guest
  };

  const recordChallengeResult = ({ challengeId, data }) => {
    io.to(challengeId).emit("updateChallengeResults", data);
  };
  const startChallenge = ({ challengeId }) => {
    io.to(challengeId).emit("start:challenge", { challengeId });
  };

  socket.on("record_challenge_result", recordChallengeResult);
  socket.on("invite", inviteFriend);
  socket.on("challenge:start", startChallenge);
};
