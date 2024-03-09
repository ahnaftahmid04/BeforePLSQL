CREATE TABLE location (
    location_id SERIAL PRIMARY KEY,
    city_name VARCHAR(255) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    CONSTRAINT city_country_unique UNIQUE (city_name, country_name)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(45) NOT NULL UNIQUE,
    email VARCHAR(45) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    name VARCHAR(45) NOT NULL,
    coverpic VARCHAR(100),
    profilepic VARCHAR(100),
    location_id INT REFERENCES location(location_id),
    bio VARCHAR(300),
    verified_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE topics (
    topic_id SERIAL PRIMARY KEY,
    text VARCHAR(255) NOT NULL 

);
CREATE TABLE community (
    community_id SERIAL PRIMARY KEY,
    community_name VARCHAR(45) NOT NULL,
	topic_id INT REFERENCES topics(topic_id),
    description VARCHAR(255),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    img VARCHAR(200),
    user_id INT NOT NULL REFERENCES users(id),
    topic_id INT REFERENCES topics(topic_id),
    community_id INT REFERENCES community(community_id), -- Added community_id column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE posts ADD COLUMN post_type VARCHAR(20);

CREATE TABLE threads (
    threadID SERIAL PRIMARY KEY,
   
    postID INT NOT NULL REFERENCES posts(post_id)
  
);

-- Events Table
CREATE TABLE events (
    eventID SERIAL PRIMARY KEY,
    eventName VARCHAR(255) NOT NULL,
    scheduledTime TIMESTAMP NOT NULL,
   
    locationID INT NOT NULL REFERENCES location(location_id),
	
    postID INT REFERENCES posts(post_id)
);

-- Polls Table
CREATE TABLE polls (
    pollID SERIAL PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    options TEXT[], -- Adjust the data type based on  requirements
    postID INT REFERENCES posts(post_id)
);

-- Ads Table
CREATE TABLE ads (
    adID SERIAL PRIMARY KEY,
    content VARCHAR(255) NOT NULL,
    postID INT REFERENCES posts(post_id)
);



CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commenteruser_id INT REFERENCES users(id),
    postid INT REFERENCES posts(post_id)
);




CREATE TABLE likes (
    likeuserid INT NOT NULL,
    likepostid INT NOT NULL,
    CONSTRAINT pk_likes PRIMARY KEY (likeuserid, likepostid),
    CONSTRAINT unique_like_constraint UNIQUE (likeuserid, likepostid),
    FOREIGN KEY (likeuserid) REFERENCES users(id),
    FOREIGN KEY (likepostid) REFERENCES posts(post_id)
);





-- User Relationship Table
CREATE TABLE user_relationship (
    followerUserId INT NOT NULL REFERENCES users(id),
    followedUserId INT NOT NULL REFERENCES users(id),
    CONSTRAINT pk_user_relationship PRIMARY KEY (followerUserId, followedUserId)
);

-- User Community Relationship Table
CREATE TABLE user_community_relationship (
    user_id INT NOT NULL REFERENCES users(id),
    community_id INT NOT NULL REFERENCES community(community_id),
    CONSTRAINT pk_user_community_relationship PRIMARY KEY (user_id, community_id)
);





CREATE TABLE messages (
    message_id SERIAL PRIMARY KEY,
    sender_user_id INT NOT NULL REFERENCES users(id),
    receiver_user_id INT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seen_status BOOLEAN DEFAULT FALSE
);

CREATE TABLE verification_request (
    request_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    user_id INT NOT NULL REFERENCES users(id)
);

CREATE TABLE content_flagging (
    flag_id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    post_id INT NOT NULL REFERENCES posts(post_id),
    user_id INT NOT NULL REFERENCES users(id),
    reason VARCHAR(255)
);

INSERT INTO location (city_name, country_name) VALUES
('New York', 'USA'),
('Los Angeles', 'USA'),
('London', 'UK'),
('Paris', 'France'),
('Tokyo', 'Japan'),
('Sydney', 'Australia'),
('Berlin', 'Germany'),
('Toronto', 'Canada'),
('Moscow', 'Russia'),
('Rio de Janeiro', 'Brazil');



CREATE OR REPLACE FUNCTION get_news_feed(idno INT)
RETURNS TABLE (
    post_id INT,
    description VARCHAR(255),
    img VARCHAR(200),
    post_type VARCHAR(20),
    created_at TIMESTAMP,
    poll_question VARCHAR(255),
    poll_options TEXT[],
    event_name VARCHAR(255),
    event_scheduled_time TIMESTAMP,
    event_city_name VARCHAR(255),
    event_country_name VARCHAR(255),
    username VARCHAR(100),
    community_name VARCHAR(45),
    topic_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY (
        
         -- Get threads from communities the user follows
        SELECT p.post_id, p.description, p.img, 'community_post'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tc.text AS topic_name
        FROM posts p   
        JOIN threads t ON p.post_id = t.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tc ON p.topic_id = tc.topic_id
        WHERE ucr.user_id = idno
        
        UNION ALL
        
        -- Get polls posted in the communities the user follows
        SELECT p.post_id, p.description, p.img, 'poll'::VARCHAR(20) AS post_type, p.created_at,
               po.question, po.options, NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tp.text AS topic_name
        FROM posts p
        JOIN polls po ON p.post_id = po.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tp ON p.topic_id = tp.topic_id
        WHERE ucr.user_id = idno
        
        UNION ALL
        
        -- Get events posted in the communities the user follows
        SELECT p.post_id, p.description, p.img, 'event'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], e.eventName, e.scheduledTime, l.city_name AS event_city_name, l.country_name AS event_country_name,
               u.username, c.community_name, te.text AS topic_name
        FROM posts p
        JOIN events e ON p.post_id = e.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics te ON p.topic_id = te.topic_id
        JOIN location l ON e.locationID = l.location_id
        WHERE ucr.user_id = idno
        
        UNION ALL
        
        -- Get threads posted by the user
        SELECT p.post_id, p.description, p.img, 'thread'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tt.text AS topic_name
        FROM posts p
        JOIN threads t ON p.post_id = t.postID
        JOIN user_relationship ur ON ur.followeruserid=idno
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tt ON p.topic_id = tt.topic_id
        
        UNION ALL
        
        -- Get polls posted by the user
        SELECT p.post_id, p.description, p.img, 'poll'::VARCHAR(20) AS post_type, p.created_at,
               po.question, po.options, NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tp.text AS topic_name
        FROM posts p
        JOIN polls po ON p.post_id = po.postID
        JOIN user_relationship ur ON ur.followeruserid=idno
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tp ON p.topic_id = tp.topic_id
        
        UNION ALL
        
        -- Get events posted by the user
        SELECT p.post_id, p.description, p.img, 'event'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], e.eventName, e.scheduledTime, l.city_name AS event_city_name, l.country_name AS event_country_name,
               u.username, c.community_name, te.text AS topic_name
        FROM posts p
        JOIN events e ON p.post_id = e.postID
        JOIN user_relationship ur ON ur.followeruserid=idno
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics te ON p.topic_id = te.topic_id
        JOIN location l ON e.locationID = l.location_id
    );
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION get_news_feed_community(idno INT)
RETURNS TABLE (
    post_id INT,
    description VARCHAR(255),
    img VARCHAR(200),
    post_type VARCHAR(20),
    created_at TIMESTAMP,
    poll_question VARCHAR(255),
    poll_options TEXT[],
    event_name VARCHAR(255),
    event_scheduled_time TIMESTAMP,
    event_city_name VARCHAR(255),
    event_country_name VARCHAR(255),
    username VARCHAR(100),
    community_name VARCHAR(45),
    topic_name VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY (
        
        -- Get threads from communities the user follows
        SELECT p.post_id, p.description, p.img, 'community_post'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tc.text AS topic_name
        FROM posts p   
        JOIN threads t ON p.post_id = t.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tc ON p.topic_id = tc.topic_id
        WHERE ucr.user_id = idno
        
        UNION ALL
        
        -- Get polls posted in the communities the user follows
        SELECT p.post_id, p.description, p.img, 'poll'::VARCHAR(20) AS post_type, p.created_at,
               po.question, po.options, NULL::VARCHAR(255), NULL::TIMESTAMP, NULL::VARCHAR(255), NULL::VARCHAR(255),
               u.username, c.community_name, tp.text AS topic_name
        FROM posts p
        JOIN polls po ON p.post_id = po.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics tp ON p.topic_id = tp.topic_id
        WHERE ucr.user_id = idno
        
        UNION ALL
        
        -- Get events posted in the communities the user follows
        SELECT p.post_id, p.description, p.img, 'event'::VARCHAR(20) AS post_type, p.created_at,
               NULL::VARCHAR(255), NULL::TEXT[], e.eventName, e.scheduledTime, l.city_name AS event_city_name, l.country_name AS event_country_name,
               u.username, c.community_name, te.text AS topic_name
        FROM posts p
        JOIN events e ON p.post_id = e.postID
        JOIN user_community_relationship ucr ON ucr.community_id = p.community_id
        JOIN users u ON p.user_id = u.id
        LEFT JOIN community c ON p.community_id = c.community_id
        LEFT JOIN topics te ON p.topic_id = te.topic_id
        JOIN location l ON e.locationID = l.location_id
        WHERE ucr.user_id = idno
    );
END;
$$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION get_trending_topics(idno INT)
RETURNS TABLE (
    topic_id INT,
    topic_name VARCHAR(255),
    popularity_score INT
) AS $$
DECLARE
    trending_topics_ids INT[];
BEGIN
    -- Calculate popularity score for each topic based on relevant metrics
    SELECT ARRAY(
        SELECT t.topic_id
        FROM topics t
        ORDER BY (
            SELECT COUNT(*)::INT FROM posts p WHERE p.topic_id = t.topic_id
        ) +
        (
            SELECT COUNT(*)::INT FROM likes l WHERE l.likepostid IN (SELECT p.post_id FROM posts p WHERE p.topic_id = t.topic_id)
        ) +
        (
            SELECT COUNT(*)::INT FROM comments c WHERE c.postid IN (SELECT p.post_id FROM posts p WHERE p.topic_id = t.topic_id)
        ) DESC
        LIMIT 5
    )
    INTO trending_topics_ids;

    -- Query to fetch trending topics along with popularity score
    RETURN QUERY (
        SELECT 
            t.topic_id, 
            t.text AS topic_name,
            (
                SELECT 
                    COUNT(*)::INT 
                FROM 
                    posts p 
                WHERE 
                    p.topic_id = tt.topic_id
            ) +
            (
                SELECT 
                    COUNT(*)::INT 
                FROM 
                    likes l 
                WHERE 
                    l.likepostid IN (SELECT p.post_id FROM posts p WHERE p.topic_id = tt.topic_id)
            ) +
            (
                SELECT 
                    COUNT(*)::INT 
                FROM 
                    comments c 
                WHERE 
                    c.postid IN (SELECT p.post_id FROM posts p WHERE p.topic_id = tt.topic_id)
            ) AS popularity_score
        FROM 
            unnest(trending_topics_ids) tt(topic_id)
        JOIN 
            topics t ON t.topic_id = tt.topic_id
    );
END;
$$ LANGUAGE plpgsql;


- Create the function to insert into threads table
CREATE OR REPLACE FUNCTION insert_into_threads()
RETURNS TRIGGER AS $$
BEGIN
   
    IF NEW.post_type = 'thread' THEN
        -- Insert into the threads table
        INSERT INTO threads (postID) VALUES (NEW.post_id);
    END IF;
    
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for threads
CREATE TRIGGER insert_thread_trigger
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION insert_into_threads();

-- Create the function to insert into polls table
CREATE OR REPLACE FUNCTION insert_into_polls()
RETURNS TRIGGER AS $$
BEGIN
 
    IF NEW.post_type = 'poll' THEN
        -- Insert into the polls table
        INSERT INTO polls (postID) VALUES (NEW.post_id);
    END IF;
    
   
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for polls
CREATE TRIGGER insert_poll_trigger
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION insert_into_polls();

-- Create the function to insert into events table
CREATE OR REPLACE FUNCTION insert_into_events()
RETURNS TRIGGER AS $$
BEGIN
   
    IF NEW.post_type = 'event' THEN
        -- Insert into the events table
        INSERT INTO events (postID) VALUES (NEW.post_id);
    END IF;
    
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for events
CREATE TRIGGER insert_event_trigger
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION insert_into_events();