import AdminRole from "../db/models/adminRole.model";
import ClassModel from "../db/models/classes.model";
import User from "../db/models/users.model";
import Helper from "../utils/user.utils";
import sendEmail from "../utils/email.utils";

/**
 *Contains AdminRole Controller
 *
 *
 *
 * @class AdminRoleController
 */
class AdminRoleController {
  /**
   * Add an Admin to a class
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof AdminRoleController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addAdminToClass(req, res) {
    try {
      let customerRole = "Admin";
      const { fullName, password, email, roleDescription } = req.body;

      const encryptpassword = await Helper.encrptPassword(password);

      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          status: "400 Bad Request",
          error: "Email already exist",
        });
      }
      const existingClass = await ClassModel.findOne({ _id: req.body.classId });

      if (!existingClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "The class you selected is not found",
        });
      }

      const newUser = {
        fullName,
        password: encryptpassword,
        email,
        role: "602f3ce39b146b3201c2dc1d",
      };

      const result = await User.create({
        ...newUser,
      });

      const adminResult = await AdminRole.create({
        roleDescription: roleDescription || "Admin",
        userId: result._id,
        classId: req.body.classId,
      });
      const admin = await AdminRole.findOne({ _id: adminResult._id }).populate(
        "userId"
      );

      const message = `Hi, ${fullName},  ${existingClass.name} just created a new ${customerRole}'s account for you.`;
      const adminMessage = ` ${existingClass.name}, just created a new ${customerRole}'s account for ${fullName}.`;

      sendEmail(email, "Welcome to Afrilearn", message);
      sendEmail("africustomers@gmail.com", "New Customer", adminMessage);

      return res.status(200).json({
        status: "success",
        data: {
          admin,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding admin",
      });
    }
  }
  static async addTeacherAsAdminToClass(req, res) {
    try {
      const { email, roleDescription } = req.body;

      const existingUsers = await User.find({
        email: { $in: req.body.emails },
      });

      const existingClass = await ClassModel.findOne({ _id: req.body.classId });

      if (!existingClass) {
        return res.status(404).json({
          status: "404 Not found",
          error: "The class you selected is not found",
        });
      }
      const admins = [];
      for (let index = 0; index < existingUsers.length; index++) {
        const user = existingUsers[index];

        const admin = await AdminRole.create({
          roleDescription: roleDescription || "Admin",
          userId: user._id,
          classId: req.body.classId,
        });
        admins.push(admin);
      }
      // const admin = await AdminRole.findOne({ _id: adminResult._id }).populate(
      //   "userId"
      // );

      return res.status(200).json({
        status: "success",
        data: {
          admins,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding admin",
      });
    }
  }
}
export default AdminRoleController;
