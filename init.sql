\c postgres

DROP DATABASE IF EXISTS boop;
CREATE DATABASE boop
    TEMPLATE template0
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

\c boop;

CREATE TYPE GENDER_IDENTITY AS ENUM ('Female', 'Male', 'Nonbinary');

-- public: profile and contact info visible to everyone
-- private: profile and contact info visible to friends and friends-of-friends
-- restricted: profile and contact info visible to friends only (disables notifications to talk to friends-of-friends)
CREATE TYPE PRIVACY_LEVEL AS ENUM ('public', 'private', 'restricted');

CREATE TABLE users(
    user_uuid UUID PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    -- bcrypt "hashes" actually contain both the password hash and salt as one string
    bcrypt_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    friendly_name TEXT NOT NULL,
    -- gender is allowed to be null for users who prefer not to state a gender
    gender GENDER_IDENTITY,
    email TEXT NOT NULL,
    -- date in ISO format, e.g. '2000-12-31'
    birth_date TEXT NOT NULL,
    status_message TEXT NOT NULL DEFAULT ''::TEXT,
    do_not_disturb BOOLEAN NOT NULL DEFAULT false,
    -- last time that this user was sent a spontaneous reminder, in milliseconds since epoch
    -- note that the default value is equivilant to Jan 1 1970
    last_push_timestamp bigint NOT NULL DEFAULT 0,
    -- web-push/VAPID subscription objects used to send push notifications
    vapid_subs JSONB[] NOT NULL DEFAULT '{}'::JSONB[],
    -- profile privacy settings
    profile_privacy_level PRIVACY_LEVEL NOT NULL DEFAULT 'public',
    profile_show_age BOOLEAN NOT NULL DEFAULT true,
    profile_show_gender BOOLEAN NOT NULL DEFAULT true,
    -- profile page description field
    profile_bio TEXT NOT NULL DEFAULT ''::TEXT
);

-- only users listed here can use admin command endpoints
CREATE TABLE administrators(
    admin_user_uuid UUID PRIMARY KEY REFERENCES users (user_uuid) ON DELETE CASCADE
);

-- create special admin account
INSERT INTO users
("user_uuid", "username", "bcrypt_hash",
"full_name", "friendly_name", "email", "birth_date", "profile_privacy_level",
"profile_show_age", "profile_show_gender")
VALUES ('00000000-0000-0000-0000-000000000000', 'admin', '$2b$09$6Xjk49GbCZTjoognkzPk2.pyblewRbaiHLGap0PjETNNX924or4xS',
'Boop Administrator', 'Administrator', 'boopsocialapp@gmail.com', '2000-01-01', 'restricted',
'false', 'false');
INSERT INTO administrators(admin_user_uuid) values ('00000000-0000-0000-0000-000000000000');

-- user log-in sessions
CREATE TABLE sessions(
    -- a unique token is randomly generated for each session
    token text PRIMARY KEY,
    user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    -- time this session was last accessed, in milliseconds since epoch
    time_last_touched bigint NOT NULL
);

-- identifies a reminder push notification and authorizes getting user info about the target friend or friend-of-friend
CREATE TABLE push_identity_tokens(
    -- each chat prompt notification has a token that is separate from the session tokens
    token text PRIMARY KEY,
    -- uuid of the user whose information will be shown on "start chat" page for this notification
    target_user_uuid UUID NOT NULL REFERENCES users (user_uuid) ON DELETE CASCADE,
    -- expiration time in milliseconds since epoch
    expiration_time bigint NOT NULL
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
    -- user's username/number/etc for that platform
    contact_id TEXT NOT NULL
);


-- function for selecting pairs of users to send notifications
CREATE FUNCTION selectPairs(
    timestamp_cutoff bigint,
    friend_probability double precision,
    metafriend_probability double precision
) RETURNS TABLE (
        user_a UUID, user_b UUID,
        full_name_a TEXT, friendly_name_a TEXT, gender_a GENDER_IDENTITY, vapid_subs_a JSONB[],
        full_name_b TEXT, friendly_name_b TEXT, gender_b GENDER_IDENTITY, vapid_subs_b JSONB[],
        -- mutual friend fields are null for users who are friends
        mutual_full_name TEXT, mutual_friendly_name TEXT, mutual_gender GENDER_IDENTITY
) AS $$
    -- find all the users that can be sent notifications right now
    WITH enabled_users AS (
        SELECT user_uuid
        FROM users
        WHERE (do_not_disturb IS NOT true) and (last_push_timestamp is null or last_push_timestamp < timestamp_cutoff)
    ),
    -- users with restricted profiles cannot match with friends-of-friends
	    restricted_users AS (
		    select user_uuid from users where profile_privacy_level = 'restricted'
	    ),
    -- find all the friend-of-friend relationships that don't include someone with a restricted profile
    metafriends as (
        select f1.user_a as user_a, f1.user_b as shared, f2.user_b as user_b
        from friends f1 join friends f2 on f1.user_b = f2.user_a
        where f1.user_a <> f2.user_b and f2.user_b not in (select f3.user_b from friends f3 where f3.user_a = f1.user_a)
            and f1.user_a not in (select user_uuid from restricted_users)
            and f2.user_b not in (select user_uuid from restricted_users)
    ),
    -- pick a random subset of users to get notifications about friends
    friends_chosen_users AS (
        SELECT user_uuid
        FROM enabled_users
        WHERE random() < friend_probability
    ),
    -- get the array of possible friends that those users could be paired with
    friend_options AS (
        SELECT user_a, array_agg(user_b order by random()) as user_bs
        FROM friends_chosen_users join friends on friends_chosen_users.user_uuid = friends.user_a
        group by user_a
    ),
    -- pick a random subset of users to get notifications about friends-of-friends
    metafriends_chosen_users AS (
        SELECT user_uuid
        FROM enabled_users
        WHERE random() < metafriend_probability
    ),
    -- get the array of possible friends-of-friends those users could be paired with
    metafriend_options AS (
        SELECT user_a, array_agg(ARRAY[user_b, shared] order by random()) as user_bs
        FROM metafriends_chosen_users join metafriends on metafriends_chosen_users.user_uuid = metafriends.user_a
        group by user_a
    ),
    friend_pairs as (
        -- select one of the possible friends
        select user_a, user_bs[1] as user_b, NULL::UUID as shared
        from friend_options
        -- note that the resulting set of pairs is likely to contain duplicates of the same user
    ),
    metafriend_pairs as (
        select user_a, user_bs[1][1] as user_b, user_bs[1][2] as shared
        from metafriend_options
        -- note that the resulting set of pairs is likely to contain duplicates of the same user
    ),
    -- merge friend pairs and friend-of-friend pairs
    all_pairs as (
        select * from friend_pairs union all select * from metafriend_pairs
    ),
    -- collect user info for user a
    a_info as (
        select user_a, user_b, shared,
        full_name as full_name_a, friendly_name as friendly_name_a, gender as gender_a, vapid_subs as vapid_subs_a
        from all_pairs join users on user_a = user_uuid
    ),
    -- collect user info for user b
    ab_info as (
        select user_a, user_b, shared,
        full_name_a, friendly_name_a, gender_a, vapid_subs_a,
        full_name as full_name_b, friendly_name as friendly_name_b, gender as gender_b, vapid_subs as vapid_subs_b
        from a_info join users on user_b = user_uuid
    ),
    -- collect user info for mutual friend if applicable
    abc_info as (
        select user_a, user_b,
        full_name_a, friendly_name_a, gender_a, vapid_subs_a,
        full_name_b, friendly_name_b, gender_b, vapid_subs_b,
        full_name as mutual_full_name, friendly_name as mutual_friendly_name, gender as mutual_gender
        from ab_info left join users on shared = user_uuid
    )
    -- return results in a random order
    select * from abc_info order by random();
$$ LANGUAGE SQL
