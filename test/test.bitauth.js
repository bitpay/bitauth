'use strict';

if ( typeof(window) === 'undefined' ) {
  var bitauth = require('../index');
} else {
  var bitauth = window.bitauth;
}

var chai = chai || require('chai');

describe('bitauth', function() {

  var should = chai.should();

  // previously known keys for comparison
  var keysKnown = {
    priv: '97811b691dd7ebaeb67977d158e1da2c4d3eaa4ee4e2555150628acade6b344c',
    pub: '02326209e52f6f17e987ec27c56a1321acf3d68088b8fb634f232f12ccbc9a4575',
    sin: 'Tf3yr5tYvccKNVrE26BrPs6LWZRh8woHwjR'
  }

  // a private key that will produce a public key with a leading zero
  var privateKeyToZero = 'c6b7f6bfe5bb19b1e390e55ed4ba5df8af6068d0eb89379a33f9c19aacf6c08c';

  // keys generated
  var keys      = null;

  // invalid checksum
  var sinbad    = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';

  // valid sin
  var singood   = 'TfG4ScDgysrSpodWD4Re5UtXmcLbY5CiUHA';

  // data to sign
  var contract  = 'keyboard cat';
  var secret    = 'o hai, nsa. how i do teh cryptos?';
  var password  = 's4705hiru13z!';

  // signature from generate keys
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

    it('should properly get compressed public key from a previously known private key', function(done) {
      bitauth.getPublicKeyFromPrivateKey(keysKnown.priv).should.equal(keysKnown.pub);
      done();
    });

  });

  describe('#getSinFromPublicKey', function() {

    it('should properly get the sin', function(done) {
      bitauth.getSinFromPublicKey(keys.pub).should.equal(keys.sin);
      done();
    });

    it('should properly get the sin from a previously known compressed public key', function(done) {
      bitauth.getSinFromPublicKey(keysKnown.pub).should.equal(keysKnown.sin);
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
      bitauth.verifySignature(contract, keys.pub, signature, function(err, valid){
        should.not.exist(err);
        should.exist(valid);
        valid.should.equal(true);
        done();
      });
    });

    it('should verify the signature with leading zero public key', function(done) {

      var leadingZeroKeys = {
        priv: privateKeyToZero,
        pub: bitauth.getPublicKeyFromPrivateKey(privateKeyToZero)
      };

      signature = bitauth.sign(contract, leadingZeroKeys.priv);
      bitauth.verifySignature(contract, leadingZeroKeys.pub, signature, function(err, valid){
        should.not.exist(err);
        should.exist(valid);
        valid.should.equal(true);
      });

      done();

    });

  });

  describe('#validateSinTrue', function() {

    it('should validate the sin as true', function(done) {
      var valid = bitauth.validateSin(singood);
      should.equal(true, valid);
      done();
    });

  });

  describe('#validateSinFalse', function() {

    it('should validate the sin as false because of bad checksum', function(done) {
      var valid = bitauth.validateSin(sinbad);
      should.equal(false, valid);
      done();
    });

    it('should validate the sin as false because of non-base58', function(done) {
      var valid = bitauth.validateSin('not#base!58');
      should.equal(false, valid);
      done();
    });

  });

  describe('#validateSinCallback', function() {

    it('should receive error callback', function(done) {
      var valid = bitauth.validateSin(sinbad, function(err){
        should.exist(err);
        err.message.should.equal('Checksum does not match');
        done();
      });
    });

  });

  // node specific tests
  if ( typeof(window) === 'undefined' ) {

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

  }

});
