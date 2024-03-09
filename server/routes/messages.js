const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');


// Function to send a message
router.post('/', authorize, async (req, res) => {
    try {
        const { receiver_user_name, content } = req.body;
        const sender_user_id = req.userId; // Assuming sender_user_id is obtained from authorization
        const receiver_user_id_result = await pool.query("SELECT id FROM users WHERE username = $1", [receiver_user_name]);
        const receiver_user_id = receiver_user_id_result.rows[0].id; // Extracting the id from the query result

        // Query to insert the message into the messages table
        const insertMessageQuery = `
            INSERT INTO messages(sender_user_id, receiver_user_id, content)
            VALUES($1, $2, $3)
            RETURNING *`;
        const values = [sender_user_id, receiver_user_id, content];

        pool.query(insertMessageQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Message sent successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Function to get messages between two users
router.get('/:receiver_user_name', authorize, async (req, res) => {
    try {
        const { receiver_user_name } = req.params;
        const sender_user_id = req.userId; // Assuming sender_user_id is obtained from authorization

        const receiver_user_id_result = await pool.query("SELECT id FROM users WHERE username = $1", [receiver_user_name]);
        const receiver_user_id = receiver_user_id_result.rows[0].id; // Extracting the id from the query result

        // Query to get messages between the sender and receiver users
        const getMessagesQuery = `
            SELECT * 
            FROM messages 
            WHERE (sender_user_id = $1 AND receiver_user_id = $2)
               OR (sender_user_id = $2 AND receiver_user_id = $1)
            ORDER BY sent_at`;
        const values = [sender_user_id, receiver_user_id];

        pool.query(getMessagesQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(data.rows);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Function to update the seen status of a message
router.put('/:user_id', authorize, async (req, res) => {
    try {
        const { user_id } = req.params;
        const receiver_user_id = req.userId; // Assuming receiver_user_id is obtained from authorization

        // Query to update the seen status of the message
        const updateSeenStatusQuery = `
            UPDATE messages
            SET seen_status = true
            WHERE sender_user_id = $1 AND receiver_user_id = $2
            RETURNING *`;
        const values = [user_id, receiver_user_id];

        pool.query(updateSeenStatusQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (data.rows.length === 0) {
                return res.status(404).json({ message: "Message not found or you are not the receiver" });
            }
            return res.status(200).json({ message: "Message seen status updated successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Retrieve all users who have messaged the specified user
router.get('/users/:num', authorize, async (req, res) => {
    try {
        const userId  = req.userId;
        const num = req.params.num;

        // Retrieve all users who have messaged the specified user
        const query = `
        SELECT 
        u.id, 
        u.username, 
        u.name, 
        u.profilepic, 
        MAX(m.sent_at) AS last_message_time,
        (SELECT content FROM messages WHERE (sender_user_id = $1 AND receiver_user_id = u.id) OR (sender_user_id = u.id AND receiver_user_id = $1) ORDER BY sent_at DESC LIMIT 1) AS last_message_content,
        (SELECT seen_status FROM messages WHERE (sender_user_id = $1 AND receiver_user_id = u.id) OR (sender_user_id = u.id AND receiver_user_id = $1) ORDER BY sent_at DESC LIMIT 1) AS last_message_seen_status,
        (SELECT sender_user_id FROM messages WHERE (sender_user_id = $1 AND receiver_user_id = u.id) OR (sender_user_id = u.id AND receiver_user_id = $1) ORDER BY sent_at DESC LIMIT 1) AS last_message_sender_id
    FROM 
        users u
    JOIN 
        messages m ON u.id = m.sender_user_id OR u.id = m.receiver_user_id
    WHERE 
        (m.sender_user_id = $1 OR m.receiver_user_id = $1) AND u.id != $1
    GROUP BY 
        u.id, u.username, u.name, u.profilepic
    ORDER BY 
        last_message_time DESC`;

        const { rows } = await pool.query(query, [userId]);
        return res.status(200).json(rows);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;