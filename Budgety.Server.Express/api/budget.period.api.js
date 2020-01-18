'use strict';

const express = require('express');
const router = express.Router();

const authorizationMiddleware = require('../middlewares/authorization.middleware');
const validationMiddleware = require('../middlewares/validation.middleware');
const BudgetError = require('../budget.error');
const userIdSchema = require('../schemas/user.id.schema');
const dateSchema = require('../schemas/date.schema');
const paginationSchema = require('../schemas/pagination.schema');
const budgetPeriodIdSchema = require('../schemas/id.schema');

const BudgetPeriodApi = function(
  budgetPeriodRepository,
  budgetedCategoriesRepository,
  expenseRepository,
  earningRepository,
  refreshTokenService
) {
  // Get single budget router
  router.get(
    '/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    async (req, res) => {
      const { id } = req.params;
      const { userId } = req.user;
      try {
        const budget = await budgetPeriodRepository.retrieveBudgetPeriodById(
          userId,
          id
        );
        res.status(200).json({ budget });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Get paged list of budgets
  router.get(
    '/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(paginationSchema, 'query'),
    async (req, res) => {
      const { userId } = req.user;
      const { currentPage, resultsPerPage } = req.query;
      try {
        const pagedResult = await budgetPeriodRepository.getBudgetPeriods(
          userId,
          currentPage,
          resultsPerPage
        );
        res.status(200).json({ result: pagedResult });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Get budgeted categories for budget
  router.get(
    '/:id/budgetedcategories/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    async (req, res) => {
      const { id } = req.params;
      const { userId } = req.user;
      try {
        const categories = await budgetedCategoriesRepository.getBudgetedCategories(
          userId,
          id
        );
        res.status(200).json({ categories });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Get expenses within tbis budget period
  router.get(
    '/:id/expenses/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    validationMiddleware(paginationSchema, 'query'),
    async (req, res) => {
      const { userId } = req.user;
      const { id } = req.params;
      const { currentPage, resultsPerPage } = req.query;
      try {
        const pagedResult = await expenseRepository.getUserBudgetExpenses(
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

  // Get earnings within tbis budget period
  router.get(
    '/:id/earnings/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    validationMiddleware(paginationSchema, 'query'),
    async (req, res) => {
      const { userId } = req.user;
      const { id } = req.params;
      const { currentPage, resultsPerPage } = req.query;
      try {
        const pagedResult = await earningRepository.getUserBudgetEarnings(
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

  // Create budget router
  router.post(
    '/',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(dateSchema, 'body'),
    validationMiddleware(userIdSchema, 'user'),
    async (req, res) => {
      const { userId } = req.user;
      const { date } = req.body;
      try {
        const budgetPeriodId = await budgetPeriodRepository.registerBudgetPeriod(
          userId,
          date
        );
        res.status(201).json({ id: budgetPeriodId });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Activate budget
  router.patch(
    '/activate/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    async (req, res) => {
      const { userId } = req.user;
      const { id } = req.params;
      try {
        await budgetPeriodRepository.activateBudget(userId, id);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Deactivate budget
  router.patch(
    '/deactivate/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(
      budgetPeriodIdSchema,
      validationMiddleware(budgetPeriodIdSchema, 'params'),
      'params'
    ),
    async (req, res) => {
      const { userId } = req.user;
      const { id } = req.params;
      try {
        await budgetPeriodRepository.deactivateBudget(userId, id);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // Delete budget router
  router.delete(
    '/:id',
    authorizationMiddleware(refreshTokenService),
    validationMiddleware(budgetPeriodIdSchema, 'params'),
    async (req, res) => {
      const { userId } = req.user;
      const { id } = req.params;
      try {
        await budgetPeriodRepository.deleteBudgetPeriod(userId, id);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  return Object.create({
    router
  });
};

module.exports = BudgetPeriodApi;
