const Post = require("../model/Post/Post");
const User = require("../model/User/User");
const { appErr } = require("../utility/appErr");

const createPostController = async (req, res, next) => {
    const {title, description, category} = req.body;
    try {
        const author = await User.findById(req.userAuth);

        if(author.isBlocked) {
            return next(appErr('Access denied, your account is blocked', 403));
        }

        const postCreated = await Post.create({ 
            title, 
            description, 
            user: author._id, 
            category,
            photo: req && req.file && req.file.path
        });
        author.posts.push(postCreated);
        await author.save();
        
        res.json(({
            status: 'success',
            data: postCreated
        }));
    } catch (error) {
        next(appErr(error.message));
    }
}

const getPostController = async(req, res, next) => {
    try {
        const posts = await Post.find({}).populate('user').populate('category', 'title');

        const filteredPost = posts.filter(post => {
            const blockedUsers = post.user.blocked;
            const isBlocked = blockedUsers.includes(req.userAuth);

            return !isBlocked;
        });
        res.json(({
            status: 'success',
            data: posts
        }))
    } catch (error) {
        next(appErr(error.message));
    }
}

const postLikeController = async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const liked = post.likes.includes(req.userAuth);
        if(liked) {
            post.likes = post.likes.filter(like => like != req.userAuth);
            await post.save();
        } else {
            post.likes.push(req.userAuth);
            await post.save();
        }

        res.json(({
            status: 'success',
            data: 'You liked this post successfully!'
        }))
    } catch (error) {
        next(appErr(error.message));
    }
}

const postDislikeController = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        const unLiked = post.dislikes.includes(req.userAuth);
        if(unLiked) {
            post.disLikes = post.disLikes.filter(dislike => dislike != req.userAuth);
            await post.save();
        } else {
            post.disLikes.push(req.userAuth);
            await post.save();
        }

        res.json(({
            status: 'success',
            data: 'You unLiked this post!'
        }))
    } catch (error) {
        next(appErr(error.message));
    }
}

const postDetailsController = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        const viewed = post.numViews.includes(req.userAuth);
        if(viewed) {
            res.json({
                status: 'success',
                data: post
            });
        } else {
            post.numViews.push(req.userAuth);
            await post.save();

            res.json({
                status: 'success',
                data: post
            });
        }
        
    } catch (error) {
        next(appErr(error.message));
    }
}

const deletePostController = async(req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);

        if(post.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You cannot delete this post!", 403));
        }

        await Post.findByIdAndDelete(req.params.id);
        res.json(({
            status: 'success',
            data: "Post deleted!"
        }))
    } catch (error) {
        next(appErr(error.message));
    }
}

const editPostController = async(req, res, next) => {
    const { title, description, category} = req.body;
    try {
        const post = await Post.findById(req.params.id);

        if(post.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You cannot update this post!", 403));
        }

        await Post.findByIdAndUpdate(req.params.id, {title, description, category, photo: req?.file?.path}, {
            new: true
        });
        res.json(({
            status: 'success',
            data: "Post updated successfully!"
        }))
    } catch (error) {
        next(appErr(error.message));
    }
}

module.exports = {
    createPostController,
    postDetailsController,
    deletePostController,
    editPostController,
    getPostController,
    postLikeController,
    postDislikeController
}