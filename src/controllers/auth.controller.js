import Auth from '../db/models/users.model';
import Helper from '../utils/user.utils';
import sendEmail from '../utils/email.utils';

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
        password,
        email,
        role,
      } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);
      
      const newUser = {
        fullName,
        password: encryptpassword,
        email,      
        role,
      };
   
      const result = await Auth.create({ ...newUser });   

      const token = await Helper.generateToken(
        result._id,
        role,
        fullName
      );

      const message = `Please verify your email address to complete your Afrilearn Account.<br/>Click the link https://www.myafrilearn.com/?token=${token}`;
      sendEmail(email, 'Account Activation', message);     

      return res.status(201).json({
        status: 'success',
        data: {
           token, 
           user:result
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
        const {id} =req.data;

        const newData = {
            isActivated: true,
        };

        await Auth.findByIdAndUpdate(id, { ...newData });
        
        return res.status(200).json({
            status: 'success',
            data: {
                message:"Account activation successful"
            },
        });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error activating user account',
      });
    }
  }
}
export default AuthController;
