

var db = require('../db');

// parse_basic_auth middleware should exist upstream.
// if basic http auth was provided, it will be available
// as { user: String, pass: String }
// The client should give us session_id as the basic auth username.
// if a session exists with that id, then we conj { current_user: <User> }
// to the request.

module.exports = function() {
  return function *(next) {
    var basic_auth = this.request.basic_auth;
    var session_id = basic_auth && basic_auth.user;

    // If basic auth was provided, try to find a DB user from the
    // provided basic auth username as a session_id.
    if (session_id) {
      var current_user = yield db.find_user_by_session_id(session_id);
      // Assoc a current_user to the request if one is found
      if (current_user) {
        console.log('current_user found: ' + require('util').inspect(current_user));
        this.request['current_user'] = current_user;
      }
    }

    yield next;
  }
}
