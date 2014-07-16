var should  = require('should');
var expect  = require('expect.js');
var bitauth = require('../index');

describe('bitauth', function() {

  var keys      = null;
  var sin       = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMHX';
  var sinb      = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';
  var contract  = 'keyboard cat';
  var secret    = 'o hai, nsa. how i do teh cryptos?';
  var password  = 's4705hiru13z!';
  var signature = null;
  var enc       = null;

  describe('#generateSin', function() {

    it('should generate a sin object', function(done) {
      keys = bitauth.generateSin();
      should.exist(keys);
      should.exist(keys.pub);
      should.exist(keys.priv);
      should.exist(keys.sin);
      done();
    });

  });

  describe('#getPublicKeyFromPrivateKey', function() {

    it('should properly get the public key', function(done) {
      bitauth.getPublicKeyFromPrivateKey(keys.priv).should.equal(keys.pub);
      done();
    });

  });

  describe('#getSinFromPublicKey', function() {

    it('should properly get the sin', function(done) {
      bitauth.getSinFromPublicKey(keys.pub).should.equal(keys.sin);
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

  describe('#validateSinTrue', function() {

    it('should validate the sin as true', function(done) {
      var valid = bitauth.validateSin(sin);
      should.equal(true, valid);
      done();
    });

  });

  describe('#validateSinFalse', function() {

    it('should validate the sin as false', function(done) {
      var valid = bitauth.validateSin(sinb);
      should.equal(false, valid);
      done();
    });

  });

  describe('#validateSinCallback', function() {

    var received;

    var valid = bitauth.validateSin(sinb, function(err){
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
