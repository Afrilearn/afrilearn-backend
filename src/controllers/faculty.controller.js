import Faculty from "../db/models/faculty.model";

class FacultyController {
  static async addFaculty(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.image = req.file.location;
      }
      const faculty = await Faculty.create(data);
      return res.status(201).json(faculty);
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Adding faculty",
      });
    }
  }
  static async updateFaculty(req, res) {
    try {
      const data = { ...req.body };
      if (req.file) {
        data.image = req.file.location;
      }
      const faculty = await Faculty.findByIdAndUpdate(
        req.params.facultyId,
        {
          ...data,
        },
        {
          new: true,
        }
      );
      return res.status(201).json(faculty);
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error Updateing faculty",
      });
    }
  }
  static async getFaculty(req, res) {
    try {
      const faculty = await Faculty.find({});
      return res.status(200).json(faculty);
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error getting faculty",
      });
    }
  }
}
export default FacultyController;
