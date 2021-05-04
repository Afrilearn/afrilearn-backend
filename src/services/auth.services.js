import Auth from "../db/models/users.model";
import EnrolledCourse from "../db/models/enrolledCourses.model";
import ResetPassword from "../db/models/resetPassword.model";
import AdminRole from "../db/models/adminRole.model";
import Course from "../db/models/courses.model";
import Class from "../db/models/classes.model";
import Helper from "../utils/user.utils";

export default {
  async emailExist(email, res) {
    try {
      const condition = {
        email,
      };
      const user = await Auth.findOne(condition)
        .populate({
          path: "enrolledCourses",
          model: EnrolledCourse,
          populate: {
            path: "courseId",
            select: "name imageUrl",
          },
        })
        .populate({ path: "classOwnership", populate: "enrolledCourse" })
        .populate({
          path: "adminRoles",
          model: AdminRole,
          populate: { path: "classId", populate: "enrolledCourse" },
        })
        .populate({ path: "usersReferred", select: "fullName" })
        .populate({ path: "schoolOwnership" })
        .populate({ path: "schoolId" });

      return user;
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error checking for email",
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
        status: "500 Internal server error",
        error: "Error matching activation code",
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
        status: "500 Internal server error",
        error: "Error getting email",
      });
    }
  },
  async createClassesForSchool(courseCategoryId, school, user, res) {
    try {
      // 605b21868636bc00158b4ad6 primary
      // 605b218f8636bc00158b4ad7 secondary
      const courses = await Course.find({ categoryId: courseCategoryId });
      if (courses.length === 0) {
        return res.status(400).json({
          status: "400 Invalid Data",
          error: "Select a valid class category",
        });
      }
      for (let index = 0; index < courses.length; index++) {
        const course = courses[index];

        //create class
        let classCode = await Helper.generateCode(8);
        const existingClassCode = await Class.findOne({ classCode });

        if (existingClassCode) {
          classCode = await Helper.generateCode(9);
        }
        const trimmedSchoolName = school.name.replace(/\s/g, "");
        const classData = {
          courseId: course._id,
          schoolId: school._id,
          name: `${course.name}-${school.name}`,
          classCode: `${trimmedSchoolName}${classCode}`,
        };
        const classCreated = await Class.create({ ...classData });
        const enrollCourseData = {
          userId: user._id,
          courseId: course._id,
          schoolId: school._id,
          classId: classCreated._id,
        };
        await EnrolledCourse.create({ ...enrollCourseData });
      }
      return "success";

      // const user = await Auth.findOne(condition);
    } catch (err) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error creating classes",
      });
    }
  },
};
