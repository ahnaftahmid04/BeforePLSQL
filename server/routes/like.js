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



module.exports=router;