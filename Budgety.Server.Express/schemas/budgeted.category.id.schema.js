'use strict';

const Joi = require('@hapi/joi');
const budgetedCategoryIdSchema = Joi.object({
  budgetedCategoryId: Joi.string().required()
});

module.exports = budgetedCategoryIdSchema;
