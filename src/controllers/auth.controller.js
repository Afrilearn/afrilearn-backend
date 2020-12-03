/**
 *Contains Auth Controller
 *
 *
 *
 * @class AuthController
 */
class AuthController {
  /**
   * Create account for a user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async signUp(req, res) {
    try {
      const {
        fullName,
        userName,
        password,
        email,
        gender,
        country,
        phoneNumber,
        dayOfBirth,
        monthOfBirth,
        yearOfBirth,
        role,
      } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const newUser = {
        fullName,
        userName,
        password: encryptpassword,
        email,
        gender,
        country,
        phoneNumber,
        dayOfBirth,
        monthOfBirth,
        yearOfBirth,
        role,
      };
      const code = await Helper.generateCode(5);
      await Auth.create({ ...newUser }, (err, createdUser) => {
        if (err) {
          // logger.error(err);
          // throw new Error('Error occured in db during creation of user');
        } else {
          const featureRecord = {
            userId: createdUser._id,
          };
          Feature.create({ ...featureRecord });
          const activationRecord = {
            userId: createdUser._id,
            email: createdUser.email,
            passcode: code,
          };
          const message = `Your account activation code is <b>${code}<b/>`;
          sendEmail(createdUser.email, 'Account Activation', message);
          Activation.create({ ...activationRecord }, (err) => {
            if (err) {
              // logger.error(err);
              // throw new Error('Error occured in db during creation of activation record');
            }

            return res.status(201).json({
              status: 'success',
              message: 'Account activation code has been sent to your email',
            });
          });
        }
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error creating new user',
      });
    }
  }

  /**
   * Activate user account.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async activateAccount(req, res) {
    try {
      const { _id } = req.body;
      const newData = {
        isActivated: true,
      };
      const user = await Auth.findByIdAndUpdate(_id, { ...newData });
      const condition = {
        userId: user.id,
      };
      const feature = await Feature.findOne(condition);
      const experience = await Experience.find(condition);
      const association = await Association.find(condition);
      const follow = await Follow.find(condition);
      const achievement = await Achievement.find(condition);
      const post = await Post.find(condition).populate({
        path: 'application',
        model: Application,
        populate: {
          path: 'userId',
          select: '_id userName profilePhotoUrl yearOfBirth userLocation',
        },
      });

      const token = await Helper.generateToken(
        user.id,
        user.role,
        user.userName
      );
      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user,
          feature,
          experience,
          association,
          achievement,
          post,
          follow,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error activating user account',
      });
    }
  }

  /**
   * Login user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const user = await AuthServices.emailExist(email, res);
      if (!user.length) {
        return res.status(401).json({
          status: '401 Unauthorized',
          error: 'Invalid email address',
        });
      }
      const confirmPassword = await Helper.verifyPassword(
        password,
        user[0].password || 'google'
      );
      if (!confirmPassword) {
        return res.status(401).json({
          status: '401 Unauthorized',
          error: 'Invalid password',
        });
      }

      const condition = {
        userId: user[0].id,
      };

      const feature = await Feature.findOne(condition);
      const experience = await Experience.find(condition);
      const association = await Association.find(condition);
      const follow = await Follow.find(condition);
      const achievement = await Achievement.find(condition);
      const post = await Post.find(condition).populate({
        path: 'application',
        model: Application,
        populate: {
          path: 'userId',
          select: '_id userName profilePhotoUrl yearOfBirth userLocation',
        },
      });

      const token = await Helper.generateToken(
        user[0].id,
        user[0].role,
        user[0].userName
      );
      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user: {
            ...user[0]._doc,
          },
          feature,
          experience,
          association,
          achievement,
          post,
          follow,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Logging in user',
      });
    }
  }

  /**
   * Login user through google.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async socialLogin(req, res) {
    try {
      const { token } = req.body;
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      if (ticket) {
        const payload = ticket.getPayload();
        const response = {
          email: payload.email,
          fullName: payload.name,
          isActivated: true,
          googleUserId: payload.sub,
        };

        // if the user has previously created account normally
        const myUser = await AuthServices.emailExist(payload.email, res);
        if (myUser.length) {
          const condition = {
            userId: myUser[0].id,
          };
          const feature = await Feature.findOne(condition);
          const experience = await Experience.find(condition);
          const association = await Association.find(condition);
          const follow = await Follow.find(condition);
          const achievement = await Achievement.find(condition);
          const post = await Post.find(condition).populate({
            path: 'application',
            model: Application,
            populate: {
              path: 'userId',
              select: '_id userName profilePhotoUrl yearOfBirth userLocation',
            },
          });
          const userToken = await Helper.generateToken(
            myUser[0]._id,
            myUser[0].role,
            myUser[0].userName
          );
          return res.status(200).json({
            status: 'success',
            data: {
              token: userToken,
              user: {
                ...myUser[0]._doc,
              },
              feature,
              experience,
              association,
              achievement,
              post,
              follow,
            },
          });
        }
        const user = await AuthServices.googleIdExist(payload.sub, res);
        // if the user dont have existing account
        if (!user.length) {
          await Auth.create({ ...response }, (err, createdUser) => {
            if (err) {
              // logger.error(err);
              // throw new Error('Error occured in db during creation of google user');
            } else {
              const featureRecord = {
                userId: createdUser._id,
              };
              Feature.create({ ...featureRecord });

              const condition = {
                userId: createdUser.id,
              };
              (async () => {
                const feature = await Feature.findOne(condition);
                const experience = await Experience.find(condition);
                const association = await Association.find(condition);
                const follow = await Follow.find(condition);
                const achievement = await Achievement.find(condition);
                const post = await Post.find(condition).populate({
                  path: 'application',
                  model: Application,
                  populate: {
                    path: 'userId',
                    select:
                      '_id userName profilePhotoUrl yearOfBirth userLocation',
                  },
                });
                const userToken = await Helper.generateToken(
                  createdUser.id,
                  createdUser.role,
                  createdUser.userName
                );
                return res.status(200).json({
                  status: 'success',
                  data: {
                    token: userToken,
                    user: createdUser,
                    feature,
                    experience,
                    association,
                    achievement,
                    post,
                    follow,
                  },
                });
              })();
            }
          });
        }
      }
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error logging in user through google',
      });
    }
  }

  /**
   * Reset Password.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async resetPassword(req, res) {
    try {
      const { email } = req.params;
      const Time = new Date();
      const expiringDate = Time.setDate(Time.getDate() + 1);
      const token = await Helper.generateCode(5);
      await ResetPassword.deleteOne({ email });
      const data = {
        email,
        expiringDate,
        token,
      };
      await ResetPassword.create({ ...data });
      const message = `To reset your password use this code:${token}, the code expires in 24 hours`;
      sendEmail(email, 'Password Reset', message);
      return res.status(201).json({
        status: 'success',
        message: 'Password reset link sent to your mail',
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error reseting password',
      });
    }
  }

  /**
   * Change Password.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async changePassword(req, res) {
    try {
      const { email, password } = req.body;
      const encryptpassword = await Helper.encrptPassword(password);
      const newData = {
        password: encryptpassword,
      };
      await Auth.findOneAndUpdate({ email }, { ...newData });

      return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully',
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error changing password',
      });
    }
  }

  /**
   * Resend Verification Code
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async resendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      const code = await Helper.generateCode(5);
      const newData = {
        passcode: code,
      };
      const message = `Your account activation code is <b>${code}<b/>`;
      sendEmail(email, 'Account Activation', message);
      await Activation.findOneAndUpdate({ email }, { ...newData });
      return res.status(201).json({
        status: 'success',
        message: 'Account activation code has been sent to your email',
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error resending verification code',
      });
    }
  }

  /**
   * Load user.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async loadUser(req, res) {
    try {
      const user = await AuthServices.userIdExist(req.data.id, res);
      if (user.length) {
        const condition = {
          userId: user[0].id,
        };

        const feature = await Feature.findOne(condition);
        const experience = await Experience.find(condition);
        const association = await Association.find(condition);
        const follow = await Follow.find(condition);
        const achievement = await Achievement.find(condition);
        const post = await Post.find(condition).populate({
          path: 'application',
          model: Application,
          populate: {
            path: 'userId',
            select: '_id userName profilePhotoUrl yearOfBirth userLocation',
          },
        });

        const token = await Helper.generateToken(
          user[0].id,
          user[0].role,
          user[0].userName
        );
        return res.status(200).json({
          status: 'success',
          data: {
            token,
            user: {
              ...user[0]._doc,
            },
            feature,
            experience,
            association,
            achievement,
            post,
            follow,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading user',
      });
    }
  }
}
export default AuthController;
