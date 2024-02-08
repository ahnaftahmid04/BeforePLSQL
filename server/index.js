const express = require('express');
const app = express();
const cors = require('cors');

// middleware
app.use(express.json()); // req.body
app.use(cors());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Credentials",true); 
    next();
});

// routes

// register and login routes
app.use("/auth", require("./routes/jwtAuth"));
// user route
app.use("/users", require("./routes/user"));
// post route
app.use("/posts", require("./routes/post"));
// follow route
app.use("/relationships", require("./routes/relationship"));
// comment route
app.use("/comments", require("./routes/comment"));
// like route
app.use("/likes", require("./routes/like"));

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});