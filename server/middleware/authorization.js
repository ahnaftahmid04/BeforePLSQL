const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
    // get token from header
    const jwtToken = req.header("token");
    if (!jwtToken) {
        return res.status(403).json("Not authorized");
    }

    try {
        const payload = jwt.verify(jwtToken, process.env.jwtSecret);
        req.userId = payload.userId;
        next();
    } catch (error) {
        console.error(error.message);
        return res.status(403).json("Not authorized");
    }
};