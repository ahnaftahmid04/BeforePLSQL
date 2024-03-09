const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

// User request for verification
router.post('/requestVerification', authorize, async (req, res) => {
  try {
    const  userId  = req.userId;

    // Insert the verification request into the verification_request table
    const requestVerificationQuery = `
      INSERT INTO verification_request (timestamp, status, user_id)
      VALUES (CURRENT_TIMESTAMP, 'Pending', $1)
      RETURNING *
    `;
    const { rows } = await pool.query(requestVerificationQuery, [userId]);

    res.status(200).json({ message: 'Verification request submitted successfully', request: rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to retrieve verification requests
router.get('/verificationRequests', authorize, async (req, res) => {
  try {
    // Query to retrieve verification requests
    const verificationRequestsQuery = `
      SELECT v.*, u.name, u.username
      FROM verification_request v
      JOIN users u
      ON (u.id = v.user_id)
      ORDER BY timestamp DESC
    `;

    // Execute the query
    const { rows } = await pool.query(verificationRequestsQuery);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// set verified status of user to  true
router.put('/verifyUser/:user_id',authorize,async(req,res)=>{
    try{
        const user_id=req.params.user_id;
        const q = `UPDATE users SET verified_status=true WHERE id=$1`;
        pool.query(q, [user_id], (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json({message:"User verified successfully"});
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Ignore verification request
router.delete('/deleteVerificationRequest/:request_id',authorize,async(req,res)=>{
  try{
      const request_id=req.params.request_id;
      const q = `DELETE FROM verification_request WHERE request_id=$1`;
      pool.query(q, [request_id], (err, data) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json({message:"Verification request deleted successfully"});
      });
  }
  catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// Endpoint to flag content
router.post('/flagContent', authorize, async (req, res) => {
  try {
    const { post_id, reason } = req.body;
    const user_id = req.userId;

    // Check if the post exists
    const postExistsQuery = 'SELECT * FROM posts WHERE post_id = $1';
    const postExistsResult = await pool.query(postExistsQuery, [post_id]);

    if (postExistsResult.rows.length === 0) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Insert the flagging information into the content_flagging table
    const flagContentQuery = `
      INSERT INTO content_flagging (post_id, user_id, reason)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const flagContentResult = await pool.query(flagContentQuery, [post_id, user_id, reason]);

    res.status(200).json({ message: 'Content flagged successfully', flaggedContent: flagContentResult.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Endpoint to retrieve flagged content
router.get('/flaggedContent', authorize, async (req, res) => {
  try {
    // Query to retrieve flagged content
    const flaggedContentQuery = `
      SELECT cf.flag_id, cf.timestamp, p.description AS post_description, p.post_id, p.post_type, u.name AS flagged_by, cf.reason
      FROM content_flagging cf
      JOIN posts p ON cf.post_id = p.post_id
      JOIN users u ON cf.user_id = u.id
    `;

    // Execute the query
    const { rows } = await pool.query(flaggedContentQuery);

    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// delete the flagging record from table when not approved
router.delete('/deleteFlag/:flag_id',authorize,async(req,res)=>{
  try{
      const flag_id=req.params.flag_id;
      const q = `DELETE FROM content_flagging WHERE flag_id=$1`;
      pool.query(q, [flag_id], (err, data) => {
          if (err) return res.status(500).json(err);
          return res.status(200).json({message:"Flag deleted successfully"});
      });
  }
  catch(err){
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// approve the flagging record and delete the post from the posts table
router.delete('/posts/:post_id', async (req, res) => {
  const postId = req.params.post_id;

  try {
      // Delete the post record from the posts table
      const deletePostQuery = 'DELETE FROM posts WHERE post_id = $1 RETURNING *';
      const { rows } = await pool.query(deletePostQuery, [postId]);

      // Check if a record was deleted
      if (rows.length === 0) {
          return res.status(404).json({ message: 'Post not found' });
      }


      // If the post was successfully deleted, return the deleted post
      res.status(200).json({ message: 'Post deleted successfully', deletedPost: rows[0] });
  } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).send('Server error');
  }
});

// No of communities created last month
router.get('/communitiesCreatedLastMonth', authorize, async (req, res) => {
  try {
      // Construct the SQL query to count communities created last month
      const sqlQuery = `
          SELECT COUNT(*) AS community_count
          FROM community
          WHERE creation_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
          AND creation_date < DATE_TRUNC('month', CURRENT_DATE);
      `;

      // Execute the SQL query
      const { rows } = await pool.query(sqlQuery);

      // Extract the community count from the query result
      const communityCount = rows[0].community_count;

      // Send the community count as the API response
      res.status(200).json({ communityCount });
  } catch (error) {
      console.error('Error fetching community count:', error);
      res.status(500).send('Server error');
  }
});

// top 5 most active communities based on no of posts
router.get('/mostActiveCommunities', async (req, res) => {
  try {
      // Construct the SQL query to fetch the most active communities
      const sqlQuery = `
          SELECT c.community_id, c.community_name, COUNT(*) AS post_count
          FROM posts p
          JOIN community c ON p.community_id = c.community_id
          GROUP BY c.community_id, c.community_name
          ORDER BY post_count DESC
          LIMIT 5;
      `;

      // Execute the SQL query
      const { rows } = await pool.query(sqlQuery);

      // Send the most active communities as the API response
      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching most active communities:', error);
      res.status(500).send('Server error');
  }
});

// most active locations based on no of users
router.get('/mostActiveLocations',authorize, async (req, res) => {
  try {
      // Construct the SQL query to fetch the most active locations
      const sqlQuery = `
          SELECT l.location_id, l.city_name, l.country_name, COUNT(*) AS user_count
          FROM location AS l
          JOIN users AS u ON u.location_id = l.location_id
          GROUP BY l.location_id, l.city_name, l.country_name
          ORDER BY user_count DESC
          LIMIT 3
      `;

      // Execute the SQL query
      const { rows } = await pool.query(sqlQuery);

      // Send the most active locations as the API response
      res.status(200).json(rows);
  } catch (error) {
      console.error('Error fetching most active locations:', error);
      res.status(500).send('Server error');
  }
});

router.post('/updateAllUsersTag', authorize, async (req, res) => {
  try {
      // PL/pgSQL block to update tags for all users
      const updateAllUsersTagQuery = `
      DO $$
      DECLARE
          user_record RECORD;
      BEGIN
          -- Iterate over each user in the users table
          FOR user_record IN SELECT id FROM users LOOP
              -- Call the stored procedure to update the user's tag
              CALL update_user_tag(user_record.id);
          END LOOP;
      END $$;
      `;

      // Execute the PL/pgSQL block
      await pool.query(updateAllUsersTagQuery);

      res.status(200).json({ message: "Tags updated for all users successfully!" });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// no of verified accounts
router.get('/verifiedAccounts',authorize, async (req, res) => {
  try {
    // Query to count the number of verified accounts and get additional information
    const verifiedAccountsQuery = `
      SELECT 
        COUNT(*) AS verified_accounts_count
      FROM users
      WHERE verified_status = true;
    `;

    const { rows } = await pool.query(verifiedAccountsQuery);

    // Send the response with the count and additional information
    res.status(200).json({
      verified_accounts_count: rows[0].verified_accounts_count
    });
  } catch (error) {
    console.error('Error fetching verified accounts:', error.message);
    res.status(500).send('Server error');
  }
});


module.exports = router;