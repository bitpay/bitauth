var should  = require('should');
var expect  = require('expect.js');
var bitauth = require('../index');

describe('bitauth', function() {

  var keys      = null;
  var identity  = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMHX';
  var identityb = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';
  var contract  = 'keyboard cat';
  var secret    = 'o hai, nsa. how i do teh cryptos?';
  var password  = 's4705hiru13z!';
  var signature = null;
  var enc       = null;

  describe('#generateIdentity', function() {

    it('should generate a identity object', function(done) {
      keys = bitauth.generateIdentity()._keypair;
      should.exist(keys);
      should.exist(keys._keypair.pubkey);
      should.exist(keys._keypair.privkey);
      should.exist(keys._identity);
      done();
    });

  });

  describe('#getPublicKeyFromPrivateKey', function() {

    it('should properly get the public key', function(done) {
      bitauth.getPublicKeyFromPrivateKey(keys.priv).should.equal(keys.pub);
      done();
    });

  });

  describe('#getIdentityFromPublicKey', function() {

    it('should properly get the identity', function(done) {
      bitauth.getIdentityFromPublicKey(keys.pub).should.equal(keys.identity);
      done();
    });

  });

  describe('#sign', function() {

    it('should sign the string', function(done) {
      signature = bitauth.sign(contract, keys.priv);
      should.exist(signature);
      done();
    });

  });

  describe('#verifySignature', function() {

    it('should verify the signature', function(done) {
      bitauth.verifySignature(contract, keys.pub, signature, done);
    });

  });

  describe('#validateIdentityTrue', function() {

    it('should validate the identity as true', function(done) {
      var valid = bitauth.validateIdentity(identity);
      should.equal(true, valid);
      done();
    });

  });

  describe('#validateIdentityFalse', function() {

    it('should validate the identity as false', function(done) {
      var valid = bitauth.validateIdentity(identityb);
      should.equal(false, valid);
      done();
    });

  });

  describe('#validateIdentityCallback', function() {

    var received;

    var valid = bitauth.validateIdentity(identityb, function(err){
      if ( err && typeof(err) == 'object' ) {
        received = true;
      }
    });

    it('should receive error callback', function() {
      expect(received).to.eql(true);
    });

  });

  describe('#encrypt', function() {

    it('should encrypt the secret message', function(done) {
      enc = bitauth.encrypt(password, secret);
      should.exist(enc);
      done();
    });

  });

  describe('#decrypt', function() {

    it('should decrypt the secret message', function(done) {
      var dec = bitauth.decrypt(password, enc);
      should.exist(dec);
      done();
    });

  });

  describe('#middleware', function() {

    it('should expose an express middleware', function(done) {
      bitauth.middleware( {} , {} , function() {
        done();
      });
    });

  });

});
