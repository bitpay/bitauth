var util = require('util');

var bitcore  = require('bitcore');
var Keypair  = bitcore.Keypair;
var Privkey  = bitcore.Privkey;
var Identity = bitcore.Identity;
var Message  = bitcore.Message;
var Hash     = bitcore.Hash;

var BitAuth  = function() {
  this._identity = null;
  this._keypair = null;
};

BitAuth.prototype.generateIdentity = function( keypair ) {
  var self = this;

  if (!keypair) var keypair = new Keypair().fromRandom();

  self._keypair  = keypair;
  self._identity = new Identity().fromPubkey( self._keypair.pubkey );

  return self;
};

BitAuth.prototype.sign = function(data, privkey) {
  var self = this;
  var keypair = new Keypair().fromPrivkey( privkey );
  var signature = Message.sign( new Buffer( data ) , keypair );
  return signature;
};

BitAuth.prototype.getIdentityFromPublicKey = function( pubkey ) {
  var identity = new Identity( pubkey );
  return identity;
};

BitAuth.prototype.getPublicKeyFromPrivateKey = function( privkey ) {
  var keypair = new Keypair();
  return keypair.fromPrivkey( privkey ).pubkey;
};


BitAuth.prototype.verifySignature = function(data, pubkey, signature, callback) {
  var self = this;
  var messageBuffer = new Buffer( data );
  var keypair = new Keypair();

  keypair.fromString( JSON.stringify({ pubkey: pubkey }) )

  var identity = new Identity().fromPubkey( keypair.pubkey );

  try {
    Message.verify( messageBuffer , signature , identity );
    callback();
  } catch (err) {
    callback(err, false);
  }
};

BitAuth.prototype.validateIdentity = function( identity ) {
  try {
    new Identity( identity ).validate();
    return true;
  } catch(err) {
    return false;
  }
};

module.exports = BitAuth;
