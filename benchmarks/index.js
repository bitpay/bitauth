'use strict';

var assert = require('assert');
var benchmark = require('benchmark');
var bitauth = require('../lib/bitauth-node');
var async = require('async');

var maxTime = 10;

async.series([
  function(next) {

    var privkey = '9b3bdba1c7910017dae5d6cbfb2e86aafdccfbcbea518d1b984c45817b6c655b';
    var privkeyBuffer = new Buffer(privkey, 'hex');
    var pubkey = '03ff368ca67364d1df4c0f131b6a454d4fa14c00538357f03235917feabc1a9cb6';
    var pubkeyBuffer = new Buffer(pubkey, 'hex');
    var contract = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vestibulum nibh neque, ac fermentum nunc pharetra in. Aenean orci velit, facilisis a gravida eu, ullamcorper feugiat dui. Sed quis eros sed sem egestas sagittis non sit amet arcu. Nulla feugiat purus et sem tempus convallis. Ut a odio consequat, vulputate nisl a, venenatis lectus. Aenean mi diam, pulvinar sed vehicula pulvinar, commodo quis justo. Pellentesque quis elementum eros. Sed ligula tellus, interdum non interdum eget, ultricies in ipsum. Maecenas vitae lectus sit amet ante volutpat malesuada. Nulla condimentum iaculis sem sit amet rhoncus. Mauris at vestibulum felis, a porttitor elit. Pellentesque rhoncus faucibus condimentum. Praesent auctor auctor magna, nec consectetur mi suscipit eget. Nulla sit amet ligula enim. Ut odio augue, auctor ac quam vel, aliquet mattis nisi. Curabitur orci lectus, viverra at hendrerit at, feugiat at magna. Morbi rhoncus bibendum erat, quis dapibus felis eleifend vitae. Etiam vel sapien consequat, tempor libero non, lobortis purus. Maecenas finibus pretium augue a ullamcorper. Donec consectetur sed nunc sed convallis. Phasellus eu magna a nisl lobortis finibus. Quisque hendrerit at arcu tempus gravida. Donec fringilla pulvinar sapien at porta. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed dui metus, rhoncus at iaculis nec, porta at nunc. Donec in purus pellentesque, lacinia erat eget, congue massa. In a magna molestie tellus convallis dictum. Etiam id magna laoreet, suscipit leo non, egestas turpis. Sed dolor orci, pellentesque eget tempor ut, tincidunt at magna. Duis quis imperdiet sapien.';
    var contractBuffer = new Buffer(contract);
    var signature = '3045022100db71942a5a6dd1443cbf7519b2bc16a041aff8d4830bd42599f03ce503b8bf700220281989345617548d2512391a4b04450761df9add920d83043f9e21cb5baeb703';
    var signatureBuffer = new Buffer(signature, 'hex');

    function nodebitauthVerify() {
      bitauth.verifySignature(contractBuffer, pubkeyBuffer, signatureBuffer);
    }

    // #verifySignature
    var suite = new benchmark.Suite();
    suite.add('bitauth#verifySignature', nodebitauthVerify, { maxTime: maxTime });
    suite
      .on('cycle', function(event) {
        console.log(String(event.target));
      })
      .on('complete', function() {
        console.log('---------------------------------------');
        next();
      })
      .run();
  },
  function(next) {

    // invalid checksum
    var sinbad = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';

    function nodebitauthValidateSin() {
      bitauth.validateSin(sinbad);
    }

    // #validateSin
    var suite = new benchmark.Suite();
    suite.add('bitauth#validateSin', nodebitauthValidateSin, { maxTime: maxTime });
    suite
      .on('cycle', function(event) {
        console.log(String(event.target));
      })
      .on('complete', function() {
        console.log('---------------------------------------');
        next();
      })
      .run();
  }
], function(err) {
  console.log('Finished');
});
