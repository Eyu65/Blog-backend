const bcrypt = require('bcryptjs'); 
const Category = require('../model/Category/Category');
const Comment = require('../model/Comment/Comment');
const Post = require('../model/Post/Post');
const User = require("../model/User/User");
const {appErr, AppErr} = require('../utility/appErr');
const getToken = require('../utility/getToken');
const genToken = require('../utility/tokenGen');

const userRegController = async(req, res, next) => {
    const { firstName, lastName, email, password} = req.body;
    try {
        const userFound = await User.findOne({email});
        if(userFound) {
            return next(new AppErr("User already exists!", 500))
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            firstName, lastName, email, password: hashedPassword
        })
        res.json(({
            status: 'success',
            data: user
        }))
    } catch (error) {
        next(appErr(error.message))
    }
};

const userLoginController = async(req, res, next) => {
    const {email, password} = req.body;
    try {
        const userFound = await User.findOne({email});

        if(!userFound) {
            return next(appErr("You have entered invalid login credentials!"))
        }

        const passwordMatched = await bcrypt.compare(password, userFound.password);

        if(!passwordMatched) {
            return next(appErr("You have entered invalid login credentials!"))
        }
    
        res.json(({
            status: 'success',
            data: {
                firstName: userFound.firstName,
                lastName: userFound.lastName,
                email: userFound.email,
                isAdmin: userFound.isAdmin,
                token: genToken(userFound._id)
            }
        }))
    } catch (error) {
        next(appErr(error.message));
    }
};

const profileViewController = async(req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        const usersWhoViewed = await User.findById(req.userAuth);

        if(user && usersWhoViewed) {
            const userAlreadyViewed = user.viewers.find(
                viewer => viewer.toString() === usersWhoViewed._id.toJSON()
            );
        if(userAlreadyViewed) {
            return next(appErr("You already saw this profile!"));
        } else {
            user.viewers.push(usersWhoViewed._id);
            await user.save();
            res.json({
                status: 'success',
                data: "Successfully viewed this profile"
            });
        }
      }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const usersController = async(req, res, next) => {
    try {
        const users = await User.find()
        res.json({
            status: 'success',
            data: users
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

const unblockUserController = async(req, res, next) => {
    try {
        const userToUnblock = await User.findById(req.params.id);

        const userWhoUnblocks = await User.findById(req.userAuth);

        if(userToUnblock && userWhoUnblocks) {
            const userAlreadyBlocked = userWhoUnblocks.blocked.find(blocked => blocked.toString() === userToUnblock._id.toString());

            if(!userAlreadyBlocked) {
                return next(appErr("You have not blocked this user at the first place."))
            }

            userWhoUnblocks.blocked = userWhoUnblocks.blocked.filter(blocked => blocked.toString() !== userToUnblock._id.toString());
            await userWhoUnblocks.save();

            res.json({
                status: 'success',
                data: "User unblocked!"
            })
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const blockUserController = async(req, res, next) => {
    try {
        const userToBlock = await User.findById(req.params.id);
        const userWhoBlocks = await User.findById(req.userAuth);

        if(userToBlock && userWhoBlocks) {
            const userAlreadyBlocked = userWhoBlocks.blocked.find(blocked => blocked.toString() === userToBlock._id.toString());
            if(userAlreadyBlocked) {
                return next(appErr("You already blocked this user"));
            }

            userWhoBlocks.blocked.push(userToBlock._id);
            await userWhoBlocks.save();

            res.json({
                status: 'success',
                data: "User successfully blocked!"
            })
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const adminBlockController = async(req, res, next) => {
    try {
        const userToBlock = await User.findById(req.params.id);

        if(userToBlock.isBlocked) {
            return next(appErr("You already blocked this user!"))
        }

        if(!userToBlock) {
            return next(appErr("User not found!"));
        }

        userToBlock.isBlocked = true;
        await userToBlock.save();
        res.json({
            status: 'success',
            data: "Admin blocked this user successfully!"
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

const adminUnblockController = async(req, res, next) => {
    try {
        const userToUnblock = await User.findById(req.params.id);

        if(!userToUnblock) {
            return next(appErr("User not Found!"))
        }

        if(!userToUnblock.isBlocked) {
            return next(appErr("This user is not blocked at the first place!"))
        }

        userToUnblock.isBlocked = false;
        await userToUnblock.save();
        res.json({
            status: 'success',
            data: "Successfully unblocked a user!"
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

const followingController = async(req, res, next) => {
    try {
        const userToFollow = await User.findById(req.params.id);

        const userFollowing = await User.findById(req.userAuth);

        if(userToFollow && userFollowing) {

            const userAlreadyFollowed = userToFollow.followers.find( follower => follower.toString() === userFollowing._id.toString());
            if(userAlreadyFollowed) {
                return next(appErr("Already followed this user"));
            } else {
                userToFollow.followers.push(userFollowing._id);
                userFollowing.following.push(userToFollow._id);

                await userFollowing.save();
                await userToFollow.save();

                res.json({
                    status: 'success',
                    data: "Successfully followed this user!"
                })
            }
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const unFollowController = async(req, res, next) => {
    try {
        const userToUnFollow = await User.findById(req.params.id);

        const userWhoUnFollows = await User.findById(req.userAuth);

        if(userToUnFollow && userWhoUnFollows) {
            const userAlreadyFollowed = userToUnFollow.followers.find( follower => follower.toString() === userWhoUnFollows._id.toString());
            if(!userAlreadyFollowed) {
                return next(appErr("You don't follow this user!"));
            } else {
                userToUnFollow.followers = userToUnFollow.followers.filter(follower => follower.toString() !== userWhoUnFollows._id.toString());
                
                await userToUnFollow.save();
                userWhoUnFollows.following = userWhoUnFollows.following.filter(following => following.toString() !== userToUnFollow._id.toString());

                await userWhoUnFollows.save();

                res.json({
                    status: 'success',
                    data: "Successfully unfollowed this user!"
                });
            }
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const singleUserController = async(req, res, next) => {
    try {
        const user = await User.findById(req.userAuth).populate('posts');
        res.json({
            status: 'success',
            data: user
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

const updateUserController = async(req, res, next) => {
    const {email, firstName, lastName} = req.body;
    try {
        if(email) {
            const emailCheck = await User.findOne({email});
            if(emailCheck) {
                return next(appErr("Email is already taken", 400));
            }
        }
        const user = await User.findByIdAndUpdate(req.userAuth, {
            firstName, lastName, email
        }, {
            new: true,
            runValidators: true
        });       
        res.json({
            status: 'success',
            data: user
        })
    } catch (error) {
        next(appErr(error.message));
    }
};

const updatePasswordController = async(req, res, next) => {
    const {password} = req.body;
    try {
        if(password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.findByIdAndUpdate(req.userAuth, { password: hashedPassword }, { new: true, runValidators: true });
            res.json({
                status: 'success',
                data: "Password update success!"
            })
        } else {
            return next(appErr('Please provide insert your new password'));
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const deleteAccountController = async(req, res, next) => {
    try {
        const userToDelete = await User.findById(req.userAuth);
        await Post.deleteMany({user: req.userAuth});
        
        await Comment.deleteMany({user: req.userAuth});

        await Category.deleteMany({user: req.userAuth});

        await userToDelete.deleteOne();

            res.json({
                status: 'success',
                data: "Account deleted!"
            })
        
    } catch (error) {
        next(appErr(error.message));
    }
};

const profilePhotoController = async(req, res, next) => {
    // console.log(req.file)
    try {
        const userToUpdate = await User.findById(req.userAuth);

        if(!userToUpdate) {
            return next(appErr("User not found", 403));
        }

        if(userToUpdate.isBlocked) {
            return next(appErr("Your account is blocked!", 403));
        }
        if(req.file) {
            await User.findByIdAndUpdate(req.userAuth, {
                $set: {
                    profilePhoto: req.file.path,
                }
            },{
                new: true
            }
            );
            res.json ({
                status: "success",
                data: "Profile photo Upload Success!"
            });
        }
        } 
    catch (error) {
        next(appErr(error.message, 500));
    }
};

module.exports = {
    userRegController,
    userLoginController,
    usersController,
    singleUserController,
    updateUserController,
    profilePhotoController,
    profileViewController,
    followingController,
    unFollowController,
    blockUserController,
    unblockUserController,
    adminBlockController,
    adminUnblockController,
    updatePasswordController,
    deleteAccountController
}