import AdminRole from "../db/models/adminRole.model";
import ClassModel from "../db/models/classes.model";
import School from "../db/models/schoolProfile";
import Auth from "../db/models/users.model";

/**
 *Contains School Controller
 *
 *
 *
 * @class SchoolController
 */
class SchoolController {
    /**
     * get a school profile
     * @param {Request} req - Response object.
     * @param {Response} res - The payload.
     * @memberof SchoolController
     * @returns {JSON} - A JSON success response.
     *
     */
    static async getSchoolProfile(req, res) {
        try {
            const {schoolId} = req.params
           
            let schoolClassesData = [];

            const numOfStudents = await Auth.countDocuments({
                schoolId,
                role: "5fd08fba50964811309722d5"
            });
           
            const numOfAdminTeachers = await AdminRole.countDocuments({
                schoolId
            });
           

            const schoolClasses = await ClassModel.find({
                schoolId
            }, {
                name: 1,
                userId:1,
                courseId:1
            })
            let overAllClassTeachers = 0;
            for(let i = 0; i<schoolClasses.length; i++){                         
                let numOfClassTeachers = await AdminRole.countDocuments({
                    schoolId,
                    classId:schoolClasses[i].id
                });   
              
                if(schoolClasses[i].userId){
                    ++numOfClassTeachers
                    ++overAllClassTeachers
                }  
                
                const data = {                   
                    className:schoolClasses[i].name,
                    numOfClassTeachers,
                    courseId:schoolClasses[i].courseId,
                    classId: schoolClasses[i].id,                  
                }
                schoolClassesData.push(data)
            }
            const numOfTeachers = overAllClassTeachers + numOfAdminTeachers;
            return res.status(201).json({
                status: "success",
                data: {
                    numOfStudents,
                    numOfTeachers,
                    schoolClassesData
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "500 Internal server error",
                error: "Error getting school profile",
            });
        }
    }


}
export default SchoolController;