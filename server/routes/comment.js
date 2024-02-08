const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.get('/:postid',authorize,async(req,res)=>{
    try{
        const postId=req.params.postid;
        const q =
        `
        SELECT c.description,c.created_at, u.id, u.name, u.profilePic
        FROM comments AS c
        JOIN users AS u ON u.id = c.commenteruser_id
        WHERE c.postid = $1
        ORDER BY c.created_at DESC`;
        
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

router.post('/',authorize,async(req,res)=>{
    try{
    const q =
    `INSERT INTO comments(description, created_at, commenteruser_id, postid) VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [
        req.body.description,
        moment().format("YYYY-MM-DD HH:mm:ss"),
        req.userId,
        req.body.postId
    ];
  
  pool.query(q, values, (err, data) => {
    if (err) {
      // Handle errors, including unique constraint violations
      return res.status(500).json(err);
    }
  
    return res.status(200).json({ message: "Comment created successfully!", data: data.rows[0] });
  });


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
module.exports=router;