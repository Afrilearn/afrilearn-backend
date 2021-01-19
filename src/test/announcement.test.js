import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
// import logger from '../config';

import ClassController from '../controllers/class.controller';
import Class from '../db/models/classes.model';
import Announcement from '../db/models/announcement.model';
import TeacherAssignedContent from '../db/models/teacherAssignedContents.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Classes ', () => {
  const user_id = new mongoose.mongo.ObjectId();
  const class_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
  const announcement_id = new mongoose.mongo.ObjectId();
  const assigned_id = new mongoose.mongo.ObjectId();
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
    await Class.create({
      _id: class_id,
      userId: user_id,
      name: 'Primary One',
      courseId: course_id,
    });
    await Announcement.create({
      _id: announcement_id,
      text: 'Hi class',
      teacher: user_id,
      classId: class_id,
    });
    await TeacherAssignedContent.create({
      _id: assigned_id,
      description: 'Hi class',
      teacher: user_id,
      classId: class_id,
    });
  });

  after(async () => {
    await Announcement.findByIdAndDelete(announcement_id);
    await Class.findByIdAndDelete(class_id);
  });

  it('should  create an announcement and return an announcement with status 200', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${class_id}/announce`)
      .set('token', token)
      .send({
        text: 'Welcome to the class',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('announcement');
        done();
      });
  });

  it('should NOT create an announcement if user is not authenticated', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${class_id}/announce`)
      .send({
        text: 'Welcome to the class',
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should NOT create an announcement if input is invalid', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${class_id}/announce`)
      .send('text', 2)
      .set('token', token)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('should create a comment and return a comment with status 200', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${announcement_id}/comment`)
      .set('token', token)
      .send({
        text: 'Thank you instructor',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('comment');
        done();
      });
  });

  it('should NOT create a comment if user is not authenticated', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${announcement_id}/comment`)
      .send({
        text: 'Thank you Instructor',
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should NOT create a comment and if input is invalid', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${announcement_id}/comment`)
      .set('token', token)
      .send('text', 2)
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it('should return a list of announcement with status 200', (done) => {
    chai
      .request(app)
      .get(`/api/v1/classes/${class_id}/announcements`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('announcements');
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

    ClassController.makeComment(req, res);
    res.status.should.have.callCount(1);
    done();
  });
  it('should create a assignedComment and return a comment with status 200', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${assigned_id}/comment-on-content`)
      .set('token', token)
      .send({
        text: 'Thank you instructor',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('comment');
        done();
      });
  });

  it('should NOT create a assignedComment if user is not authenticated', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${assigned_id}/comment-on-content`)
      .send({
        text: 'Thank you Instructor',
      })
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should NOT create a assignedComment and if input is invalid', (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${assigned_id}/comment-on-content`)
      .set('token', token)
      .send('text', 2)
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

    ClassController.makeCommentOnAssignedContent(req, res);
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

    ClassController.getClassAnnouncements(req, res);
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

    ClassController.makeAnnouncement(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
