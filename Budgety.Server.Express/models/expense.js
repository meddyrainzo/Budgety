'use strict';

const Expense = function(
  userId,
  budgetPeriodId,
  budgetedCategoryId,
  name,
  amount
) {
  this.userId = userId;
  this.budgetPeriodId = budgetPeriodId;
  this.budgetedCategoryId = budgetedCategoryId;
  this.name = name;
  this.amount = amount;
};

module.exports = Expense;
