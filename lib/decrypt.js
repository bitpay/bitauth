var base58 = require('bs58');
var crypto = require('crypto');

module.exports = function decrypt(password, str) {
  var aes256 = crypto.createDecipher('aes-256-cbc', password);
  var a = aes256.update(Buffer.from(base58.decode(str)));
  var b = aes256.final();
  return Buffer.concat([a, b]).toString('utf8');
};
