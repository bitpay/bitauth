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
  var signature = Message.sign( new Buffer( data ) , privkey );
  return signature;
};

BitAuth.prototype.getIdentityFromPublicKey = function( pubkey ) {
  var identity = new Identity( pubkey );
  return identity.toString();
};

BitAuth.prototype.getPublicKeyFromPrivateKey = function( privkey ) {
  var keypair = Keypair().fromString( JSON.stringify({ privkey : privkey }) );
  return keypair.pubkey.toString();
};

BitAuth.prototype.getPublicKeyFromIdentity = function( identity ) {
  var identity = Identity().fromString( identity );
  
  console.log('pubkeyfromident, ident:' , identity );

  return identity.toPubkey();
};

BitAuth.prototype.verifySignature = function(data, identity, signature, callback) {
  var self = this;
  
  console.log('verifySignature', identity , signature );
  
  var pubkey = self.getPublicKeyFromIdentity( identity );
  
  console.log('pubkey', pubkey );
  
  var messageBuffer = new Buffer( data );
  
  var signature = Message.sign( messageBuffer , identity._keypair );

  console.log('verifySig', identity);

  try {
    Message.verify( messageBuffer , signature , identity );
    callback();
  } catch (err) {
    callback(err, false);
  }
};

BitAuth.prototype.validateIdentity = function( identity , callback ) {
  var s = new Identity( identity );

  try {
    s.validate();
    callback();
  } catch(err) {
    callback(err);
  }
};

module.exports = BitAuth;
