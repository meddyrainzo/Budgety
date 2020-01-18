'use strict';

const express = require('express');
const router = express.Router();

const validationMiddleware = require('../middlewares/validation.middleware');
const userSchema = require('../schemas/user.schema');
const loginSchema = require('../schemas/login.schema');

const UserApi = function(userRepository) {
  router.post(
    '/register',
    validationMiddleware(userSchema, 'body'),
    async (req, res) => {
      const { name, email, password } = req.body;
      try {
        const userId = await userRepository.registerUser(name, email, password);
        res.status(201).json({ userId });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  router.post(
    '/login',
    validationMiddleware(loginSchema, 'body'),
    async (req, res) => {
      const { email, password } = req.body;
      try {
        const loginResult = await userRepository.loginUser(email, password);
        const { token, userId, refreshToken } = loginResult;
        res.set('x-auth-token', token);
        res.set('x-refresh-token', refreshToken);
        res.status(200).json({ userId });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  return Object.create({
    router
  });
};

module.exports = UserApi;
