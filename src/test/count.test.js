import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import app from '../index';
import Subject from '../db/models/subjects.model';
import CountController from '../controllers/count.countroller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Counts ', () => {
  const main_subject_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
  const subject_id = new mongoose.mongo.ObjectId();
  before(async () => {
    await Subject.create({
      _id: subject_id,
      mainSubjectId: main_subject_id,
      courseId: course_id,
    });
  });
  after(async () => {
    await Subject.findByIdAndDelete(subject_id);
  });

  it('should return an object containing counts with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/counts/get-all-counts')
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

    CountController.getAllCounts(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
