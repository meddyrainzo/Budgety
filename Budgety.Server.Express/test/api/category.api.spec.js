'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const server = require('../../server');
const url = '/api/categories';

chai.use(chaiHttp);

before(done => {
  server.on('listening', () => done());
});

describe('Test creating a category', () => {
  it('should throw a 422 error when invalid data is sent', done => {
    const category = { name: 1234 };
    chai
      .request(server)
      .post(url)
      .send(category)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a string');
        done();
      });
  });
  it('should return 422 when name is too short', done => {
    const category = { name: 'a' };
    chai
      .request(server)
      .post(url)
      .send(category)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'length must be at least 2 characters'
        );
        done();
      });
  });
  it('should return 422 when name is too long', done => {
    const category = {
      name: 'this should be more than fifty characters long to fail'
    };
    chai
      .request(server)
      .post(url)
      .send(category)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'length must be less than or equal to 50 characters long'
        );
        done();
      });
  });
  it('should throw a 422 when nothing is sent in the body', done => {
    chai
      .request(server)
      .post(url)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('is required');
        done();
      });
  });
  it('should create a category successfully', done => {
    chai
      .request(server)
      .post(url)
      .send({ name: 'Pets' })
      .end((err, res) => {
        res.should.have.status(201);
        res.body.should.have.property('id');
        done();
      });
  });
});

describe('Test getting category by id', () => {
  it('should throw a 400 error if invalid id is sent', done => {
    // THE ID IS NEVER CREATED. IT IS ALWAYS AN OBJECT ID
    // IN THIS CASE, A 12 BTE STRING OR 24 HEX CHARACTER IS A VALID ID
    chai
      .request(server)
      .get(`${url}/1234`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('Failed to retrieve category');
        done();
      });
  });
  it('should return 404 if no category found with the id', done => {
    chai
      .request(server)
      .get(`${url}/5dae28753220215bdc80788f`)
      .end((err, res) => {
        res.should.have.status(404);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain("doesn't exist");
        done();
      });
  });
  it('should return the category successfully when the right id is sent', done => {
    const categoryId = '5dae28753220215bdc80776f';
    chai
      .request(server)
      .get(`${url}/${categoryId}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('category');
        res.body.category.should.have.property('id');
        res.body.category.id.should.contain(`${categoryId}`);
        done();
      });
  });
});

describe('Test getting a list of categories', () => {
  it('should successfully get a list of categories', done => {
    chai
      .request(server)
      .get(`${url}`)
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('categories');
        res.body.categories.length.should.be.gt(0);
        done();
      });
  });
});

describe('Test changing a category name', () => {
  const categoryId = '5dae28753220215bdc80776f';
  const patchUrl = `${url}/${categoryId}`;
  it('should return 422 when a name is not a string', done => {
    const name = { name: 1234 };
    chai
      .request(server)
      .patch(patchUrl)
      .send(name)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain('must be a string');
        done();
      });
  });
  it('should return 422 when name is too short', done => {
    const name = { name: 'a' };
    chai
      .request(server)
      .patch(patchUrl)
      .send(name)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'length must be at least 2 characters'
        );
        done();
      });
  });
  it('should return 422 when name is too long', done => {
    const name = {
      name: 'this should be more than fifty characters long to fail'
    };
    chai
      .request(server)
      .patch(patchUrl)
      .send(name)
      .end((err, res) => {
        res.should.have.status(422);
        res.body.should.have.property('errorMessage');
        res.body.errorMessage.should.contain(
          'length must be less than or equal to 50 characters long'
        );
        done();
      });
  });
  it('should successfully change the name of a  category', done => {
    const name = { name: 'Travels & tourism' };
    chai
      .request(server)
      .patch(patchUrl)
      .send(name)
      .end((err, res) => {
        res.should.have.status(204);
        done();
      });
  });
});
