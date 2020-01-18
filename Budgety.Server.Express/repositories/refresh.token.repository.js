'use strict';

const logger = require('pino')();
const ObjectId = require('mongodb').ObjectID;
const randomToken = require('rand-token');

const RefreshToken = require('../models/refresh.token');
const BudgetError = require('../budget.error');

const RefreshTokenRepository = function(db) {
  const collection = db.collection('refreshTokens');

  this.getRefreshToken = async token => {
    try {
      const refreshToken = await collection.findOne({ token });
      logger.info('Successfully retrieve refresh token');
      const { userId, email } = refreshToken;
      return new RefreshToken(refreshToken.token, userId, email);
    } catch (err) {
      const errorMessage = 'Error retrieving the refresh token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  this.getRefreshTokenById = async id => {
    try {
      const refreshToken = await collection.findOne({ _id: ObjectId(id) });
      logger.info('Successfully retrieve refresh token');
      const { token, userId, email } = refreshToken;
      return new RefreshToken(token, userId, email);
    } catch (err) {
      const errorMessage = 'Error retrieving the refresh token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const getRefreshTokenByUserEmail = async email => {
    try {
      const refreshToken = await collection.findOne({ email });
      logger.info('Successfully retrieve refresh token');
      const { token, userId } = refreshToken;
      return refreshToken;
    } catch (err) {
      const errorMessage = 'Error retrieving the refresh token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  this.addRefreshToken = async (userId, email) => {
    const alreadyExists = await getRefreshTokenByUserEmail(email);
    if (alreadyExists) {
      return alreadyExists._id;
    }
    try {
      const token = randomToken.uid(128);
      const refreshToken = new RefreshToken(token, userId, email);
      const result = await collection.insertOne(refreshToken);
      logger.info('Successfully added refresh token');
      return result.insertedId;
    } catch (err) {
      const errorMessage = 'Error adding the refresh token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  this.revokeRefreshToken = async (token, userId) => {
    try {
      const refreshToken = new RefreshToken(token, userId);
      refreshToken.revokeToken();
      await collection.replaceOne({ token }, refreshToken);
      logger.info('Successfully revoked refresh token');
    } catch (err) {
      const errorMessage = 'Error revoking the refresh token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };
};

module.exports = RefreshTokenRepository;
