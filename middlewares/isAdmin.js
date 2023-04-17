const User = require("../model/User/User");
const { appErr } = require("../utility/appErr");
const getToken = require("../utility/getToken");
const verifyToken = require("../utility/verifyToken");

const isAdmin = async (req, res, next) => {
    // Get the token header
    const token = getToken(req);
    // Verify the token
    const decodedUser = verifyToken(token);
    //Saving the user into reqObj
    req.userAuth = decodedUser.id;
    
    const user = await User.findById(decodedUser.id);
    if(user.isAdmin) {
        return next();
    } else {
        return next(appErr("Access denied", 403));
    }
};

module.exports = isAdmin;