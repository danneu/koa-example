
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE users (
  id            serial          PRIMARY KEY,
  uname         text            NOT NULL  UNIQUE,
  digest        text            NOT NULL,
  created_at    timestamp       NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sessions (
  id            uuid            PRIMARY KEY,
  user_id       int             REFERENCES users(id),
  created_at    timestamp       NOT NULL  DEFAULT CURRENT_TIMESTAMP
);

