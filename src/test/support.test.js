import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import app from '../index';
import SupportRequestController from '../controllers/support.controller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('SUpport ', () => {
  it('should create a supportRequest with status 200', (done) => {
    chai
      .request(app)
      .post('/api/v1/supports/add-support')
      .send({
        email: 'Ayobamiu@gmail.com',
        subject: 'Testing Support Request',
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget commodo libero. Fusce consectetur iaculis diam, sed semper odio elementum ac. Curabitur quis euismod nibh',
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
        res.body.should.have.property('data');
        res.body.data.should.have.property('supportRequest');
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

    SupportRequestController.addSupportRequest(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
