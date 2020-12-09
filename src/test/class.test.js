import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
// import logger from '../config';

import ClassController from '../controllers/class.controller';
import ClassMember from '../db/models/classMembers.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Classes ', () => {
  const user_id = new mongoose.mongo.ObjectId();
  const class_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
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
    await ClassMember.create({
      classId: class_id,
      userId: user_id,
    });
  });

  after(async () => {
    await ClassMember.findByIdAndDelete(class_id);
  });

  it('should return a class with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/add-class')
      .set('token', token)
      .send({
        name: 'Class for testing',
        courseId: course_id,
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

  it('should NOT return a class with status 400 when data is incomplete', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/add-class')
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should return a classMember and message with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/send-class-request')
      .set('token', token)
      .send({
        classId: class_id,
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

  it('should NOT return a classMember and message with status 400', (done) => {
    chai
      .request(app)
      .post('/api/v1/classes/send-class-request')
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should return a classMember with updated status with status 200', (done) => {
    chai
      .request(app)
      .patch('/api/v1/classes/accept-reject-class-request')
      .set('token', token)
      .send({
        classId: class_id,
        userId: user_id,
        status: 'accept',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('classMember');
        done();
      });
  });

  it('should not return a classMember with updated status if class ID and User ID are not present with status 400', (done) => {
    chai
      .request(app)
      .patch('/api/v1/classes/accept-reject-class-request')
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an('object');
        done();
      });
  });

  it('should return a students in a class with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/classes/${class_id}/students`)
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('classMembers');
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

  it('fakes server error', (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, 'status').returnsThis();

    ClassController.acceptRejectRetractClassRequest(req, res);
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

    ClassController.getStudentsInClass(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
