import chai from "chai";
import chaiHttp from "chai-http";
import Sinonchai from "sinon-chai";
import sinon from "sinon";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../index";
// import logger from '../config';

import ClassController from "../controllers/class.controller";
import ClassMember from "../db/models/classMembers.model";
import Class from "../db/models/classes.model";
import Lesson from "../db/models/lessons.model";

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe("Classes ", () => {
  const user_id = new mongoose.mongo.ObjectId();
  const lesson_id = new mongoose.mongo.ObjectId();
  const class_id = new mongoose.mongo.ObjectId();
  const new_class_id = new mongoose.mongo.ObjectId();
  const course_id = new mongoose.mongo.ObjectId();
  const token = jwt.sign(
    {
      data: {
        id: user_id,
        role: "5fc8cc978e28fa50986ecac9",
        fullName: "Testing fullName",
      },
    },
    process.env.SECRET
  );

  before(async () => {
    await Class.create({
      _id: class_id,
      userId: user_id,
      name: "Primary Testing",
      courseId: course_id,
      classCode: "00000000",
    });
    await ClassMember.create({
      classId: class_id,
      userId: user_id,
    });
    await Lesson.create({
      _id: lesson_id,
      title: "Nul",
    });
  });

  after(async () => {
    await ClassMember.findByIdAndDelete(class_id);
    await ClassMember.findOneAndDelete({
      classId: new_class_id,
      userId: user_id,
    });
    await Class.findByIdAndDelete(class_id);
    await Lesson.findByIdAndDelete(lesson_id);
  });

  it("should  save an EnrooledClass and return a class with status 200", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/add-class")
      .set("token", token)
      .send({
        name: "Class for testing",
        courseId: course_id,
        classCode: "00000000",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("class");
        done();
      });
  });

  it("should NOT return a class with status 400 when data is incomplete", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/add-class")
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an("object");
        done();
      });
  });

  it("should return a classMember and message with status 200", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-request")
      .set("token", token)
      .send({
        classCode: "00000000",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("classMember");
        res.body.data.should.have.property("message");
        done();
      });
  });

  it("should return a classMember and message with status 200 when it is auto approved", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-request")
      .set("token", token)
      .send({
        classCode: "00000000",
        status: "approved",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("classMember");
        res.body.data.should.have.property("message");
        done();
      });
  });

  it("should NOT return a classMember and message with status 400", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-request")
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an("object");
        done();
      });
  });

  it("should return a success status and message with status 200", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-invite")
      .set("token", token)
      .send({
        link: "www.afri.com",
        email: "ayobamiu@gmail.com",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("message");
        done();
      });
  });

  it("should NOT return a success status with 400 when input is invalid", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-invite")
      .set("token", token)
      .send({
        link: "00000000",
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it("should NOT return a classMember and message with status 401 when user is not authenticated", (done) => {
    chai
      .request(app)
      .post("/api/v1/classes/send-class-invite")
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it("should return a classMember with updated status with status 200", (done) => {
    chai
      .request(app)
      .patch("/api/v1/classes/accept-reject-class-request")
      .set("token", token)
      .send({
        classId: class_id,
        userId: user_id,
        status: "accept",
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("classMember");
        done();
      });
  });

  it("should not return a classMember with updated status if class ID and User ID are not present with status 400", (done) => {
    chai
      .request(app)
      .patch("/api/v1/classes/accept-reject-class-request")
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.be.an("object");
        done();
      });
  });

  it("should return a students in a class with status 200", (done) => {
    chai
      .request(app)
      .get(`/api/v1/classes/${class_id}/students`)
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("classMembers");
        done();
      });
  });

  it("should return a class with status 200", (done) => {
    chai
      .request(app)
      .get(`/api/v1/classes/${class_id}`)
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("class");
        done();
      });
  });

  it("should create and return an assignedContent with status 200", (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${class_id}/assign-content`)
      .set("token", token)
      .send({
        description: "Attemp the last English test again",
        lessonId: lesson_id,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("content");
        done();
      });
  });

  it("should NOT create an assignedContent with status 400 when input is invalid", (done) => {
    chai
      .request(app)
      .post(`/api/v1/classes/${class_id}/assign-content`)
      .set("token", token)
      .send({
        description: "Attemp the last English test again",
        lessonId: "0",
      })
      .end((err, res) => {
        res.should.have.status(400);
        done();
      });
  });

  it("should return classes with status 200 ", (done) => {
    chai
      .request(app)
      .get("/api/v1/classes")
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("classes");
        done();
      });
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.getClasses(req, res);
    res.status.should.have.callCount(0);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.sendClassEmailInvite(req, res);
    res.status.should.have.callCount(2);
    done();
  });

  // it('fakes server error', (done) => {
  //   const req = { body: {} };
  //   const res = {
  //     status() {},
  //     send() {},
  //   };

  //   sinon.stub(res, 'status').returnsThis();

  //   ClassController.joinClassApproved(req, res);
  //   res.status.should.have.callCount(1);
  //   done();
  // });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.addClass(req, res);
    res.status.should.have.callCount(0);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.sendClassRequest(req, res);
    res.status.should.have.callCount(0);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.acceptRejectRetractClassRequest(req, res);
    res.status.should.have.callCount(0);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.getStudentsInClass(req, res);
    res.status.should.have.callCount(1);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.getClassById(req, res);
    res.status.should.have.callCount(1);
    done();
  });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    ClassController.assignContent(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
