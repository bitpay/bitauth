var base58 = require('base58-native');
var crypto = require('crypto');

module.exports = function encrypt(password, str) {
  var aes256 = crypto.createCipher('aes-256-cbc', password);
  var a      = aes256.update(str, 'utf8');
  var b      = aes256.final();
  var buf    = new Buffer(a.length + b.length);

  a.copy(buf, 0);
  b.copy(buf, a.length);
  
  return base58.encode(buf);
};
