'use strict';

const chai = require('chai');
const should = chai.should();

const BudgetError = require('../../budget.error');
const MonthYearToUnixTimeConverter = require('../../utils/month.year.to.unix.time.converter');

describe('Month year to unix time converter test', () => {
  it('should convert a month year format to a unix time successfully', () => {
    const monthYear = 'January - 2010';
    const converter = new MonthYearToUnixTimeConverter(monthYear);

    const unixTime = converter.convert();

    const expected = 1262300400;

    chai.assert(expected.should.eq(unixTime));
  });

  it('should default the month to January when the first 3 letters of the month is invalid', () => {
    const invalidMonth = 'Travember - 2010';
    const converter = new MonthYearToUnixTimeConverter(invalidMonth);
    const unixTime = converter.convert();

    const expected = 1262300400;

    chai.assert(expected.should.eq(unixTime));
  });

  it('should use the first 3 letters to determine the month if the other letters form an invalid month', () => {
    const invalidMonth = 'Julember - 2010';
    const converter = new MonthYearToUnixTimeConverter(invalidMonth);
    const unixTime = converter.convert();

    const expected = 1277938800; // July -

    chai.assert(expected.should.eq(unixTime));
  });

  it('should throw an error when invalid date is given', () => {
    const invalidYear = 'January - Trash';
    const converter = new MonthYearToUnixTimeConverter(invalidYear);

    chai
      .expect(converter.convert.bind(converter))
      .to.throw('Provided invalid month - year');
  });
});
