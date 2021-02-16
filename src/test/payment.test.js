import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from '../index';
import Transaction from '../db/models/transaction.model';
import PaymentPlan from '../db/models/paymentPlans.model';
import EnrolledCourse from '../db/models/enrolledCourses.model';
import PaymentController from '../controllers/payment.controller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;
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
describe('Past Questions ', () => {
  const pay_plan_id = new mongoose.mongo.ObjectId();
  const en_course_id = new mongoose.mongo.ObjectId();
  const ref = {
    tx_ref: 'Links-6166264146297',
    enrolledCourseId: en_course_id,
    paymentPlanId: pay_plan_id,
  };
  const refReq = {
    event: 'charge.completed',
    data: {
      id: 285959875,
      tx_ref: 'Links-6166264146297',
      flw_ref: 'PeterEkene/FLW270177170',
      device_fingerprint: 'a42937f4a73ce8bb8b8df14e63a2df31',
      amount: 100,
      currency: 'NGN',
      charged_amount: 100,
      app_fee: 1.4,
      merchant_fee: 0,
      processor_response: 'Approved by Financial Institution',
      auth_model: 'PIN',
      ip: '197.210.64.96',
      narration: 'CARD Transaction ',
      status: 'successful',
      payment_type: 'card',
      created_at: '2020-07-06T19:17:04.000Z',
      account_id: 17321,
      customer: {
        id: 215604089,
        name: 'Yemi Desola',
        phone_number: null,
        email: 'user@gmail.com',
        created_at: '2020-07-06T19:17:04.000Z',
      },
      card: {
        first_6digits: '123456',
        last_4digits: '7889',
        issuer: 'VERVE FIRST CITY MONUMENT BANK PLC',
        country: 'NG',
        type: 'VERVE',
        expiry: '02/23',
      },
    },
  };
  const failedPaymentRefReq = {
    event: 'charge.completed',
    data: {
      id: 285959875,
      tx_ref: 'Links-6166264146297999',
      flw_ref: 'PeterEkene/FLW270177170',
      device_fingerprint: 'a42937f4a73ce8bb8b8df14e63a2df31',
      amount: 100,
      currency: 'NGN',
      charged_amount: 100,
      app_fee: 1.4,
      merchant_fee: 0,
      processor_response: 'Approved by Financial Institution',
      auth_model: 'PIN',
      ip: '197.210.64.96',
      narration: 'CARD Transaction ',
      status: 'successful',
      payment_type: 'card',
      created_at: '2020-07-06T19:17:04.000Z',
      account_id: 17321,
      customer: {
        id: 215604089,
        name: 'Yemi Desola',
        phone_number: null,
        email: 'user@gmail.com',
        created_at: '2020-07-06T19:17:04.000Z',
      },
      card: {
        first_6digits: '123456',
        last_4digits: '7889',
        issuer: 'VERVE FIRST CITY MONUMENT BANK PLC',
        country: 'NG',
        type: 'VERVE',
        expiry: '02/23',
      },
    },
  };
  const unSuccesfulRefReq = {
    event: 'charge.completed',
    data: {
      id: 285959875,
      tx_ref: 'Links-6166264146297',
      flw_ref: 'PeterEkene/FLW270177170',
      device_fingerprint: 'a42937f4a73ce8bb8b8df14e63a2df31',
      amount: 100,
      currency: 'NGN',
      charged_amount: 100,
      app_fee: 1.4,
      merchant_fee: 0,
      processor_response: 'Approved by Financial Institution',
      auth_model: 'PIN',
      ip: '197.210.64.96',
      narration: 'CARD Transaction ',
      status: 'FAILED',
      payment_type: 'card',
      created_at: '2020-07-06T19:17:04.000Z',
      account_id: 17321,
      customer: {
        id: 215604089,
        name: 'Yemi Desola',
        phone_number: null,
        email: 'user@gmail.com',
        created_at: '2020-07-06T19:17:04.000Z',
      },
      card: {
        first_6digits: '123456',
        last_4digits: '7889',
        issuer: 'VERVE FIRST CITY MONUMENT BANK PLC',
        country: 'NG',
        type: 'VERVE',
        expiry: '02/23',
      },
    },
  };

  //   const subject_id = new mongoose.mongo.ObjectId();
  //   before(async () => {
  //     await Subject.create({
  //       _id: subject_id,
  //       mainSubjectId: main_subject_id,
  //       courseId: course_id,
  //     });
  //   });
  //   after(async () => {
  //     await Subject.findByIdAndDelete(subject_id);
  //   });
  before(async () => {
    await Transaction.create(ref);
    await PaymentPlan.create({
      _id: pay_plan_id,
      duration: 3,
    });
    await EnrolledCourse.create({ _id: en_course_id });
  });
  // it('should update enrolled course if payment is succesful with status 200', (done) => {
  //   chai
  //     .request(app)
  //     .post('/api/v1/payments/verify-payment')
  //     .send(refReq)
  //     .set('verif-hash', 'afrilearnofafrica')
  //     .end((err, res) => {
  //       res.should.have.status(200);
  //       res.body.should.be.an('object');
  //       res.body.should.have.property('status').eql('success');
  //       res.body.should.have.property('enrolledCourse');
  //       done();
  //     });
  // });

  it('should NOT update enrolled course if payment FAILED with status 500', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/verify-payment')
      .send(unSuccesfulRefReq)
      .set('verif-hash', 'afrilearnofafrica')
      .end((err, res) => {
        res.should.have.status(500);
        done();
      });
  });

  it('should NOT update enrolled course if payment ref is not found', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/verify-payment')
      .send(failedPaymentRefReq)
      .set('verif-hash', 'afrilearnofafrica')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('should NOT update enrolled course if verif-hash is not found', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/verify-payment')
      .send(failedPaymentRefReq)
      .end((err, res) => {
        res.should.have.status(401);
        done();
      });
  });

  it('should NOT update enrolled course if verif-hash is not match', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/verify-payment')
      .send(failedPaymentRefReq)
      .set('verif-hash', 'afrilearn')
      .end((err, res) => {
        res.should.have.status(404);
        done();
      });
  });

  it('should return list of Student payment plans with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/payments/plans')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('paymentPlans');
        done();
      });
  });

  it('should add a transaction with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/add-transaction')
      .set('token', token)
      .send({
        tx_ref: 'Links-616626414629',
        amount: 200,
        userId: '5ffdabf46d55210251b1a738',
        paymentPlanId: '5fc90039d4c5950e84f72ab0',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('transaction');
        done();
      });
  });

  it('should add a transaction with status 200 when courseId is sent', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/add-transaction')
      .set('token', token)
      .send({
        tx_ref: 'Links-616626414629',
        amount: 200,
        userId: '5ffdabf46d55210251b1a738',
        paymentPlanId: '5fc90039d4c5950e84f72ab0',
        courseId: '5fc90039d4c5950e84f72ab0',
      })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('transaction');
        done();
      });
  });

  it('should NOT add a transaction when input is invalid', (done) => {
    chai
      .request(app)
      .post('/api/v1/payments/add-transaction')
      .set('token', token)
      .send({
        tx_ref: 'Links-616626414629',
        amount: 200,
        userId: '2',
        paymentPlanId: '5fc90039d4c5950e84f72ab0',
      })
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

    PaymentController.addTransaction(req, res);
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

    PaymentController.verifyPayment(req, res);
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

    PaymentController.getPaymentPlans(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
