'use strict';

const Joi = require('@hapi/joi');

const earningSchema = Joi.object({
  budgetPeriodId: Joi.string().required(),
  budgetedCategoryId: Joi.string().required(),
  name: Joi.string().required(),
  amount: Joi.number().required()
});

module.exports = earningSchema;
