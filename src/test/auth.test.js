import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import AuthController from '../controllers/auth.controller';
import Email from '../utils/email.utils';
import AuthService from '../services/auth.services';
import Helper from '../utils/user.utils';
import Auth from '../db/models/users.model';
import ResetPassword from '../db/models/resetPassword.model';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import Course from '../db/models/courses.model';
import ClassMember from '../db/models/classMembers.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
const { expect } = chai;

const user_id = new mongoose.mongo.ObjectId();
const user_one = new mongoose.mongo.ObjectId();
const course_id = new mongoose.mongo.ObjectId();
const class_id = new mongoose.mongo.ObjectId();
const class_member_id = new mongoose.mongo.ObjectId();

const token = jwt.sign(
  {
    data: {
      id: user_one,
      role: '5fc8cc978e28fa50986ecac9',
      fullName: 'Testing fullName',
    },
  },
  process.env.SECRET,
);

const incompleteUser = {
  email: 'hackerbay888@gmail.com',
};
const invalidEmail = {
  email: 'hackerbay888@gmail.com',
  password: '86789789',
};
const user = {
  _id: user_id,
  fullName: 'hackerbay',
  userName: 'jackson',
  email: 'okwuosachijioke56687@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  role: '5fc8f4b99d1e3023e4942152',
};
// const userOne = {
//   _id: user_one,
//   fullName: 'hackerbay',
//   userName: 'jackson',
//   email: 'userone@gmail.com',
//   password: '123456',
//   confirmPassword: '123456',
//   gender: 'male',
//   role: '5fc8f4b99d1e3023e4942152',
// };
const wrongPasscode = {
  email: 'okwuosachijioke56687@gmail.com',
  password: '1234560',
};
const changePasswordInvalidCode = {
  email: 'okwuosachijioke56687@gmail.com',
  password: '12345678',
  code: '34534543',
};
const enrolledCourseOne = {
  courseId: '5fc8cfbb81a55b4c3c19737d',
  userId: user_id,
};
const courseOne = {
  _id: course_id,
  name: 'JSS2',
};

let myToken;
let passwordToken;

describe('No Matching Endpoint', () => {
  describe('* Unknown ', () => {
    it('should throw 404 error when endpoint is not found', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/none')
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});
describe('Auth Route Endpoints', () => {
  before((done) => {
    Auth.deleteMany({ email: 'okwuosachijioke56687@gmail.com' }, (err) => {
      if (!err) {
        done();
      }
    });
    EnrolledCourse.create({ ...enrolledCourseOne });
    ClassMember.create({
      _id: class_member_id,
      classId: class_id,
      userId: user_one,
    });
    Course.create({ ...courseOne });
  });
  after((done) => {
    ClassMember.findByIdAndDelete(class_member_id);
    done();
  });
  describe('POST api/v1/auth/signup', () => {
    it('should not create account if the user supplies incomplete information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(incompleteUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should create account if the user supplies complete and valid information', (done) => {
      const stub = sinon.stub(sgMail, 'send').callsFake(() => 'done');
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          stub.restore();
          done();
        });
    });
    it('should not create account if the user supplies already exisiting email', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(user)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('409 Conflict');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should return available roles and classes', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/roles')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          done();
        });
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.signUp(req, res);
      res.status.should.have.callCount(0);
      done();
    });
  });
  describe('POST api/v1/auth/activate_account', () => {
    before((done) => {
      Auth.find({ email: 'okwuosachijioke56687@gmail.com' }, (err, myuser) => {
        if (myuser) {
          (async () => {
            myToken = await Helper.generateToken(
              myuser[0].id,
              myuser[0].role,
              myuser[0].fullName,
            );
          })();
          done();
        }
      });
    });
    it('should activate account if user supplies valid token', (done) => {
      chai
        .request(app)
        .get(`/api/v1/auth/activate_account?token=${myToken}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          done();
        });
    });
    it('should not activate account if the user does not supply token', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/activate_account')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not activate account if the user supply invalid token', (done) => {
      chai
        .request(app)
        .get(
          '/api/v1/auth/activate_account?token=57576576thfcgfnfhfghfghfngfdtrd',
        )
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error').eql('Access token is Invalid');
          done();
        });
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.activateAccount(req, res);
      res.status.should.have.callCount(1);
      done();
    });
  });
  describe('POST api/v1/auth/login', () => {
    before(async () => {
      await EnrolledCourse.create({
        userId: user_id,
        courseId: '5fc8cfbb81a55b4c3c19737d',
      });
    });
    it('should not login a user if the user supplies incomplete information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(incompleteUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should login a user account if the user supplies complete valid information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(user)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          done();
        });
    });
    it('should not login a user if the user email cannot be found', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(invalidEmail)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not login a user if the user supplies wrong password', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/login')
        .send(wrongPasscode)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.login(req, res);
      res.status.should.have.callCount(0);
      done();
    });
  });
  describe('Auth Services Mock', () => {
    it('Should fake server error on emailExist function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.emailExist(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error on verifyPasscode function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.verifyPasscode(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should mock encrypt password', (done) => {
      expect(Helper.encrptPassword('reqBody'));
      done();
    });
    it('Should mock email', (done) => {
      expect(Email('gh'));
      done();
    });
  });
  describe('GET api/v1/auth/:email/reset_password', () => {
    it('should not send the user a reset password link if the users email does not exist', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/okwuosach@gmail.com/reset_password')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should send the user reset password link via mail when he provides valid email', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/okwuosachijioke56687@gmail.com/reset_password')
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('message');
          done();
        });
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.getRoles(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.resetPassword(req, res);
      res.status.should.have.callCount(1);
      done();
    });
  });
  describe('POST api/v1/auth/change_password', () => {
    before((done) => {
      (async () => {
        await ResetPassword.findOne(
          { email: 'okwuosachijioke56687@gmail.com' },
          (err, myuser) => {
            if (myuser) {
              passwordToken = myuser.token;
            }
          },
        );
      })();
      done();
    });
    it('should not change password if all parameters are not supplied', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/change_password')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not change password if passcode is invalid', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/change_password')
        .send(changePasswordInvalidCode)
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should change password if suppied data is complete', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/change_password')
        .send({
          email: 'okwuosachijioke56687@gmail.com',
          password: '123456',
          code: passwordToken,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('message');
          done();
        });
    });
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.changePassword(req, res);
      res.status.should.have.callCount(0);
      done();
    });
  });
  describe('POST api/v1/auth/change_password', () => {
    before((done) => {
      const newData = {
        expiringDate: '2343',
      };
      ResetPassword.findOneAndUpdate(
        { email: 'okwuosachijioke56687@gmail.com' },
        { ...newData },
        (err, myuser) => {
          if (myuser) {
            done();
          }
        },
      );
    });
    it('should not verify token if is it expired', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/change_password')
        .send({
          email: 'okwuosachijioke56687@gmail.com',
          password: '123456',
          code: passwordToken,
        })
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });
  });
  describe('POST api/v1/auth/social_login/google', () => {
    it('should not login a user if the user supplies incomplete information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/social_login/google')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not login a user if the user token is invalid', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/social_login/google')
        .send({ token: 'invalid' })
        .end((err, res) => {
          res.should.have.status(500);
          res.body.should.be.an('object');
          res.body.should.have
            .property('status')
            .eql('500 Internal server error');
          res.body.should.have.property('error');
          done();
        });
    });
  });
  describe('PATCH api/v1/auth/profile-update', () => {
    before(async () => {
      await Auth.create({
        _id: user_one,
        role: '5fc8cc978e28fa50986ecac9',
        fullName: 'Testing fullName',
        email: 'email@test.com',
      });
    });

    after(async () => {
      await Auth.findByIdAndDelete(user_one);
    });

    it('should update user profile if user is Authenticated', (done) => {
      chai
        .request(app)
        .patch('/api/v1/auth/profile-update')
        .set('token', token)
        .send({ fullName: 'Updated Name' })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          done();
        });
    });

    it('should NOT update user profile if update is Invalid', (done) => {
      chai
        .request(app)
        .patch('/api/v1/auth/profile-update')
        .set('token', token)
        .send({ password: 'Updated Name' })
        .end((err, res) => {
          res.should.have.status(400);
          done();
        });
    });

    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.updateProfile(req, res);
      res.status.should.have.callCount(1);
      done();
    });
  });
  describe('GET api/v1/auth/load-user', () => {
    it('should not load a user if there is no token', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/load-user')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error');
          done();
        });
    });

    it('should not load a user if the token is invalid', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/load-user')
        .set('token', 'invalid token')
        .end((err, res) => {
          res.should.have.status(401);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('401 Unauthorized');
          res.body.should.have.property('error').eql('Access token is Invalid');
          done();
        });
    });
    it('should load a user if valid token is supplied', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/load-user')
        .set('token', myToken)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          done();
        });
    });

    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.loadUser(req, res);
      res.status.should.have.callCount(1);
      done();
    });
  });

  describe('GET api/v1/auth/check-join-class', () => {
    it("should not load a user if it doesn't ", (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/check-join-class')
        .send({
          email: 'strang@email.com',
          classId: '600fd9316b97f8283045b201',
        })
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });

    // it('should not load a user if the token is invalid', (done) => {
    //   chai
    //     .request(app)
    //     .get('/api/v1/auth/load-user')
    //     .set('token', 'invalid token')
    //     .end((err, res) => {
    //       res.should.have.status(401);
    //       res.body.should.be.an('object');
    //       res.body.should.have.property('status').eql('401 Unauthorized');
    //       res.body.should.have.property('error').eql('Access token is Invalid');
    //       done();
    //     });
    // });
    // it('should load a user if valid token is supplied', (done) => {
    //   chai
    //     .request(app)
    //     .get('/api/v1/auth/load-user')
    //     .set('token', myToken)
    //     .end((err, res) => {
    //       res.should.have.status(200);
    //       res.body.should.be.an('object');
    //       res.body.should.have.property('status').eql('success');
    //       res.body.should.have.property('data');
    //       done();
    //     });
    // });

    // it('Should fake server error', (done) => {
    //   const req = { body: {} };
    //   const res = {
    //     status() {},
    //     send() {},
    //   };
    //   sinon.stub(res, 'status').returnsThis();
    //   AuthController.loadUser(req, res);
    //   res.status.should.have.callCount(1);
    //   done();
    // });
  });
});
