var base58 = require('base58-native');
var crypto = require('crypto');
var bitcore = require('bitcore');
var Key = bitcore.Key;
var SIN = bitcore.SIN;
var SINKey = bitcore.SINKey
var coinUtil = bitcore.util;

var BitAuth = function() {};

BitAuth.generateSin = function() {
  var sk = new SINKey();
  sk.generate();
  var obj = sk.storeObj();

  return obj;
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
  var pubkeyHash = coinUtil.sha256ripe160(new Buffer(pubkey, 'hex'));
  var sin = new SIN(SIN.SIN_EPHEM, pubkeyHash);
  return sin.toString(); 
}

BitAuth.sign = function(data, privkey) {
  var hash = coinUtil.sha256(data);

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
  var hash = coinUtil.sha256(data);

  try {
    var key = new Key();
    key.public = new Buffer(pubkey, 'hex');
    key.verifySignature(hash, new Buffer(signature, 'hex'), callback);
  } catch (err) {
    callback(err, false);
  }
};

BitAuth.encrypt = function(password, str) {
  var aes256 = crypto.createCipher('aes-256-cbc', password);
  var a = aes256.update(str, 'utf8');
  var b = aes256.final();
  var buf = new Buffer(a.length + b.length);
  a.copy(buf, 0);
  b.copy(buf, a.length);
  return base58.encode(buf);
};

BitAuth.decrypt = function(password, str) {
  var aes256 = crypto.createDecipher('aes-256-cbc', password);
  var a = aes256.update(base58.decode(str));
  var b = aes256.final();
  var buf = new Buffer(a.length + b.length);
  a.copy(buf, 0);
  b.copy(buf, a.length);
  return buf.toString('utf8');
};

module.exports = BitAuth;
