-- script to set up example data for testing. do not use in production.

\c boop;

do $$
<<examples>>
declare
  -- all of these test accounts use the password "foobar", which matches this hash
  example_password_hash TEXT := '$2b$09$lAAPQpGfr7wG/D9KzFX1pOTrNpgX5X5AOCunbTxfOdcdmyqnKgOPy';
begin
    -- add example users
    -- gpb (George P Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000001-0000-0000-0000-000000000000', 'gpb', example_password_hash, 'George P. Burdell',
      'George', 'Male', 'gburdell@gatech.edu', '1909-04-01', false);
    -- ramonac (Ramona Cartwright Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000002-0000-0000-0000-000000000000', 'ramona', example_password_hash, 'Ramona Cartwright Burdell',
      'Ramona', 'Female', 'rcartwright@agnesscott.edu', '1936-04-01', false);
    -- JRainwater (John Rainwater)
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000003-0000-0000-0000-000000000000', 'JRainwater', example_password_hash, 'John Rainwater',
      'Johnny', null, 'jrainwater@washington.edu', '1952-01-01', false);

    -- alice, bob, charlie, and david
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000011-0000-0000-0000-000000000000', 'alice', example_password_hash, 'Alice Exampleton',
      'Alice', 'Female', 'alice@example.com', '1995-03-05', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000012-0000-0000-0000-000000000000', 'bob', example_password_hash, 'Robert Defacto',
      'Bob', null, 'bob@example.com', '1999-10-20', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000013-0000-0000-0000-000000000000', 'charlie', example_password_hash, 'Charlie McExampleface',
      'Charlie', 'Nonbinary', 'charlie@example.com', '2000-07-15', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES ('00000014-0000-0000-0000-000000000000', 'david', example_password_hash, 'David Défaut',
      'Dave', null, 'david@example.com', '1995-03-30', false);


    -- friend request from John Rainwater to George P Burdell
    insert into friend_requests(from_user, to_user)
        values('00000003-0000-0000-0000-000000000000', '00000001-0000-0000-0000-000000000000');


    -- George and Ramona Burdell
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000001-0000-0000-0000-000000000000', '00000002-0000-0000-0000-000000000000');
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000002-0000-0000-0000-000000000000', '00000001-0000-0000-0000-000000000000');
    -- alice and bob
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000011-0000-0000-0000-000000000000', '00000012-0000-0000-0000-000000000000');
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000012-0000-0000-0000-000000000000', '00000011-0000-0000-0000-000000000000');
    -- alice and charlie
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000011-0000-0000-0000-000000000000', '00000013-0000-0000-0000-000000000000');
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000013-0000-0000-0000-000000000000', '00000011-0000-0000-0000-000000000000');
    -- charlie and david
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000013-0000-0000-0000-000000000000', '00000014-0000-0000-0000-000000000000');
    INSERT INTO FRIENDS(user_a, user_b)
        values('00000014-0000-0000-0000-000000000000', '00000013-0000-0000-0000-000000000000');


   COMMIT;
   RAISE NOTICE 'Finished creating example users';
end examples $$;


