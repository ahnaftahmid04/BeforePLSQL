const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(id) {
    const payload = {
        userId: id
    };

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "6hr"});
}

module.exports = jwtGenerator;