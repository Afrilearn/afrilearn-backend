import chai from "chai";
import chaiHttp from "chai-http";
import Sinonchai from "sinon-chai";
import sinon from "sinon";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../index";
import RecentActivityController from "../controllers/recentActivity.controller";
import RecentActivity from "../db/models/recentActivities.model";
// import logger from '../config';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe("RecentActivities ", () => {
  const recent_activity_id = new mongoose.mongo.ObjectId();
  const user_id = new mongoose.mongo.ObjectId();
  const lesson_id = new mongoose.mongo.ObjectId();
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

  after(async () => {
    await RecentActivity.findByIdAndDelete(recent_activity_id);
  });

  // it("should save and return an object RecentActivity with status 200", (done) => {
  //   chai
  //     .request(app)
  //     .post("/api/v1/recents/add-recent-activity")
  //     .set("token", token)
  //     .send({
  //       type: "lesson",
  //       lessonId: lesson_id,
  //     })
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.be.an("object");
  //       res.body.should.have.property("status").eql("success");
  //       res.body.should.have.property("data");
  //       res.body.data.should.have.property("recentActivity");
  //       done();
  //     });
  // });

  it("should return 5 most recent RecentActivities with status 200", (done) => {
    chai
      .request(app)
      .get("/api/v1/recents/activities")
      .set("token", token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an("object");
        res.body.should.have.property("status").eql("success");
        res.body.should.have.property("data");
        res.body.data.should.have.property("recentActivities");
        done();
      });
  });

  // it('fakes server error', (done) => {
  //   const req = { body: {} };
  //   const res = {
  //     status() {},
  //     send() {},
  //   };

  //   sinon.stub(res, 'status').returnsThis();

  //   RecentActivityController.addItemToRecentActivity(req, res);
  //   res.status.should.have.callCount(2);
  //   done();
  // });

  it("fakes server error", (done) => {
    const req = { body: {} };
    const res = {
      status() {},
      send() {},
    };

    sinon.stub(res, "status").returnsThis();

    RecentActivityController.getRecentActivities(req, res);
    res.status.should.have.callCount(1);
    done();
  });
});
