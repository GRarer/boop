\c postgres

DROP DATABASE IF EXISTS boop;
CREATE DATABASE boop
    TEMPLATE template0
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

\c boop;

CREATE TYPE GENDER_IDENTITY AS ENUM ('Female', 'Male', 'Nonbinary');

-- table used for the tech-stack demonstration prototype
CREATE TABLE example_data(
    id_number bigint NOT NULL,
    contents text Not NULL,
    PRIMARY KEY (id_number)
);

CREATE TABLE users(
    user_uuid UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    bcrypt_hash TEXT NOT NULL, -- bcrypt "hashes" actually contain both the password hash and salt as one string
    full_name TEXT NOT NULL,
    friendly_name TEXT NOT NULL,
    gender GENDER_IDENTITY, -- allowed to be null for users who prefer not to state a gender
    email TEXT NOT NULL,
    birth_date TEXT NOT NULL, -- date in ISO format
    is_admin BOOLEAN
);

-- create special admin account for demonstrations
-- TODO remove this before deploying
INSERT INTO users
("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email", "birth_date", "is_admin")
VALUES ('689b90d7-41ed-4257-a2a1-ca6d608d28f7', 'admin', '$2b$09$6Xjk49GbCZTjoognkzPk2.pyblewRbaiHLGap0PjETNNX924or4xS',
'Boop Administrator', 'Administrator', null, 'example@example.com', '2000-01-15', TRUE);

-- web-push subscriptions and the associated users
-- endpoint column ensures we don't send duplicate notifications to the same user on the same device/browser
CREATE Table subscriptions(
    sub_json JSON NOT NUll,
    user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    PRIMARY Key (endpoint, user_uuid)
);

-- user log-in sessions
CREATE TABLE sessions(
    token text PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    time_last_touched bigint NOT NULL -- time this session was last accessed, in milliseconds since epoch
);

-- pending friend requests
CREATE TABLE friend_requests(
    from_user UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    to_user UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE
)
