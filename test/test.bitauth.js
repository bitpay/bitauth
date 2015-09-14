'use strict';

if (typeof(window) === 'undefined') {
    var bitauth = require('../index');
} else {
    var bitauth = window.bitauth;
}

var chai = chai || require('chai');

describe('bitauth', function () {

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
    var keys = null;

    // invalid checksum
    var sinbad = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';

    // valid sin
    var singood = 'TfG4ScDgysrSpodWD4Re5UtXmcLbY5CiUHA';

    // data to sign
    var contract = 'keyboard cat';
    var secret = 'o hai, nsa. how i do teh cryptos?';
    var password = 's4705hiru13z!';
    var encryptedSecret = '291Dm9unZMwfxBA7BEHiQsraRxCrMRqwJ2TjCWwEH3Sp5QGMehNFNgZLo62sgF5Khe';

    // signature from generate keys
    var signature = null;
    var enc = null;

    describe('#generateSin', function () {

        it('should generate a sin object', function (done) {
            keys = bitauth.generateSin();
            should.exist(keys);
            should.exist(keys.pub);
            should.exist(keys.priv);
            should.exist(keys.sin);
            done();
        });

    });

    describe('#getPublicKeyFromPrivateKey', function () {

        it('should properly get the public key', function (done) {
            bitauth.getPublicKeyFromPrivateKey(keys.priv).should.equal(keys.pub);
            done();
        });

        it('should properly get compressed public key from a previously known private key', function (done) {
            bitauth.getPublicKeyFromPrivateKey(keysKnown.priv).should.equal(keysKnown.pub);
            done();
        });

    });

    describe('#getSinFromPublicKey', function () {

        it('should properly get the sin', function (done) {
            bitauth.getSinFromPublicKey(keys.pub).should.equal(keys.sin);
            done();
        });

        it('should properly get the sin from a previously known compressed public key', function (done) {
            bitauth.getSinFromPublicKey(keysKnown.pub).should.equal(keysKnown.sin);
            done();
        });

    });

    describe('#sign', function () {

        it('should sign the string', function (done) {
            signature = bitauth.sign(contract, keys.priv);
            should.exist(signature);
            done();
        });

    });

    describe('#verifySignature', function () {

        it('should verify the signature', function (done) {
            bitauth.verifySignature(contract, keys.pub, signature, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal(true);
                done();
            });
        });

        it('should verify the signature with leading zero public key', function (done) {

            var leadingZeroKeys = {
                priv: privateKeyToZero,
                pub: bitauth.getPublicKeyFromPrivateKey(privateKeyToZero)
            };

            signature = bitauth.sign(contract, leadingZeroKeys.priv);
            bitauth.verifySignature(contract, leadingZeroKeys.pub, signature, function (err, valid) {
                should.not.exist(err);
                should.exist(valid);
                valid.should.equal(true);
            });

            done();

        });

        var priv = "8295702b2273896ae085c3caebb02985cab02038251e10b6f67a14340edb51b0";
        var pub = bitauth.getPublicKeyFromPrivateKey(priv);
        var refPairs = [
            ["foo",
                "30450220451cce92b56350ea747ad5fcf848a9cbed97277825d8be13c0fcf8eaf4e015fa0221008ff5310557e301630c59373d84664d1dd4eaaddefb7a896c60f25365dfb28f82"],

            ["baz",
                "304402202d6c14c8e0d9049aa9b0643c27c5b58c2aa75c318614d8344967a884e6a6370302201dd74af254a8eecaf5cb1dc9a16757b5fc4e0b1b6851f10035909fc0419c7779"],

            ["What a piece of work is a man! how noble in reason! how infinite in faculty! in form and moving how express and admirable! in action how like an angel! in apprehension how like a god!",
                "3045022100a98d807592e2c77f3f4e16f45f540e9f83093db08ab0a61c35ad08f0a016ecea022067631d3ea1c646553bb4242835f7d54efcc0e7e84c1e61ab0f01be8b1104bbb4"],

            ["☕️   ⓝ  🀤  ⎈  ∲",
                "3045022100cfd45a68c1ed6b3f24514b024ba10906355305be8b3acba33ed92e420f8c307d022051cdea572b7869c2dfafd0fbfe7823c99a3c67621b6adeb856abe24d1575e199"],

            ["इसकी दो प्रजातियाँ हैं सुपर्ब लायर बर्ड तथा अलबर्ट्स लायर बर्ड",
                "3045022079151babc06074279e3c322259e85c166409b5dbad04343573d596aa9da0c1d7022100b132eb81e92362772e6507d8cba7bd710c8764f9c6bf8b6852143c6bf77d0b45"],

            ["금조류(琴鳥類, lyrebird)는 오스트레일리아 남부에 사는 참새목의 한 부류로, 주변의 소리를 잘 따라한다. 거문고새라고도 한다.",
                "304502202ce7e7ae440bde0bed0c647bdbcce501320109413b3d77dbcc117282264797640221008d0570f65598b234506a83f9958b80535f6cd87a664c2c7f6942ea90e736ffcc"],

            ["コトドリ属（コトドリぞく、学名 Menura）はコトドリ上科コトドリ科 Menuridae に属する鳥の属の一つ。コトドリ科は単型である。",
                "304502203b287b4e720016aff0144a35b2c5d8738da939238b7481348a2744a8478740370221009e3349f5a99c84359f1cee315a8fb520c317b5ed139c302b82de52c8b358c778"]
        ];
        refPairs.map(function (pair) {
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

    describe('#validateSinTrue', function () {

        it('should validate the sin as true', function (done) {
            var valid = bitauth.validateSin(singood);
            should.equal(true, valid);
            done();
        });

    });

    describe('#validateSinFalse', function () {

        it('should validate the sin as false because of bad checksum', function (done) {
            var valid = bitauth.validateSin(sinbad);
            should.equal(false, valid);
            done();
        });

        it('should validate the sin as false because of non-base58', function (done) {
            var valid = bitauth.validateSin('not#base!58');
            should.equal(false, valid);
            done();
        });

    });

    describe('#validateSinCallback', function () {

        it('should receive error callback', function (done) {
            var valid = bitauth.validateSin(sinbad, function (err) {
                should.exist(err);
                err.message.should.equal('Checksum does not match');
                done();
            });
        });

    });

    // node specific tests
    if (typeof(window) === 'undefined') {

        describe('#encrypt', function () {

            it('should encrypt the secret message', function (done) {
                enc = bitauth.encrypt(password, secret);
                should.exist(enc);
                done();
            });
        });

        describe('#decrypt', function () {

            it('should decrypt the secret message', function (done) {
                var dec = bitauth.decrypt(password, enc);
                should.exist(dec);
                dec.should.equal(secret);
                done();
            });

            it('should decrypt a previously known message', function (done) {
                var dec = bitauth.decrypt(password, encryptedSecret);
                should.exist(dec);
                dec.should.equal(secret);
                done();
            });

        });

        describe('#middleware', function () {

            it('should expose an express middleware', function (done) {
                bitauth.middleware({}, {}, function () {
                    done();
                });
            });

        });

    }

});
