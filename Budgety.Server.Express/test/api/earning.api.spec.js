'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const url = '/api/earnings';

const earningId = '5e1fa8397ffd0d6390f50679';
const loginUrl = '/api/users/login';

let token;

chai.use(chaiHttp);

before(done => {
  server.on('listening', () => {
    // Login
    chai
      .request(server)
      .post(loginUrl)
      .send({ email: 'randy@savage.com', password: 'RandySavage' })
      .end((err, res) => {
        token = res.get('x-auth-token');
        done();
      });
  });
});

// Test getting earning
describe('Test getting an earning by id', () => {
  it('should return a 404 if earning not found', done => {
    chai
      .request(server)
      .get(`${url}/5dae58764552512bdc80776f`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('No earning found');
        done();
      });
  });
  it('should return an earning successfully', done => {
    chai
      .request(server)
      .get(`${url}/${earningId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('earning');
        res.body.earning.should.have.property('id');
        res.body.earning.should.have.property('name');
        res.body.earning.should.have.property('amount');
        done();
      });
  });
});

// Test creating earning
describe('Test creating an earning', () => {
  it('should return 422 if invalid name is sent', done => {
    const earning = {
      budgetedCategoryId: '5dae58764552512bdc80776f',
      name: 1234,
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 2200
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(earning)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a string');
        done();
      });
  });

  it('should return 422 if invalid amount is sent', done => {
    const earning = {
      budgetedCategoryId: '5dae58764552512bdc80776f',
      name: 'TGIF',
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 'trash'
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(earning)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });

  it('should create a budget for a category successfully', done => {
    const earning = {
      budgetedCategoryId: '5e1fa8397ffd0d6390f50679',
      name: 'TGIF',
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 2200
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(earning)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('id');
        done();
      });
  });
});

// Test updating name
describe('Test updating the name of the earning', () => {
  it('should throw a 422 if the name is invalid', done => {
    chai
      .request(server)
      .patch(`${url}/${earningId}/changename`)
      .set('x-auth-token', token)
      .send({ name: 1234 })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a string');
        done();
      });
  });

  it('Should successfully change the name of the earning', done => {
    chai
      .request(server)
      .patch(`${url}/${earningId}/changename`)
      .set('x-auth-token', token)
      .send({ name: 'Budapest' })
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});

// Test updating amount
describe('Test updating the amount of the earning', () => {
  it('should throw a 422 if the name is invalid', done => {
    chai
      .request(server)
      .patch(`${url}/${earningId}/changeamount`)
      .set('x-auth-token', token)
      .send({ amount: 'trash' })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });
  it('Should successfully change the amount of the earning', done => {
    chai
      .request(server)
      .patch(`${url}/${earningId}/changeamount`)
      .set('x-auth-token', token)
      .send({ amount: 220 })
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});

// Test updating category
describe('Test updating the category of the earning', () => {
  // Once auth middleware is sorted, add more tests
  it('Should successfully change the name of the earning', done => {
    chai
      .request(server)
      .patch(`${url}/${earningId}/changecategory`)
      .set('x-auth-token', token)
      .send({ budgetedCategoryId: '5e1fa8397ffd0d6390f50679' })
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
