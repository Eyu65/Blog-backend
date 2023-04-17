const express = require('express');
const storage = require('../../config/cloudinary');
const { userRegController, userLoginController, singleUserController, usersController, updateUserController, profilePhotoController, profileViewController, followingController, unFollowController, blockUserController, unblockUserController, adminBlockController, adminUnblockController, updatePasswordController, deleteAccountController } = require('../../controllers/userController');
const isLoggedIn = require('../../middlewares/isLoggedIn');
const multer = require('multer');
const isAdmin = require('../../middlewares/isAdmin');

const userRouter = express.Router();

const upload = multer({ storage });

userRouter.post('/register', userRegController);

userRouter.post('/login', userLoginController);

userRouter.get('/profile/', isLoggedIn, singleUserController);

userRouter.get('/', usersController);

userRouter.put('/', isLoggedIn, updateUserController);

userRouter.get('/following/:id', isLoggedIn, followingController);

userRouter.get('/unfollow/:id', isLoggedIn, unFollowController);

userRouter.get('/blocked/:id', isLoggedIn, blockUserController);

userRouter.get('/unblock/:id', isLoggedIn, unblockUserController);

userRouter.put('/admin-block/:id', isLoggedIn, isAdmin, adminBlockController);

userRouter.put('/admin-unblock/:id', isLoggedIn, isAdmin, adminUnblockController);

userRouter.get('/profile-viewers/:id', isLoggedIn, profileViewController);

userRouter.post('/profile-photo', isLoggedIn, upload.single('profile'),  profilePhotoController);

userRouter.put('/password-update', isLoggedIn, updatePasswordController);

userRouter.delete('/delete-account', isLoggedIn, deleteAccountController);


module.exports = userRouter;