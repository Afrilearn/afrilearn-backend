import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import app from '../index';
// import logger from '../config';
import Course from '../db/models/courses.model';

import CourseController from '../controllers/course.controller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Courses ', () => {
  const _id = new mongoose.mongo.ObjectId();
  before(async () => {
    const course = new Course({
      _id,
      name: 'Course for testing',
      categoryId: '5fc8cc978e28fa50986ecac9',
    });
    await course.save();
  });

  after(async () => {
    await Course.findByIdAndDelete(_id);
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
      .get(`/api/v1/courses/${_id}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('course');
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
});
