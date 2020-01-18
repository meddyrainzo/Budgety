'use strict';

const logger = require('pino')();
const BudgetError = require('../budget.error');

const MonthYearToUnixTimeConverter = function(monthYear) {
  this.monthYear = monthYear;
};

MonthYearToUnixTimeConverter.prototype.convert = function() {
  const monthYearSplit = this.monthYear.split('-');
  const month = monthYearSplit[0];
  const year = monthYearSplit[1];
  const date = new Date(`${month} ${year}`);
  const timeString = date.getTime() / 1000;
  if (timeString !== timeString) {
    logger.error(`Provided invalid month - year ${this.monthYear}`);
    throw new BudgetError(400, 'Provided invalid month - year');
  }

  const unixTime = parseInt(timeString.toFixed(0));
  return unixTime;
};

module.exports = MonthYearToUnixTimeConverter;
