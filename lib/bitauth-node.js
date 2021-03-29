'use strict';

const secp256k1 = require('secp256k1');
const BitAuth = require('./bitauth-common');
const crypto = require('crypto');

BitAuth._generateRandomPair = function() {
  const privateKeyBuffer = crypto.randomBytes(32); // may throw error if entropy sources drained
  const publicKeyBuffer = Buffer.from(secp256k1.publicKeyCreate(privateKeyBuffer, true));
  return [privateKeyBuffer.toString('hex'), publicKeyBuffer.toString('hex')];
};

BitAuth._getPublicKeyFromPrivateKey = function(privkey) {
  let privateKeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privateKeyBuffer = privkey;
  } else {
    privateKeyBuffer = Buffer.from(privkey, 'hex');
  }
  return Buffer.from(secp256k1.publicKeyCreate(privateKeyBuffer, true));
};

BitAuth._sign = function(hashBuffer, privkey) {
  let privkeyBuffer;
  if (Buffer.isBuffer(privkey)) {
    privkeyBuffer = privkey;
  } else {
    privkeyBuffer = Buffer.from(privkey, 'hex');
  }
  var signatureInfo = secp256k1.ecdsaSign(hashBuffer, privkeyBuffer);
  return Buffer.from(secp256k1.signatureExport(signatureInfo.signature));
};

BitAuth._verifySignature = function(hashBuffer, signatureBuffer, pubkey) {
  let pubkeyBuffer;
  const signature = secp256k1.signatureNormalize(secp256k1.signatureImport(signatureBuffer));
  if (!Buffer.isBuffer(pubkey)){
    pubkeyBuffer = Buffer.from(pubkey, 'hex');
  } else {
    pubkeyBuffer = pubkey;
  }
  return !!secp256k1.ecdsaVerify(signature, hashBuffer, pubkeyBuffer);
};

module.exports = BitAuth;
