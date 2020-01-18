'use strict';

const express = require('express');
const router = express.Router();

const authorizationMiddleware = require('../middlewares/authorization.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const idSchema = require('../schemas/id.schema');
const expenseSchema = require('../schemas/expense.schema');
const nameSchema = require('../schemas/name.schema');
const userIdSchema = require('../schemas/user.id.schema');
const amountSchema = require('../schemas/amount.schema');
const budgetedCategoryIdSchema = require('../schemas/budgeted.category.id.schema');

const ExpenseApi = function(expenseRepository, refreshTokenService) {
  // Get expense by id
  router.get(
    '/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(idSchema, 'params'),
    async (req, res) => {
      try {
        const { userId } = req.user;
        const { id } = req.params;
        const expense = await expenseRepository.getExpenseById(userId, id);
        res.status(200).json({ expense });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Create an expense
  router.post(
    '/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(userIdSchema, 'user'),
    validationMiddleware(expenseSchema, 'body'),
    async (req, res) => {
      try {
        const { budgetPeriodId, budgetedCategoryId, name, amount } = req.body;
        const { userId } = req.user;
        const expenseId = await expenseRepository.createExpense(
          userId,
          budgetPeriodId,
          budgetedCategoryId,
          name,
          amount
        );
        res.status(201).json({ id: expenseId });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Change name
  router.patch(
    '/:id/changename',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(idSchema, 'params'),
    validationMiddleware(nameSchema, 'body'),
    async (req, res) => {
      try {
        const { name } = req.body;
        const { userId } = req.user;
        const { id } = req.params;
        await expenseRepository.changeName(id, userId, name);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Change amount
  router.patch(
    '/:id/changeamount',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(idSchema, 'params'),
    validationMiddleware(amountSchema, 'body'),
    async (req, res) => {
      try {
        const { amount } = req.body;
        const { userId } = req.user;
        const { id } = req.params;
        await expenseRepository.changeAmount(id, userId, amount);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Change category
  router.patch(
    '/:id/changecategory',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(idSchema, 'params'),
    validationMiddleware(budgetedCategoryIdSchema, 'body'),
    async (req, res) => {
      try {
        const { userId } = req.user;
        const { budgetedCategoryId } = req.body;
        const { id } = req.params;
        await expenseRepository.changeCategory(id, userId, budgetedCategoryId);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Delete
  router.delete(
    '/:id',
    validationMiddleware(idSchema, 'params'),
    async (req, res) => {
      try {
        const { userId } = req.body;
        const { id } = req.params;
        await expenseRepository.deleteExpense(userId, id);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  return Object.create({ router });
};

module.exports = ExpenseApi;
