CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL,
    password VARCHAR(200) NOT NULL,
    name VARCHAR(45) NOT NULL,
    coverpic VARCHAR(100),
    profilepic VARCHAR(100),
    location VARCHAR(45),
    bio VARCHAR(300),
    CONSTRAINT email_unique UNIQUE (email)
);

CREATE TABLE posts (
    post_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    img VARCHAR(200), 
    user_id INT REFERENCES USERS(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    commenteruser_id INT REFERENCES USERS(id),
    postid INT REFERENCES POSTS(post_id)
);
CREATE TABLE stories (
    story_id SERIAL PRIMARY KEY,
    img VARCHAR(200),
    storyuser_id INT REFERENCES USERS(id)
);

CREATE TABLE user_relationship (
    relationship_id SERIAL PRIMARY KEY,
    followerUserId INT REFERENCES USERS(id),
    followedUserId INT REFERENCES USERS(id)
);

CREATE TABLE likes (
    like_id SERIAL PRIMARY KEY,
    likeuserid INT REFERENCES USERS(id),
    likepostid INT REFERENCES POSTS(post_id)
);

-- egular por theke relation gula establish ee jhamela ase onek
-- Create Community table
-- Adding the Community table
CREATE TABLE community (
    community_id SERIAL PRIMARY KEY,
    community_name VARCHAR(45) NOT NULL,
    description VARCHAR(255),
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Adding the User-Community Relationship table
CREATE TABLE user_community_relationship (
    relationship_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    community_id INT REFERENCES community(community_id),
    CONSTRAINT unique_user_community UNIQUE (user_id, community_id)
);