const router=require('express').Router();
const pool=require('../db.js');
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

module.exports=router;