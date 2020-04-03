'use strict';

const elliptic = require('elliptic');
const ecdsa = new elliptic.ec(elliptic.curves.secp256k1);

const BitAuth = require('./bitauth-common');

BitAuth._generateRandomPair = function() {
  const keys = ecdsa.genKeyPair();
  const privateKey = keys.getPrivate('hex');
  const publicKey = BitAuth.getPublicKeyFromPrivateKey(privateKey);
  return [privateKey, publicKey];
};

BitAuth._getPublicKeyFromPrivateKey = function(privkey) {
  let privKeyString;
  if (Buffer.isBuffer(privkey)) {
    privKeyString = privkey.toString('hex');
  } else {
    privKeyString = privkey;
  }
  const keys = ecdsa.keyFromPrivate(privKeyString, 'hex');

  // compressed public key
  const pubKey = keys.getPublic();
  const xbuf = Buffer.from(pubKey.x.toString('hex', 64), 'hex');
  const ybuf = Buffer.from(pubKey.y.toString('hex', 64), 'hex');
  let pub;

  if (ybuf[ybuf.length - 1] % 2) { //odd
    pub = Buffer.concat([Buffer.from([3]), xbuf]);
  } else { //even
    pub = Buffer.concat([Buffer.from([2]), xbuf]);
  }
  return pub;
};

BitAuth._sign = function(hashBuffer, privkey) {
  const keys = ecdsa.keyFromPrivate(privkey, 'hex');
  const signature = keys.sign(hashBuffer.toString('hex'));
  return signature.toDER('hex');
};

BitAuth._verifySignature = function(hashBuffer, signatureBuffer, pubkey) {
  return ecdsa.verify(hashBuffer.toString('hex'), signatureBuffer, pubkey, 'hex');
};

module.exports = BitAuth;
