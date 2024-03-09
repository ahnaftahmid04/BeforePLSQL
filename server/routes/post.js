const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.get('/',authorize,async(req,res,)=>{
    try{
        const q =
    "SELECT distinct p.post_id, p.description, p.img, p.created_at, u.id AS userId, u.username, u.name, u.profilepic FROM posts AS p JOIN users AS u ON u.id = p.user_id LEFT JOIN user_relationship AS r ON (r.followeduserid=p.user_id) WHERE r.followeruserid=$1 OR p.user_id=$1 ORDER BY p.created_at DESC";

    pool.query(q, [req.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/', authorize, async (req, res) => {
    try {
        const { description, img, topic_text, post_type } = req.body;
        
        // Query to find the topic ID based on the topic text
        const findTopicQuery = "SELECT topic_id FROM topics WHERE text = $1";
        const topicResult = await pool.query(findTopicQuery, [topic_text]);
        
        if (topicResult.rows.length === 0) {
            // If the topic doesn't exist, you may choose to handle this case accordingly
            return res.status(404).json({ message: "Topic not found" });
        }
        
        const topic_id = topicResult.rows[0].topic_id;
        
        const insertPostQuery = `
            INSERT INTO posts(description, img, created_at, user_id, topic_id, post_type)
            VALUES($1, $2, $3, $4, $5,$6)
            RETURNING *`; // Assuming it's a normal post
        const values = [
            description,
            img,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            req.userId,
            topic_id,
            post_type
        ];

        pool.query(insertPostQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(data.rows[0].post_id);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/users/:username',authorize,async(req,res)=>{
    try{
        const q =`
            SELECT
                p.post_id,
                p.description,
                p.img,
                u.id AS userId,
                u.username,
                u.name,
                u.profilepic
            FROM
                posts AS p
            JOIN
                users AS u ON u.id = p.user_id
            WHERE
                p.user_id = (
                    SELECT
                        id
                    FROM
                        users
                    WHERE
                        username = $1
                )
            ORDER BY
            p.created_at DESC`;

        const {username} = req.params;
    pool.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/threads', authorize, async (req, res) => {
    try {
        const { post_id } = req.body;
        const insertThreadQuery = "INSERT INTO threads(postID) VALUES($1) RETURNING *";
        const values = [post_id];

        pool.query(insertThreadQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Thread created successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/events', authorize, async (req, res) => {
    try {
        const { eventName, scheduledTime, city_name, country_name, post_id } = req.body;

        // Query to find the location_id based on city_name and country_name
        const findLocationQuery = `
            SELECT location_id
            FROM location
            WHERE city_name = $1 AND country_name = $2`;

        const locationResult = await pool.query(findLocationQuery, [city_name, country_name]);

        // Check if a location was found
        if (locationResult.rows.length === 0) {
            return res.status(404).json({ message: "Location not found" });
        }

        // Extract the location_id from the query result
        const locationID = locationResult.rows[0].location_id;

        // Insert event into the events table
        const insertEventQuery = `
            INSERT INTO events(eventName, scheduledTime, locationID, postID)
            VALUES($1, $2, $3, $4) RETURNING *`;

        const values = [eventName, scheduledTime, locationID, post_id];

        pool.query(insertEventQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Event created successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/ads', authorize, async (req, res) => {
    try {
        const { content, post_id } = req.body;
        const insertAdQuery = "INSERT INTO ads(content, postID) VALUES($1, $2) RETURNING *";
        const values = [content, post_id];

        pool.query(insertAdQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Ad created successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/community', authorize, async (req, res) => {
    try {
        const userId = req.userId; // Directly access userId from req object

        const { description, img, community_name, post_type } = req.body;

        const findCommunityQuery = `
        SELECT community_id, topic_id
        FROM community
        WHERE community_name = $1`;
    
        const communityResult = await pool.query(findCommunityQuery, [community_name]);

        if (communityResult.rows.length === 0) {
            return res.status(404).json({ message: "Community not found" });
        }
    
    const { community_id, topic_id } = communityResult.rows[0];
        
        const insertPostQuery = `
            INSERT INTO posts(description, img, user_id, topic_id, community_id, created_at, post_type)
            VALUES($1, $2, $3, $4, $5, $6,$7)
            RETURNING *`; // Assuming it's a community post
        const values = [
            description,
            img,
            userId, // Assuming the user_id is obtained from authorization
            topic_id, // Assuming no specific topic is assigned for community posts
            community_id,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            post_type,
        ];

        pool.query(insertPostQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(data.rows[0].post_id);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/news/feed/community',authorize,async(req,res,)=>{
    try{
        const  userId  = req.userId;
        const q =`
        SELECT * from get_news_feed_community($1)
        ORDER BY created_at DESC`;
        
    pool.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/news/feed/events',authorize,async(req,res,)=>{
    try{
        const  userId  = req.userId;
        const q =`
        SELECT * from get_news_feed_events($1)
        ORDER BY event_scheduled_time DESC`;
        
    pool.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/news/feed', authorize, async (req, res) => {
    try {
        const { userId } = req;
        const newsFeedQuery = `
        SELECT DISTINCT ON (f.post_id) f.*
        FROM get_news_feed($1) AS f
        ORDER BY f.post_id DESC, created_at DESC`;
      
    pool.query(newsFeedQuery,[userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    })}
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

});


router.put('/events/:post_id/interested', authorize, async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.userId; // Get the user ID from the request

        // Check if the event exists
        const eventQuery = "SELECT * FROM events WHERE postid = $1";
        const eventResult = await pool.query(eventQuery, [post_id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Increment the interested_count by 1
        const updateInterestedQuery = `
            UPDATE events
            SET interested_count = COALESCE(interested_count, 0) + 1
            WHERE postid = $1
            RETURNING *`;

        const updatedEvent = await pool.query(updateInterestedQuery, [post_id]);
        const updatedEventId = updatedEvent.rows[0].eventid;


        // Insert record into user_event table
        const insertUserEventQuery = `
            INSERT INTO user_event_relationship (user_id, event_id)
            VALUES ($1, $2)`;
        await pool.query(insertUserEventQuery, [userId, updatedEventId]);

        return res.status(200).json({ message: "Interested count updated successfully!", updated_event: updatedEvent.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//show only events
router.get('/events',authorize,async(req,res)=>{
    try{
        const q =`
        SELECT * from events
        ORDER BY scheduledTime DESC`;
        
    pool.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/events/:post_id/notInterested', authorize, async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.userId; 

       
        const eventQuery = "SELECT * FROM events WHERE postid = $1";
        const eventResult = await pool.query(eventQuery, [post_id]);

        if (eventResult.rows.length === 0) {
            return res.status(404).json({ message: "Event not found" });
        }

       
        const updateNotInterestedQuery = `
            UPDATE events
            SET interested_count = GREATEST(COALESCE(interested_count, 0) - 1, 0)
            WHERE postid = $1
            RETURNING *`;

        const updatedEvent = await pool.query(updateNotInterestedQuery, [post_id]);
        const updatedEventId = updatedEvent.rows[0].eventid;

        // Delete record from user_event table
        const deleteUserEventQuery = `
            DELETE FROM user_event_relationship
            WHERE user_id = $1 AND event_id = $2`;
        await pool.query(deleteUserEventQuery, [userId, updatedEventId]);

        return res.status(200).json({ message: "Not interested count updated successfully!", updated_event: updatedEvent.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// show all the events in which the user is interested
router.get('/events/interested', authorize, async (req, res) => {
    try {
        const userId = req.userId; // Get the user ID from the request

        // Query to get all events in which the user is interested
        const getInterestedEventsQuery = `
        SELECT e.eventid, e.eventname AS event_name, e.scheduledtime AS event_scheduled_time, p.post_id,p.post_type, p.description, u.name, p.created_at, ll.city_name AS event_city_name, ll.country_name AS event_country_name, t.text AS topic_name, c.community_name
        FROM events AS e
        JOIN posts AS p ON e.postID = p.post_id
        JOIN users AS u ON p.user_id = u.id
        JOIN likes l ON e.postID = l.likepostid
        JOIN topics t ON t.topic_id = p.topic_id
        JOIN location AS ll ON e.locationID = ll.location_id
        LEFT JOIN community c ON (c.community_id = p.community_id)
        WHERE l.likeuserid = $1`;

        const interestedEvents = await pool.query(getInterestedEventsQuery, [userId]);

        return res.status(200).json(interestedEvents.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
router.get('/events/upcoming/city',authorize,async(req,res)=>{
    try{
        const userId=req.userId;
        const q =`
        SELECT e.eventid, e.eventname AS event_name, e.scheduledtime AS event_scheduled_time, p.post_id,p.post_type, p.description, u.name, p.created_at, ll.city_name AS event_city_name, ll.country_name AS event_country_name, t.text AS topic_name, c.community_name, COUNT(l.likeuserid) AS interested_count, u.verified_status, u.username
        FROM events AS e
        JOIN posts AS p ON e.postID = p.post_id
        JOIN users AS u ON p.user_id = u.id
        LEFT JOIN likes l ON e.postID = l.likepostid
        JOIN topics t ON t.topic_id = p.topic_id
        JOIN location AS ll ON e.locationID = ll.location_id
        LEFT JOIN community c ON (c.community_id = p.community_id)
        WHERE e.scheduledtime > NOW()
        AND (SELECT city_name FROM location WHERE location_id = e.locationid) = (SELECT city_name FROM location WHERE location_id = (SELECT location_id FROM users WHERE id = $1))
        GROUP BY e.eventid,p.post_id, p.post_type,p.description,u.name,p.created_at,ll.city_name, ll.country_name, t.text, c.community_name, u.verified_status, u.username
        ORDER BY e.scheduledtime ASC`;
        
    pool.query(q,[userId],(err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
router.get('/events/upcoming/country',authorize,async(req,res)=>{
    try{
        const userId=req.userId;
        const q =`
        SELECT e.eventid, e.eventname AS event_name, e.scheduledtime AS event_scheduled_time, p.post_id,p.post_type, p.description, u.name, p.created_at, ll.city_name AS event_city_name, ll.country_name AS event_country_name, t.text AS topic_name, c.community_name, COUNT(l.likeuserid) AS interested_count, u.verified_status, u.username
        FROM events AS e
        JOIN posts AS p ON e.postID = p.post_id
        JOIN users AS u ON p.user_id = u.id
        LEFT JOIN likes l ON e.postID = l.likepostid
        JOIN topics t ON t.topic_id = p.topic_id
        JOIN location AS ll ON e.locationID = ll.location_id
        LEFT JOIN community c ON (c.community_id = p.community_id)
        WHERE e.scheduledtime > NOW()
        AND (SELECT country_name FROM location WHERE location_id = e.locationid) = (SELECT country_name FROM location WHERE location_id = (SELECT location_id FROM users WHERE id = $1))
        GROUP BY e.eventid,p.post_id, p.post_type,p.description,u.name,p.created_at,ll.city_name, ll.country_name, t.text, c.community_name, u.verified_status, u.username
        ORDER BY e.scheduledtime ASC`;
        
    pool.query(q,[userId],(err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Trending events
router.get('/events/trending',authorize,async(req,res)=>{
    try{
        const q =`
        SELECT e.eventid, e.eventname AS event_name, e.scheduledtime AS event_scheduled_time, p.post_id,p.post_type, p.description, u.name, p.created_at, ll.city_name AS event_city_name, ll.country_name AS event_country_name, t.text AS topic_name, c.community_name, COUNT(l.likeuserid) AS interested_count, u.verified_status, u.username
        FROM events AS e
        JOIN posts AS p ON e.postID = p.post_id
        JOIN users AS u ON p.user_id = u.id
        JOIN likes l ON e.postID = l.likepostid
        JOIN topics t ON t.topic_id = p.topic_id
        JOIN location AS ll ON e.locationID = ll.location_id
        LEFT JOIN community c ON (c.community_id = p.community_id)
        GROUP BY e.eventid,p.post_id, p.post_type,p.description,u.name,p.created_at,ll.city_name, ll.country_name, t.text, c.community_name, u.verified_status, u.username
        ORDER BY interested_count DESC
        LIMIT 10`;
        
    pool.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//43. Show all users who are interested in an event
router.get('/events/interestedUsers',authorize,async(req,res)=>{
    try{
        const {query}=req.query;
        const q =
        `SELECT u.name,u.username,u.profilepic  
        FROM users AS u 
        JOIN user_event_relationship AS uer ON (uer.user_id=u.id) WHERE event_id = ${query}`;
        
    pool.query(q, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// event search
router.get('/events/search', authorize, async (req, res) => {
    try {
        const { query } = req.query; // The search query string
        
        // Build the base query
        let searchQuery = `
        SELECT e.eventid, e.eventname AS event_name, e.scheduledtime AS event_scheduled_time, p.post_id,p.post_type, p.description, u.name, p.created_at, ll.city_name AS event_city_name, ll.country_name AS event_country_name, t.text AS topic_name, c.community_name, u.verified_status, u.username
        FROM events AS e
        JOIN posts AS p ON e.postID = p.post_id
        JOIN users AS u ON p.user_id = u.id
        LEFT JOIN likes l ON e.postID = l.likepostid
        JOIN topics t ON t.topic_id = p.topic_id
        JOIN location AS ll ON e.locationID = ll.location_id
        LEFT JOIN community c ON (c.community_id = p.community_id)
        WHERE 
                LOWER(e.eventname) LIKE LOWER('%${query}%')
                OR LOWER(ll.city_name) LIKE LOWER('%${query}%')
                OR LOWER(ll.country_name) LIKE LOWER('%${query}%');
    
        `;
        
        // Execute the query
        const { rows } = await pool.query(searchQuery);

        return res.status(200).json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get("/events/:event_id", authorize, async (req, res) => {
    try {
        const { event_id } = req.params;
        const userId = req.userId;

        // Query to check if the user is interested in the event
        const q = `
            SELECT * FROM user_event_relationship WHERE user_id = $1 AND event_id = $2
        `;
        const values = [userId, event_id];

        // Execute the query
        const result = await pool.query(q, values);

        // Check if any rows are returned
        if (result.rows.length === 0) {
            // If no rows are returned, the user is not interested in the event
            return res.status(200).json([]);
        } else {
            // If rows are returned, the user is interested in the event
            return res.status(200).json(result.rows);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/polls', authorize, async (req, res) => {
    try {
        const { post_id } = req.body;
        const insertPollQuery = "INSERT INTO polls(post_id) VALUES($1) RETURNING *";
        const values = [post_id];

        pool.query(insertPollQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(data.rows[0]);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// insert polls options in the poll_options table
router.post('/pollOptions', authorize, async (req, res) => {
    try {
        const { poll_id, options } = req.body;
        
        // Loop through each option and insert it into the poll_options table
        for (const option of options) {
            const insertOptionQuery = "INSERT INTO poll_options(poll_id, option_name) VALUES($1, $2) RETURNING *";
            const values = [poll_id, option];
    
            await pool.query(insertOptionQuery, values);
        }

        res.status(200).json({ message: "Poll options inserted successfully!" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// poll vote_count update
router.post('/pollOptions/vote', authorize, async (req, res) => {
    try {
        const {poll_id,option_id} = req.body;
        const user_id = req.userId;
        
        // Increment the vote count for the specified poll option
        const updateVoteCountQuery = "INSERT INTO poll_option_user_relationship(poll_id,option_id,user_id) VALUES($1,$2,$3) RETURNING *";
        const values = [poll_id,option_id,user_id];
        
        const { rows } = await pool.query(updateVoteCountQuery, values);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Poll option not found!" });
        }

        res.status(200).json({ message: "Vote count updated successfully!", data: rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/pollOptions/:post_id', authorize,async (req, res) => {
    try {
        const { post_id } = req.params;

        // Query to get poll options and their vote count
        const pollOptionsQuery = `
            SELECT po.option_id, po.option_name, COUNT(pour.user_id) AS vote_count
            FROM poll_options po
            JOIN polls pl ON (pl.poll_id = po.poll_id)
            JOIN posts p ON (p.post_id = pl.post_id)
            LEFT JOIN poll_option_user_relationship pour ON po.option_id = pour.option_id
            WHERE p.post_id = $1
            GROUP BY po.option_id, po.option_name
        `;

        const { rows } = await pool.query(pollOptionsQuery, [post_id]);

        // Construct the response JSON
        const options = rows.map(row => ({
            option_id: row.option_id,
            option_name: row.option_name,
            vote_count: parseInt(row.vote_count) || 0  // If no votes, default to 0
        }));

        res.status(200).json({ options });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/polls/:post_id', authorize,async (req, res) => {
    try {
        const { post_id } = req.params;

        // Query to get poll options and their vote count
        const pollOptionsQuery = `
            SELECT poll_id FROM polls WHERE post_id = $1
        `;

        const { rows } = await pool.query(pollOptionsQuery, [post_id]);

        res.status(200).json({ poll_id: rows[0].poll_id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/pollOptions/:option_id/voters',authorize, async (req, res) => {
    try {
        const { option_id } = req.params;

        // Query to get users who voted for the specified option
        const votersQuery = `
            SELECT u.id, u.username, u.name
            FROM users u
            JOIN poll_option_user_relationship pour ON u.id = pour.user_id
            WHERE pour.option_id = $1
        `;

        const { rows } = await pool.query(votersQuery, [option_id]);

        // Construct the response JSON
        const voters = rows.map(row => ({
            user_id: row.id,
            username: row.username,
            name: row.name
        }));

        res.status(200).json({ option_id, voters });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// show all posts liked by the user
router.get('/likedPosts/:username',authorize,async(req,res)=>{
    const {username}=req.params;
    
    try{
        const q =`
            SELECT
            p.post_id,
            p.description,
            p.img,
            p.post_type,
            p.created_at,
            e.eventname AS event_name,
            e.eventid,
            e.scheduledTime AS event_scheduled_time,
            l.city_name AS event_city_name,
            l.country_name AS event_country_name,
            u.username,
            u.name,
            u.profilepic,
            tp.text AS topic_name,
            c.community_name
            FROM
                posts AS p
            JOIN
                users AS u ON u.id = p.user_id
            LEFT JOIN
                events AS e ON e.postid = p.post_id
            LEFT JOIN
                location AS l ON e.locationid = l.location_id
            LEFT JOIN
                threads AS t ON t.postid = p.post_id
            LEFT JOIN
                polls AS po ON po.post_id = p.post_id
            LEFT JOIN 
                topics AS tp ON (p.topic_id = tp.topic_id)
            LEFT JOIN
                community AS c ON (p.community_id = c.community_id)
            WHERE
                EXISTS (
                    SELECT 1
                    FROM likes l
                    WHERE l.likeuserid = (
                        SELECT id
                        FROM users
                        WHERE username = $1
                    )
                    AND l.likepostid = p.post_id
                )
            ORDER BY
                p.created_at DESC;
                
                    
         
         `;
    
    pool.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });
}
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Show all posts commented by the user
router.get('/commentedPosts/:username', authorize, async (req, res) => {
    const { username } = req.params;

    try {
        const q = `
            SELECT
            p.post_id,
            p.description,
            p.img,
            p.post_type,
            p.created_at,
            e.eventname AS event_name,
            e.eventid,
            e.scheduledTime AS event_scheduled_time,
            l.city_name AS event_city_name,
            l.country_name AS event_country_name,
            u.username,
            u.name,
            u.profilepic,
            tp.text AS topic_name,
            c1.community_name
            FROM
                posts AS p
            JOIN
                users AS u ON u.id = p.user_id
            LEFT JOIN
                events AS e ON e.postid = p.post_id
            LEFT JOIN
                location AS l ON e.locationid = l.location_id
            LEFT JOIN
                threads AS t ON t.postid = p.post_id
            LEFT JOIN
                polls AS po ON po.post_id = p.post_id
            LEFT JOIN 
                topics AS tp ON (p.topic_id = tp.topic_id)
            LEFT JOIN
                community AS c1 ON (p.community_id = c1.community_id)
                WHERE
                    EXISTS (
                        SELECT 1
                        FROM comments c
                        WHERE c.commenteruser_id = (
                            SELECT id
                            FROM users
                            WHERE username = $1
                        )
                        AND c.postid = p.post_id
                    )
                ORDER BY
                    p.created_at DESC
        `;

        pool.query(q, [username], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// delete polls given poll_id
router.delete('/polls/:poll_id', authorize, async (req, res) => {
    try {
        const { poll_id } = req.params;
        const userId = req.userId; // Get the active user ID from the request

        // Check if the poll exists and if the active user is the author
        const checkPollQuery = "SELECT * FROM polls WHERE poll_id = $1";
        const { rows } = await pool.query(checkPollQuery, [poll_id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Poll not found" });
        }


        // Delete the poll
        const deletePollQuery = "DELETE FROM polls WHERE poll_id = $1";
        await pool.query(deletePollQuery, [poll_id]);

        return res.status(200).json({ message: "Poll deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// news feed for following only
router.get('/news/feed/following',authorize,async(req,res,)=>{
    try{
        const  userId  = req.userId;
        const q =`
        SELECT * from get_news_feed_followingonly($1)
        ORDER BY created_at DESC`;
        
    pool.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//Show all posts about the topics in which the user is interested in
router.get('/postsAboutInterestingTopics', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        // Construct the SQL query to fetch posts about interesting topics
        const sqlQuery = `
            SELECT 
                p.post_id,
                p.description,
                p.img,
                p.post_type,
                p.created_at,
                e.eventname AS event_name,
                e.eventid,
                e.scheduledTime AS event_scheduled_time,
                l.city_name AS event_city_name,
                l.country_name AS event_country_name,
                u.username,
                u.name,
                u.profilepic,
                tp.text AS topic_name,
                c1.community_name
            FROM 
                posts AS p
            JOIN 
                users AS u ON u.id = p.user_id
            LEFT JOIN 
                events AS e ON e.postid = p.post_id
            LEFT JOIN 
                location AS l ON e.locationid = l.location_id
            LEFT JOIN 
                threads AS t ON t.postid = p.post_id
            LEFT JOIN 
                polls AS po ON po.post_id = p.post_id
            LEFT JOIN 
                topics AS tp ON (p.topic_id = tp.topic_id)
            LEFT JOIN
                community AS c1 ON (p.community_id = c1.community_id)
            WHERE 
                p.topic_id IN (SELECT topic_id FROM get_user_interesting_topics($1))
            ORDER BY 
                p.created_at DESC
        `;

        // Execute the SQL query
        const { rows } = await pool.query(sqlQuery, [userId]);

        // Send the posts about interesting topics as the API response
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching posts about interesting topics:', error);
        res.status(500).send('Server error');
    }
});

// get news feed own
router.get('/news/feed/own/:username',authorize,async(req,res,)=>{
    try{
        const {username}=req.params;
        const q =`
        SELECT * from get_news_feed_own(
            (SELECT id FROM users WHERE username = $1)
        )
        WHERE community_name IS NULL
        ORDER BY created_at DESC`;
        
    pool.query(q, [username], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    }
    )
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports=router;