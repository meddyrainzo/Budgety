'use strict';

const Joi = require('@hapi/joi');
const IdSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = IdSchema;
