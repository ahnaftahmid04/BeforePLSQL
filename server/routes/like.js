const router=require('express').Router();
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.get('/:postid',authorize,async(req,res)=>{
    try{
        const postId=req.params.postid;
        const q =
        `SELECT u.name,u.profilepic  FROM users AS u JOIN likes AS l ON(l.likeuserid=u.id) WHERE likepostid = $1`;
        
    pool.query(q, [postId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/', authorize, async (req, res) => {
    try {
        const q =
            `INSERT INTO likes(likeuserid, likepostid) VALUES ($1, $2)
            RETURNING *`;

        const values = [
            req.userId,
            req.body.postId
        ];

        pool.query(q, values, (err, data) => {
            if (err) {
                // Handle errors, including unique constraint violations
                console.error(err.message);
                return res.status(500).json(err);
            }

            return res.status(200).json({ message: "Like created successfully!", data: data.rows[0] });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/likedPosts',authorize,async(req,res)=>{
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
        JOIN
            user_relationship AS r ON r.followeduserid = p.user_id
        WHERE
            r.followeruserid = $1
            AND 
            EXISTS (SELECT l.* FROM likes l WHERE l.likeuserid = $1 AND l.likepostid = p.post_id)
        ORDER BY
             p.created_at DESC`;
    
    pool.query(q, [req.userId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/:postId',authorize,async(req,res)=>{
    try{
        const userId=req.userId;
        const q = "DELETE FROM likes WHERE likeuserid=$1 AND likepostid=$2";
        const values = [userId, req.params.postId];
    
        pool.query(q, values, (err, data) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json(err);
            }
    
            return res.status(200).json({ message: "Like deleted successfully!" });
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get("/threads/:post_id", authorize, async (req, res) => {
    try {
        const { post_id } = req.params;
        const userId = req.userId;

        // Query to check if the user liked a post
        const q = `
            SELECT * FROM likes WHERE likeuserid = $1 AND likepostid = $2
        `;
        const values = [userId, post_id];

        // Execute the query
        const result = await pool.query(q, values);

        // Check if any rows are returned
        if (result.rows.length === 0) {
            // If no rows are returned, the user did not like the post
            return res.status(200).json([]);
        } else {
            // If rows are returned, the user liked the post
            return res.status(200).json(result.rows);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/threads/:postId',authorize,async(req,res)=>{
    try{
        const userId=req.userId;
        const q = "DELETE FROM likes WHERE likeuserid=$1 AND likepostid=$2";
        const values = [userId, req.params.postId];
    
        pool.query(q, values, (err, data) => {
            if (err) {
                console.error(err.message);
                return res.status(500).json(err);
            }
    
            return res.status(200).json({ message: "Like deleted successfully!" });
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//  Show all users who liked a post
router.get('/likedUsers/:postId',authorize,async(req,res)=>{
    try{
        const postId=req.params.postId;
        const q =
        `SELECT u.username,u.name
        FROM users AS u 
        JOIN likes AS l ON (l.likeuserid=u.id) WHERE likepostid = $1`;
        
    pool.query(q, [postId], (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(data.rows);
    });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports=router;