import Auth from '../db/models/users.model';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import ResetPassword from '../db/models/resetPassword.model';
import ClassMembers from '../db/models/classMembers.model';
import RecentActivity from '../db/models/recentActivities.model';

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
          populate: { path: 'courseId', select: 'name imageUrl' },
        })
        .populate({
          path: 'classMembership',
          select: '_id status',
          model: ClassMembers,
          populate: {
            path: 'classId',
            select: 'name classCode',
            populate: { path: 'courseId', select: 'name imageUrl' },
          },
        })
        .populate({
          path: 'recentActivities',
          model: RecentActivity,
          populate: {
            path: 'userId classId lessonId questionId',
          },
        });
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
};
