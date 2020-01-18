'use strict';

const Joi = require('@hapi/joi');
const userIdSchema = Joi.object({
  userId: Joi.string().required()
});

module.exports = userIdSchema;
