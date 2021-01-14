import Auth from '../db/models/users.model';
import Helper from '../utils/user.utils';
import sendEmail from '../utils/email.utils';
import AuthServices from '../services/auth.services';
import ResetPassword from '../db/models/resetPassword.model';
import Role from '../db/models/roles.model';
import Course from '../db/models/courses.model';

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
        fullName, password, email, role,
      } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role,
      };

      const result = await Auth.create({ ...newUser });

      const token = await Helper.generateToken(result._id, role, fullName);

      const message = `Please verify your email address to complete your Afrilearn Account.<br/>Click the link https://www.myafrilearn.com/?token=${token}`;
      sendEmail(email, 'Account Activation', message);

      return res.status(201).json({
        status: 'success',
        data: {
          token,
          user: result,
        },
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
      const { id } = req.data;

      const newData = {
        isActivated: true,
      };

      await Auth.findByIdAndUpdate(id, { ...newData });

      return res.status(200).json({
        status: 'success',
        data: {
          message: 'Account activation successful',
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

      if (!user) {
        return res.status(401).json({
          status: '401 Unauthorized',
          error: 'Invalid email address',
        });
      }

      const confirmPassword = await Helper.verifyPassword(
        password,
        user.password,
      );

      if (!confirmPassword) {
        return res.status(401).json({
          status: '401 Unauthorized',
          error: 'Invalid password',
        });
      }

      const token = await Helper.generateToken(
        user.id,
        user.role,
        user.fullName,
      );

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user,
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
      await ResetPassword.deleteOne({ email });

      const token = await Helper.generateCode(5);

      const data = {
        email,
        expiringDate,
        token,
      };

      await ResetPassword.create({ ...data });
      const message = `Click on the link below to reset your password<br/>Click the link https://www.myafrilearn.com/?token=${token}&email=${email} <br/> Link Expires in 24 hours.`;
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
   * Update Profile
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async updateProfile(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      'fullName',
      'phoneNumber',
      'dateOfBirth',
      'country',
      'state',
      'role',
    ];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({
        status: '400 Invalid Updates',
        error: 'Error updating profile',
      });
    }
    try {
      const user = await Auth.findOne({ _id: req.data.id });
      updates.forEach((update) => {
        user[update] = req.body[update];
      });
      await user.save();
      return res.status(200).json({
        status: 'success',
        message: 'Profile Updated successfully',
        user,
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error updating profile',
      });
    }
  }

  /**
   * Return Roles and Classes
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AuthController
   * @returns {JSON} - A JSON success response.
   */
  static async getRoles(req, res) {
    try {
      const roles = await Role.find();
      const courses = await Course.find();

      return res.status(200).json({
        status: 'success',
        data: {
          roles,
          courses,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error changing password',
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
      const owner = await AuthServices.getEmail(req.data.id, res);
      
      if (!owner) {
        return res.status(404).json({
          status: '400 Not found',
          error: 'User does not exist',
        });
      }     
      const user = await AuthServices.emailExist(owner.email, res);   
      const token = await Helper.generateToken(
        user._id,
        user.role,
        user.fullName,
      );
      const subjectList = [];
      user.enrolledCourses.forEach((enrolledCourse) => {
        const courseEntr = {
          _id: enrolledCourse.courseId._id,
          name: enrolledCourse.courseId.name,
          subjects: [],
        };
        // enrolledCourse.courseId.relatedSubjects.forEach((subject) => {
        //   const entr = {
        //     _id: subject._id,
        //     name: subject.mainSubjectId.name,
        //     score: 0,
        //   };
        //   subject.quizResults.forEach((result) => {
        //     entr.score += result.score;
        //   });
        //   courseEntr.subjects.push(entr);
        // });
        subjectList.push(courseEntr);
      });

      return res.status(200).json({
        status: 'success',
        data: {
          token,
          user,
          subjectList,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Loading user',
      });
    }
  }
}
export default AuthController;
