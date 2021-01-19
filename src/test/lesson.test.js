import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
// import logger from '../config';

import LessonController from '../controllers/lesson.controller';
import Question from '../db/models/questions.model';
import QuizResult from '../db/models/quizResults.model';
import Lesson from '../db/models/lessons.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Classes ', () => {
  const test_result_id = new mongoose.mongo.ObjectId();
  const user_id = new mongoose.mongo.ObjectId();
  const question_id = new mongoose.mongo.ObjectId();
  const lesson_id = new mongoose.mongo.ObjectId();
  const unknown_lesson_id = new mongoose.mongo.ObjectId();
  const new_lesson = {
    _id: lesson_id,
    subjectId: '5fc8d2a4b55ab52a40d75a54',
    courseId: '5fc8d2a4b55ab52a40d75a54',
    creatorId: '5fc8d2a4b55ab52a40d75a54',
    termId: '5fc8d2a4b55ab52a40d75a54',
    title: 'lorem ipsum vicini',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
    videoUrl: 'https://www.youtube.com/watch?v=kSdR1UIWh_s',
  };
  const getSubject = {
    subjectId: '5fc8d2a4b55ab52a40d75a54',
    courseId: '5fc8d2a4b55ab52a40d75a54',
  };
  const getSubjectWithClas = {
    userId: '5fc8d2a4b55ab52a40d75a54',
    classId: '5fc8d2a4b55ab52a40d75a54',
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

  const testResultData = {
    _id: test_result_id,
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
    lessonId: '5fc8e7134bfe993c34a9689c',
    timeSpent: '20:00:00',
    numberOfCorrectAnswers: 2,
    numberOfWrongAnswers: 3,
    numberOfSkippedQuestions: 2,
    score: 2,
    remark: 'You can be better',
  };

  before(async () => {
    await Question.create({
      _id: question_id,
      lessonId: lesson_id,
      question: 'Who is the president of Nigeria',
      questionImage: 'https://picsum.photos/200',
      imagePosition: 'top',
      optionA: 'Muhammed Buhari',
      optionAImage: 'https://picsum.photos/200',
      optionB: 'Da Vinci',
      optionBImage: 'https://picsum.photos/200',
      optionC: 'Donald Trump',
      optionCImage: 'https://picsum.photos/200',
      optionD: 'Will Smith',
      optionDImage: 'https://picsum.photos/200',
      optionE: 'Ayo Balogun',
      optionEImage: 'https://picsum.photos/200',
      correctOption: 0,
      explanation:
        'Muhammed Buhari is the president of the federal republic of Nigeria',
    });
    await Lesson.create({ ...new_lesson });
  });

  after(async () => {
    await Question.findByIdAndDelete(question_id);
    await QuizResult.findByIdAndDelete(test_result_id);
    await Lesson.findByIdAndDelete(lesson_id);
  });

  it('should return array of question with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/lessons/${lesson_id}/test`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('questions');
        done();
      });
  });

  it('should submit test result and  return array of quiz results with status 200', (done) => {
    chai
      .request(app)
      .post(`/api/v1/lessons/${lesson_id}/save-test-results`)
      .set('token', token)
      .send({ ...testResultData })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('results');
        done();
      });
  });

  it('should neither submit test result nor  return array of quiz results with status 400', (done) => {
    chai
      .request(app)
      .post(`/api/v1/lessons/${lesson_id}/save-test-results`)
      .set('token', token)
      .send({ ...testResultData, timeSpent: 2 })
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('400 Invalid Request');
        done();
      });
  });

  it('should return array of quiz results with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/lessons/${lesson_id}/get-test-results`)
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('results');
        done();
      });
  });

  it('should return array of quiz results related to a class with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/lessons/${lesson_id}/get-test-results`)
      .set('token', token)
      .send({ classId: '5fc8e7134bfe993c34a9689c' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('results');
        done();
      });
  });

  it("should not return array of quiz results when lesson doesn't exists, status 404", (done) => {
    chai
      .request(app)
      .get(`/api/v1/lessons/${unknown_lesson_id}/get-test-results`)
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should return array of lessons with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/lessons')
      .query({ searchQuery: 'vicini' })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('lessons');
        done();
      });
  });

  it('should return array of lessons even with no searchQuery, with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/lessons')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('lessons');
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

    LessonController.loadTest(req, res);
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

    LessonController.saveTestResult(req, res);
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

    LessonController.getTestResult(req, res);
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

    LessonController.searchLessons(req, res);
    res.status.should.have.callCount(1);
    done();
  });

  it('should return subject lessons and progress', (done) => {
    chai
      .request(app)
      .post(
        '/api/v1/lessons/5fc8d2a4b55ab52a40d75a54/5fc8d2a4b55ab52a40d75a54/subject-lessons',
      )
      .set('token', token)
      .send(getSubject)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subject');
        done();
      });
  });

  it('should return subject lessons and progress when Class ID is sent', (done) => {
    chai
      .request(app)
      .post(
        '/api/v1/lessons/5fc8d2a4b55ab52a40d75a54/5fc8d2a4b55ab52a40d75a54/subject-lessons',
      )
      .set('token', token)
      .send(getSubjectWithClas)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('subject');
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

    LessonController.getSubjectLessonsAndProgress(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
