// import AdminRole from "../db/models/adminRole.model";
// import ClassModel from "../db/models/classes.model";
// import School from "../db/models/schoolProfile";

// /**
//  *Contains School Controller
//  *
//  *
//  *
//  * @class SchoolController
//  */
// class SchoolController {
//   /**
//    * Add a school profile
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof SchoolController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async addSchoolPrfile(req, res) {
//     try {
//       const school = await School.create({ ...req.body });

//       return res.status(201).json({
//         status: "success",
//         data: {
//           school,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error Adding school profile",
//       });
//     }
//   }

//   /**
//    * Update a school profile
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof SchoolController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async updateSchoolPrfile(req, res) {
//     try {
//       const school = await School.findOne({ _id: req.params.schoolId });
//       if (!school) {
//         return res.status(404).json({
//           status: "404 Not fund",
//           error: "School not found",
//         });
//       }
//       const updates = Object.keys(req.body);
//       const allowedUpdates = [
//         "name",
//         "email",
//         "description",
//         "regNumber",
//         "location",
//         "logo",
//       ];
//       const isValidOperation = updates.every((update) =>
//         allowedUpdates.includes(update)
//       );
//       if (!isValidOperation) {
//         return res.status(400).json({
//           status: "400 Invalid Updates",
//           error: "Error updating profile",
//         });
//       }
//       updates.forEach((update) => {
//         school[update] = req.body[update];
//       });
//       await school.save();

//       return res.status(200).json({
//         status: "success",
//         data: {
//           school,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error Updating school profile",
//       });
//     }
//   }

//   /**
//    * Add a class to the school
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof SchoolController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async schoolAddClass(req, res) {
//     try {
//       const existingClass = await ClassModel.findOne({
//         name: req.body.name,
//         courseId: req.body.courseId,
//         schoolId: req.body.schoolId,
//         userId: req.body.teacherId,
//       });

//       if (existingClass) {
//         return res.status(404).json({
//           status: "400 Bad request",
//           error: "Class with this detail exists",
//         });
//       }

//       const newClass = await ClassModel.create({
//         name: req.body.name,
//         courseId: req.body.courseId,
//         schoolId: req.body.schoolId,
//         userId: req.body.teacherId,
//       });

//       return res.status(201).json({
//         status: "success",
//         data: {
//           class: newClass,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error Adding class",
//       });
//     }
//   }

//   /**
//    * Update a school class
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof SchoolController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async schoolUpdateClass(req, res) {
//     try {
//       const clazz = await ClassModel.findOne({ _id: req.params.classId });
//       if (!clazz) {
//         return res.status(404).json({
//           status: "404 Not fund",
//           error: "Class not found",
//         });
//       }
//       const updates = Object.keys(req.body);
//       const allowedUpdates = ["name", "courseId", "userId"];
//       const isValidOperation = updates.every((update) =>
//         allowedUpdates.includes(update)
//       );
//       if (!isValidOperation) {
//         return res.status(400).json({
//           status: "400 Invalid Updates",
//           error: "Error updating class",
//         });
//       }
//       updates.forEach((update) => {
//         clazz[update] = req.body[update];
//       });
//       await clazz.save();

//       return res.status(200).json({
//         status: "success",
//         data: {
//           class: clazz,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error updating class",
//       });
//     }
//   }

//   /**
//    * Delete a school class
//    * @param {Request} req - Response object.
//    * @param {Response} res - The payload.
//    * @memberof SchoolController
//    * @returns {JSON} - A JSON success response.
//    *
//    */
//   static async schoolDeleteClass(req, res) {
//     try {
//       const clazz = await ClassModel.findOneAndDelete({
//         _id: req.params.classId,
//       });
//       if (!clazz) {
//         return res.status(404).json({
//           status: "404 Not fund",
//           error: "Class not found",
//         });
//       }

//       return res.status(200).json({
//         status: "success",
//         data: {
//           class: clazz,
//         },
//       });
//     } catch (error) {
//       return res.status(500).json({
//         status: "500 Internal server error",
//         error: "Error updating class",
//       });
//     }
//   }
// }
// export default SchoolController;
