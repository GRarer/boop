-- script to set up example data for testing. do not use in production.

\c boop;

do $$
<<examples>>
declare
  -- all of these test accounts use the password "foobar", which matches this hash
  example_password_hash TEXT := '$2b$09$lAAPQpGfr7wG/D9KzFX1pOTrNpgX5X5AOCunbTxfOdcdmyqnKgOPy';

  -- fake UUIDs
  georgeUUID UUID := '00000001-0000-0000-0000-000000000000';
  ramonaUUID UUID := '00000002-0000-0000-0000-000000000000';
  johnUUID UUID := '00000003-0000-0000-0000-000000000000';
  aliceUUID UUID := '0000000a-0000-0000-0000-000000000000';
  bobUUID UUID := '0000000b-0000-0000-0000-000000000000';
  charlieUUID UUID := '0000000c-0000-0000-0000-000000000000';
  davidUUID UUID := '0000000d-0000-0000-0000-000000000000';

begin
    -- add example users
    -- gpb (George P Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (georgeUUID, 'gpb', example_password_hash, 'George P. Burdell',
      'George', 'Male', 'gburdell@gatech.edu', '1909-04-01', false);
    -- ramonac (Ramona Cartwright Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (ramonaUUID, 'ramona', example_password_hash, 'Ramona Cartwright Burdell',
      'Ramona', 'Female', 'rcartwright@agnesscott.edu', '1936-04-01', false);
    -- JRainwater (John Rainwater)
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (johnUUID, 'JRainwater', example_password_hash, 'John Rainwater',
      'Johnny', null, 'jrainwater@washington.edu', '1952-01-01', false);

    -- alice, bob, charlie, and david
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (aliceUUID, 'alice', example_password_hash, 'Alice Exampleton',
      'Alice', 'Female', 'alice@example.com', '1995-03-05', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (bobUUID, 'bob', example_password_hash, 'Robert Defacto',
      'Bob', null, 'bob@example.com', '1999-10-20', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (charlieUUID, 'charlie', example_password_hash, 'Charlie McExampleface',
      'Charlie', 'Nonbinary', 'charlie@example.com', '2000-07-15', false);
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date", "is_admin")
      VALUES (davidUUID, 'david', example_password_hash, 'David Défaut',
      'Dave', null, 'david@example.com', '1995-03-30', false);


    -- friend request from John Rainwater to George P Burdell
    insert into friend_requests(from_user, to_user)
        values(johnUUID, georgeUUID);

    -- friendships
    INSERT INTO FRIENDS(user_a, user_b) values
        (georgeUUID, ramonaUUID),
        (ramonaUUID, georgeUUID),
        (aliceUUID, bobUUID),
        (bobUUID, aliceUUID),
        (aliceUUID, charlieUUID),
        (charlieUUID, aliceUUID),
        (charlieUUID, davidUUID),
        (davidUUID, charlieUUID);




    -- contact methods
    INSERT INTO contact_methods (user_uuid, platform, contact_id) VALUES
    (georgeUUID, 'WhatsApp', '555-555-5555'),
    (georgeUUID, 'Discord', 'burdell#1234'),
    (georgeUUID, 'iMessage', '555-555-5555'),
    (ramonaUUID, 'WhatsApp', '555-555-1234'),
    (johnUUID, 'Discord', 'rainwater#1337'),
    (aliceUUID, 'Signal', '123-555-4567'),
    (aliceUUID, 'Discord', 'exampleton#5678'),
    (bobUUID, 'Signal', '123-555-0000'),
    (bobUUID, 'Line', 'defacto1'),
    (charlieUUID, 'GroupMe', 'charlie2000');

   COMMIT;
   RAISE NOTICE 'Finished creating example users';
end examples $$;


