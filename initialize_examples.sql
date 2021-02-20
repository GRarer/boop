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
  eveUUID UUID := '0000000e-0000-0000-0000-000000000000';

begin
    -- add example users'
    -- gpb (George P Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (georgeUUID, 'gpb', example_password_hash, 'George P. Burdell',
      'George', 'Male', 'gburdell@gatech.edu', '1909-04-01');
    -- ramonac (Ramona Cartwright Burdell)
    INSERT INTO users
      ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (ramonaUUID, 'ramona', example_password_hash, 'Ramona Cartwright Burdell',
      'Ramona', 'Female', 'rcartwright@agnesscott.edu', '1936-04-01');
    -- JRainwater (John Rainwater)
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (johnUUID, 'JRainwater', example_password_hash, 'John Rainwater',
      'Johnny', null, 'jrainwater@washington.edu', '1952-01-01');

    -- alice, bob, charlie, and david
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (aliceUUID, 'alice', example_password_hash, 'Alice Exampleton',
      'Alice', 'Female', 'alice@example.com', '1995-03-05');
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (bobUUID, 'bob', example_password_hash, 'Robert Defacto',
      'Bob', 'Male', 'bob@example.com', '1999-10-20');
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (charlieUUID, 'charlie', example_password_hash, 'Charlie McExampleface',
      'Charlie', 'Nonbinary', 'charlie@example.com', '2000-07-15');
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (davidUUID, 'david', example_password_hash, 'David Défaut',
      'Dave', null, 'david@example.com', '1995-03-30');
    INSERT INTO users
    ("user_uuid", "username", "bcrypt_hash", "full_name",
      "friendly_name", "gender", "email", "birth_date")
      VALUES (eveUUID, 'eve', example_password_hash, 'Eve Exampleton',
      'Eve', 'Female', 'eve@example.com', '1996-07-17');


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
        (davidUUID, charlieUUID),
        (aliceUUID, eveUUID),
        (eveUUID, aliceUUID),
        (charlieUUID, eveUUID),
        (eveUUID, charlieUUID);

    -- contact methods
    INSERT INTO contact_methods (user_uuid, platform, contact_id) VALUES
    (georgeUUID, 'WhatsApp', '15555555555'),
    (georgeUUID, 'Discord', 'burdell#1234'),
    (georgeUUID, 'iMessage', '555-555-5555'),
    (ramonaUUID, 'WhatsApp', '15555551234'),
    (johnUUID, 'Discord', 'rainwater#1337'),
    (aliceUUID, 'Signal', '123-555-4567'),
    (aliceUUID, 'Discord', 'exampleton#5678'),
    (bobUUID, 'Signal', '123-555-0000'),
    (bobUUID, 'Line', 'defacto1'),
    (charlieUUID, 'GroupMe', 'charlie2000');

   COMMIT;
   RAISE NOTICE 'Finished creating example users';
end examples $$;


