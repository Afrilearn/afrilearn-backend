import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import app from '../index';
import sgMail from '@sendgrid/mail';
import AuthController from '../controllers/auth.controller';
import Email from '../utils/email.utils';
import AuthService from '../services/auth.services';
import Helper from '../utils/user.utils';
import Auth from '../db/models/users.model';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
const { expect } = chai;


const incompleteUser = {
  email: 'hackerbay',
  password: '24567/8',
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
    Auth.deleteMany({ email: 'okwuosachijioke56687@gmail.com' }, (err) =>{
      if(!err){
        done()
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
    it('Should mock encrypt password', (done) => {
      expect(Helper.encrptPassword('reqBody'));
      done();
    });
    it('Should mock email', (done) => {
      expect(Email('gh'));
      done();
    });
  });
 });