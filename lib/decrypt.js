const base58 = require('bs58');
const crypto = require('crypto');

module.exports = function decrypt(password, str) {
  const aes256 = crypto.createDecipher('aes-256-cbc', password);
  const a = aes256.update(Buffer.from(base58.decode(str)));
  const b = aes256.final();
  return Buffer.concat([a, b]).toString('utf8');
};
