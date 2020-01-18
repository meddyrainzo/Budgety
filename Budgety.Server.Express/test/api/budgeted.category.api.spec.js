'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const url = '/api/budgetedcategories';

const budgetedCategoryId = '5dea27853202215bdc80767f';
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

describe('Test creating a budget for categories', () => {
  it('should return 422 if invalid categoryName is sent', done => {
    const budgetedCategory = {
      categoryName: 1234,
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 2200
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetedCategory)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a string');
        done();
      });
  });

  it('should return 422 if invalid amount is sent', done => {
    const budgetedCategory = {
      categoryName: '1234',
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 'trash'
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetedCategory)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });

  it('should create a budget for a category successfully', done => {
    const budgetedCategory = {
      categoryName: 'Transportation',
      budgetPeriodId: '5dae27664330215bdc80778f',
      amount: 1234
    };

    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetedCategory)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('id');
        done();
      });
  });
});

describe('Test getting a paged list of budget expenses for given category', () => {
  const budgetedCategoryId = '5dea27853202215bdc80767f';
  it('should give an error with 422 status code if an invalid value is given for currentPage query parameter', done => {
    chai
      .request(server)
      .get(`${url}/${budgetedCategoryId}/expenses?currentPage=trash`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });
  it('should give an error with 422 status code if an invalid value is given for resultsPerPage query parameter', done => {
    chai
      .request(server)
      .get(`${url}/${budgetedCategoryId}/expenses?resultsPerPage=trash`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });
  it('should return a paged list with currentPage = 0 and resultsPerPage <= 10 if they are not set', done => {
    chai
      .request(server)
      .get(`${url}/${budgetedCategoryId}/expenses`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.have.property('currentPage');
        res.body.result.should.have.property('totalResults');
        res.body.result.currentPage.should.eq(1);
        res.body.result.totalResults.should.lt(10);
        done();
      });
  });
  it('should return a paged list of results when valid current page and/or resultsPerPage is set', done => {
    const urlWithQuery = `${url}/${budgetedCategoryId}/expenses?currentPage=0&resultsPerPage=10`;
    chai
      .request(server)
      .get(urlWithQuery)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.have.property('currentPage');
        res.body.result.should.have.property('totalResults');
        res.body.result.currentPage.should.be.gt(0);
        res.body.result.totalResults.should.be.gt(0);
        done();
      });
  });
});

describe('Test getting a budgeted category by id', () => {
  it('should return a 404 if budgeted category not found', done => {
    chai
      .request(server)
      .get(`${url}/5dae58764552512bdc80776f`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain("doesn't exist");
        done();
      });
  });
  it('should return a budgeted category successfully', done => {
    chai
      .request(server)
      .get(`${url}/${budgetedCategoryId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('budgetedCategory');
        res.body.budgetedCategory.should.have.property('id');
        res.body.budgetedCategory.should.have.property('name');
        res.body.budgetedCategory.should.have.property('amount');
        done();
      });
  });
});

describe('Test changing the spendable amount of the budgeted category', () => {
  it('should return 422 if the amount is invalid', done => {
    chai
      .request(server)
      .patch(`${url}/${budgetedCategoryId}/changeamount`)
      .set('x-auth-token', token)
      .send({ amount: 'trash' })
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });

  it('should update the amount successfully', done => {
    chai
      .request(server)
      .patch(`${url}/${budgetedCategoryId}/changeamount`)
      .set('x-auth-token', token)
      .send({ amount: 1234 })
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
