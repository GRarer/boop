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
    INSERT INTO users
      ("user_uuid", "username", "full_name", "friendly_name", "bcrypt_hash",
      "email", "gender", "birth_date",
      "profile_privacy_level", "profile_show_age", "profile_show_gender", "profile_bio") VALUES
    -- gpb (George P Burdell)
    (georgeUUID, 'gpb', 'Geore P. Budell', 'George', example_password_hash,
    'gburdell@gatech.edu', 'Male', '1909-04-01',
    'private', false, true, 'The Eternal Georgia Tech Student. Go Jackets!'),
    -- ramona (Ramona Cartwright Burdell)
    (ramonaUUID, 'ramona', 'Ramona Cartwright Burdell', 'Ramona', example_password_hash,
    'rcartwright@agnesscott.edu', 'Female', '1936-04-01',
    'public', true, true, 'Fictitious Scottie'),
    -- JRainwater (John Rainwater)
    (johnUUID, 'JRainwater', 'John Rainwater', 'Johnny', example_password_hash,
    'jrainwater@washington.edu', null, '1952-01-01',
    'public', true, true, 'Mathematician specializing in Functional Analysis.'),
    -- alice
    (aliceUUID, 'alice', 'Alice Exampelton', 'Alice', example_password_hash,
    'alice@example.com', 'Female', '1995-03-05',
    'public', true, true, 'Cryptography Enthusiast'),
    -- bob
    (bobUUID, 'bob', 'Robert Defacto', 'Bob', example_password_hash,
    'bob@example.com', 'Male', '1990-10-20',
    'private', false, false, 'Proponent of public-key encryption'),
    -- charlie
    (charlieUUID, 'charlie', 'Charlie McExampleFace', 'Charlie', example_password_hash,
    'charlie@example.com', 'Nonbinary', '2000-07-15',
    'public', false, true, ''),
    -- david
    (davidUUID, 'david', 'David Défaut', 'Dave', example_password_hash,
    'david@example.com', null, '1995-03-30',
    'public', true, true, ''),
    -- eve
    (eveUUID, 'eve', 'Eve Exampleton', 'Eve', example_password_hash,
    'eve@example.com', 'Female', '1996-07-17',
    'private', true, true, '');

    -- friend requests
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
    (georgeUUID, 'WhatsApp', '+1-555-555-5555'),
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


