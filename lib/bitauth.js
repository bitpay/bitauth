'use strict';

var crypto = require('crypto');
var secp256k1 = require('secp256k1');
var bs58check = require('bs58check');

/**
 * @param {Buffer} data
 * @return {Buffer}
 */
function sha256 (data) {
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * @param {Buffer} data
 * @return {Buffer}
 */
function rmd160 (data) {
  return crypto.createHash('rmd160').update(data).digest();
}

var BitAuth = module.exports = {};
BitAuth.SIN_PREFIX = 0x0f;
BitAuth.SIN_TYPE = 0x02;
BitAuth.PREFIX = new Buffer('0f02', 'hex');

/**
 * @typedef {Object} BitAuth~generateSinResult
 * @property {Number} created
 * @property {String} priv
 * @property {String} pub
 * @property {String} sin
 */

/**
 * Will return a key pair and identity
 *
 * @returns {BitAuth~generateSinResult}
 */
BitAuth.generateSin = function () {
  var privateKey;
  do {
    privateKey = crypto.randomBytes(32); // may throw error if entropy sources drained
  } while (!secp256k1.privateKeyVerify(privateKey));

  var publicKey = secp256k1.publicKeyCreate(privateKey, true);
  var sin = BitAuth.getSinFromPublicKey(publicKey);

  return {
    created: Math.round(Date.now() / 1000),
    priv: privateKey.toString('hex'),
    pub: publicKey.toString('hex'),
    sin: sin
  };
};

/**
 * Will return a public key from a private key
 *
 * @param {(Buffer|String)} privateKey A private key in hex or as Buffer
 * @returns {String} A compressed public key in hex
 */
BitAuth.getPublicKeyFromPrivateKey = function (privateKey) {
  if (!Buffer.isBuffer(privateKey)) {
    privateKey = new Buffer(privateKey, 'hex');
  }

  return secp256k1.publicKeyCreate(privateKey, true).toString('hex');
};

/**
 * Will return a SIN from a compressed public key
 *
 * @param {(Buffer|String)} publicKey A public key in hex
 * @returns {String} A SIN identity
 */
BitAuth.getSinFromPublicKey = function (publicKey) {
  if (!Buffer.isBuffer(publicKey)) {
    publicKey = new Buffer(publicKey, 'hex');
  }

  // apply sha256 and ripemd160 to the public key
  var pubRipe = rmd160(sha256(publicKey));

  // add the version
  var pubPrefixed = Buffer.concat([new Buffer([BitAuth.SIN_PREFIX, BitAuth.SIN_TYPE]), pubRipe]);

  // encode in base-58 with checksum
  return bs58check.encode(pubPrefixed);
};

/**
 * Will sign a string of data with a private key
 *
 * @param {(Buffer|String)} data - A string of data to be signed
 * @param {(Buffer|String)} privateKey - A private key in hex
 * @returns {String} A DER signature in hex
 */
BitAuth.sign = function (data, privateKey) {
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data, 'utf8');
  }

  if (!Buffer.isBuffer(privateKey)) {
    privateKey = new Buffer(privateKey, 'hex');
  }

  var sigObj = secp256k1.sign(sha256(data), privateKey);
  return secp256k1.signatureExport(sigObj.signature).toString('hex');
};

/**
 * Will verify a signature
 *
 * @param {(Buffer|String)} data - A string of data that has been signed
 * @param {(Buffer|String)} publicKey - The compressed public key in hex that has signed the data
 * @param {(Buffer|String)} signature - A DER signature in hex
 * @returns {Function|Boolean} If the signature is valid
 */
BitAuth.verifySignature = function (data, publicKey, signature, callback) {
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(data, 'utf8');
  }

  if (!Buffer.isBuffer(publicKey)) {
    publicKey = new Buffer(publicKey, 'hex');
  }

  if (!Buffer.isBuffer(signature)) {
    signature = new Buffer(signature, 'hex');
  }

  var _err = null;
  var isValid;
  try {
    signature = secp256k1.signatureImport(signature);
    isValid = secp256k1.verify(sha256(data), signature, publicKey);
  } catch (err) {
    _err = err;
  }

  if (callback) {
    return callback(_err, isValid);
  }

  return _err === null && isValid;
};

/**
 * Will verify that a SIN is valid
 *
 * @param {String} sin - A SIN identity
 * @returns {Function|Boolean} - If the SIN identity is valid
 */
BitAuth.validateSin = function (sin, callback) {
  try {
    var pubPrefixed = bs58check.decode(sin);
  } catch (err) {
    if (callback) {
      return callback(err);
    }

    return false;
  }

  var err = null;
  if (pubPrefixed[0] !== BitAuth.SIN_PREFIX) {
    err = new Error('Invalid SIN prefix');
  } else if (pubPrefixed[1] !== BitAuth.SIN_TYPE) {
    err = new Error('Invalid SIN type');
  }

  if (callback) {
    return callback(err);
  }

  return err === null;
};
