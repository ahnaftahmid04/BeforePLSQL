module.exports = (req, res, next) => {
    const { username, email, password, name } = req.body;

    function validEmail(userEmail) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userEmail);
    }

    if (req.path === "/register") {
        console.log(!email.length);
        if (![username, email, password, name].every(Boolean)) {
            return res.status(401).json("Missing Credentials");
        } else if (!validEmail(email)) {
            return res.status(401).json("Invalid Email");
        }
    } 
    else if (req.path === "/login") {
        if (![username, password].every(Boolean)) {
            return res.status(401).json("Missing Credentials");
        }
    }

    next();
};