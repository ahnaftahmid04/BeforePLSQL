const router=require('express').Router();
const moment=require('moment');
//const { json } = require('express');
const bcrypt=require('bcrypt');
const pool=require('../db.js');
const jwtGenerator=require('../utils/jwtGenerator.js');

const authorize=require('../middleware/authorization.js');



router.get('/followers', authorize, async(req,res)=>{
    try{
        const q="SELECT r.followeruserid,u.username,u.profilepic,u.name FROM user_relationship AS r LEFT JOIN users AS u ON r.followeruserid=u.id  WHERE r.followeduserid=$1";
        const q1="SELECT COUNT(*) AS followercount FROM user_relationship AS r WHERE r.followeduserid=$1";

        pool.query(q,[req.userId],(err,followersData)=>{
            if(err) return res.status(500).json(err);
            pool.query(q1,[req.userId],(err,followerCountData)=>{
                if(err) return res.status(500).json(err);
                
                const followers = followersData.rows.map((follower) => ({
                    followeruserid: follower.followeruserid,
                    username: follower.username,
                    profilepic: follower.profilepic,
                    name: follower.name
                  }));
            
                  // Extracting followercount from followerCountData
                  const followerCount = followerCountData.rows[0];
                return res.status(200).json({followers,followerCount});
            });
        });
    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/followings',authorize,async(req,res)=>{
    try{
        const q="SELECT r.followeduserid,u.username,u.profilepic,u.name FROM user_relationship AS r LEFT JOIN users AS u ON r.followeduserid=u.id  WHERE r.followeruserid=$1";
  
        const q1="SELECT COUNT(*) AS followingcount FROM user_relationship AS r WHERE r.followeruserid=$1";
        pool.query(q,[req.userId],(err,followingData)=>{
            if(err) return res.status(500).json(err);
            pool.query(q1,[req.userId],(err,followingCountData)=>{
                if(err) return res.status(500).json(err);
                
                const followings = followingData.rows.map((following) => ({
                    followeduserid: following.followeduserid,
                    username: following.username,
                    profilepic: following.profilepic,
                    name: following.name
                  }));
            
                  // Extracting followercount from followerCountData
                  const followingCount = followingCountData.rows[0];
                return res.status(200).json({followings,followingCount});
            });
        });


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/follow',authorize,async(req,res)=>{
    try{
        const q = "INSERT INTO user_relationship(followeruserid, followeduserid) VALUES ($1, (SELECT id FROM users AS u WHERE u.username = $2)) RETURNING *";

        const values=[
            req.userId,
            req.body.followedusername
        ];
        pool.query(q,values,(err,data)=>{
            if(err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });
    


    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/unfollow',authorize,async(req,res)=>{
    try{
    const q="DELETE FROM user_relationship WHERE followeruserid = $1 AND followeduserid = (SELECT id FROM users AS u where u.username=$2) RETURNING *";

    const values=[
        req.userId,
        req.body.followedusername
    ];
    pool.query(q,values,(err,data)=>{
        if(err) return res.status(500).json(err);
        return res.status(200).json(data);
    });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/mutualFollowers',authorize,async(req,res)=>{
    try{
        const q = `
        SELECT r.followeruserid, u.username, u.profilepic
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeruserid=u.id
        WHERE r.followeduserid=$1
        INTERSECT
        SELECT r.followeruserid, u.username, u.profilepic
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeruserid=u.id
        WHERE r.followeduserid=(
          SELECT u1.id
          FROM users AS u1
          where u1.username=$2
        )
      `;
      
          pool.query(q,[req.userId,req.body.username],(err,data)=>{
              if(err) return res.status(500).json(err);
              const mutualFollowings = data.rows.map((following) => ({
                  followeduserid: following.followeduserid,
                  username: following.username,
                  profilepic: following.profilepic,
                }));
              return res.status(200).json(mutualFollowings);
              
          });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/mutualFollowings',authorize,async(req,res)=>{
    try{
        const q = `
        SELECT r.followeduserid, u.username, u.profilepic
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeduserid=u.id
        WHERE r.followeruserid=$1
        INTERSECT
        SELECT r.followeduserid, u.username, u.profilepic
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeduserid=u.id
        WHERE r.followeruserid=(
          SELECT u1.id
          FROM users AS u1
          where u1.username=$2
        )
      `;
      
          pool.query(q,[req.userId,req.body.username],(err,data)=>{
              if(err) return res.status(500).json(err);
              const mutualFollowings = data.rows.map((following) => ({
                  followeduserid: following.followeduserid,
                  username: following.username,
                  profilepic: following.profilepic,
                }));
              return res.status(200).json(mutualFollowings);
              
          });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/mutuals/:username',authorize,async(req,res)=>{
    try{
        const q = 
        `SELECT r.followeduserid, u.username, u.profilepic, u.name
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeduserid=u.id
        WHERE r.followeruserid=$1
        INTERSECT
        SELECT r.followeruserid, u.username, u.profilepic, u.name
        FROM user_relationship as r
        LEFT JOIN users AS u ON r.followeruserid=u.id
        WHERE r.followeduserid=(
          SELECT u1.id
          FROM users AS u1
          where u1.username=$2
        )`

            const {username} = req.params;
          pool.query(q,[req.userId,username],(err,data)=>{
              if(err) return res.status(500).json(err);
              const mutualFollowings = data.rows.map((following) => ({
                    followeduserid: following.followeduserid,
                    username: following.username,
                    profilepic: following.profilepic,
                    name: following.name
                }));
              return res.status(200).json(mutualFollowings);

          });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.post('/join/community', authorize, async (req, res) => {
    try {
        const { community_name } = req.body;
        const userId = req.userId;
        // Query to find the community ID based on the community name
        const findCommunityQuery = "SELECT community_id FROM community WHERE community_name = $1";
        const communityResult = await pool.query(findCommunityQuery, [community_name]);

        if (communityResult.rows.length === 0) {
            return res.status(404).json({ message: "Community not found" });
        }

        const community_id = communityResult.rows[0].community_id;

        // Insert into user_community_relationship table
        const insertUserCommunityQuery = `
            INSERT INTO user_community_relationship(user_id, community_id)
            VALUES($1, $2)
            RETURNING *`;
        const values = [userId, community_id];

        pool.query(insertUserCommunityQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Joined community successfully!", data: data.rows });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/leave/community', authorize, async (req, res) => {
    try {
        const { community_name } = req.body;
        const userId = req.userId;

        // Query to find the community ID based on the community name
        const findCommunityQuery = "SELECT community_id FROM community WHERE community_name = $1";
        const communityResult = await pool.query(findCommunityQuery, [community_name]);

        if (communityResult.rows.length === 0) {
            return res.status(404).json({ message: "Community not found" });
        }

        const community_id = communityResult.rows[0].community_id;

        // Delete from user_community_relationship table
        const deleteUserCommunityQuery = `
            DELETE FROM user_community_relationship
            WHERE user_id = $1 AND community_id = $2
            RETURNING *`;
        const values = [userId, community_id];

        pool.query(deleteUserCommunityQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Left community successfully!", data: data.rows });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// remove a follower from follower list
router.delete('/followers/:username',authorize,async(req,res)=>{
    try{
        const q="DELETE FROM user_relationship WHERE followeruserid = (SELECT id FROM users WHERE username=$1) AND followeduserid = $2 RETURNING *";
        const values=[
            req.params.username,
            req.userId
        ];
        pool.query(q,values,(err,data)=>{
            if(err) return res.status(500).json(err);
            return res.status(200).json(data.rows);
        });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

//people u may want to follow
router.get('/suggestions',authorize,async(req,res)=>{
    try{
        const userId=req.userId;
        const q = `
        SELECT * from find_users_with_mutual_count($1)
        ORDER BY mutual_count DESC
        LIMIT 100
      `;

      pool.query(q,[userId], (err, data) => {
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

// show all followers of a given user 
router.get('/followers/:username',authorize,async(req,res)=>{
    try{
        const q = `
        SELECT r.followeruserid, u.username, u.profilepic, u.name
        FROM user_relationship as r
        JOIN users AS u ON r.followeruserid=u.id
        WHERE r.followeduserid=(
          SELECT u1.id
          FROM users AS u1
          where u1.username=$1
        )
      `;
      
          pool.query(q,[req.params.username],(err,data)=>{
              if(err) return res.status(500).json(err);
              const followers = data.rows.map((follower) => ({
                  followeruserid: follower.followeruserid,
                  username: follower.username,
                  profilepic: follower.profilepic,
                  name: follower.name
                }));
              return res.status(200).json(followers);
              
          });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// show all followings of a given user
router.get('/followings/:username',authorize,async(req,res)=>{
    try{
        const q = `
        SELECT r.followeduserid, u.username, u.profilepic, u.name
        FROM user_relationship as r
        JOIN users AS u ON r.followeduserid=u.id
        WHERE r.followeruserid=(
          SELECT u1.id
          FROM users AS u1
          where u1.username=$1
        )
      `;
      
          pool.query(q,[req.params.username],(err,data)=>{
              if(err) return res.status(500).json(err);
              const followings = data.rows.map((following) => ({
                  followeduserid: following.followeduserid,
                  username: following.username,
                  profilepic: following.profilepic,
                  name: following.name
                }));
              return res.status(200).json(followings);
              
          });

    }
    catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/checkFollow/:targetUserName', authorize, async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is the ID of the active user
        const targetUsername = req.params.targetUserName; // Assuming targetUsername is the username of the target user

        // Query to check if the active user follows the target user
        const q = `
            SELECT EXISTS (
                SELECT *
                FROM user_relationship
                WHERE followeruserid = $1 AND followeduserid = (
                    SELECT U.id
                    FROM users U
                    WHERE U.username = $2)
            ) AS is_followed;
        `;

        const values = [userId, targetUsername];

        const { rows } = await pool.query(q, values);

        // Extract the boolean value from the result
        const isFollowed = rows[0].is_followed;

        // Send the boolean response back to the client
        res.status(200).json({ is_followed: isFollowed });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 25 no
router.delete('/community/members/:communityName/:username', authorize, async (req, res) => {
    try {
        const  userId  = req.userId; // Get the ID of the active user
        const { communityName, username } = req.params; // Get the community ID and the ID of the user to remove

        const communityIdResult = await pool.query("SELECT community_id FROM community WHERE community_name = $1", [communityName]);
        const communityId = communityIdResult.rows[0].community_id;

        // Check if the active user is the admin of the community
        const checkAdminQuery = `
            SELECT admin_id
            FROM community
            WHERE community_id = $1`;

        const { rows } = await pool.query(checkAdminQuery, [communityId]);
        const adminId = rows[0].admin_id;

        if (userId !== adminId) {
            return res.status(403).json({ error: "You are not authorized to remove members from this community" });
        }

        // Remove the user from the community
        const removeMemberQuery = `
            DELETE FROM user_community_relationship
            WHERE user_id = (SELECT id from users WHERE username = $1) AND community_id = $2`;

        await pool.query(removeMemberQuery, [username, communityId]);

        return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

module.exports=router;