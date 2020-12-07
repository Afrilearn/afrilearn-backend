import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
// import logger from '../config';

import ClassController from '../controllers/class.controller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Classes ', () => {
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

  it('should return a class with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/add-class')
      .set('token', token)
      .send({
        name: 'Class for testing',
        courseId: '5fc8cc978e28fa50986ecac9',
        classCode: '00000000',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('class');
        done();
      });
  });

  it('should return a classMember and message with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/send-class-request')
      .set('token', token)
      .send({
        courseId: '5fc8cc978e28fa50986ecac9',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('classMember');
        res.body.data.should.have.property('message');
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

    ClassController.addClass(req, res);
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

    ClassController.sendClassRequest(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
