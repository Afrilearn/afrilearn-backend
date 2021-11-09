import AgentSubmission from "../db/models/agentSubmission.model";
import sendEmail from "../utils/email.utils";

class AgentSubmissionController {
  static async submitEntry(req, res) {
    try {
      const data = { ...req.body, file: req.file.location };
      const agentSubmission = await AgentSubmission.create(data);
      sendEmail(
        "myafrilearn@gmail.com",
        "Agent Entry on Afrilearn",
        `${data.fullName} from ${data.state} submitted an entry on Afrilearn Agent Network.`
      );
      return res.status(200).json({
        status: "success",
        data: { agentSubmission },
      });
    } catch (error) {
      return res.status(500).json({
        status: "500 Internal server error",
        error: "Error submiting entry",
      });
    }
  }
}
export default AgentSubmissionController;
