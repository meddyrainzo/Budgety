'use strict';

const express = require('express');
const router = express.Router();

const validationMiddleware = require('../middlewares/validation.middleware');
const categorySchema = require('../schemas/category.schema');
const categoryIdSchema = require('../schemas/id.schema');

const CategoryApi = function(categoryRepository) {
  router.get('/', async (req, res) => {
    try {
      const categories = await categoryRepository.getCategories();
      res.status(200).json({ categories });
    } catch (err) {
      res.status(err.statusCode).json({ errorMessage: err.message });
    }
  });

  router.get(
    '/:id',
    validationMiddleware(categoryIdSchema, 'params'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const category = await categoryRepository.getCategoryById(id);
        res.status(200).json({ category });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  router.post(
    '/',
    validationMiddleware(categorySchema, 'body'),
    async (req, res) => {
      try {
        const { name } = req.body;
        const categoryId = await categoryRepository.createCategory(name);
        res.status(201).json({ id: categoryId });
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  router.patch(
    '/:id',
    validationMiddleware(categoryIdSchema, 'params'),
    validationMiddleware(categorySchema, 'body'),
    async (req, res) => {
      try {
        const { id } = req.params;
        const { name } = req.body;
        await categoryRepository.changeName(id, name);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  // TODO: Soft delete?
  router.delete(
    '/:id',
    validationMiddleware(categoryIdSchema, 'params'),
    async (req, res) => {
      try {
        const { id } = req.params;
        await categoryRepository.deleteCategory(id);
        res.status(204).json({});
      } catch (err) {
        res.status(err.statusCode).json({ errorMessage: err.message });
      }
    }
  );

  return Object.create({ router });
};

module.exports = CategoryApi;
