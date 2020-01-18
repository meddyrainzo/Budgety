'use strict';

const logger = require('pino')();
const mongo = require('mongodb');
const ObjectId = mongo.ObjectID;
const BudgetPeriod = require('../models/budget.period');
const BudgetPeriodDto = require('../dtos/budget.period.dto');
const Status = require('../models/budget.period.status');
const BudgetError = require('../budget.error');
const PagedResult = require('../models/paged.result');
const MonthYearToUnixTimeConverter = require('../utils/month.year.to.unix.time.converter');

const BudgetPeriodRepository = function(db, mediator) {
  const collection = db.collection('budgetPeriods');

  // Get collection count
  const getUserBudgetPeriodsCount = async userId => {
    try {
      const budgetPeriodCount = await collection.countDocuments({ userId });
      return budgetPeriodCount;
    } catch (err) {
      logger.error(`Error in checking the budget period count :: ${err}`);
      throw new BudgetError(400, 'Error retrieving the budget periods');
    }
  };

  // Get a budget period
  this.retrieveBudgetPeriodById = async (userId, budgetPeriodId) => {
    const budgetPeriod = await findBudgetPeriodById(userId, budgetPeriodId);
    if (!budgetPeriod) {
      const errorMessage = 'No budget period with given id';
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    logger.info('Successfully found budget period');
    const { _id, date, status } = budgetPeriod;
    return new BudgetPeriodDto(_id, date, status);
  };

  // Get a list of budget periods
  this.getBudgetPeriods = async (
    userId,
    currentPage = 0,
    resultsPerPage = 10
  ) => {
    const skip = currentPage * resultsPerPage;
    const totalBudgets = await getUserBudgetPeriodsCount(userId);
    try {
      const budgetPeriods = await collection
        .find({ userId })
        .skip(parseInt(skip))
        .limit(parseInt(resultsPerPage))
        .toArray();
      const budgetPeriodDtos = budgetPeriods.map(budget => {
        const { _id, date, status } = budget;
        return new BudgetPeriodDto(_id, date, status);
      });
      const newCurrentPage = currentPage + 1;
      const pagedResults = new PagedResult(
        newCurrentPage,
        resultsPerPage,
        budgetPeriodDtos,
        totalBudgets
      );
      logger.info('Successfully retrieved the budget periods');
      return pagedResults;
    } catch (err) {
      const errorMessage = 'Error retrieving the list of budgets';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Create a budget period
  this.registerBudgetPeriod = async (userId, date) => {
    const converter = new MonthYearToUnixTimeConverter(date);
    const unixTime = converter.convert();
    const budgetPeriodAlreadyExists = await findBudgetPeriodByDate(
      userId,
      unixTime
    );
    if (budgetPeriodAlreadyExists) {
      const errorMessage = 'That budget period has already been registered';
      logger.error(errorMessage);
      throw new BudgetError(400, errorMessage);
    }
    const budgetPeriod = new BudgetPeriod(userId, unixTime);
    try {
      const creationResult = await collection.insertOne(budgetPeriod);
      logger.info('Successfully created budget');
      return creationResult.insertedId;
    } catch (err) {
      const errorMessage = 'Failed to create budget';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Activate a budget if it is the period of that budget
  // This should be done on start up
  this.activateBudget = async (userId, budgetPeriodId) => {
    // If there is already an active budget period, deactivate that first
    const activePeriodAlreadyExists = await collection
      .find({
        status: Status.ACTIVE
      })
      .limit(1)
      .toArray();

    if (activePeriodAlreadyExists.length > 0) {
      const { date } = activePeriodAlreadyExists[0];
      const errorMessage = `Please deactivate the current active budget period first before activating this period`;
      logger.error(errorMessage);
      throw new BudgetError(400, errorMessage);
    }

    const budgetPeriod = await findBudgetPeriodById(userId, budgetPeriodId);
    if (!budgetPeriod) {
      const errorMessage = "Trying to activate a period that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(budgetPeriodId) },
        { $set: { status: Status.ACTIVE } }
      );
      logger.info('Successfully activated a budget period');
      return;
    } catch (err) {
      const errorMessage = 'Failed to activate the budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Deactivate a budget
  this.deactivateBudget = async (userId, budgetPeriodId) => {
    const budgetPeriod = await findBudgetPeriodById(userId, budgetPeriodId);
    if (!budgetPeriod) {
      const errorMessage =
        "Trying to deactivate a budget period that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(budgetPeriodId) },
        { $set: { status: Status.INACTIVE } }
      );
      logger.info('Successfully deactivated a budget period');
      return;
    } catch (err) {
      const errorMessage = 'Failed to deactivate the budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Delete a budget
  this.deleteBudgetPeriod = async (userId, budgetPeriodId) => {
    const budgetPeriod = await findBudgetPeriodById(userId, budgetPeriodId);
    if (!budgetPeriod) {
      const errorMessage = "Trying to delete budget that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      // TODO: Soft delete??
      const deleted = await collection.deleteOne({
        _id: ObjectId(budgetPeriodId)
      });
      logger.info('Successfully deleted budget');
    } catch (err) {
      const errorMessage = 'Failed to delete budget';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const findBudgetPeriodById = async (userId, budgetPeriodId) => {
    let budgetPeriod;
    try {
      budgetPeriod = await collection.findOne({
        _id: ObjectId(budgetPeriodId)
      });
    } catch (err) {
      logger.error(`Failed to get budget :: ${err}`);
      throw new BudgetError(404, 'Failed to retrieve budget period');
    }
    if (budgetPeriod && budgetPeriod.userId !== userId) {
      logger.error(
        "Unauthorized :: Trying to retrieve a period you don't have permission on"
      );
      throw new BudgetError(403, 'Unauthorized on this budget period');
    }
    return budgetPeriod;
  };

  const findBudgetPeriodByDate = async (userId, date) => {
    let budgetPeriod;
    try {
      budgetPeriod = await collection.findOne({ $and: [{ userId }, { date }] });
    } catch (err) {
      logger.error(`Failed to get budget :: ${err}`);
      throw new BudgetError(404, 'Failed to retrieve budget period');
    }
    if (budgetPeriod && budgetPeriod.userId !== userId) {
      logger.error(
        "Unauthorized :: Trying to retrieve a period you don't have permission on"
      );
      throw new BudgetError(403, 'Unauthorized on this budget period');
    }
    return budgetPeriod;
  };
};

module.exports = BudgetPeriodRepository;
