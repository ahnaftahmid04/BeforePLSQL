const router = require("express").Router();
const pool = require("../db");
const bcrypt = require("bcrypt");
const jwtGenerator = require("../utils/jwtGenerator");
const validInfo = require("../middleware/validInfo");
const authorization = require("../middleware/authorization");

// register route
router.post("/register", validInfo, async (req, res) => {
    try {

        // destructure req.body (username, email, password, name)
        const {username, email, password, name} = req.body;

        // check if user exists (if user exists then throw error)
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if(user.rows.length > 0) {
            return res.status(401).send("User already exists");
        }

        // bcrypt the user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bcryptPassword = await bcrypt.hash(password, salt);

        // enter the new user inside our database

        const newUser = await pool.query(
            "INSERT INTO users(username, email, password, name) VALUES($1, $2, $3, $4) RETURNING *",
            [username, email, bcryptPassword, name]
        );

        // generate jwt token
        const token = jwtGenerator(newUser.rows[0].id);
        return res.json({token});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

// login route
router.post("/login", validInfo, async (req, res) => {
    try {
        
        // destructure req.body
        const {username, password} = req.body;

        // check if user doesn't exist (if user doesn't exist then throw error)
        const user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if(user.rows.length === 0) {
            return res.status(401).json("Password or username is incorrect");
        }

        // check if incoming password is the same as the database password
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if(!validPassword) {
            return res.status(401).json("Password or username is incorrect");
        }

        // give them the jwt token
        const token = jwtGenerator(user.rows[0].id);
        return res.json({token});

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

// verify route
router.get("/verify", authorization, async (req, res) => {
    try {
        res.json(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;