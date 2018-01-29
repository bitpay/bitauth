'use strict';

var crypto = require('crypto');
var bs58 = require('bs58');
var BitAuth = {};

BitAuth.PREFIX = new Buffer('0f02', 'hex');

/**
 * Will return a key pair and identity
 *
 * @returns {Object} An object with keys: created, priv, pub and sin
 */
BitAuth.generateSin = function() {
  var pair = BitAuth._generateRandomPair();
  var sin = BitAuth.getSinFromPublicKey(pair[1]);
  var sinObj = {
    created: Math.round(Date.now() / 1000),
    priv: pair[0],
    pub: pair[1],
    sin: sin
  };
  return sinObj;
};

/**
 * Will return a public key from a private key
 *
 * @param {String} A private key in hex
 * @returns {String} A compressed public key in hex
 */
BitAuth.getPublicKeyFromPrivateKey = function(privkey) {
  var pub = BitAuth._getPublicKeyFromPrivateKey(privkey);
  var hexPubKey = pub.toString('hex');
  return hexPubKey;
};

/**
 * Will return a SIN from a compressed public key
 *
 * @param {String} A public key in hex
 * @returns {String} A SIN identity
 */
BitAuth.getSinFromPublicKey = function(pubkey) {
  var pubkeyBuffer;
  if (!Buffer.isBuffer(pubkey)) {
    pubkeyBuffer = new Buffer(pubkey, 'hex');
  } else {
    pubkeyBuffer = pubkey;
  }

  // sha256 hash the pubkey
  var pubHash = crypto.createHash('sha256').update(pubkeyBuffer).digest();

  // get the ripemd160 hash of the pubkey
  var pubRipe = crypto.createHash('rmd160').update(pubHash).digest();

  // add the version
  var pubPrefixed = Buffer.concat([BitAuth.PREFIX, pubRipe]);

  // two rounds of hashing to generate the checksum
  var hash1 = crypto.createHash('sha256').update(pubPrefixed).digest();
  var checksumTotal = crypto.createHash('sha256').update(hash1).digest();

  // slice the hash to arrive at the checksum
  var checksum = checksumTotal.slice(0, 4);

  // add the checksum to the ripemd160 pubkey
  var pubWithChecksum = Buffer.concat([pubPrefixed, checksum]);

  // encode into base58
  var sin = bs58.encode(pubWithChecksum);

  return sin;

};

/**
 * Will sign a string of data with a private key
 *
 * @param {String} data - A string of data to be signed
 * @param {String} privkey - A private key in hex
 * @returns {String} signature - A DER signature in hex
 */
BitAuth.sign = function(data, privkey) {
  var dataBuffer;
  if (!Buffer.isBuffer(data)) {
    dataBuffer = new Buffer(data, 'utf8');
  } else {
    dataBuffer = data;
  }
  var hashBuffer = crypto.createHash('sha256').update(dataBuffer).digest();
  var hexsignature = BitAuth._sign(hashBuffer, privkey);
  return hexsignature;
};

/**
 * Will verify a signature
 *
 * @param {String} data - A string of data that has been signed
 * @param {String} pubkey - The compressed public key in hex that has signed the data
 * @param {String} hexsignature - A DER signature in hex
 * @returns {Function|Boolean} - If the signature is valid
 */
BitAuth.verifySignature = function(data, pubkey, hexsignature, callback) {
  var dataBuffer;

  if (!Buffer.isBuffer(data)) {
    dataBuffer = new Buffer(data, 'utf8');
  } else {
    dataBuffer = data;
  }

  var hashBuffer = crypto.createHash('sha256').update(dataBuffer).digest();
  var signatureBuffer;

  if (!Buffer.isBuffer(hexsignature)) {
    signatureBuffer = new Buffer(hexsignature, 'hex');
  } else {
    signatureBuffer = hexsignature;
  }
  var valid = BitAuth._verifySignature(hashBuffer, signatureBuffer, pubkey);

  if (callback) {
    return callback(null, valid);
  }
  return valid;
};

/**
 * Will verify that a SIN is valid
 *
 * @param {String} sin - A SIN identity
 * @returns {Function|Boolean} - If the SIN identity is valid
 */
BitAuth.validateSin = function(sin, callback) {

  var pubWithChecksum;

  // check for non-base58 characters
  try {
    pubWithChecksum = new Buffer(bs58.decode(sin), 'hex').toString('hex');
  } catch (err) {
    if (callback) {
      return callback(err);
    }
    return false;
  }

  // check the version
  if (pubWithChecksum.slice(0, 4) !== '0f02') {
    if (callback) {
      return callback(new Error('Invalid prefix or SIN version'));
    }
    return false;
  }

  // get the checksum
  var checksum = pubWithChecksum.slice(
    pubWithChecksum.length - 8,
    pubWithChecksum.length
  );
  var pubPrefixed = pubWithChecksum.slice(0, pubWithChecksum.length - 8);

  // two rounds of hashing to generate the checksum
  var hash1 = crypto.createHash('sha256').update(new Buffer(pubPrefixed, 'hex')).digest();
  var checksumTotal = crypto.createHash('sha256').update(hash1).digest('hex');

  // check the checksum
  if (checksumTotal.slice(0, 8) === checksum) {
    if (callback) {
      return callback(null);
    }
    return true;
  } else {
    if (callback) {
      return callback(new Error('Checksum does not match'));
    }
    return false;
  }

};

module.exports = BitAuth;
