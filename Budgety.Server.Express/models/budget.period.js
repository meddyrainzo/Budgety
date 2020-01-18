'use strict';

const Status = require('./budget.period.status');

const BudgetPeriod = function(userId, date) {
  this.userId = userId;
  this.date = date;
  this.status = Status.PENDING;
};

module.exports = BudgetPeriod;
