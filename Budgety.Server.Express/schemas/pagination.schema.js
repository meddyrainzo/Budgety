'use strict';

const Joi = require('@hapi/joi');

const paginationSchema = Joi.object({
  currentPage: Joi.number().optional(),
  resultsPerPage: Joi.number().optional()
});

module.exports = paginationSchema;
