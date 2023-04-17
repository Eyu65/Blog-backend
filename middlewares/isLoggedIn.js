const { appErr } = require("../utility/appErr");
const getToken = require("../utility/getToken");
const verifyToken = require("../utility/verifyToken");

const isLoggedIn = (req, res, next) => {
    // Get the token header
    const token = getToken(req);
    // Verify the token
    const decodedUser = verifyToken(token);
    //Saving the user into reqObj
    req.userAuth = decodedUser.id;
    
    if(!decodedUser) {
        return next(appErr("Invalid or expired token, Please try logging in again", 500));
    } else {
        next();
    }
};

module.exports = isLoggedIn;