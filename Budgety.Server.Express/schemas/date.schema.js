'use strict';

const Joi = require('@hapi/joi');

const dateSchema = Joi.object({
  date: Joi.string()
    .required()
    .pattern(new RegExp('[a-zA-Z]+-\\d{4}'))
});

module.exports = dateSchema;
