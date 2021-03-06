
# koa-example

I heard about Koa yesterday and attempted to put together a basic app. Written in a couple hours.

- Just a JSON API
- Deploys to Heroku
- Uses Amazon RDS Postgres database
- Loads parameterized sql from `sql/*.sql` files
- Implements a DB-backed session-based authentication system
- Should be used over SSL

I don't have a strong Node/Javascript background or grasp of Koa/co/generators.

## Things I'd do differently next time

I've gained much more experience with Koa since I wrote this project. Here are
things I've done on Koa projects I've made since this one.

#### `Use koa-pg`

Use [koa-pg](https://www.npmjs.org/package/koa-pg) middleware to add a pooled
database connection to each request which will be available to each route via
`this.pg.db.client`. 

Then I'd rewrite my db namespace functions to take a
`client` as their first argument and query the db with `client.query_(<sql>,
[args])`.

#### Use `multiline`

Remove my `sql/*.sql` files and embed the sql directly into my db namespace
functions. It's too annoying having to juggle buffers just to see and make
trivial changes to my sql. [multiline](https://www.npmjs.org/package/multiline) is a great hack to allow multiline strings.

Example:

      exports.find_user = function *find_user(client, user_id) {
        var sql = multiline(function(){/*
    SELECT * FROM users
    WHERE id = $1
        */});
        var result = yield client.query_(sql, [user_id]);
        return result.rows[0];
      }

      exports.find_users = function *find_users(client) {
        var sql = multiline(function(){/*
    SELECT * FROM users
    ORDER BY username
        */});
        var result = yield client.query_(sql);
        return result.rows;
      }

## Setup

1. Install Node v0.11.x. I just went `brew install nvm`, `nvm install v0.11.x`, and `nvm use 0.11`.
2. Clone repo
3. `npm start`

## Demo

    $ brew install httpie jq

Change `conn_url` in db.js to point to your own postgres db.

Boot the server:

        $ npm start

Hit the `/` endpoint to create/migrate the db with 3 demo users:

    $ http localhost:3000

Grab the first user's `digest`, POST it to `/sessions` to create a `session_id`, and use the `session_id` as the Basic HTTP Auth username in a GET request to `/secret` to authenticate as that user:

    $ http localhost:3000/users | jq --raw-output '.[0].digest' | read digest; http --json localhost:3000/sessions digest=$digest | jq --raw-output '.session_id' | read session_id; http localhost:3000/secret --auth $session_id:

Output:

    HTTP/1.1 200 OK
    Connection: keep-alive
    Content-Length: 276
    Content-Type: application/json; charset=utf-8
    Date: Wed, 25 Jun 2014 16:02:00 GMT
    ETag: "-774800071"
    Vary: Accept-Encoding
    X-Response-Time: 182ms

    {
        "basic_auth": {
            "pass": "",
            "user": "67707641-4526-4c3e-9e6d-21dc21e350ad"
        },
        "current_user": {
            "created_at": "2014-06-25T20:57:04.769Z",
            "digest": "$2a$10$hGCd9ehO9KatonLZYvxNi.Q7euuESrXhoDinnVbSyPJgY3W8zZTcW",
            "id": 1,
            "uname": "danneu"
        }
    }
