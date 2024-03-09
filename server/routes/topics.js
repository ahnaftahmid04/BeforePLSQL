const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');


router.post('/', authorize, async (req, res) => {
    try {
        const { text } = req.body;
        const insertTopicQuery = "INSERT INTO topics(text) VALUES($1) RETURNING *";
        const values = [text];

        pool.query(insertTopicQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Topic created successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', authorize, async (req, res) => {
    try {
        const getTopicsQuery = "SELECT * FROM topics";

        pool.query(getTopicsQuery, (err, data) => {
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

router.get('/:id', authorize, async (req, res) => {
    try {
        const { id } = req.params;
        const getTopicQuery = "SELECT * FROM topics WHERE topic_id = $1";
        const values = [id];

        pool.query(getTopicQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (data.rows.length === 0) {
                return res.status(404).json({ message: "Topic not found" });
            }
            return res.status(200).json(data.rows[0]);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});




/*router.get('/trendings', authorize, async (req, res) => {
    try {
        const { userId } = req;
        const newsFeedQuery = `
            SELECT *
            FROM get_trending_topics($1) 
        `;
      
    pool.query(newsFeedQuery,[userId],(err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    })}
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }

});
*/
router.get('/trending/:id', authorize, async (req, res) => {
    try {
       
        const { userId } = req.params;
        const newsFeedQuery = `
            SELECT *
            FROM get_trending_topics($1)
            WHERE topic_name <> 'Others' 
            ORDER BY popularity_score DESC
            
        `;
      
    pool.query(newsFeedQuery,[userId],(err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    })}
    catch(err){
        console.error(err);
        res.status(500).send('Server error');
    }

});


router.get('/posts/:topic_name', authorize, async (req, res) => {
    try {
        const { topic_name } = req.params;

        // Query to find the topic_id based on topic_name
        const topicQuery = "SELECT topic_id FROM topics WHERE text = $1";
        const topicResult = await pool.query(topicQuery, [topic_name]);

        // Check if a topic was found
        if (topicResult.rows.length === 0) {
            return res.status(404).json({ message: "Topic not found" });
        }

        // Extract the topic_id from the query result
        const topicId = topicResult.rows[0].topic_id;

        // Query to fetch posts by topic_id
        const newsFeedQuery = `
           SELECT * FROM get_posts_by_topic($1)
           ORDER BY created_at DESC
        `;
      
        pool.query(newsFeedQuery, [topicId], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});






module.exports=router;