DROP DATABASE IF EXISTS boop;
CREATE DATABASE boop
    TEMPLATE template0
    ENCODING 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8';

\c boop;

DROP TABLE IF EXISTS example_data;
CREATE TABLE example_data(
    id_number bigint NOT NULL,
    contents text Not NULL,
    PRIMARY KEY (id_number)
);


