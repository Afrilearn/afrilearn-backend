import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
// import sinon from "sinon";
import mongoose from 'mongoose';
import app from '../index';
// import logger from '../config';
import Course from '../db/models/courses.model';
import Subject from '../db/models/subjects.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Subjects ', () => {
  const course_id = new mongoose.mongo.ObjectId();
  const subject_id = new mongoose.mongo.ObjectId();
  before(async () => {
    const course = new Course({
      _id: course_id,
      name: 'Course for testing',
      categoryId: '5fc8cc978e28fa50986ecac9',
    });
    await course.save();
    const subject = new Subject({
      _id: subject_id,
      mainSubjectId: '5fc8cc978e28fa50986ecac9',
      courseId: course_id,
    });
    await subject.save();
  });

  after(async () => {
    await Course.findByIdAndDelete(course_id);
    await Subject.findByIdAndDelete(subject_id);
  });

  it('should return array of Subject with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/subjects/${course_id}/subjects`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subjects');
        done();
      });
  });
});
