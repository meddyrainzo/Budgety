'use strict';

const Joi = require('@hapi/joi');
const CategorySchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(50)
});

module.exports = CategorySchema;
