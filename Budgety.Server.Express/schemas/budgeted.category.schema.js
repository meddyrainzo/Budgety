'use strict';

const Joi = require('@hapi/joi');

const BudgetCategorySchema = Joi.object({
  budgetPeriodId: Joi.string().required(),
  categoryName: Joi.string().required(),
  amount: Joi.number().required()
});

module.exports = BudgetCategorySchema;
