'use strict';

if ( typeof(window) === 'undefined' ) {
  var bitauth = require('../index');
} else {
  var bitauth = window.bitauth;
}

var chai = chai || require('chai');

describe('bitauth', function() {

  var should = chai.should();

  var keys      = null;
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
