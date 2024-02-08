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

router.post('/',authorize,async(req,res)=>{
    try{
    const insertPostQuery =
    "INSERT INTO posts(description, img, created_at, user_id) VALUES($1, $2, $3, $4) RETURNING *";
    const values = [
        req.body.description,
        req.body.img,
        moment().format("YYYY-MM-DD HH:mm:ss"),
        req.userId,
    ];
  
  pool.query(insertPostQuery, values, (err, data) => {
    if (err) {
      // Handle errors, including unique constraint violations
      return res.status(500).json(err);
    }
  
    return res.status(200).json({ message: "Post created successfully!", data: data.rows[0] });
  });


    }
    catch(err){
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

module.exports=router;