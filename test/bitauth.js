var should  = require('should');
var expect  = require('expect.js');
var BitAuth = require('../index');

describe('new BitAuth()', function() {

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
      keys = new BitAuth().generateIdentity();
      should.exist(keys);
      should.exist(keys._keypair.pubkey);
      should.exist(keys._keypair.privkey);
      should.exist(keys._identity);
      done();
    });

  });

  describe('#getPublicKeyFromPrivateKey', function() {

    it('should properly get the public key', function(done) {
      new BitAuth().getPublicKeyFromPrivateKey(keys._keypair.privkey).toString().should.equal(keys._keypair.pubkey.toString());
      done();
    });

  });

  describe('#sign', function() {

    it('should sign the string', function(done) {
      signature = new BitAuth().sign(contract, keys._keypair.privkey);
      should.exist(signature);
      done();
    });

  });

  describe('#verifySignature', function() {

    it('should verify the signature', function(done) {
      new BitAuth().verifySignature(contract, keys._keypair.pubkey, signature, done);
    });

  });

  describe('#validateIdentity', function() {

    var received;

    it('should validate the identity as true', function(done) {
      var valid = new BitAuth().validateIdentity(identity);
      should.equal(true, valid);
      done();
    });

    it('should validate the identity as false', function(done) {
      var valid = new BitAuth().validateIdentity(identityb);
      should.equal(false, valid);
      done();
    });

  });

  describe('#encrypt', function() {

    it('should encrypt the secret message', function(done) {
      enc = BitAuth.encrypt(password, secret);
      should.exist(enc);
      done();
    });

  });

  describe('#decrypt', function() {

    it('should decrypt the secret message', function(done) {
      var dec = BitAuth.decrypt(password, enc);
      should.exist(dec);
      done();
    });

  });

  describe('#middleware', function() {

    it('should expose an express middleware', function(done) {
      BitAuth.middleware( {} , {} , function() {
        done();
      });
    });

  });

});
