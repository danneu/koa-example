
var co = require('co');
var pg = require('co-pg')(require('pg'));
var thunkify = require('thunkify');
var path = require('path');
var fs = require('co-fs');
var authen = require('./authen');
var belt = require('./belt');

var conn_url = 'postgres://dbusername:dbpassword@abcd.efgh.us-east-1.rds.amazonaws.com:5432/dbname';

function *slurp_sql(file_path) {
  var relative_path = '../sql/' + file_path;
  var full_path = path.join(__dirname, relative_path);
  return yield fs.readFile(full_path, 'utf-8');
}

function *query(sql, params) {
  try {
    var conn = yield pg.connect_(conn_url);
    var client = conn[0];
    var done = conn[1];

    var result = yield client.query_(sql, params);
    done();  // Release client back to pool

    return result.rows;
  } catch(ex) {
    console.error(ex.toString());
  }
}

// Like query but returns the full result instead of result.rows
function *execute(sql, params) {
  try {
    var conn = yield pg.connect_(conn_url);
    var client = conn[0];
    var done = conn[1];

    var result = yield client.query_(sql, params);
    done();  // Release client back to pool

    return result.rows;
  } catch(ex) {
    console.error(ex.toString());
  }
}

////////////////////////////////////////////////////////////

exports.find_users = function *() {
  return yield query('SELECT * FROM users;', []);
}

// `uname` lookup is case-insensitive
exports.find_user_by_uname = function *(uname) {
  var sql = yield slurp_sql('find_user_by_uname.sql');
  var rows = yield query(sql, [uname]);
  return rows[0];
}

exports.create_user = function *(uname, password) {
  var digest = yield authen.hash_password(password);
  var sql = yield slurp_sql('create_user.sql');
  var rows = yield query(sql, [uname, digest]);
  return rows[0];
}

exports.create_session = function *(user_id) {
  var sql = yield slurp_sql('create_session.sql');
  var session_id = authen.generate_uuid();
  var rows = yield query(sql, [session_id, user_id]);
  return rows[0];
}

exports.find_user_by_digest = function *(digest) {
  var sql = yield slurp_sql('find_user_by_digest.sql');
  var rows = yield query(sql, [digest]);
  return rows[0];
}

exports.find_user_by_session_id = function *(session_id) {
  // Don't feed bad UUIDs into query
  if (!belt.is_valid_uuid(session_id)) { return null; };
  var sql = yield slurp_sql('find_user_by_session_id.sql');
  var rows = yield query(sql, [session_id]);
  return rows[0];
}

// Resets the db, creates 3 fresh users, and returns the db's user count
exports.reset_and_init_db = function *() {
  var sql = yield slurp_sql('migrations/0_reset_and_init_db.sql');
  var result = yield query(sql, []);
  yield [
    this.create_user('danneu', 'secret'),
    this.create_user('user2', 'secret'),
    this.create_user('user3', 'secret'),
  ];
  return (yield query('SELECT COUNT(*) FROM users;', []))[0];
}

////////////////////////////////////////////////////////////
