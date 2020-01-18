'use strict';

const logger = require('pino')();
const ObjectId = require('mongodb').ObjectID;
const BudgetError = require('../budget.error');

const Earning = require('../models/earning');
const EarningDto = require('../dtos/earning.dto');
const PagedResult = require('../models/paged.result');

const EarningRepository = function(db) {
  const collection = db.collection('earnings');

  const totalBudgetEarningsCount = async budgetPeriodId => {
    try {
      const count = await collection.countDocuments({ budgetPeriodId });
      return count;
    } catch (err) {
      const errorMessage = 'Failed to get the total budget earnings';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const totalCategoryEarningsCount = async budgetedCategoryId => {
    try {
      const count = await collection.countDocuments({ budgetedCategoryId });
      return count;
    } catch (err) {
      const errorMessage = 'Failed to get the total budget earnings';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get users earnings
  this.getUserBudgetEarnings = async (
    userId,
    budgetPeriodId,
    currentPage = 0,
    resultsPerPage = 50
  ) => {
    const skip = currentPage * resultsPerPage;
    const totalCount = await totalBudgetEarningsCount(budgetPeriodId);
    try {
      const earnings = await collection
        .find({ $and: [{ userId }, { budgetPeriodId }] })
        .skip(skip)
        .limit(parseInt(resultsPerPage))
        .toArray();
      const earningsDTO = earnings.map(earning => {
        const { _id, name, amount } = earning;
        return new EarningDto(_id, name, amount);
      });
      const newCurrentPage = currentPage + 1;
      logger.info(
        'Successfully retrieved user Budget earnings for given period'
      );
      return new PagedResult(
        newCurrentPage,
        resultsPerPage,
        earningsDTO,
        totalCount
      );
    } catch (err) {
      const errorMessage =
        'Failed to get list of earnings for this budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get user earnings by category
  this.getUserBudgetEarningsByCategory = async (
    userId,
    budgetedCategoryId,
    currentPage = 0,
    resultsPerPage = 32
  ) => {
    const skip = currentPage * resultsPerPage;
    const totalCount = await totalCategoryEarningsCount(budgetedCategoryId);
    try {
      const earnings = await collection
        .find({ $and: [{ userId }, { budgetedCategoryId }] })
        .skip(skip)
        .limit(parseInt(resultsPerPage))
        .toArray();
      const earningsDTO = earnings.map(earning => {
        const { _id, name, amount } = earning;
        return new EarningDto(_id, name, amount);
      });
      const newCurrentPage = currentPage + 1;
      logger.info(
        'Successfully retrieved user Budget earnings in a category for given period'
      );
      return new PagedResult(
        newCurrentPage,
        resultsPerPage,
        earningsDTO,
        totalCount
      );
    } catch (err) {
      const errorMessage =
        'Failed to get list of earnings in given category for this budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get earning by id
  this.getEarningById = async (userId, earningId) => {
    const earning = await findEarningById(userId, earningId);
    if (!earning) {
      const errorMessage = 'No earning found with given id';
      logger.error(`${errorMessage} :: ${earningId}`);
      throw new BudgetError(404, errorMessage);
    }
    const { _id, name, amount } = earning;
    return new EarningDto(_id, name, amount);
  };

  // Create an earning
  this.createEarning = async (
    userId,
    budgetPeriodId,
    budgetedCategoryId,
    name,
    amount
  ) => {
    try {
      const earning = new Earning(
        userId,
        budgetPeriodId,
        budgetedCategoryId,
        name,
        amount
      );
      const result = await collection.insertOne(earning);
      logger.info('Successfully created an earning');
      return result.insertedId;
    } catch (err) {
      const errorMessage = 'Failed to create an earning';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the earning category
  this.changeCategory = async (earningId, userId, budgetedCategoryId) => {
    const earning = await findEarningById(userId, earningId);
    if (!earning) {
      const errorMessage =
        "Trying to change the category of an earning that doesn't exist";
      logger.error(`${errorMessage} :: ${earningId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(earningId) },
        { $set: { budgetedCategoryId } }
      );
      logger.info('Successfully changed the category');
    } catch (err) {
      const errorMessage = 'Failed to update the category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the earning amount
  this.changeAmount = async (earningId, userId, amount) => {
    const earning = await findEarningById(userId, earningId);
    if (!earning) {
      const errorMessage =
        "Trying to change the amount of an earning that doesn't exist";
      logger.error(`${errorMessage} :: ${earningId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(earningId) },
        { $set: { amount } }
      );
      logger.info('Successfully changed the amount spent');
    } catch (err) {
      const errorMessage = 'Failed to update the amount spent';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the earning name
  this.changeName = async (earningId, userId, name) => {
    const earning = await findEarningById(userId, earningId);
    if (!earning) {
      const errorMessage =
        "Trying to change the name of an earning that doesn't exist";
      logger.error(`${errorMessage} :: ${earningId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(earningId) },
        { $set: { name } }
      );
      logger.info('Successfully changed the name');
    } catch (err) {
      const errorMessage = 'Failed to update the name';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Delete the earning
  this.deleteEarning = async (userId, earningId) => {
    const earning = await findEarningById(userId, earningId);
    if (!earning) {
      const errorMessage = "Trying to delete budget that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      // TODO: Soft delete??
      const deleted = await collection.deleteOne({
        _id: ObjectId(earningId)
      });
      logger.info('Successfully deleted earning');
    } catch (err) {
      const errorMessage = 'Failed to delete earning';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const findEarningById = async (userId, earningId) => {
    let earning;
    try {
      earning = await collection.findOne({ _id: ObjectId(earningId) });
    } catch (err) {
      const errorMessage = 'Failed to find earning by id';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
    if (earning && earning.userId !== userId) {
      const errorMessage = 'Not permitted for earning';
      logger.error(errorMessage);
      throw new BudgetError(403, errorMessage);
    }
    return earning;
  };
};

module.exports = EarningRepository;
