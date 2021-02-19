\c postgres

DROP DATABASE IF EXISTS boop;
CREATE DATABASE boop
    TEMPLATE template0
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

\c boop;

CREATE TYPE GENDER_IDENTITY AS ENUM ('Female', 'Male', 'Nonbinary');

CREATE TABLE users(
    user_uuid UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    bcrypt_hash TEXT NOT NULL, -- bcrypt "hashes" actually contain both the password hash and salt as one string
    full_name TEXT NOT NULL,
    friendly_name TEXT NOT NULL,
    gender GENDER_IDENTITY, -- allowed to be null for users who prefer not to state a gender
    email TEXT NOT NULL,
    -- date in ISO format
    birth_date TEXT NOT NULL,
    status_message TEXT NOT NULL DEFAULT ''::TEXT,
    do_not_disturb BOOLEAN NOT NULL DEFAULT false,
    -- last time that this user was sent a spontaneous reminder, in milliseconds since epoch
    -- note that the default value is equivilant to Jan 1 1970
    last_push_timestamp bigint NOT NULL DEFAULT 0,
    -- web-push/VAPID subscription objects used to send push notifications
    vapid_subs JSONB[] NOT NULL DEFAULT '{}'::JSONB[]
);

-- only users listed here can use admin command endpoints
CREATE TABLE administrators(
    admin_user_uuid UUID PRIMARY KEY REFERENCES users (user_uuid) ON DELETE CASCADE
);

-- create special admin account
INSERT INTO users
("user_uuid", "username", "bcrypt_hash", "full_name", "friendly_name", "gender", "email", "birth_date")
VALUES ('689b90d7-41ed-4257-a2a1-ca6d608d28f7', 'admin', '$2b$09$6Xjk49GbCZTjoognkzPk2.pyblewRbaiHLGap0PjETNNX924or4xS',
'Boop Administrator', 'Administrator', null, 'example@example.com', '2000-01-15');
INSERT INTO administrators(admin_user_uuid) values ('689b90d7-41ed-4257-a2a1-ca6d608d28f7');

-- user log-in sessions
CREATE TABLE sessions(
    token text PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    time_last_touched bigint NOT NULL -- time this session was last accessed, in milliseconds since epoch
);

-- identifies a reminder push notification and authorizes getting user info about the target friend or friend-of-friend
CREATE TABLE push_identity_tokens(
    token text PRIMARY KEY,
    target_user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    expiration_time bigint NOT NULL -- expiration time in milliseconds since epoch
);

-- pending friend requests
CREATE TABLE friend_requests(
    from_user UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    to_user UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE
);

-- each friendship is represented as two rows, one for each direction
CREATE TABLE friends(
    user_a UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    user_b UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE
);

CREATE TABLE contact_methods(
    user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    contact_id TEXT NOT NULL -- user's username/number/etc for that platform
);
