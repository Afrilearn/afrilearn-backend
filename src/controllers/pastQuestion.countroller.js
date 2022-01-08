import PastQuestionProgress from '../db/models/pastQuestionProgresses.model';
import PastQuestionQuizResult from '../db/models/pastQuestionQuizResults.model';
// import pastQuestionsRaw from './../utils/pastQuestions copy';
// import pastQuestionsRawYears from './../utils/pastQuestions copy 2';
/**
 *Contains pastQuestion Controller
 *
 *
 *
 * @class PastQuestionController
 */
class PastQuestionController {
  /**
   * Add a pastQuestionProgress
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PastQuestionController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async addPastQuestionProgress(req, res) {
    try {
      const pastQuestionProgress = await PastQuestionProgress.create({
        userId: req.data.id,
        ...req.body,
      });
      return res.status(201).json({
        status: 'success',
        data: { pastQuestionProgress },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error Adding progress',
      });
    }
  }

  /**
   * Save past question result
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PastQuestionController
   * @returns {JSON} - A JSON success response.
   *
   */
  static async savePastQuestionResult(req, res) {
    try {
      const results = [];

      req.body.results.forEach((result) => {
        results.push({
          questionId: result.question_id,
          optionSelected: result.optionSelected,
          correctOption: result.correctOption,
          status: result.status,
        });
      });
      const pastQuestionResultData = {
        results,
        userId: req.data.id,
        classId: req.body.classId,
        courseId: req.body.courseId,
        subjectId: req.params.subjectId,
        subjectCategoryId: req.body.subjectCategoryId,
        subjectName: req.body.subjectName,
        pastQuestionCategoryId: req.body.pastQuestionCategoryId,
        pastQuestionTypeId: req.body.pastQuestionTypeId,
        timeSpent: req.body.timeSpent,
        numberOfCorrectAnswers: req.body.numberOfCorrectAnswers,
        numberOfWrongAnswers: req.body.numberOfWrongAnswers,
        numberOfSkippedQuestions: req.body.numberOfSkippedQuestions,
        score: req.body.score,
        remark: req.body.remark,
      };
      const pastQuestionResult = await PastQuestionQuizResult.create({
        ...pastQuestionResultData,
      });

      return res.status(201).json({
        status: 'success',
        data: {
          results: pastQuestionResult,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: '500 Internal server error',
        error: 'Error saving results',
      });
    }
  }

   /**
   * Mobile app past questions logic
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @memberof PastQuestionController
   * @returns {JSON} - A JSON success response.
   *
   */
    // static async mobilePastQuestionAppLogic(req, res) {
    //   try {    
    //          
    //     pastQuestionsRawYears.forEach(element => {
    //       let result = pastQuestionsRaw.filter(element2=>element2.subject_id === element.subject_id)
    //       let currentQuestions = result.map((item)=>{
    //         return {
    //             subject_id:+element.subject_id,
    //             question_id:item.question_id,
    //             question: item.question,
    //             question_image: item.question_image,
    //             question_position: item.question_position,
    //             options: [
    //               item.option_a,
    //               item.option_b,
    //               item.option_c,
    //               item.option_d,
    //               item.option_e
    //             ],
    //             images:[
    //               item.option_a_image,
    //               item.option_b_image,
    //               item.option_c_image,
    //               item.option_d_image,
    //               item.option_e_image
    //             ],
    //             grouped : (item.grouped == 1) ? true : false,
    //             from_no : item.from_no,
    //             to_no : item.to_no,
    //             explanation : item.explanation,
    //             correct_option : +item.correct_option,
    //         }
    //       })       
    //       questions.push(...currentQuestions)
    //     });
   
    //     // const result = pastQuestionsRaw.filter(item=>item.subject_id === '3')
    //     // const questions = result.map((item)=>{
    //     //   return {
    //     //       question_id:item.question_id,
    //     //       question: item.question,
    //     //       question_image: item.question_image,
    //     //       question_position: item.question_position,
    //     //       options: [
    //     //         item.option_a,
    //     //         item.option_b,
    //     //         item.option_c,
    //     //         item.option_d,
    //     //         item.option_e
    //     //       ],
    //     //       images:[
    //     //         item.option_a_image,
    //     //         item.option_b_image,
    //     //         item.option_c_image,
    //     //         item.option_d_image,
    //     //         item.option_e_image
    //     //       ],
    //     //       grouped : (item.grouped == 1) ? true : false,
    //     //       from_no : item.from_no,
    //     //       to_no : item.to_no,
    //     //       explanation : item.explanation,
    //     //       correct_option : item.correct_option,
    //     //   }
    //     // })     
    //     return res.status(201).json({
    //       status: 'success',
    //       data:{            
    //         questions,
    //         length: questions.length
    //       }
    //     });
    //   } catch (error) {
    //     console.log(error)
    //     return res.status(500).json({
    //       status: '500 Internal server error',
    //       error: 'Error Occured',
    //     });
    //   }
    // }
}
export default PastQuestionController;
