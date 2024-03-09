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
// community route
app.use("/communities", require("./routes/community"));
// topic route
app.use("/topics", require("./routes/topics"));
// message route
app.use("/messages", require("./routes/messages"));
// location route
app.use("/locations", require("./routes/location"));
// notification route
app.use("/notifications", require("./routes/notification"));
// verification route
app.use("/admin", require("./routes/admin"));

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});