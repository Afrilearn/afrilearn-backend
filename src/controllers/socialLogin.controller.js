import { OAuth2Client } from 'google-auth-library';
import { config } from 'dotenv';
import axios from 'axios';
import Auth from '../db/models/users.model';
import Helper from '../utils/user.utils';
import AuthServices from '../services/auth.services';

config();
/**
 *Contains Auth Controller
 *
 *
 *
 * @class AuthController
 */
class AuthController {
  /**
   * Login user through google.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async socialLoginGoogle(req, res) {
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

        // if the user already have an account
        let myUser = await AuthServices.emailExist(payload.email, res);
        // if the user does not have an account
        if (!myUser) {
          myUser = await Auth.create({ ...response });
        }
        const userToken = await Helper.generateToken(
          myUser._id,
          myUser.role,
          myUser.fullName,
        );
        return res.status(200).json({
          status: 'success',
          data: {
            token: userToken,
            user: myUser,
          },
        });
      }
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error logging in user through google',
      });
    }
  }

  /**
   * Login user through facebook.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async socialLoginFacebook(req, res) {
    try {
      const { token } = req.body;
      const { data } = await axios({
        url: 'https://graph.facebook.com/me',
        method: 'get',
        params: {
          fields: ['id', 'email', 'first_name', 'last_name'].join(','),
          access_token: token,
        },
      });
      if (data) {
        const response = {
          email: data.email,
          fullName: `${data.last_name} ${data.first_name}`,
          isActivated: true,
          googleUserId: data.id,
        };

        let myUser = await AuthServices.emailExist(data.email, res);

        // if the user does not have an account
        if (!myUser) {
          myUser = await Auth.create({ ...response });
        }

        const userToken = await Helper.generateToken(
          myUser._id,
          myUser.role,
          myUser.fullName,
        );

        return res.status(200).json({
          status: 'success',
          data: {
            token: userToken,
            user: myUser,
          },
        });
      }
      return res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error logging in user through facebook',
      });
    }
  }
}
export default AuthController;
