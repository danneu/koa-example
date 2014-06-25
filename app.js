
var app = require('koa')();
var debug = require('debug')('app');

// Either 'test', 'development', 'production'
var env = process.env.NODE_ENV || 'development';

// Turn off X-Powered-By header
app.poweredBy = false;

app.use(require('koa-response-time')()); // Add x-response-time header to response
app.use(require('koa-logger')()); // https://github.com/koajs/logger
app.use(require('koa-compress')()); // https://github.com/koajs/compress
// Pretty-print JSON response to make API more browser-explorable
app.use(require('koa-json')());
// Assoc request.basic_auth = { user: String, pass: String } if
// Basic HTTP auth was provided.
app.use(require('./app/middleware/parse_basic_auth')());
// Assoc request.current_user = <User> if a valid session_id was
// provided as Basic HTTP auth username.
app.use(require('./app/middleware/authenticate_session_id')());
app.use(require('koa-conditional-get')());  // Use upstream from etag
app.use(require('koa-etag')()); // koa-etag https://github.com/koajs/etag
// app.use(require('koa-ratelimit')({})); // https://github.com/koajs/ratelimit
app.use(require('koa-body')()); // https://github.com/dlau/koa-body

var route = require('koa-route'); // koa-route https://github.com/koajs/route
var db = require('./app/db');

// Demo 1
app.use(route.get('/', function *() {
  this.body = yield db.reset_and_init_db();
}));

// Demo 2
app.use(route.get('/secret', function *() {
  this.body = {
    current_user: this.request.current_user,
    basic_auth: this.request.basic_auth
  };
}));

// /users handlers
app.use(route.get('/users', require('./app/api/users').list_users));
app.use(route.get('/users/:uname', require('./app/api/users').show_user));
app.use(route.post('/users', require('./app/api/users').create_user));

// /sessions handlers
app.use(route.post('/sessions', require('./app/api/sessions').create_session));

module.exports = app;
