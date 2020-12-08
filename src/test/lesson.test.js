import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
// import jwt from 'jsonwebtoken';
import app from '../index';
// import logger from '../config';

import LessonController from '../controllers/lesson.controller';
import Question from '../db/models/questions.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Classes ', () => {
//   const user_id = new mongoose.mongo.ObjectId();
  const question_id = new mongoose.mongo.ObjectId();
  const lesson_id = new mongoose.mongo.ObjectId();
  //   const token = jwt.sign(
  //     {
  //       data: {
  //         id: user_id,
  //         role: '5fc8cc978e28fa50986ecac9',
  //         fullName: 'Testing fullName',
  //       },
  //     },
  //     process.env.SECRET,
  //   );

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
  });

  after(async () => {
    await Question.findByIdAndDelete(question_id);
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
});
