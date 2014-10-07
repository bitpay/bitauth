var base58 = require('bitcore').Base58;
var crypto = require('crypto');

module.exports = function decrypt(password, str) {
  var aes256 = crypto.createDecipher('aes-256-cbc', password);
  var a      = aes256.update(base58.decode(str));
  var b      = aes256.final();
  var buf    = new Buffer(a.length + b.length);

  a.copy(buf, 0);
  b.copy(buf, a.length);

  return Base58.decode(buf);
};
