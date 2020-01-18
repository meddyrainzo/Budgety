'use strict';

const express = require('express');
const router = express.Router();

const authorizationMiddleware = require('../middlewares/authorization.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const budgetedCategorySchema = require('../schemas/budgeted.category.schema');
const userIdSchema = require('../schemas/user.id.schema');
const budgetedIdSchema = require('../schemas/id.schema');
const amountSchema = require('../schemas/amount.schema');
const paginationSchema = require('../schemas/pagination.schema');

const BudgetedCategoryApi = function(
  budgetedCategoryRepository,
  expenseRepository,
  earningRepository,
  refreshTokenService
) {
  // Get by id
  router.get(
    '/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetedIdSchema, 'params'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.user;
        const budgetedCategory = await budgetedCategoryRepository.getBudgetedCategoryById(
          userId,
          id
        );
        res.status(200).json({ budgetedCategory });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Get expenses for this category
  router.get(
    '/:id/expenses/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetedIdSchema, 'params'),
    validationMiddleware(paginationSchema, 'query'),
    async (req, res) => {
      // TODO: userId will be gotten from auth middleware soon
      const { userId } = req.user;
      const { id } = req.params;
      const { currentPage, resultsPerPage } = req.query;
      try {
        const pagedResult = await expenseRepository.getUserBudgetExpensesByCategory(
          userId,
          id,
          currentPage,
          resultsPerPage
        );
        res.status(200).json({ result: pagedResult });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Get earnings for this category
  router.get(
    '/:id/earnings/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetedIdSchema, 'params'),
    validationMiddleware(paginationSchema, 'query'),
    async (req, res) => {
      // TODO: userId will be gotten from auth middleware soon
      const { userId } = req.user;
      const { id } = req.params;
      const { currentPage, resultsPerPage } = req.query;
      try {
        const pagedResult = await earningRepository.getUserBudgetEarningsByCategory(
          userId,
          id,
          currentPage,
          resultsPerPage
        );
        res.status(200).json({ result: pagedResult });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Create
  router.post(
    '/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(userIdSchema, 'user'),
    validationMiddleware(budgetedCategorySchema, 'body'),
    async (req, res) => {
      try {
        const { userId } = req.user;
        const { categoryName, budgetPeriodId, amount } = req.body;
        const id = await budgetedCategoryRepository.createBudgetForCategory(
          userId,
          budgetPeriodId,
          categoryName,
          amount
        );
        res.status(201).json({ id });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Change amount
  router.patch(
    '/:id/changeamount',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetedIdSchema, 'params'),
    validationMiddleware(amountSchema, 'body'),
    async (req, res) => {
      try {
        const { userId } = req.user;
        const { id } = req.params;
        const { amount } = req.body;
        await budgetedCategoryRepository.changeBudgetAmount(id, userId, amount);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Delete
  router.delete(
    '/:id',
    validationMiddleware(budgetedIdSchema, 'params'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { userId } = req.user;
        await budgetedCategoryRepository.deleteBudgetedCategory(id, userId);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  return Object.create({ router });
};

module.exports = BudgetedCategoryApi;
