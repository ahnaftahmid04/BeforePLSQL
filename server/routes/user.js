const router=require('express').Router();
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.get('/find/:username',authorize,async(req,res)=>{
    try{
        const {username} = req.params;
        const getUserQuery = "SELECT u.name, u.username,r.followeruserid FROM users AS u LEFT JOIN user_relationship AS r ON (u.id=r.followeduserid AND r.followeruserid=$1) WHERE LOWER(u.username) LIKE LOWER('%' || $2 || '%')";
        const values = [req.userId, username];
    pool.query(getUserQuery,values, (err, data) => {
    if (err) {
        return res.status(500).json(err);
      }
    
      /*if (!data || data.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
    
      // Destructure properties, excluding 'password'
      const { password, ...userInfo } = data[0];
      */
      return res.status(200).json(data.rows);
    });


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/',authorize,async(req,res)=> {
    try{
        const q = "UPDATE users SET bio=$1, location=$2 WHERE id=$3 RETURNING *";
        const values = [req.body.bio, req.body.location, req.userId];
    
        pool.query(q, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating user." });
            }
    
            return res.status(200).json(data.rows); // Assuming `data.rows` contains the updated user data
        });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/thisUser', authorize, async(req,res)=>{
    try{
        const q = "SELECT username, name FROM users WHERE id=$1";
        const values = [req.userId];
    
        pool.query(q, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error getting user." });
            }
    
            return res.status(200).json(data.rows[0]); // Assuming `data.rows` contains the updated user data
        });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/otherUser/:username', authorize, async(req,res)=>{
    try{
        const {username} = req.params;
        const q = "SELECT username, name, bio, location FROM users WHERE username=$1";

        pool.query(q, [username], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error getting user." });
            }
    
            return res.status(200).json(data.rows[0]); // Assuming `data.rows` contains the updated user data
        });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;