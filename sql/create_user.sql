INSERT INTO users (uname, digest)
VALUES ($1, $2)
RETURNING *;
