-- $1: session_id

SELECT *
FROM users u
WHERE u.id = (
  SELECT s.user_id
  FROM sessions s
  WHERE s.id = $1
    -- Sessions become invalid after 2 weeks
    AND created_at >= (NOW() - INTERVAL '14 days')
);
