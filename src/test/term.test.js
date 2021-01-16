import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
import sinon from 'sinon';
import app from '../index';
import TermController from '../controllers/term.countroller';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

describe('Terms ', () => {
  it('should return an object containing terms with status 200', (done) => {
    chai
      .request(app)
      .get('/api/v1/terms')
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.should.have.property('status').eql('success');
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

    TermController.getAllTerms(req, res);
    res.status.should.have.callCount(0);
    done();
  });
});
