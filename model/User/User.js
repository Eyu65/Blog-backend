const mongoose = require("mongoose");
const Post = require("../Post/Post");


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required!"]
    },
    lastName: {
        type: String,
        required: [true, "Last name is required!"]
    },
    profilePhoto: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required!"]
    },
    password: {
        type: String,
        required: [true, "Password is required!"]
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["Admin", "Guest", "Editor"]
    },
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    comments: [
        {
            type: String,
            ref: "Comment"
        }
    ],
    blocked: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    // plan: {
    //     type: String,
    //     enum: ['Free', 'Premium', 'Pro'],
    //     default: 'Free'
    // },
    award: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold'],
        default: "Bronze"
    }
},{
    timestamps: true,
    toJSON: { virtuals: true}
});

userSchema.pre('findOne', async function(next) {
    const userId = this._conditions._id;

    const posts = await Post.find({ user: userId});
    const lastPost = posts[posts.length - 1];

    const lastPostedDate = new Date(lastPost && lastPost.createdAt);
    const lastPostedDateStr = lastPostedDate.toDateString();
    userSchema.virtual('lastPostedDate').get(function () {
        return lastPostedDateStr;
    });

    const currentDate = new Date();
    const diff = currentDate - lastPostedDate;
    const dayDiff = diff/(1000 * 3600 * 24);

    if(dayDiff > 60) {
        userSchema.virtual('Inactive').get(function () {
            return true;
        });
        await User.findByIdAndUpdate(userId, {
            isBlocked: true
        },{
        new: true
        }
        )
    } else {
        userSchema.virtual('Inactive').get(function () {
            return false;
        });
        await User.findByIdAndUpdate(userId, {
            isBlocked: false
        }, {
            new: true
        })
    }

    const lastSeen = Math.floor(dayDiff);
    userSchema.virtual('lastActive').get( function() {
        if(lastSeen <= 0) {
            return 'Today';
        } else if(lastSeen === 1) {
            return 'Yesterday'
        } else if(lastSeen) {
            return `${lastSeen} days ago`;
        }
    });

    const numOfPosts = posts.length;

    if(numOfPosts < 10) {
        await User.findByIdAndUpdate(userId, {
            award: "Bronze"
        }, {
            new: true
        })
    } else if(numOfPosts > 10) {
        await User.findByIdAndUpdate(userId, {
            award: "Silver"
        }, {
            new: true
        })
    } else if(numOfPosts > 30) {
        await User.findByIdAndUpdate(userId, {
            award: "Gold"
        }, {
            new: true
        })
    }
    next();
});

userSchema.virtual("fullname").get(function () {
    return `${this.firstName} ${this.lastName}`
});

userSchema.virtual("initials").get(function () {
    return `${this.firstName[0]}${this.lastName[0]}`
});

userSchema.virtual("postCount").get(function () {
    return this.posts.length;
});

userSchema.virtual("followersCount").get(function () {
    return this.followers.length;
});

userSchema.virtual("followingCount").get(function () {
    return this.following.length;
});

userSchema.virtual("viewersCount").get(function () {
    return this.viewers.length;
});

userSchema.virtual("blockingCount").get(function () {
    return this.blocked.length;
});

const User = mongoose.model('User', userSchema);

module.exports = User;