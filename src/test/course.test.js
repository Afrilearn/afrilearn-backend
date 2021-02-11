import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import Course from '../db/models/courses.model';
import SubjectProgress from '../db/models/subjectProgresses.model';
import CourseController from '../controllers/course.controller';
import PastQuestionQuizResult from '../db/models/pastQuestionQuizResults.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

const subjectProgress = {
  userId: '5fcf78a4a26c8527bc8f423a',
  subjectId: '5fcf78a4a26c8527bc8f423a',
  courseId: '5fcf78a4a26c8527bc8f423a',
  lessonId: '5fcf78a4a26c8527bc8f423a',
  classId: '5fcf78a4a26c8527bc8f423a',
};
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
  userId: '5fd66fb678385d3c8098f880',
  classId: '5fc8d2a4b55ab52a40d75a54',
  courseId: '5fd12c70e74b15663c5f4c6e',
  subjectId: '5fc8e7134bfe993c34a9689c',
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

describe('Courses ', () => {
  const course_id = new mongoose.mongo.ObjectId();
  const user_id = new mongoose.mongo.ObjectId();

  const token = jwt.sign(
    {
      data: {
        id: '5fd66fb678385d3c8098f880',
        role: '5fc8cc978e28fa50986ecac9',
        fullName: 'Testing fullName',
      },
    },
    process.env.SECRET,
  );
  before(async () => {
    const course = new Course({
      _id: course_id,
      name: 'Course for testing',
      categoryId: '5fc8cc978e28fa50986ecac9',
    });

    await course.save();
    const newPqResult = new PastQuestionQuizResult({ ...pqResult });
    await newPqResult.save();
  });

  after(async () => {
    await Course.findByIdAndDelete(course_id);
  });
  before((done) => {
    SubjectProgress.deleteMany(subjectProgress, (err) => {
      if (!err) {
        done();
      }
    });
  });
  it('should return array of enrolledCourses with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/courses/enroll')
      .send({ courseId: course_id, userId: user_id })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('course');
        done();
      });
  });

  it('should NOT return array of enrolledCourses with status 400 when data is incomplete', (done) => {
    chai
      .request(app)
      .post('/api/v1/courses/enroll')
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should return array of courses with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/courses')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('courses');
        done();
      });
  });

  it('should return a course with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/courses/${course_id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('course');
        done();
      });
  });
  it('should return array of subjects with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/courses/${course_id}/subjects`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subjects');
        done();
      });
  });
  it('should return array of subjects with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/courses/${course_id}/subjects`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subjects');
        done();
      });
  });

  it('should return subjectsProgress with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/courses/5fd12c70e74b15663c5f4c6e/progress-and-performance')
      .set('token', token)
      .send({
        classId: '5fc8d2a4b55ab52a40d75a54',
      })
      .end((err, res) => {
        res.should.have.status(200);
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

    CourseController.loadCourses(req, res);
    res.status.should.have.callCount(0);
    done();
  });

  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    CourseController.getCourseProgressAndPerformance(req, res);
    res.status.should.have.callCount(1);
    done();
  });
  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    CourseController.addCourseToEnrolledCourses(req, res);
    res.status.should.have.callCount(0);
    done();
  });
  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    CourseController.getCourse(req, res);
    res.status.should.have.callCount(1);
    done();
  });
  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    CourseController.getSubjectsForACourse(req, res);
    res.status.should.have.callCount(1);
    done();
  });
  it('should register subject progress if it had not been done before', (done) => {
    chai
      .request(app)
      .post('/api/v1/courses/subject-progress')
      .set('token', token)
      .send(subjectProgress)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        done();
      });
  });
  // it('should not register subject progress if it had not been done before', (done) => {
  //   chai
  //     .request(app)
  //     .post('/api/v1/courses/subject-progress')
  //     .set('token', token)
  //     .send(subjectProgress)
  //     .end((err, res) => {
  //       res.should.have.status(409);
  //       res.body.should.be.an('object');
  //       res.body.should.have.property('status').eql('409 Conflict');
  //       res.body.should.have.property('error');
  //       done();
  //     });
  // });
  it('should not register progress if the user supplies incomplete information', (done) => {
    chai
      .request(app)
      .post('/api/v1/courses/subject-progress')
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('400 Invalid Request');
        res.body.should.have.property('error');
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

    CourseController.subjectProgress(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
