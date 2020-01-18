'use strict';

const jwt = require('jsonwebtoken');

const BudgetError = require('../budget.error');
const logger = require('pino')();

const RefreshTokenService = function(repository) {
  this.addRefreshToken = async userId => {
    try {
      await repository.addRefreshToken(userId);
    } catch (err) {
      throw new BudgetError(err.statusCode, err.message);
    }
  };

  this.getRefreshToken = async token => {
    try {
      return await repository.getRefreshToken(token);
    } catch (err) {
      throw new BudgetError(err.statusCode, err.message);
    }
  };

  this.revokeRefreshToken = async (token, userId) => {
    try {
      await repository.revokeRefreshToken(token, userId);
    } catch (err) {
      throw new BudgetError(err.statusCode, err.message);
    }
  };

  this.createAccessToken = async token => {
    const refreshToken = await repository.getRefreshToken(token);
    if (!refreshToken) {
      const errorMessage = 'Refresh token not found';
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    if (refreshToken.isRevoked) {
      const errorMessage = 'Refresh token has been revoked';
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      const token = jwt.sign(
        { userId: refreshToken.userId },
        process.env.JWT_SECRET,
        {
          expiresIn: 3600
        }
      );
      return {
        token,
        userId: refreshToken.userId,
        refreshToken: refreshToken.token
      };
    } catch (err) {
      const errorMessage = 'Failed to create an access token';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };
};

module.exports = RefreshTokenService;
