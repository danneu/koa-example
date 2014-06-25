
var bcrypt = require('bcryptjs');
var uuid = require('node-uuid');
var thunkify = require('thunkify');

var hash_ = thunkify(bcrypt.hash);
function *hash_password(password) {
  var work_factor = 11;
  return yield hash_(password, work_factor);
}

function generate_uuid() {
  // Unlike v1 (time based), v4 is random
  return uuid.v4();
}

exports.hash_password = hash_password;
exports.generate_uuid = generate_uuid;
