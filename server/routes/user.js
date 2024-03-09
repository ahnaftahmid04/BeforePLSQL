const router=require('express').Router();
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.get('/find/:username',authorize,async(req,res)=>{
    try{
        const {username} = req.params;
        const getUserQuery = "SELECT u.id, u.name, u.username, r.followeruserid FROM users AS u LEFT JOIN user_relationship AS r ON (u.id=r.followeduserid AND r.followeruserid=$1) WHERE LOWER(u.name) LIKE LOWER('%' || $2 || '%')";
        const values = [req.userId, username];
    pool.query(getUserQuery,values, (err, data) => {
    if (err) {
        return res.status(500).json(err);
      }
      return res.status(200).json(data.rows);
    });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/', authorize, async (req, res) => {
    try {
        const { bio, city_name, country_name } = req.body;
        const userId = req.userId;


        const locationQuery = "SELECT location_id FROM location WHERE city_name=$1 AND country_name=$2";
        const locationResult = await pool.query(locationQuery, [city_name, country_name]);


        if (locationResult.rows.length === 0) {
            return res.status(404).json({ message: "Location not found" });
        }


        const locationId = locationResult.rows[0].location_id;

        // Update the user's information
        const updateUserQuery = "UPDATE users SET bio=$1, location_id=$2 WHERE id=$3 RETURNING *";
        const values = [bio, locationId, userId];

        pool.query(updateUserQuery, values, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Error updating user." });
            }

            return res.status(200).json(data.rows); // Assuming data.rows contains the updated user data
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/thisUser', authorize, async(req,res)=>{
    try{
        const q = "SELECT id, username, name, verified_status FROM users WHERE id=$1";
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

router.get('/otherUser/:username/', authorize, async(req,res)=>{
    try{
        const {username} = req.params;
        const q = "SELECT U.name, U.username, U.bio, U.id, U.verified_status, L.city_name, L.country_name FROM users U JOIN location L ON (L.location_id = U.location_id) WHERE U.username = $1";

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

//users jader posst shob cheye beshi like korsi
router.get('/topLikedUsers', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        const topLikedUsersQuery = `
            SELECT u.username,u.name, COUNT(l.likepostid) AS total_likes
            FROM likes l
            JOIN posts p ON l.likepostid = p.post_id
            JOIN users u ON u.id = p.user_id
            WHERE l.likeuserid=$1
            GROUP BY u.username,u.name
            ORDER BY total_likes DESC
            LIMIT 3
        `;

        const { rows } = await pool.query(topLikedUsersQuery, [userId]);

        res.status(200).json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// users jader sathe shob cheye beshi chat korsi

router.get('/topChattedUsers', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        const topChattedUsersQuery = `
            SELECT u.username, u.name, COUNT(DISTINCT m.message_id) AS total_messages
            FROM messages m
            JOIN users u ON (u.id = m.sender_user_id OR u.id = m.receiver_user_id)
            WHERE (m.sender_user_id = $1 OR m.receiver_user_id = $1) AND u.id != $1
            GROUP BY u.username, u.name
            ORDER BY total_messages DESC
            LIMIT 3
        `;

        const { rows } = await pool.query(topChattedUsersQuery, [userId]);

        res.status(200).json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// user interesting topics top 10
router.get('/userInterestingTopics', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        // Construct the SQL query to fetch the interesting topics of the user
        const sqlQuery = `
           SELECT * from get_user_interesting_topics($1)
        `;

        // Execute the SQL query
        const { rows } = await pool.query(sqlQuery, [userId]);

        // Send the interesting topics as the API response
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching interesting topics:', error);
        res.status(500).send('Server error');
    }
});

// get user tag
router.get('/userTag', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        // Construct the SQL query to fetch the tag of user
        const sqlQuery = `
            SELECT tag FROM users WHERE id = $1
        `;

        // Execute the SQL query
        const { rows } = await pool.query(sqlQuery, [userId]);

        // Send the interesting topics as the API response
        res.status(200).json(rows[0].tag);
    } catch (error) {
        console.error('Error fetching interesting topics:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;