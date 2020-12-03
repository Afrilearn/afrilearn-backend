import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sgMail from '@sendgrid/mail';
import sinon from 'sinon';
import app from '../index';
import Auth from '../db/models/users.model';
import Activation from '../db/models/accountActivation.model';
import ResetPassword from '../db/models/resetPassword.model';
import AuthController from '../controllers/auth.controller';
import Email from '../utils/email.utils';
import AuthService from '../services/auth.services';
import Helper from '../utils/user.utils';
import logger from '../config';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
const { expect } = chai;

let passcode;
let passwordToken;

const incompleteUser = {
  username: 'hackerbay',
  password: '24567/8',
};
const changePasswordInvalidCode = {
  email: 'okwuosachijioke1@gmail.com',
  password: '12345678',
  code: '34534543',
};
const user = {
  fullName: 'hackerbay',
  userName: 'jackson',
  email: 'okwuosachijioke1@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  country: '234',
  phoneNumber: '07037381011',
  dayOfBirth: '22',
  monthOfBirth: '08',
  yearOfBirth: '1990',
  role: '123',
};
const emailExist = {
  fullName: 'hackerbay',
  userName: 'mackson',
  email: 'okwuosachijioke1@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  country: '2344',
  phoneNumber: '08037381011',
  dayOfBirth: '22',
  monthOfBirth: '08',
  yearOfBirth: '1990',
  role: '123',
};
const usernameExist = {
  fullName: 'hackerbay',
  userName: 'jackson',
  email: 'okwuosachijioke91@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  country: '234',
  phoneNumber: '08037381011',
  dayOfBirth: '22',
  monthOfBirth: '08',
  yearOfBirth: '1990',
  role: '123',
};
const phoneExist = {
  fullName: 'hackerbay',
  userName: 'jacksojn',
  email: 'okwuosachij8ioke9@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  country: '234',
  phoneNumber: '07037381011',
  dayOfBirth: '22',
  monthOfBirth: '08',
  yearOfBirth: '1990',
  role: '123',
};
const invalidEmail = {
  email: 'hackerbay@gmail.com',
  passcode: '245678',
  password: '123456',
};
const wrongPasscode = {
  email: 'okwuosachijioke1@gmail.com',
  passcode: 'passcode',
  password: 'uuiyuiy',
};

let myToken;

before((done) => {
  Activation.deleteMany({ email: 'okwuosachijioke1@gmail.com' }, (err) => {
    if (err) {
      logger.error(err);
    } else {
      Auth.deleteOne({ email: 'okwuosachijioke1@gmail.com' }, (err) => {
        if (err) {
          logger.error(err);
        } else {
          done();
        }
      });
    }
  });
});

describe('No Matching Endpoint', () => {
  describe('* Unknown ', () => {
    it('should throw 404 error when endpoint is not found', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/none')
        .send(user)
        .end((err, res) => {
          res.should.have.status(404);
          done();
        });
    });
  });
});

describe('Auth Route Endpoints', () => {
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
          res.body.should.have.property('message');
          stub.restore();
          done();
        });
    });
    it('should not create account if the user supplies already exisiting email', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(emailExist)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('409 Conflict');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not create account if the user supplies already exisiting username', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(usernameExist)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('409 Conflict');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not create account if the user supplies already exisiting phone number', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/signup')
        .send(phoneExist)
        .end((err, res) => {
          res.should.have.status(409);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('409 Conflict');
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
      AuthController.signUp(req, res);
      res.status.should.have.callCount(0);
      done();
    });
  });
  describe('POST api/v1/auth/activate_account', () => {
    before((done) => {
      Activation.find(
        { email: 'okwuosachijioke1@gmail.com' },
        (err, myuser) => {
          if (myuser) {
            passcode = myuser[0].passcode;
            done();
          }
        }
      );
    });
    it('should not activate user account if the user supplies incomplete information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/activate_account')
        .send(incompleteUser)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should activate user account if the user supplies complete valid information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/activate_account')
        .send({
          email: 'okwuosachijioke1@gmail.com',
          passcode,
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('success');
          res.body.should.have.property('data');
          done();
        });
    });
    it('should not activate user account if the user email cannot be found', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/activate_account')
        .send(invalidEmail)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should not activate user account if the user supplies wrong passcode', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/activate_account')
        .send(wrongPasscode)
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
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
      AuthController.activateAccount(req, res);
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
    it('Should fake server error on usernameExist function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.usernameExist(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error on user id exisit function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.userIdExist(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error on googleIdExist function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.googleIdExist(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error on phoneExist function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.phoneExist(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake server error on matchCode function', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthService.matchCode(req, res);
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
    it('Should mock googleIdExist', (done) => {
      expect(AuthService.googleIdExist('reqBody', 'req'));
      done();
    });
    it('Should mock email', (done) => {
      expect(Email('gh'));
      done();
    });
  });
  describe('POST api/v1/auth/login', () => {
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
  describe('POST api/v1/auth/social_login', () => {
    it('should not login a user if the user supplies incomplete information', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/social_login')
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
        .post('/api/v1/auth/social_login')
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
    it('Should fake server error', (done) => {
      const req = { body: {} };
      const res = {
        status() {},
        send() {},
      };
      sinon.stub(res, 'status').returnsThis();
      AuthController.socialLogin(req, res);
      res.status.should.have.callCount(0);
      done();
    });
    it('Should fake social login', (done) => {
      sinon.stub(AuthController, 'socialLogin').callsFake(() => ({
        status: 'success',
        data: {},
      }));
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
        .get('/api/v1/auth/okwuosachijioke1@gmail.com/reset_password')
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
      AuthController.resetPassword(req, res);
      res.status.should.have.callCount(1);
      done();
    });
  });
  describe('POST api/v1/auth/change_password', () => {
    before((done) => {
      (async () => {
        await ResetPassword.find(
          { email: 'okwuosachijioke1@gmail.com' },
          (err, myuser) => {
            if (myuser) {
              passwordToken = myuser[0].token;
            }
          }
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
          email: 'okwuosachijioke1@gmail.com',
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
        { email: 'okwuosachijioke1@gmail.com' },
        { ...newData },
        (err, myuser) => {
          if (myuser) {
            done();
          }
        }
      );
    });
    it('should not verify token if is it expired', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/change_password')
        .send({
          email: 'okwuosachijioke1@gmail.com',
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
  describe('POST api/v1/auth/resend-verification', () => {
    it('should not resend verification code if email is not supplied', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/resend-verification')
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.should.have.property('status').eql('400 Invalid Request');
          res.body.should.have.property('error');
          done();
        });
    });
    it('should resend verification code if suppied data is complete', (done) => {
      chai
        .request(app)
        .post('/api/v1/auth/resend-verification')
        .send({
          email: 'okwuosachijioke1@gmail.com',
        })
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
      AuthController.resendVerificationCode(req, res);
      res.status.should.have.callCount(0);
      done();
    });
  });
  describe('GET api/v1/auth/load_user', () => {
    before((done) => {
      Auth.find({ email: 'okwuosachijioke1@gmail.com' }, (err, myuser) => {
        if (myuser) {
          (async () => {
            myToken = await Helper.generateToken(
              myuser[0].id,
              myuser[0].role,
              myuser[0].userName
            );
          })();
          done();
        }
      });
    });
    it('should not load a user if there is no token', (done) => {
      chai
        .request(app)
        .get('/api/v1/auth/load_user')
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
        .get('/api/v1/auth/load_user')
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
        .get('/api/v1/auth/load_user')
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
});
