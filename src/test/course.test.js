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

describe('Courses ', () => {
  const course_id = new mongoose.mongo.ObjectId();
  const user_id = new mongoose.mongo.ObjectId();
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
    const course = new Course({
      _id: course_id,
      name: 'Course for testing',
      categoryId: '5fc8cc978e28fa50986ecac9',
    });

    await course.save();
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
      .set('token', token)
      .send({ courseId: course_id })
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

    CourseController.addCourseToEnrolledCourses(req, res);
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
        res.body.should.have.property('data');
        res.body.data.should.have.property('progress');
        done();
      });
  });
  it('should not register subject progress if it had not been done before', (done) => {
    chai
      .request(app)
      .post('/api/v1/courses/subject-progress')
      .set('token', token)
      .send(subjectProgress)
      .end((err, res) => {
        res.should.have.status(409);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('409 Conflict');
        res.body.should.have.property('error');
        done();
      });
  });
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
