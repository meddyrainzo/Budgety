'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../server');
const should = chai.should();
const url = '/api/budgetperiods';
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

describe('Test the creation of budget periods', () => {
  it('should throw an error with 422 status code when the req.body contains invalid date', done => {
    const budgetPeriod = {
      date: 'Trash - trash'
    };
    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetPeriod)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'fails to match the required pattern'
        );
        done();
      });
  });

  it("should throw an error with 422 status code when req.body doesn't contain the date", done => {
    const budgetPeriod = {};
    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetPeriod)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('required');
        done();
      });
  });

  it('should successfully create a budget period if all values are correct', done => {
    const budgetPeriod = {
      date: 'January-2020'
    };
    chai
      .request(server)
      .post(url)
      .set('x-auth-token', token)
      .send(budgetPeriod)
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('id');
        done();
      });
  });
});

describe('Test getting user budget period by id', () => {
  it('should give an error with 404 if bad id is sent', done => {
    chai
      .request(server)
      .get(`${url}/1234`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('Failed to retrieve budget');
        done();
      });
  });

  it('should return 404 if no budget period found for that id', done => {
    const budgetPeriodId = '5e110890ecb07c72cabde29e';
    chai
      .request(server)
      .get(`${url}/${budgetPeriodId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('No budget period with given id');
        done();
      });
  });

  it('should successfully retrieve the budget period', done => {
    const budgetPeriodId = '5dae27664330215bdc80776f';
    chai
      .request(server)
      .get(`${url}/${budgetPeriodId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('budget');
        res.body.budget.should.have.property('id');
        done();
      });
  });
});

describe('Test getting categories for this budget period', () => {
  const budgetPeriodId = '5dae27664330215bdc80776f';
  it('should return 400 if bad budget id is sent', () => {
    chai
      .request(server)
      .get(`${url}/1234/budgetedcategories`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'Failed to get budgeted categories'
        );
        done();
      });
  });

  it("should return an empty array if budget period doesn't exist", () => {
    const nonExistentbudgetPeriodId = '5dae27664330215bdc80775q';
    chai
      .request(server)
      .get(`${url}/${nonExistentbudgetPeriodId}/budgetedcategories`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('categories');
        res.body.categories.length.should.eq(0);
        done();
      });
  });

  it('should get the budgeted categories successfully', () => {
    chai
      .request(server)
      .get(`${url}/${budgetPeriodId}/budgetedcategories`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('categories');
        res.body.categories.length.should.be.gt(0);
        done();
      });
  });
});

describe('Test getting a paged list of budget expenses for given period', () => {
  const budgetPeriodId = '5dae27664330215bdc80776f';
  it('should give an error with 422 status code if an invalid value is given for currentPage query parameter', done => {
    chai
      .request(server)
      .get(`${url}/${budgetPeriodId}/expenses?currentPage=trash`)
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
      .get(`${url}/${budgetPeriodId}/expenses?resultsPerPage=trash`)
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
      .get(`${url}/${budgetPeriodId}/expenses`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.have.property('currentPage');
        res.body.result.should.have.property('totalResults');
        res.body.result.currentPage.should.gt(0);
        res.body.result.totalResults.should.lt(10);
        done();
      });
  });
  it('should return a paged list of results when valid current page and/or resultsPerPage is set', done => {
    const urlWithQuery = `${url}/${budgetPeriodId}/expenses?currentPage=0&resultsPerPage=10`;
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

describe('Test getting a paged list of budget periods', () => {
  it('should give an error with 422 status code if an invalid value is given for currentPage query parameter', done => {
    chai
      .request(server)
      .get(`${url}?currentPage=trash`)
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
      .get(`${url}?resultsPerPage=trash`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a number');
        done();
      });
  });
  it('should return a paged list with currentPage = 1 and resultsPerPage <= 10 if they are not set', done => {
    chai
      .request(server)
      .get(url)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('result');
        res.body.result.should.have.property('currentPage');
        res.body.result.should.have.property('totalResults');
        res.body.result.currentPage.should.be.eq(1);
        res.body.result.totalResults.should.be.lt(10);
        done();
      });
  });
  it('should return a paged list of results when valid current page and/or resultsPerPage is set', done => {
    const urlWithQuery = `${url}?currentPage=0&resultsPerPage=10`;
    chai
      .request(server)
      .get(urlWithQuery)
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
});

describe('Testing activation of budget periods', () => {
  const budgetPeriodId = '5dae27664330215bdc80776f';
  it('should give an error with 400 status code if invalid budgetPeriodId is given', () => {
    chai
      .request(server)
      .get(`${url}/activate/1234`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('Failed to retrieve budget');
        done();
      });
  });
  it('should successfully activate a budget period', () => {
    chai
      .request(server)
      .patch(`${url}/activate/${budgetPeriodId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});

describe('Testing deactivation of budget periods', () => {
  const budgetPeriodId = '5dae27664330215bdc80776f';
  it('should give an error with 400 status code if invalid budgetPeriodId is given', () => {
    chai
      .request(server)
      .get(`${url}/deactivate/1234`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(400);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('Failed to retrieve budget');
        done();
      });
  });
  it('should successfully deactivate a budget period', () => {
    chai
      .request(server)
      .patch(`${url}/deactivate/${budgetPeriodId}`)
      .set('x-auth-token', token)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
