'use strict';

var secp256k1 = require('secp256k1');
var BitAuth = require('./bitauth-common');
var crypto = require('crypto');

BitAuth._generateRandomPair = function() {
  var privateKeyBuffer;
  do {
    privateKeyBuffer = crypto.randomBytes(32);
  } while (!secp256k1.secretKeyVerify(privateKeyBuffer));
  var publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);
  return [privateKeyBuffer.toString('hex'), publicKeyBuffer.toString('hex')];
};

BitAuth._getPublicKeyFromPrivateKey = function(privkey) {
  var privateKeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privateKeyBuffer = privkey;
  } else {
    privateKeyBuffer = new Buffer(privkey, 'hex');
  }
  return secp256k1.publicKeyCreate(privateKeyBuffer);
};

BitAuth._sign = function(hashBuffer, privkey) {
  var privkeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privkeyBuffer = privkey;
  } else {
    privkeyBuffer = new Buffer(privkey, 'hex');
  }
  var signatureInfo = secp256k1.signSync(hashBuffer, privkeyBuffer);
  return signatureInfo.signature.toString('hex');
};

BitAuth._verifySignature = function(hashBuffer, signatureBuffer, pubkey) {
  var pubkeyBuffer;
  if (!Buffer.isBuffer(pubkey)){
    pubkeyBuffer = new Buffer(pubkey, 'hex');
  } else {
    pubkeyBuffer = pubkey;
  }
  return secp256k1.verify(hashBuffer, signatureBuffer, pubkeyBuffer) ? true : false;
};

module.exports = BitAuth;
