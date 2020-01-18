'use strict';

const BudgetError = function(statusCode, message) {
  var instance = new Error(message);
  instance.name = 'BudgetError';
  instance.statusCode = statusCode;
  Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
  if (Error.captureStackTrace) {
    Error.captureStackTrace(instance, BudgetError);
  }
  return instance;
};
BudgetError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: Error,
    enumerable: false,
    writable: true,
    configurable: true
  }
});

if (Object.setPrototypeOf) {
  Object.setPrototypeOf(BudgetError, Error);
} else {
  BudgetError.__proto__ = Error;
}

module.exports = BudgetError;
