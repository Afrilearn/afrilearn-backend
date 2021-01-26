import Auth from '../db/models/users.model';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import ResetPassword from '../db/models/resetPassword.model';

export default {
  async emailExist(email, res) {
    try {
      const condition = {
        email,
      };
      const user = await Auth.findOne(condition)
        .populate({
          path: 'enrolledCourses',
          model: EnrolledCourse,
          populate: {
            path: 'courseId',
            select: 'name imageUrl',
          },
        })
        .populate({ path: 'classOwnership', populate: 'enrolledCourse' });

      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error checking for email',
      });
    }
  },
  async verifyPasscode(email, code, res) {
    try {
      const condition = {
        email,
      };
      const user = await ResetPassword.findOne(condition);
      if (user.token !== code) {
        return 2;
      }
      const Time = new Date();
      const currentDate = Time.setDate(Time.getDate());
      if (+user.expiringDate < currentDate) {
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
  async getEmail(id, res) {
    try {
      const condition = {
        _id: id,
      };
      const user = await Auth.findOne(condition);
      return user;
    } catch (err) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error getting email',
      });
    }
  },
};
