const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

// Get All Comments for a Post
router.get('/:postid',authorize,async(req,res)=>{
    try{
        const postId=req.params.postid;
        const q =
        `
        SELECT c.description,c.created_at, u.id, u.name, u.profilePic, c.comment_id
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

// Create a Comment
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
    console.log(values);
  
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

// Delete Comment
router.delete('/:comment_id', authorize, async (req, res) => {
    try {
        const { comment_id } = req.params;
        const userId = req.userId; // Get the user ID from the request

        // Check if the comment exists and if the active user is the one who made the comment
        const commentQuery = "SELECT * FROM comments WHERE comment_id = $1 AND commenteruser_id = $2";
        const commentResult = await pool.query(commentQuery, [comment_id, userId]);

        if (commentResult.rows.length === 0) {
            return res.status(404).json({ message: "Comment not found or you are not authorized to delete it" });
        }

        // Delete the comment
        const deleteCommentQuery = "DELETE FROM comments WHERE comment_id = $1";
        await pool.query(deleteCommentQuery, [comment_id]);

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports=router;