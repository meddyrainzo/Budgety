'use script';

const Joi = require('@hapi/joi');

const amountSchema = Joi.object({
  amount: Joi.number().required()
});

module.exports = amountSchema;
