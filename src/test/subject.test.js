import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import app from '../index';
import SubjectController from '../controllers/subject.controller';
import Subject from '../db/models/subjects.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Subjects ', () => {
  const main_subject_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
  const subject_id = new mongoose.mongo.ObjectId();
  after(async () => {
    await Subject.findByIdAndDelete(subject_id);
  });

  it('should create and return  a subject object with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/subjects/add-subject')
      .send({
        _id: subject_id,
        mainSubjectId: main_subject_id,
        courseId: course_id,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subject');
        done();
      });
  });

  it('should NOT create with status 400 when bad request is sent', (done) => {
    chai
      .request(app)
      .post('/api/v1/subjects/add-subject')
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
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

    SubjectController.addSubject(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
