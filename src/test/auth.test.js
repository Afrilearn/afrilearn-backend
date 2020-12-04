import chai from 'chai';
import chaiHttp from 'chai-http';
import Sinonchai from 'sinon-chai';
// import sinon from 'sinon';
import app from '../index';
// import logger from '../config';

chai.should();
chai.use(Sinonchai);
chai.use(chaiHttp);
// const { expect } = chai;

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
