var crypto   = require('crypto');
var bitcore  = require('bitcore');
var Key      = bitcore.Key;
var SIN      = bitcore.SIN;
var SINKey   = bitcore.SINKey
var util     = bitcore.util;

var BitAuth  = {};

BitAuth.generateSin = function() {
  var sk = new SINKey();
  sk.generate();
  return sk.storeObj();
};

BitAuth.getPublicKeyFromPrivateKey = function(privkey) {
  try {
    var key = new Key();

    key.private = new Buffer(privkey, 'hex');
    key.regenerateSync();

    return key.public.toString('hex');
  } catch (err) {
    console.log(err);
    return null;
  }
};

BitAuth.getSinFromPublicKey = function(pubkey) {
  var pubkeyHash = util.sha256ripe160(new Buffer(pubkey, 'hex'));
  var sin = new SIN(SIN.SIN_EPHEM, pubkeyHash);
  return sin.toString();
}

BitAuth.sign = function(data, privkey) {
  var hash = util.sha256(data);

  try {
    var key = new Key();
    key.private = new Buffer(privkey, 'hex');
    return key.signSync(hash).toString('hex');
  } catch (err) {
    console.log(err.stack);
    console.log(err);
    return null;
  }
};

BitAuth.verifySignature = function(data, pubkey, signature, callback) {
  var hash = util.sha256(data);

  try {
    var key = new Key();
    key.public = new Buffer(pubkey, 'hex');
    key.verifySignature(hash, new Buffer(signature, 'hex'), callback);
  } catch (err) {
    callback(err, false);
  }
};

BitAuth.validateSin = function(sin, callback) {
  var s = new SIN(sin);

  try {
    s.validate()
  } catch(err) {
    if ( callback )
      callback(err);
    return false;
  }
  if ( callback )
    callback(null);
  return true;
};

module.exports = BitAuth;
