'use strict';

const Joi = require('@hapi/joi');

const userSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(1)
    .max(100),
  email: Joi.string()
    .required()
    .pattern(new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.\\w{2,3}')),
  password: Joi.string()
    .required()
    .min(6)
});

module.exports = userSchema;
