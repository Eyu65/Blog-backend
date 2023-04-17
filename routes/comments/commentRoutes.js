const express = require('express');
const { createCommentController, deleteCommentController, editCommentController } = require('../../controllers/commentController');
const isLoggedIn = require('../../middlewares/isLoggedIn');

const commentRouter = express.Router();

commentRouter.post('/:id', isLoggedIn, createCommentController);

commentRouter.put('/:id', isLoggedIn, editCommentController);

commentRouter.delete('/:id', isLoggedIn, deleteCommentController);

module.exports = commentRouter;