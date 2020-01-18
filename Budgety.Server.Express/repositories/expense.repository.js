'use strict';

const logger = require('pino')();
const ObjectId = require('mongodb').ObjectID;
const BudgetError = require('../budget.error');

const Expense = require('../models/expense');
const ExpenseDto = require('../dtos/expense.dto');
const PagedResult = require('../models/paged.result');

const ExpenseRepository = function(db) {
  const collection = db.collection('expenses');

  const totalBudgetExpensesCount = async budgetPeriodId => {
    try {
      const count = await collection.countDocuments({ budgetPeriodId });
      return count;
    } catch (err) {
      const errorMessage = 'Failed to get the total budget expenses';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const totalCategoryExpensesCount = async budgetedCategoryId => {
    try {
      const count = await collection.countDocuments({ budgetedCategoryId });
      return count;
    } catch (err) {
      const errorMessage = 'Failed to get the total budget expenses';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get users expenses
  this.getUserBudgetExpenses = async (
    userId,
    budgetPeriodId,
    currentPage = 0,
    resultsPerPage = 50
  ) => {
    const skip = currentPage * resultsPerPage;
    const totalCount = await totalBudgetExpensesCount(budgetPeriodId);
    try {
      const expenses = await collection
        .find({ $and: [{ userId }, { budgetPeriodId }] })
        .skip(skip)
        .limit(parseInt(resultsPerPage))
        .toArray();
      const expensesDTO = expenses.map(expense => {
        const { _id, name, amount } = expense;
        return new ExpenseDto(_id, name, amount);
      });
      const newCurrentPage = currentPage + 1;
      logger.info(
        'Successfully retrieved user Budget expenses for given period'
      );
      return new PagedResult(
        newCurrentPage,
        resultsPerPage,
        expensesDTO,
        totalCount
      );
    } catch (err) {
      const errorMessage =
        'Failed to get list of expenses for this budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get user expenses by category
  this.getUserBudgetExpensesByCategory = async (
    userId,
    budgetedCategoryId,
    currentPage = 0,
    resultsPerPage = 32
  ) => {
    const skip = currentPage * resultsPerPage;
    const totalCount = await totalCategoryExpensesCount(budgetedCategoryId);
    try {
      const expenses = await collection
        .find({ $and: [{ userId }, { budgetedCategoryId }] })
        .skip(skip)
        .limit(parseInt(resultsPerPage))
        .toArray();
      const expensesDTO = expenses.map(expense => {
        const { _id, name, amount } = expense;
        return new ExpenseDto(_id, name, amount);
      });
      const newCurrentPage = currentPage + 1;
      logger.info(
        'Successfully retrieved user Budget expenses in a category for given period'
      );
      return new PagedResult(
        newCurrentPage,
        resultsPerPage,
        expensesDTO,
        totalCount
      );
    } catch (err) {
      const errorMessage =
        'Failed to get list of expenses in given category for this budget period';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get expense by id
  this.getExpenseById = async (userId, expenseId) => {
    const expense = await findExpenseById(userId, expenseId);
    if (!expense) {
      const errorMessage = 'No expense found with given id';
      logger.error(`${errorMessage} :: ${expenseId}`);
      throw new BudgetError(404, errorMessage);
    }
    const { _id, name, amount } = expense;
    return new ExpenseDto(_id, name, amount);
  };

  // Create an expense
  this.createExpense = async (
    userId,
    budgetPeriodId,
    budgetedCategoryId,
    name,
    amount
  ) => {
    try {
      const expense = new Expense(
        userId,
        budgetPeriodId,
        budgetedCategoryId,
        name,
        amount
      );
      const result = await collection.insertOne(expense);
      logger.info('Successfully created an expense');
      return result.insertedId;
    } catch (err) {
      const errorMessage = 'Failed to create an expense';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the expense category
  this.changeCategory = async (expenseId, userId, budgetedCategoryId) => {
    const expense = await findExpenseById(userId, expenseId);
    if (!expense) {
      const errorMessage =
        "Trying to change the category of an expense that doesn't exist";
      logger.error(`${errorMessage} :: ${expenseId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(expenseId) },
        { $set: { budgetedCategoryId } }
      );
      logger.info('Successfully changed the category');
    } catch (err) {
      const errorMessage = 'Failed to update the category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the expense amount
  this.changeAmount = async (expenseId, userId, amount) => {
    const expense = await findExpenseById(userId, expenseId);
    if (!expense) {
      const errorMessage =
        "Trying to change the amount of an expense that doesn't exist";
      logger.error(`${errorMessage} :: ${expenseId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(expenseId) },
        { $set: { amount } }
      );
      logger.info('Successfully changed the amount spent');
    } catch (err) {
      const errorMessage = 'Failed to update the amount spent';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Change the expense name
  this.changeName = async (expenseId, userId, name) => {
    const expense = await findExpenseById(userId, expenseId);
    if (!expense) {
      const errorMessage =
        "Trying to change the name of an expense that doesn't exist";
      logger.error(`${errorMessage} :: ${expenseId}`);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.updateOne(
        { _id: ObjectId(expenseId) },
        { $set: { name } }
      );
      logger.info('Successfully changed the name');
    } catch (err) {
      const errorMessage = 'Failed to update the name';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Delete the expense
  this.deleteExpense = async (userId, expenseId) => {
    const expense = await findExpenseById(userId, expenseId);
    if (!expense) {
      const errorMessage = "Trying to delete budget that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      // TODO: Soft delete??
      const deleted = await collection.deleteOne({
        _id: ObjectId(expenseId)
      });
      logger.info('Successfully deleted expense');
    } catch (err) {
      const errorMessage = 'Failed to delete expense';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const findExpenseById = async (userId, expenseId) => {
    let expense;
    try {
      expense = await collection.findOne({ _id: ObjectId(expenseId) });
    } catch (err) {
      const errorMessage = 'Failed to find expense by id';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
    if (expense && expense.userId !== userId) {
      const errorMessage = 'Not permitted for expense';
      logger.error(errorMessage);
      throw new BudgetError(403, errorMessage);
    }
    return expense;
  };
};

module.exports = ExpenseRepository;
