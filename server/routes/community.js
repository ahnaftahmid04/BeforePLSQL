const router=require('express').Router();
const moment=require('moment');
const pool=require('../db.js');
const authorize=require('../middleware/authorization.js');

router.post('/', authorize, async (req, res) => {
    try {
        const { community_name, topic_text, description } = req.body;

        const userId = req.userId;
        
        // Query to find the topic ID based on the topic text
        const findTopicQuery = "SELECT topic_id FROM topics WHERE text = $1";
        const topicResult = await pool.query(findTopicQuery, [topic_text]);
        
        if (topicResult.rows.length === 0) {
            // If the topic doesn't exist, you may choose to handle this case accordingly
            return res.status(404).json({ message: "Topic not found" });
        }
        
        const topic_id = topicResult.rows[0].topic_id;
        
        const insertCommunityQuery = `
            INSERT INTO community(community_name, topic_id, description, creation_date,admin_id)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [
            community_name,
            topic_id,
            description,
            moment().format("YYYY-MM-DD HH:mm:ss"),
            userId,

        ];

        pool.query(insertCommunityQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ message: "Community created successfully!", data: data.rows[0] });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/', authorize, async (req, res) => {
    try {
        const getCommunitiesQuery = "SELECT * FROM community";

        pool.query(getCommunitiesQuery, (err, data) => {
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
        const getCommunityQuery = "SELECT c.*, t.text FROM community c JOIN topics t ON (t.topic_id = c.topic_id) WHERE community_id = $1";
        const values = [id];

        pool.query(getCommunityQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (data.rows.length === 0) {
                return res.status(404).json({ message: "Community not found" });
            }
            return res.status(200).json(data.rows[0]);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/community/:name', authorize, async (req, res) => {
    try {
        const { name } = req.params;
        const getCommunityQuery = "SELECT * FROM community WHERE community_name = $1";
        const values = [name];

        pool.query(getCommunityQuery, values, (err, data) => {
            if (err) {
                return res.status(500).json(err);
            }
            if (data.rows.length === 0) {
                return res.status(404).json({ message: "Community not found" });
            }
            return res.status(200).json(data.rows[0]);
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/search/:communityName', authorize, async (req, res) => {
    try {
        const { communityName } = req.params;
        const userId=req.userId;
        const searchCommunityQuery = `
        SELECT 
        c.community_id, 
        c.community_name,
        (SELECT t.text FROM topics t WHERE t.topic_id = c.topic_id) AS topic_name, 
        COUNT(ucr.user_id) AS member_count,
        CASE WHEN $2 = ANY (ARRAY_AGG(ucr.user_id)) THEN $2 ELSE NULL END AS user_follows
        FROM 
            community c
        LEFT JOIN 
            user_community_relationship ucr ON c.community_id = ucr.community_id
        WHERE 
            LOWER(c.community_name) LIKE LOWER('%' || $1 || '%')
        GROUP BY 
            c.community_id;
    
        `;
        const values = [communityName,userId];
        
        pool.query(searchCommunityQuery, values, (err, data) => {
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

router.get('/follows/:num', authorize, async (req, res) => {
    try {
        const userId = req.userId;
        const num = req.params.num; 
        // Query to fetch the names of communities the user follows
        const communityQuery = `
            SELECT c.community_name, c.community_id
            FROM community c
            JOIN user_community_relationship ucr ON c.community_id = ucr.community_id
            WHERE ucr.user_id = $1`;

        const communityResult = await pool.query(communityQuery, [userId]);

        // Check if the user follows any communities
        if (communityResult.rows.length === 0) {
            return res.status(404).json({ message: "User does not follow any communities" });
        }

        /*
        // Extract community names from the query result
        const communityNames = communityResult.rows.map(row => row.community_name);

        return res.status(200).json({ community_names: communityNames });
        */
        return res.status(200).json(communityResult.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// 24. Show all members of a community
router.get('/members/:communityID', authorize, async (req, res) => {
    try {
        const { communityID } = req.params;
        const getMembersQuery = `
                    
            SELECT 
            u.name, 
            u.username, 
            u.profilepic,
            CASE 
                WHEN ucr.user_id = c.admin_id THEN 'Admin'
                ELSE NULL
            END AS role
            FROM 
            users u
            JOIN 
            user_community_relationship ucr ON u.id = ucr.user_id
            LEFT JOIN
            community c ON ucr.community_id = c.community_id
            WHERE 
            c.community_id = $1`;
        const values = [communityID];

        pool.query(getMembersQuery, values, (err, data) => {
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

router.get('/suggested', authorize, async (req, res) => {
    try {
      const userId = req.userId;
  
      // Query to get suggested communities
      const suggestCommunitiesQuery = `
        SELECT c.community_id, c.community_name, CAST(COUNT(ucr.user_id) AS INT) AS member_count
        FROM community c
        JOIN user_community_relationship ucr ON c.community_id = ucr.community_id
        WHERE c.topic_id IN (
            SELECT topic_id FROM get_user_interesting_topics($1)
        )
        AND ucr.user_id != $1 
        GROUP BY c.community_id, c.community_name
        ORDER BY member_count DESC
      `;
  
      // Execute the query
      const { rows } = await pool.query(suggestCommunitiesQuery, [userId]);
  
      // Send the response
      res.status(200).json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

  router.delete('/community/members/:communityName/:username', authorize, async (req, res) => {
    try {
        const  userId  = req.userId; // Get the ID of the active user
        const { communityName, userNameToRemove } = req.params; // Get the community ID and the ID of the user to remove

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

        await pool.query(removeMemberQuery, [userNameToRemove, communityId]);

        return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/suggested/:num', authorize, async (req, res) => {
    try {
      const userId = req.userId;
  
      // Query to get suggested communities
      const suggestCommunitiesQuery = `
      SELECT 
      c.community_id, 
      c.community_name, 
      CAST(COUNT(ucr.user_id) AS INT) AS member_count
  FROM 
      community c
  LEFT JOIN 
      user_community_relationship ucr ON c.community_id = ucr.community_id
  WHERE 
      c.topic_id IN (
          SELECT topic_id FROM get_user_interesting_topics($1)
      )
      AND (ucr.user_id != $1 OR ucr.user_id IS NULL)
  GROUP BY 
      c.community_id, c.community_name
  ORDER BY 
      member_count DESC
      `;
  
      // Execute the query
      const { rows } = await pool.query(suggestCommunitiesQuery, [userId]);
  
      // Send the response
      res.status(200).json(rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });

router.get('/checkFollow/:targetCommunityID', authorize, async (req, res) => {
    try {
        const userId = req.userId; // Assuming userId is the ID of the active user
        const targetCommunityID = req.params.targetCommunityID; // Assuming targetUsername is the username of the target user

        // Query to check if the active user follows the target user
        const q = `
            SELECT EXISTS (
                SELECT * FROM user_community_relationship WHERE user_id = $1 AND community_id = $2
            ) AS is_followed;
        `;

        const values = [userId, targetCommunityID];

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

// Trending Posts in a Community
router.get('/community/trendingPosts/:communityID', authorize, async (req, res) => {
    try {
        const { communityID } = req.params;

        // Call the PL/pgSQL function to get trending posts in the community
        const getTrendingPostsQuery = `
            SELECT *
            FROM get_trending_posts_community($1)
            ORDER BY created_at DESC
            LIMIT 69
        `;
        const { rows } = await pool.query(getTrendingPostsQuery, [communityID]);

        return res.status(200).json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// show all recent posts in a community
router.get('/recentPosts/:communityId', authorize, async (req, res) => {
    try {
        const communityId = req.params.communityId;

        // Construct the SQL query to fetch recent posts in a community
        const sqlQuery = `
            SELECT 
                p.post_id,
                p.description,
                p.img,
                p.post_type,
                p.created_at,
                e.eventname AS event_name,
                e.eventid,
                e.scheduledTime AS event_scheduled_time,
                l.city_name AS event_city_name,
                l.country_name AS event_country_name,
                u.username,
                u.name,
                u.profilepic,
                tp.text AS topic_name,
                c1.community_name
            FROM 
                posts AS p
            JOIN 
                users AS u ON u.id = p.user_id
            LEFT JOIN 
                events AS e ON e.postid = p.post_id
            LEFT JOIN 
                location AS l ON e.locationid = l.location_id
            LEFT JOIN 
                threads AS t ON t.postid = p.post_id
            LEFT JOIN 
                polls AS po ON po.post_id = p.post_id
            LEFT JOIN 
                topics AS tp ON (p.topic_id = tp.topic_id)
            LEFT JOIN
                community AS c1 ON (p.community_id = c1.community_id)
            WHERE 
                p.community_id = $1
            ORDER BY 
                p.created_at DESC
            LIMIT 25
        `;

        // Execute the SQL query
        const { rows } = await pool.query(sqlQuery, [communityId]);

        // Send the recent posts in the community as the API response
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching recent posts:', error);
        res.status(500).send('Server error');
    }
});

// Endpoint for fetching the favorite communities of a specific user
router.get('/favoriteCommunities/:num', authorize, async (req, res) => {
    try {
        const userId = req.userId;

        // Construct the SQL query
        const favoriteCommunitiesQuery = `
            SELECT c.community_id, c.community_name, 
                   COUNT(DISTINCT p.post_id) AS total_posts,
                   COUNT(DISTINCT l.likepostid) AS total_likes,
                   COUNT(DISTINCT co.comment_id) AS total_comments,
                   COUNT(DISTINCT p.post_id) + COUNT(DISTINCT l.likepostid) + COUNT(DISTINCT co.comment_id) AS total_activities
            FROM community c
            JOIN posts p ON c.community_id = p.community_id
            LEFT JOIN likes l ON p.post_id = l.likepostid AND l.likeuserid = $1
            LEFT JOIN comments co ON p.post_id = co.postid AND co.commenteruser_id = $1
            WHERE p.user_id = $1
            GROUP BY c.community_id, c.community_name
            ORDER BY total_activities DESC
            LIMIT 3;
        `;

        // Execute the query with the parameter
        const { rows } = await pool.query(favoriteCommunitiesQuery, [userId]);

        // Send the response
        res.status(200).json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Rank of community based on member count
router.get('/communityRank/:community_id', async (req, res) => {
    try {
        const { community_id } = req.params;

        // Query to call the PL/pgSQL function
        const query = 'SELECT get_community_rank($1) AS rank';

        // Execute the query with the community_id parameter
        const { rows } = await pool.query(query, [community_id]);

        // Extract the rank from the result
        const { rank } = rows[0];

        // Send the rank of the community as the API response
        res.status(200).json(rank);
    } catch (error) {
        console.error('Error fetching community rank:', error);
        res.status(500).send('Server error');
    }
});

module.exports=router;