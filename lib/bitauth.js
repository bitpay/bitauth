var crypto   = require('crypto');
var bitcore  = require('bitcore');
var Key      = bitcore.Key;
var SIN      = bitcore.SIN;
var SINKey   = bitcore.SINKey
var util     = bitcore.util;
var HKey     = bitcore.HierarchicalKey;

var BitAuth  = {};

BitAuth.generateSin = function() {
  var sk = new SINKey();
  sk.generate();
  return sk.storeObj();
};

BitAuth.genHSin = function() {
  var hkey = new bitcore.HierarchicalKey();
  var hsin = {
    hsinpriv: hkey.extendedPrivateKeyString(),
    SIN: BitAuth.getSinFromPublicKey(hkey.eckey.public.toString('hex'))
  };
  return hsin;
};

BitAuth.hSin = function(hsinpriv, path) {
  var hkey = new bitcore.HierarchicalKey(hsinpriv);
  var hkey2 = hkey.derive(path);
  var hsin = {
    hsinpriv: hkey2.extendedPrivateKeyString(),
    SIN: BitAuth.getSinFromPublicKey(hkey.eckey.public.toString('hex'))
  };
  return hsin
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

module.exports = BitAuth;
