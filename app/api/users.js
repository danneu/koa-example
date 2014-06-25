
var db = require('../db');

exports.list_users = function *() {
  var users = yield db.find_users();
  this.body = users;
}

exports.show_user = function *(uname) {
  var user = yield db.find_user_by_uname(uname);
  this.body = user;
}

exports.create_user = function *() {
  var uname = this.request.body['uname'];
  var password = this.request.body['password'];

  // Verify that uname is supplied
  if (!uname) {
    this.status = 400;  // Bad Request
    this.body = { message: 'Required body param: uname' };
    return;
  }

  // Verify that uname is supplied
  if (!password) {
    this.status = 400;  // Bad Request
    this.body = { message: 'Required body param: password' };
    return;
  }

  // Ensure user with that name does not already exist
  if (yield db.find_user_by_uname(uname)) {
    this.status = 409;  // Conflict
    this.body = { message: 'User with that uname already exists' };
    return;
  }

  var created_user = yield db.create_user(uname, password);
  this.status = 201;
  return created_user;
}
