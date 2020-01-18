'use strict';

const logger = require('pino')();
const BudgetError = require('../budget.error');

const RefreshToken = function(token, userId, email) {
  this.token = token;
  this.userId = userId;
  this.email = email;
  this.isRevoked = false;
  // TODO: Add a revoked time
};

RefreshToken.prototype.revokeToken = function() {
  if (this.isRevoked) {
    const errorMessage = `Token has already been revoked`;
    logger.error(errorMessage);
    throw new BudgetError(400, errorMessage);
  }
  this.isRevoked = true;
};

module.exports = RefreshToken;
