'use strict';

const EventEmitter = require('events');
const logger = require('pino')();
const express = require('express');
const app = express();
require('dotenv').config();

const env = process.env.ENV || 'development';
const configFile = require(`./config/${env}.json`);
const mediator = new EventEmitter();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const MongoConnection = require('./mongo.connection');
const BudgetPeriodRepository = require('./repositories/budget.period.repository');
const BudgetPeriodApi = require('./api/budget.period.api');

const CategoryRepository = require('./repositories/category.repository');
const CategoryApi = require('./api/category.api');

const BudgetedCategoryRepository = require('./repositories/budgeted.category.repository');
const BudgetedCategoryApi = require('./api/budgeted.category.api');

const ExpenseRepository = require('./repositories/expense.repository');
const ExpenseApi = require('./api/expense.api');

const EarningRepository = require('./repositories/earning.repository');
const EarningApi = require('./api/earning.api');

const RefreshTokenRepository = require('./repositories/refresh.token.repository');
const RefreshTokenService = require('./services/refesh.token.service');

const UserRepository = require('./repositories/user.repository');
const UserApi = require('./api/user.api');

const port = process.env.PORT || 3000;
const { db_hostname, db_port, db_user, db_password } = configFile;
const mongoConnection = new MongoConnection(
  db_hostname,
  db_port,
  db_user,
  db_password
);

mongoConnection.connect().then(client => {
  const db = client.db('budgety');
  const budgetPeriodRepository = new BudgetPeriodRepository(db);
  const categoryRepository = new CategoryRepository(db, mediator);
  const budgetedCategoryRepository = new BudgetedCategoryRepository(
    db,
    mediator
  );
  const expenseRepository = new ExpenseRepository(db);
  const earningRepository = new EarningRepository(db);
  const refreshTokenRepository = new RefreshTokenRepository(db);
  const refreshTokenService = new RefreshTokenService(refreshTokenRepository);
  const userRepository = new UserRepository(db, refreshTokenRepository);

  // Instantiate apis
  const budgetPeriodApi = new BudgetPeriodApi(
    budgetPeriodRepository,
    budgetedCategoryRepository,
    expenseRepository,
    earningRepository,
    refreshTokenService
  );
  const categoryApi = new CategoryApi(categoryRepository);
  const budgetedCategoryApi = new BudgetedCategoryApi(
    budgetedCategoryRepository,
    expenseRepository,
    earningRepository,
    refreshTokenService
  );
  const expenseApi = new ExpenseApi(expenseRepository, refreshTokenService);
  const earningApi = new EarningApi(earningRepository, refreshTokenService);
  const userApi = new UserApi(userRepository);

  // Register routes
  app.use('/api/budgetperiods', budgetPeriodApi.router);
  app.use('/api/categories', categoryApi.router);
  app.use('/api/budgetedcategories', budgetedCategoryApi.router);
  app.use('/api/expenses', expenseApi.router);
  app.use('/api/earnings', earningApi.router);
  app.use('/api/users', userApi.router);

  app.listen(port, () => logger.info(`Listening on port ${port}`));
  app.emit('listening');
});

module.exports = app;
