const Comment = require("../model/Comment/Comment");
const Post = require("../model/Post/Post");
const User = require("../model/User/User");
const { appErr } = require(".././utility/appErr");

const createCommentController = async (req, res, next) => {
    const {description} = req.body;
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.userAuth);
        const comment = await Comment.create({
            post: post._id,
            user: req.userAuth
        });

        post.comments.push(comment._id);
        user.comments.push(comment._id);

        await post.save({validateBeforeSave: false});
        await user.save({validateBeforeSave: false});
        res.json(({
            status: 'success',
            data: comment
        }))
    } catch (error) {
        next(appErr(error.message));
    }
};

const editCommentController = async (req, res, next) => {
    const {description} = req.body;
    try {

        const comment = await Comment.findById(req.params.id);
        if(comment.user.toString() !== req.userAuth.toString()) {
            return next(appErr("You cannot update this comment!", 403));
        }

        await Comment.findByIdAndUpdate(req.params.id, {description}, {
            new: true, runValidators: true
        });

        res.json(({
            status: 'success',
            data: "Comment updated!"
        }))
    } catch (error) {
        next(appErr(error.message));
    }
    
};

const deleteCommentController = async (req, res, next) => {
        try {

            const comment = await Comment.findById(req.params.id);
            if(comment.user.toString() !== req.userAuth.toString()) {
                return next(appErr("You cannot update this comment!", 403));
            }

            await Comment.findByIdAndDelete(req.params.id);

            res.json(({
                status: 'success',
                data: "Comment deleted!"
            }))
        } catch (error) {
            next(appErr(error.message));
        }
};


module.exports = {
    createCommentController,
    deleteCommentController,
    editCommentController
}
