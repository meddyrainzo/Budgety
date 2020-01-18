'use strict';

const logger = require('pino')();
const Category = require('../models/category');
const ObjectId = require('mongodb').ObjectID;
const BudgetError = require('../budget.error');
const CategoryDto = require('../dtos/category.dto');

const CategoryRepository = function(db, mediator) {
  const collection = db.collection('categories');

  this.getCategoryById = async categoryId => {
    const category = await findCategory(categoryId);
    if (!category) {
      const errorMessage = "Category doesn't exist with the given id";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    logger.info('Successfully retrieved category');
    const { _id, name } = category;
    return new CategoryDto(_id, name);
  };

  this.getCategories = async () => {
    try {
      const categories = await collection.find({}).toArray();
      logger.info('Successfully retrieved categories');
      return categories.map(
        category => new CategoryDto(category._id, category.name)
      );
    } catch (err) {
      logger.error(`Failed to get the list of categories :: ${err}`);
      throw new BudgetError('Failed to get the list of categories');
    }
  };

  this.createCategory = async name => {
    const category = new Category(name);
    try {
      const result = await collection.insertOne(category);
      logger.info('Successfully created a category');
      return result.insertedId;
    } catch (err) {
      logger.error(`Failed to create category : ${err}`);
      throw new BudgetError(400, 'Failed to create category');
    }
  };

  this.changeName = async (categoryId, name) => {
    const category = await findCategory(categoryId);
    if (!category) {
      const errorMessage =
        "Trying to change the name of a category that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      const oldName = category.name;
      await collection.updateOne(
        { _id: ObjectId(categoryId) },
        { $set: { name } }
      );
      logger.info('Successfully change the category name');
      mediator.emit('category.name.changed', oldName, name);
    } catch (err) {
      logger.error(`Failed to change the name of the category :: ${err}`);
      throw new BudgetError(400, 'Failed to change the category name');
    }
  };

  this.deleteCategory = async categoryId => {
    const category = await findCategory(categoryId);
    if (!category) {
      const errorMessage = "Trying to delete a category that doesn't exist";
      logger.error(errorMessage);
      throw new BudgetError(404, errorMessage);
    }
    try {
      await collection.deleteOne({ _id: ObjectId(categoryId) });
      logger.info('Successfully deleted the category');
    } catch (err) {
      const errorMessage = 'Failed to delete the category';
      logger.error(`${errorMessage} :: ${err}`);
      throw new BudgetError(400, errorMessage);
    }
  };

  const findCategory = async categoryId => {
    try {
      const category = await collection.findOne({ _id: ObjectId(categoryId) });
      return category;
    } catch (err) {
      logger.error(`Failed to get the category by id :: ${categoryId}`);
      throw new BudgetError(404, 'Failed to retrieve category');
    }
  };
};

module.exports = CategoryRepository;
