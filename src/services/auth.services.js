
export default {
  async emailExist(email, res) {
    try {
      const condition = {
        email,
      };
      const user = await Auth.find(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking for email',
      });
    }
  },

  async userIdExist(id, res) {
    try {
      const condition = {
        _id: id,
      };
      const user = await Auth.find(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking for user id',
      });
    }
  },

  async usernameExist(username, res) {
    try {
      const condition = {
        userName: username,
      };
      const user = await Auth.find(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking for username',
      });
    }
  },

  async googleIdExist(id, res) {
    try {
      const condition = {
        googleUserId: id,
      };
      const user = await Auth.find(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking for google Id',
      });
    }
  },

  async phoneExist(phonenumber, res) {
    try {
      const condition = {
        phoneNumber: phonenumber,
      };
      const user = await Auth.find(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking phonenumber',
      });
    }
  },

  async matchCode(id, code, res) {
    try {
      const condition = {
        userId: id,
      };
      const user = await Activation.find(condition);
      if (user[0].passcode === code) {
        return true;
      }
      return false;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error matching activation code',
      });
    }
  },

  async verifyPasscode(email, code, res) {
    try {
      const condition = {
        email,
      };
      const user = await ResetPassword.find(condition);
      if (user[0].token !== code) {
        return 2;
      }
      const Time = new Date();
      const currentDate = Time.setDate(Time.getDate());
      if (+user[0].expiringDate < currentDate) {
        return 3;
      }
      return true;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error matching activation code',
      });
    }
  },
};
