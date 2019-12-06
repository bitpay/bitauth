const base58 = require('bs58');
const crypto = require('crypto');

module.exports = function encrypt(password, str) {
  const aes256 = crypto.createCipher('aes-256-cbc', password);
  const a = aes256.update(str, 'utf8');
  const b = aes256.final();
  return base58.encode(Buffer.concat([a, b]));
};
