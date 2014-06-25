
var db = require('../db');

// Client must provide us with `digest` which is bcrypt(11, password)
// Returns { session_id: <session.id> }
exports.create_session = function *() {

  // "Ensure" that body params are encoded in a JSON string
  function is_json_type(content_type) {
    return /application\/json/i.test(content_type);
  }
  if (!is_json_type(this.request.header['content-type'])) {
    this.status = 415;  // Unsupported media type
    this.body = { message: 'Send body params as JSON' };
    return;
  }

  var digest = this.request.body['digest'];

  // Verify that user_id is supplied
  if (!digest) {
    this.status = 400;  // Bad Request
    this.body = { message: 'Required body param: digest' };
    return;
  }

  var user = yield db.find_user_by_digest(digest);

  // Verify that a user was found (that digest was valid)
  if (!user) {
    this.status = 401;
    this.body = { message: 'Invalid credentials' };
    return;
  }

  var session = yield db.create_session(user.id);
  this.status = 201;  // Created
  this.body = { session_id: session.id };
}
