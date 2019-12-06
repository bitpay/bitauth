'use strict';

const benchmark = require('benchmark');
const bitauth = require('../lib/bitauth-node');

const maxTime = 10;

const privkey = '9b3bdba1c7910017dae5d6cbfb2e86aafdccfbcbea518d1b984c45817b6c655b';
const privkeyBuffer = Buffer.from(privkey, 'hex');
const pubkey = '03ff368ca67364d1df4c0f131b6a454d4fa14c00538357f03235917feabc1a9cb6';
const pubkeyBuffer = Buffer.from(pubkey, 'hex');
const contract = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vestibulum nibh neque, ac fermentum nunc pharetra in. Aenean orci velit, facilisis a gravida eu, ullamcorper feugiat dui. Sed quis eros sed sem egestas sagittis non sit amet arcu. Nulla feugiat purus et sem tempus convallis. Ut a odio consequat, vulputate nisl a, venenatis lectus. Aenean mi diam, pulvinar sed vehicula pulvinar, commodo quis justo. Pellentesque quis elementum eros. Sed ligula tellus, interdum non interdum eget, ultricies in ipsum. Maecenas vitae lectus sit amet ante volutpat malesuada. Nulla condimentum iaculis sem sit amet rhoncus. Mauris at vestibulum felis, a porttitor elit. Pellentesque rhoncus faucibus condimentum. Praesent auctor auctor magna, nec consectetur mi suscipit eget. Nulla sit amet ligula enim. Ut odio augue, auctor ac quam vel, aliquet mattis nisi. Curabitur orci lectus, viverra at hendrerit at, feugiat at magna. Morbi rhoncus bibendum erat, quis dapibus felis eleifend vitae. Etiam vel sapien consequat, tempor libero non, lobortis purus. Maecenas finibus pretium augue a ullamcorper. Donec consectetur sed nunc sed convallis. Phasellus eu magna a nisl lobortis finibus. Quisque hendrerit at arcu tempus gravida. Donec fringilla pulvinar sapien at porta. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed dui metus, rhoncus at iaculis nec, porta at nunc. Donec in purus pellentesque, lacinia erat eget, congue massa. In a magna molestie tellus convallis dictum. Etiam id magna laoreet, suscipit leo non, egestas turpis. Sed dolor orci, pellentesque eget tempor ut, tincidunt at magna. Duis quis imperdiet sapien.';
const contractBuffer = Buffer.from(contract);
const signature = '3045022100db71942a5a6dd1443cbf7519b2bc16a041aff8d4830bd42599f03ce503b8bf700220281989345617548d2512391a4b04450761df9add920d83043f9e21cb5baeb703';
const signatureBuffer = Buffer.from(signature, 'hex');

// invalid checksum
const sinbad = 'Tf1Jc1xSbqasm5QLwwSQc5umddx2h7mAMhX';
const singood = bitauth.getSinFromPublicKey(pubkeyBuffer);

function nodebitauthVerify() {
  bitauth.verifySignature(contractBuffer, pubkeyBuffer, signatureBuffer);
}
function nodebitauthSign() {
  bitauth.sign(contractBuffer, privkeyBuffer);
}
function nodebitauthValidateSinBad() {
  bitauth.validateSin(sinbad);
}
function nodebitauthValidateSinGood() {
  bitauth.validateSin(singood);
}

const suite = new benchmark.Suite();
suite.add('bitauth#createSignature', nodebitauthSign, { maxTime: maxTime });
suite.add('bitauth#verifySignature', nodebitauthVerify, { maxTime: maxTime });
suite.add('bitauth#validateBadSin', nodebitauthValidateSinBad, { maxTime: maxTime });
suite.add('bitauth#validateGoodSin', nodebitauthValidateSinGood, { maxTime: maxTime });
suite
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .run();
