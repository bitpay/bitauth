'use strict';

var bitauth = require('../');
var chai = require('chai');

describe('bitauth', function() {

  var should = chai.should();

  // previously known keys for comparison
  var keysKnown = {
    priv: '97811b691dd7ebaeb67977d158e1da2c4d3eaa4ee4e2555150628acade6b344c',
    pub: '02326209e52f6f17e987ec27c56a1321acf3d68088b8fb634f232f12ccbc9a4575',
    sin: 'Tf3yr5tYvccKNVrE26BrPs6LWZRh8woHwjR'
  };

  // a private key that will produce a public key with a leading zero
  var privateKeyToZero = 'c6b7f6bfe5bb19b1e390e55ed4ba5df8af6068d0eb89379a33f9c19aacf6c08c';

  // keys generated
  var keys = null;

  // invalid checksum
  var sinbad = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';

  // valid sin
  var singood = 'TfG4ScDgysrSpodWD4Re5UtXmcLbY5CiUHA';

  // data to sign
  var contract = 'kéyboard cät';
  var secret = 'o hai, nsa. how i do teh cryptos?';
  var password = 's4705hiru13z!';
  var encryptedSecret = '291Dm9unZMwfxBA7BEHiQsraRxCrMRqwJ2TjCWwEH3Sp5QGMehNFNgZLo62sgF5Khe';

  // signature from generate keys
  var signature = null;
  var enc = null;

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
      bitauth.verifySignature(contract, keys.pub, signature, function(err, valid) {
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
      bitauth.verifySignature(contract, leadingZeroKeys.pub, signature, function(err, valid) {
        should.not.exist(err);
        should.exist(valid);
        valid.should.equal(true);
      });

      done();

    });

    describe('Reference Signature Tests', function () {
        var priv = "8295702b2273896ae085c3caebb02985cab02038251e10b6f67a14340edb51b0";
        var pub = bitauth.getPublicKeyFromPrivateKey(priv);
        var refPairs = [
            ["foo",
                "3044022045bc5aba353f97316b92996c01eba6e0b0cb63a763d26898a561c748a9545c7502204dc0374c8d4ca489c161b21ff5e25714f1046d759ec9adf9440233069d584567"],

            ["baz",
                "304502206ac2ffc240d23fd218a5aa9857065b8bb09ed6c154f1d7da2b56f993bd6e1e3e022100e8dba80dea09122ab87aae82f91e23876aa6628055e24afc895405482ac97aae"],

            ["What a piece of work is a man! how noble in reason! how infinite in faculty! in form and moving how express and admirable! in action how like an angel! in apprehension how like a god!",
                "304402204c818a10380ba42b3be0a293d47922469c4ae7ad6277e0e62bf32700c79c32210220102b673477ee13877b4b7f8f9a2e4c2004553948fbe5e7fd95d7e23b4cd9f8e3"],

            ["☕️   ⓝ  🀤  ⎈  ∲",
                "304502204d78e57e9bce7fc6d3dd61bcd1baaceff2689f9a8efac5bbb8ce59a47f6652120221008bdce60d43916e35db9c8ee889ba2f85acd2a98fa0193cce0a7f9f9d9867aac1"],

            ["इसकी दो प्रजातियाँ हैं सुपर्ब लायर बर्ड तथा अलबर्ट्स लायर बर्ड",
                "304602210087d7aad4dc2789b8f58f97f541f95fc150ffc7fad8e09093932c023b13330e1a022100b434f9403048a983f8dfbd9b92ad8e2dac1ec4b1934dec8c94f4165bf981e01c"],

            ["금조류(琴鳥類, lyrebird)는 오스트레일리아 남부에 사는 참새목의 한 부류로, 주변의 소리를 잘 따라한다. 거문고새라고도 한다.",
                "3044022030e9acbd8f0f3328bd059296092824a38216a222d04ac7e1f3de89d4270f3e18022014386f61154177111fe1da0eee9874e612990d3ce663e6f2b4c44828b4c7072f"],

            ["コトドリ属（コトドリぞく、学名 Menura）はコトドリ上科コトドリ科 Menuridae に属する鳥の属の一つ。コトドリ科は単型である。",
                "3046022100b286833ddce1537e12f56ae63fbbd6db25ac0dfab659d342a323b764765b60c0022100d83878b0529bf2cab70e98929faf11d1836d8452ef978aad558e35cce4fb14c4"],

            ["ဂျူးလိယက်ဆီဇာ(ဘီစီ၁၀၀-၄၄)",
                "304402206ba84011c961db733e28f40f2496e8ff1ba60fcbf942b609fd1a9a6971f22e5b02202987d7d6ad5c330c7fdacefe3351554c00f42b82b7ad513104de8caebae40fc8"],

            ["རོ་མའི་རང་དབང་འབངས་མི་ཞིག་ལ་མིང་གསུམ་ཡོད་དེ།",
             "304402200e4b0560c42e4de19ddc2541f5531f7614628e9d01503d730ebe38c182baee8702206b80868e3d67fec2a9d5a594edd6b4f0266044965fe41e7cc3bff65feb922b7c"]
        ];
        refPairs.forEach(function (pair) {
            var contract = pair[0];
            var signature = pair[1];
            it('should verify reference signature for: "' + contract + '"', function (done) {
                bitauth.verifySignature(contract, pub, signature, function (err, valid) {
                    should.not.exist(err);
                    should.exist(valid);
                    valid.should.equal(true);
                    done();
                });
            });
        });

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
      bitauth.validateSin(sinbad, function(err) {
        should.exist(err);
        err.message.should.equal('Checksum does not match');
        done();
      });
    });

  });

  // node specific tests
  if (typeof(window) === 'undefined') {

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
        dec.should.equal(secret);
        done();
      });

      it('should decrypt a previously known message', function(done) {
        var dec = bitauth.decrypt(password, encryptedSecret);
        should.exist(dec);
        dec.should.equal(secret);
        done();
      });

    });

    describe('#middleware', function() {

      it('should expose an express middleware', function(done) {
        bitauth.middleware({}, {}, function() {
          done();
        });
      });

    });

  }

});
