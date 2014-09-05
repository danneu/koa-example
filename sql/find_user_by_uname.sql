SELECT *
FROM users
WHERE lower(uname) = lower($1);
