'use strict';

const crypto = require('crypto');
const bs58 = require('bs58');
const BitAuth = {};

BitAuth.PREFIX = Buffer.from('0f02', 'hex');

/**
 * Will return a key pair and identity
 *
 * @returns {Object} An object with keys: created, priv, pub and sin
 */
BitAuth.generateSin = function() {
  const pair = BitAuth._generateRandomPair();
  const sin = BitAuth.getSinFromPublicKey(pair[1]);
  return {
    created: Math.round(Date.now() / 1000),
    priv: pair[0],
    pub: pair[1],
    sin: sin
  };
};

/**
 * Will return a public key from a private key
 *
 * @param {String} privkey A private key in hex
 * @returns {String} A compressed public key in hex
 */
BitAuth.getPublicKeyFromPrivateKey = function(privkey) {
  const pub = BitAuth._getPublicKeyFromPrivateKey(privkey);
  return pub.toString('hex');
};

/**
 * Will return a SIN from a compressed public key
 *
 * @param {String} pubkey A public key in hex
 * @returns {String} A SIN identity
 */
BitAuth.getSinFromPublicKey = function(pubkey) {
  let pubkeyBuffer;
  if (!Buffer.isBuffer(pubkey)) {
    pubkeyBuffer = Buffer.from(pubkey, 'hex');
  } else {
    pubkeyBuffer = pubkey;
  }

  // sha256 hash the pubkey
  const pubHash = crypto.createHash('sha256').update(pubkeyBuffer).digest();

  // get the ripemd160 hash of the pubkey
  const pubRipe = crypto.createHash('rmd160').update(pubHash).digest();

  // add the version
  const pubPrefixed = Buffer.concat([BitAuth.PREFIX, pubRipe]);

  // two rounds of hashing to generate the checksum
  const hash1 = crypto.createHash('sha256').update(pubPrefixed).digest();
  const checksumTotal = crypto.createHash('sha256').update(hash1).digest();

  // slice the hash to arrive at the checksum
  const checksum = checksumTotal.slice(0, 4);

  // add the checksum to the ripemd160 pubkey
  const pubWithChecksum = Buffer.concat([pubPrefixed, checksum]);

  // encode into base58 to get SIN
  return bs58.encode(pubWithChecksum);
};

/**
 * Will sign a string of data with a private key
 *
 * @param {String} data - A string of data to be signed
 * @param {String} privkey - A private key in hex
 * @returns {String} signature - A DER signature in hex
 */
BitAuth.sign = function(data, privkey) {
  let dataBuffer;
  if (!Buffer.isBuffer(data)) {
    dataBuffer = Buffer.from(data, 'utf8');
  } else {
    dataBuffer = data;
  }
  const hashBuffer = crypto.createHash('sha256').update(dataBuffer).digest();
  return BitAuth._sign(hashBuffer, privkey);
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
  let dataBuffer;
  if (!Buffer.isBuffer(data)) {
    dataBuffer = Buffer.from(data, 'utf8');
  } else {
    dataBuffer = data;
  }
  const hashBuffer = crypto.createHash('sha256').update(dataBuffer).digest();
  let signatureBuffer;
  if (!Buffer.isBuffer(hexsignature)) {
    signatureBuffer = Buffer.from(hexsignature, 'hex');
  } else {
    signatureBuffer = hexsignature;
  }
  const valid = BitAuth._verifySignature(hashBuffer, signatureBuffer, pubkey);

  if (callback) {
    return callback(null, valid);
  }
  return valid;
};

/**
 * Will verify that a SIN is valid
 *
 * @param {String} sin - A SIN identity
 * @param {function} callback
 * @returns {Function|Boolean} - If the SIN identity is valid
 */
BitAuth.validateSin = function(sin, callback) {

  let pubWithChecksum;

  // check for non-base58 characters
  try {
    pubWithChecksum = Buffer.from(bs58.decode(sin), 'hex').toString('hex');
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
  const checksum = pubWithChecksum.slice(
    pubWithChecksum.length - 8,
    pubWithChecksum.length
  );
  const pubPrefixed = pubWithChecksum.slice(0, pubWithChecksum.length - 8);

  // two rounds of hashing to generate the checksum
  const hash1 = crypto.createHash('sha256').update(Buffer.from(pubPrefixed, 'hex')).digest();
  const checksumTotal = crypto.createHash('sha256').update(hash1).digest('hex');

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
