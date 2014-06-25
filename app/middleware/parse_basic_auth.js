
// Parses basic http auth
// Pass in Koa request
// Returns {} or { user: String, pass: String }
function parse_basic_auth(request){
  var auth_header = request.header['authorization'];
  if (!auth_header) { return {}; }

  // auth_header_parts: ['Basic' '<token64>']
  var auth_header_parts = auth_header.split(/\s+/);
  if ('basic' != auth_header_parts[0].toLowerCase()) { return {}; }
  if (!auth_header_parts[1]) { return {}; }

  var token64 = auth_header_parts[1];

  // credentials
  var token = new Buffer(token64, 'base64').toString();
  var token_parts = token.match(/^([^:]+):(.*)$/);
  if (!token_parts) { return {}; }

  return { user: token_parts[1], pass: token_parts[2] };
};

module.exports = function() {
  return function *(next) {
    var basic_auth = parse_basic_auth(this.request);
    if (basic_auth) {
      this.request.basic_auth = basic_auth;
    }
    yield next;
  }
}
