'use strict';

const logger = require('pino')();
const ObjectId = require('mongodb').ObjectID;
const BudgetError = require('../budget.error');
const BudgetedCategory = require('../models/budgeted.category');
const BudgetedCategoryDto = require('../dtos/budgeted.category.dto');

const BudgetedCategoryRepository = function(db, mediator) {
  const collection = db.collection('budgetedCategories');

  // Get all budget categories
  this.getBudgetedCategories = async (userId, budgetPeriodId) => {
    try {
      const budgetedCategories = await collection
        .find({ $and: [{ userId }, { budgetPeriodId }] })
        .toArray();
      logger.info('Successfully retrieved budgeted categories');
      return budgetedCategories.map(
        bc => new BudgetedCategoryDto(bc._id, bc.categoryName, bc.amount)
      );
    } catch (err) {
      const errorMessage = 'Failed to get budgeted categories';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get budget categories by id
  this.getBudgetedCategoryById = async (userId, budgetedCategoryId) => {
    const budgetedCategory = await findBudgetedCategory(
      budgetedCategoryId,
      userId
    );
    if (!budgetedCategory) {
      const errorMessage = "Budgeted category doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    const { _id, categoryName, amount } = budgetedCategory;
    return new BudgetedCategoryDto(_id, categoryName, amount);
  };

  // Create the budget categories
  this.createBudgetForCategory = async (
    userId,
    budgetPeriodId,
    categoryName,
    amount
  ) => {
    try {
      const budgetedCategory = new BudgetedCategory(
        userId,
        budgetPeriodId,
        categoryName,
        amount
      );
      const result = await collection.insertOne(budgetedCategory);
      logger.info('Successfully budgeted category');
      return result.insertedId;
    } catch (err) {
      const errorMessage = 'Failed to create budget for category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the price on the budget categories
  this.changeBudgetAmount = async (budgetedCategoryId, userId, newAmount) => {
    const budgetedCategory = await findBudgetedCategory(
      budgetedCategoryId,
      userId
    );
    if (!budgetedCategory) {
      const errorMessage =
        "Trying to change the spendable amount on a budget that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(budgetedCategoryId) },
        { $set: { amount: newAmount } }
      );
      logger.info('Successfully updated the spendable amount of the budget');
    } catch (err) {
      const errorMessage =
        'Failed to update the spendable amount of the budgeted category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the name of the budgeted category
  // This is done when the category changes it's name
  mediator.on('category.name.changed', async (oldName, newName) => {
    try {
      const result = await collection.updateMany(
        { categoryName: oldName },
        { $set: { categoryName: newName } }
      );
      logger.info('Successfully updated budgeted category names');
      return result.modifiedCount;
    } catch (err) {
      const errorMessage =
        'Failed to fupdate the name of the budgeted categories';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  });

  // Delete the budget categories
  this.deleteBudgetedCategory = async (budgetedCategoryId, userId) => {
    const budgetedCategory = await findBudgetedCategory(
      budgetedCategoryId,
      userId
    );
    if (!budgetedCategory) {
      const errorMessage =
        "Trying to deleted a budgeted category that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.deleteOne({ _id: ObjectId(budgetedCategoryId) });
      logger.info('Successfully removed budget from category');
    } catch (err) {
      const errorMessage = 'Failed to remove budget from a category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const findBudgetedCategory = async (id, userId) => {
    let budgetedCategory;
    try {
      budgetedCategory = await collection.findOne({ _id: ObjectId(id) });
    } catch (err) {
      const errorMessage = 'Failed to find budgeted category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(404, errorMessage);
    }
    if (budgetedCategory && budgetedCategory.userId !== userId) {
      const errorMessage = 'Not authorized on budgeted category';
      logger.error(errorMessage);
      throw new BudgetError(403, errorMessage);
    }
    logger.info('Budgeted category found successfully');
    return budgetedCategory;
  };
};

module.exports = BudgetedCategoryRepository;
