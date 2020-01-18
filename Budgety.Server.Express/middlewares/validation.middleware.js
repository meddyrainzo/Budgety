'use strict';

const Joi = require('@hapi/joi');
const logger = require('pino')();

const validationMiddleware = (schema, property) => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property]);
    if (!error) {
      next();
    } else {
      logger.error(`${error}`);
      const errorMessage = error.details
        .map(detail => detail.message.replace(/"/g, "'"))
        .join(',');
      res.status(422).json({ errorMessage });
    }
  };
};

module.exports = validationMiddleware;
