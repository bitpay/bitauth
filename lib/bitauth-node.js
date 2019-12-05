'use strict';

var secp256k1 = require('secp256k1');
var BitAuth = require('./bitauth-common');
var crypto = require('crypto');

BitAuth._generateRandomPair = function() {
  var privateKeyBuffer = crypto.randomBytes(32); // may throw error if entropy sources drained
  var publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer, true);
  return [privateKeyBuffer.toString('hex'), publicKeyBuffer.toString('hex')];
};

BitAuth._getPublicKeyFromPrivateKey = function(privkey) {
  var privateKeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privateKeyBuffer = privkey;
  } else {
    privateKeyBuffer = Buffer.from(privkey, 'hex');
  }
  return secp256k1.publicKeyCreate(privateKeyBuffer, true);
};

BitAuth._sign = function(hashBuffer, privkey) {
  var privkeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privkeyBuffer = privkey;
  } else {
    privkeyBuffer = Buffer.from(privkey, 'hex');
  }
  var signatureInfo = secp256k1.sign(hashBuffer, privkeyBuffer);
  return secp256k1.signatureExport(signatureInfo.signature);
};

BitAuth._verifySignature = function(hashBuffer, signatureBuffer, pubkey) {
  var pubkeyBuffer;
  var signature = secp256k1.signatureImportLax(signatureBuffer);
  if (!Buffer.isBuffer(pubkey)){
    pubkeyBuffer = Buffer.from(pubkey, 'hex');
  } else {
    pubkeyBuffer = pubkey;
  }
  return !!secp256k1.verify(hashBuffer, signature, pubkeyBuffer);
};

module.exports = BitAuth;
