const express = require('express');
const { createCategoryController, categoryDetailsController, deleteCategoryController, editCategoryController, allCategoriesController } = require('../../controllers/categoriesController');
const isLoggedIn = require('../../middlewares/isLoggedIn');


const categoryRouter = express.Router();

categoryRouter.post('/', isLoggedIn, createCategoryController);

categoryRouter.get('/:id', isLoggedIn, categoryDetailsController);

categoryRouter.get('/', isLoggedIn, allCategoriesController);

categoryRouter.delete('/:id', isLoggedIn, deleteCategoryController);

categoryRouter.put('/:id', isLoggedIn, editCategoryController);

module.exports = categoryRouter;