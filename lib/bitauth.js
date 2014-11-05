var elliptic  = require('elliptic');
var ecdsa     = new elliptic.ec(elliptic.curves.secp256k1);
var hashjs    = require('hash.js');
var bs58      = require('bs58');
var BitAuth   = {};

/**
 * Will return a key pair and identity
 *
 * @returns {Object} An object with keys: created, priv, pub and sin
 */
BitAuth.generateSin = function() {

  var keys = ecdsa.genKeyPair();

  var privateKey = keys.getPrivate('hex');
  var publicKey = this.getPublicKeyFromPrivateKey(privateKey);
  var sin = this.getSinFromPublicKey(publicKey);

  var sinObj = {
    created: Math.round(Date.now() / 1000),
    priv: privateKey,
    pub: publicKey,
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

  var keys = ecdsa.keyPair(privkey, 'hex');

  // compressed public key
  var pubKey = keys.getPublic();
  var xbuf = new Buffer(pubKey.x.toString('hex', 64), 'hex');
  var ybuf = new Buffer(pubKey.y.toString('hex', 64), 'hex');
  var pub;

  if (ybuf[ybuf.length-1] % 2) { //odd
    pub = Buffer.concat([new Buffer([3]), xbuf]);
  } else { //even
    pub = Buffer.concat([new Buffer([2]), xbuf]);
  }

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

  // sha256 hash the pubkey
  var pubHash = (new hashjs.sha256()).update(pubkey, 'hex').digest('hex');

  // get the ripemd160 hash of the pubkey
  var pubRipe = (new hashjs.ripemd160()).update(pubHash, 'hex').digest('hex');

  // add the version
  var pubPrefixed = '0f02'+pubRipe;

  // two rounds of hashing to generate the checksum
  var hash1 = (new hashjs.sha256()).update(pubPrefixed, 'hex').digest('hex');
  var checksumTotal = (new hashjs.sha256()).update(hash1, 'hex').digest('hex');

  // slice the hash to arrive at the checksum
  var checksum = checksumTotal.slice(0,8);

  // add the checksum to the ripemd160 pubkey
  var pubWithChecksum = pubPrefixed + checksum;

  // encode into base58
  var sin = bs58.encode(new Buffer(pubWithChecksum, 'hex'));

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
  var hash = (new hashjs.sha256()).update(data).digest('hex');
  var signature = ecdsa.sign(hash, privkey);
  var hexsignature = signature.toDER('hex');
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
  var hash = (new hashjs.sha256()).update(data).digest('hex');
  var signature = new Buffer(hexsignature, 'hex');
  var valid = ecdsa.verify(hash, signature, pubkey);
  if (callback)
    return callback(null, valid);
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
  } catch(err) {
    if (callback)
      return callback(err);
    return false;
  }

  // check the version
  if (pubWithChecksum.slice(0, 4) !== '0f02') {
    if (callback)
      return callback(new Error('Invalid prefix or SIN version'));
    return false;
  }

  // get the checksum
  var checksum = pubWithChecksum.slice(pubWithChecksum.length-8,
                                       pubWithChecksum.length);
  var pubPrefixed = pubWithChecksum.slice(0, pubWithChecksum.length-8);

  // two rounds of hashing to generate the checksum
  var hash1 = (new hashjs.sha256()).update(pubPrefixed, 'hex').digest('hex');
  var checksumTotal = (new hashjs.sha256()).update(hash1, 'hex').digest('hex');

  // check the checksum
  if (checksumTotal.slice(0,8) === checksum) {
    if (callback)
      return callback(null);
    return true;
  } else {
    if (callback)
      return callback(new Error('Checksum does not match'));
    return false;
  }

};

module.exports = BitAuth;
