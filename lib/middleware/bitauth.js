var BitAuth = require('../bitauth');
var bitauth = new BitAuth();

var bitcore  = require('bitcore');
var Identity = bitcore.Identity;

module.exports = function(req, res, next) {
  if (req.headers && req.headers['x-identity'] && req.headers['x-signature']) {
    // Check signature is valid
    // First construct data to check signature on
    var fullUrl = req.protocol + '://' + req.get('host') + req.url;
    var data = fullUrl + req.rawBody;

    bitauth.verifySignature( data , req.headers['x-identity'], req.headers['x-signature'], function(err, result) {
      if(err || !result) {
        return res.send(400, {error: 'Invalid signature'});
      }

      // Get the Identity from the public key
      var identity = bitauth.getIdentityFromPublicKey(req.headers['x-identity']);
      if(!identity) return res.send(400, {error: 'Bad public key from identity'});
      req.identity = identity;
      next();
    });
  } else {
    next();
  }
};
