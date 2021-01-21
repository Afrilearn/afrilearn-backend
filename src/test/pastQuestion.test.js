import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import PastQuestionController from '../controllers/pastQuestion.countroller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Past Questions ', () => {
  const pq_id = new mongoose.mongo.ObjectId();
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
  const pq_test = {
    results: [
      {
        questionId: '5fc8e7134bfe993c34a9689c',
        optionSelected: 0,
        correctOption: 1,
        status: 'incorrect',
      },
      {
        questionId: '5fc8e7134bfe993c34a9689c',
        optionSelected: 0,
        correctOption: 1,
        status: 'incorrect',
      },
    ],
    userId: '5fc8e7134bfe993c34a9689c',
    classId: '5fc8e7134bfe993c34a9689c',
    courseId: '5fc8e7134bfe993c34a9689c',
    subjectId: '5fc8e7134bfe993c34a9689c',
    pastQuestionCategoryId: '23',
    pastQuestionTypeId: '5fc8e7134bfe993c34a9689c',
    timeSpent: '233',
    numberOfCorrectAnswers: 2,
    numberOfWrongAnswers: 3,
    numberOfSkippedQuestions: 2,
    score: 2,
    remark: 'You can be better',
  };
  //   const course_id = new mongoose.mongo.ObjectId();
  //   const subject_id = new mongoose.mongo.ObjectId();
  //   before(async () => {
  //     await Subject.create({
  //       _id: subject_id,
  //       mainSubjectId: main_subject_id,
  //       courseId: course_id,
  //     });
  //   });
  //   after(async () => {
  //     await Subject.findByIdAndDelete(subject_id);
  //   });

  it('should add a new pastQuestion Progress with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/past-questions/add-progress')
      .set('token', token)
      .send({
        _id: pq_id,
        classId: '5fcdf5f5581c833b189bb693',
        pastQuestionTypeId: '5ff817f31d7af15424937c65',
        courseId: '5fd12c70e74b15663c5f4c6e',
        subjectId: '5fc8e475c306fb47cc7d37d9',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        done();
      });
  });

  it('should NOT add new pastQuestion Progress with status 400 if input is invalid', (done) => {
    chai
      .request(app)
      .post('/api/v1/past-questions/add-progress')
      .set('token', token)
      .send({
        courseId: '3',
        subjectId: '5fc8e475c306fb47cc7d37d9',
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('should add a new pastQuestion Result with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/past-questions/save-past-question-result')
      .set('token', token)
      .send({ ...pq_test })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        done();
      });
  });

  it('should NOT add a new pastQuestion Result with status 400 when input is invalid', (done) => {
    chai
      .request(app)
      .post('/api/v1/past-questions/save-past-question-result')
      .set('token', token)
      .send({ ...pq_test, timeSpent: 2 })
      .end((err, res) => {
        res.should.have.status(400);
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

    PastQuestionController.savePastQuestionResult(req, res);
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

    PastQuestionController.addPastQuestionProgress(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
