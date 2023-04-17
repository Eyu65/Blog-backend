const express = require('express');
const storage = require('../../config/cloudinary');
const { createPostController, postDetailsController, deletePostController, editPostController, getPostController, postLikeController, postDislikeController } = require('../../controllers/postController');
const isLoggedIn = require('../../middlewares/isLoggedIn');
const multer = require('multer');

const postRouter = express.Router();

const photoUpload = multer({storage});

postRouter.post('/', isLoggedIn, photoUpload.single('postPhoto'), createPostController);

postRouter.get('/:id', isLoggedIn, postDetailsController);

postRouter.get('like/:id', isLoggedIn, postLikeController);

postRouter.get('dislike/:id', isLoggedIn, postDislikeController);

postRouter.get('/', isLoggedIn, getPostController);

postRouter.delete('/:id', isLoggedIn, deletePostController);

postRouter.put('/:id', isLoggedIn, photoUpload.single('postPhoto'), editPostController);

module.exports = postRouter;