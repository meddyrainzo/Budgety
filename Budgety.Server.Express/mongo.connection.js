'use strict';

const mongodb = require('mongodb');
const logger = require('pino')();

const MongoConnection = function(hostname, port, user, password) {
  const uri = 'mongodb://localhost:27017';
  this.client = new mongodb.MongoClient(uri, {
    auth: {
      user: 'meddy',
      password: 'password'
    },
    useUnifiedTopology: true,
    useNewUrlParser: true
  });
};

MongoConnection.prototype.connect = async function() {
  if (this.client.isConnected()) {
    return this.client;
  }
  try {
    logger.info('Connecting to mongodb');
    const result = await this.client.connect();
    logger.info('Successfully connected to mongo database');
    return result;
  } catch (err) {
    logger.error(`Failed to connect to mongo database :: ${err}`);
  }
};

MongoConnection.prototype.disconnect = function() {
  this.client
    .close(true)
    .then(() => logger.info('Successfully closed the mongodb connection'))
    .catch(err =>
      logger.error(`Error closing the mongodb connection :: ${err}`)
    );
};

module.exports = MongoConnection;
