'use strict';

const BudgetedCategory = function(
  userId,
  budgetPeriodId,
  categoryName,
  amount
) {
  this.userId = userId;
  this.budgetPeriodId = budgetPeriodId;
  this.categoryName = categoryName;
  this.amount = amount;
};

module.exports = BudgetedCategory;
