'use strict';

const logger = require('pino')();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const ObjectId = require('mongodb').ObjectID;

const BudgetError = require('../budget.error');
const User = require('../models/user');

const UserRepository = function(db, refreshTokenRepository) {
  const collection = db.collection('users');

  // Register
  this.registerUser = async (name, email, password) => {
    const user = await getUserByEmail(email);
    if (user) {
      const errorMessage = 'User already exists with this email';
      logger.error(errorMessage);
      throw new BudgetError(400, errorMessage);
    }
    try {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = new User(name, email, hashedPassword);
      const result = await collection.insertOne(user);
      logger.info('Successfully created a user');
      return result.insertedId;
    } catch (err) {
      const errorMessage = 'Failed to register user';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Login
  this.loginUser = async (email, password) => {
    const user = await getUserByEmail(email);
    if (!user) {
      const errorMessage = 'User does not exist with this email';
      logger.error(errorMessage);
      throw new BudgetError(400, errorMessage);
    }
    try {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (!passwordsMatch) {
        throw new BudgetError(400, 'Failed to login user');
      }
      const { _id } = user;
      const token = jwt.sign({ userId: _id }, process.env.JWT_SECRET, {
        expiresIn: 3600
      });
      const refreshTokenId = await refreshTokenRepository.addRefreshToken(
        _id,
        email
      );
      const refreshToken = await refreshTokenRepository.getRefreshTokenById(
        refreshTokenId
      );
      logger.info('Successfully logged in');
      return { token, userId: _id, refreshToken: refreshToken.token };
    } catch (err) {
      const errorMessage = 'Failed to login user';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  // Get user by email
  const getUserByEmail = async email => {
    try {
      const user = collection.findOne({ email });
      return user;
    } catch (err) {
      const errorMessage = 'Failed to get user by email';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  this.getUserById = async id => {
    try {
      const user = collection.findOne({ _id: ObjectId(id) });
      return user;
    } catch (err) {
      const errorMessage = 'Failed to get user by id';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };
};

module.exports = UserRepository;
