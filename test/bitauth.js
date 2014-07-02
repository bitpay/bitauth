var should  = require('should');
var bitauth = require('../index');

describe('bitauth', function() {

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

  describe('#genHSin', function() {
    
    it('should generate a hierarchical sin object', function() {
      var hsin = bitauth.genHSin();
      should.exist(hsin.hsinpriv);
      hsin.hsinpriv.length.should.equal(111);
      should.exist(hsin.SIN);
    });

  });

  describe('#hSin', function() {

    it('should generate m/1/3', function() {
      var hsin = bitauth.genHSin();
      hsin = bitauth.hSin(hsin.hsinpriv, 'm/1/3');
      should.exist(hsin.hsinpriv);
      hsin.hsinpriv.length.should.equal(111);
      should.exist(hsin.SIN);
    });

    it('should generate m/0/4', function() {
      var hsin = bitauth.genHSin();
      hsin = bitauth.hSin(hsin.hsinpriv, 'm/0/4');
      should.exist(hsin.hsinpriv);
      hsin.hsinpriv.length.should.equal(111);
      should.exist(hsin.SIN);
    });

    it('should generate m/9/3/3/2/4000', function() {
      var hsin = bitauth.genHSin();
      hsin = bitauth.hSin(hsin.hsinpriv, 'm/9/3/3/2/4000');
      should.exist(hsin.hsinpriv);
      hsin.hsinpriv.length.should.equal(111);
      should.exist(hsin.SIN);
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
