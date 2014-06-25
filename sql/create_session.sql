INSERT INTO sessions (id, user_id)
VALUES ($1, $2::int)
RETURNING *;
