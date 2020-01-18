'use script';

const Joi = require('@hapi/joi');

const nameSchema = Joi.object({
  name: Joi.string().required()
});

module.exports = nameSchema;
