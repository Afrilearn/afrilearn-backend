import { check, validationResult } from 'express-validator';
import SubjectProgress from '../../db/models/subjectProgresses.model';

/**
 *Contains Login Validator
 *
 *
 *
 * @class Login
 */
class SubjectProgressClass {
  /**
     * validate user data.
     * @memberof Login
     * @returns {null} - No response.
     */
  static validateData() {
    return [
      check('userId')
        .exists()
        .withMessage('userId is required')
        .not()
        .isEmpty()
        .withMessage('userId cannot be empty'),       
      check('subjectId')
        .exists()
        .withMessage('subjectId is required')
        .not()
        .isEmpty()
        .withMessage('subjectId cannot be empty')
        .trim()
        .escape(),
      check('courseId')
        .exists()
        .withMessage('courseId is required')
        .not()
        .isEmpty()
        .withMessage('courseId cannot be empty')
        .trim()
        .escape(),
      check('lessonId')
        .exists()
        .withMessage('lessonId is required')
        .not()
        .isEmpty()
        .withMessage('lessonId cannot be empty')
        .trim()
        .escape()     
    ];
  }

  /**
   * Validate user data.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof Login
   * @returns {JSON} - A JSON success response.
   */
  static async myValidationResult(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array().map(({ msg }) => msg);
      return res.status(400).json({
        status: '400 Invalid Request',
        error: 'Your request contains invalid parameters',
        errors: errArr,
      });
    }
    return next();
  }

  /**
   * Check whether progress has been recorded.
   * @param {Request} req - Response object.
   * @param {Response} res - The payload.
   * @param {Response} next - The next parameter.
   * @memberof SignUp
   * @returns {JSON} - A JSON response.
   */
  static async progressExist(req, res, next) {
    const {courseId, subjectId, lessonId, userId} = req.body;
    const condition ={   
      userId,     
      courseId,
      subjectId,
      lessonId,         
    }
    if(req.body.classId){
      condition['classId'] = req.body.classId
    }  
    const exist = await SubjectProgress.findOne(condition)
   
    if (exist) {
      return res.status(409).json({
        status: '409 Conflict',
        error: 'Progress already exist',
      });
    }
    return next();
  }

}
export default SubjectProgressClass;
