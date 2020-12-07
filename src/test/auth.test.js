import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import sgMail from '@sendgrid/mail';
import app from '../index';
import AuthController from '../controllers/auth.controller';
import Email from '../utils/email.utils';
import AuthService from '../services/auth.services';
import Helper from '../utils/user.utils';
import Auth from '../db/models/users.model';
import ResetPassword from '../db/models/resetPassword.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
const { expect } = chai;

const incompleteUser = {
  email: 'hackerbay888@gmail.com',
};
const invalidEmail = {
  email: 'hackerbay888@gmail.com',
  password: '86789789',
};
const user = {
  fullName: 'hackerbay',
  userName: 'jackson',
  email: 'okwuosachijioke56687@gmail.com',
  password: '123456',
  confirmPassword: '123456',
  gender: 'male',
  role: '5fc8f4b99d1e3023e4942152',
};
const wrongPasscode = {
  email: 'okwuosachijioke56687@gmail.com',
  password: '1234560',
};
const changePasswordInvalidCode = {
  email: 'okwuosachijioke56687@gmail.com',
  password: '12345678',
  code: '34534543',
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
        .get('/api/v1/auth/activate_account?token=57576576thfcgfnfhfghfghfngfdtrd')
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
});
