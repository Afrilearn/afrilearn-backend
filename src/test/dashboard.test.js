import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import DashboardController from '../controllers/dashboard.controller';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import Course from '../db/models/courses.model';
import PastQuestionQuizResult from '../db/models/pastQuestionQuizResults.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Dashboard ', () => {
  const user_id = new mongoose.mongo.ObjectId();
  const enrolled_course_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
  const subject_id = new mongoose.mongo.ObjectId();
  const pqResult = {
    results: [
      {
        question_id: '5097',
        optionSelected: 0,
        correctOption: 2,
        status: 'incorrect',
      },
      {
        question_id: '5098',
        optionSelected: 0,
        correctOption: 1,
        status: 'incorrect',
      },
    ],
    userId: user_id,
    classId: '5fc8d2a4b55ab52a40d75a54',
    courseId: course_id,
    subjectId: subject_id,
    subjectCategoryId: '113',
    subjectName: 'Agriculture',
    pastQuestionCategoryId: '1',
    pastQuestionTypeId: '5fc8e7134bfe993c34a9689c',
    timeSpent: '233',
    numberOfCorrectAnswers: 2,
    numberOfWrongAnswers: 3,
    numberOfSkippedQuestions: 2,
    score: 2,
    remark: 'You can be better',
  };
  const token = jwt.sign(
    {
      data: {
        id: user_id,
        role: '5fc8cc978e28fa50986ecac9',
        fullName: 'Testing fullName',
      },
    },
    process.env.SECRET,
  );
  before(async () => {
    await EnrolledCourse.create({
      _id: enrolled_course_id,
      userId: user_id,
      courseId: course_id,
    });
    // await Subject.create({
    //   _id: subject_id,
    //   courseId: course_id,
    // });
    const course = new Course({
      _id: course_id,
      name: 'Course for testing',
      categoryId: '5fc8cc978e28fa50986ecac9',
    });

    await course.save();
    const newPqResult = new PastQuestionQuizResult({ ...pqResult });
    await newPqResult.save();
  });

  it('should return an object containing user data with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/dashboard')
      .set('token', token)
      .send({ enrolledCourseId: enrolled_course_id })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        done();
      });
  });

  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    DashboardController.getUserDashboard(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
