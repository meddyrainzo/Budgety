'use strict';

const Joi = require('@hapi/joi');

const userSchema = Joi.object({
  email: Joi.string()
    .required()
    .pattern(new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\\.\\w{2,3}')),
  password: Joi.string().required()
});

module.exports = userSchema;
