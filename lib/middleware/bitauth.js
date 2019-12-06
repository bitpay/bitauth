const bitauth = require('../bitauth-node');

module.exports = function(req, res, next) {
  if (req.headers && req.headers['x-identity'] && req.headers['x-signature']) {
    // Check signature is valid
    // First construct data to check signature on
    const fullUrl = req.protocol + '://' + req.get('host') + req.url;
    const data = fullUrl + req.rawBody;

    bitauth.verifySignature(data, req.headers['x-identity'], req.headers['x-signature'], function(err, result) {
      if (err || !result) {
        return res.send(400, {
          error: 'Invalid signature'
        });
      }

      // Get the SIN from the public key
      const sin = bitauth.getSinFromPublicKey(req.headers['x-identity']);
      if (!sin) {
        return res.send(400, {
          error: 'Bad public key from identity'
        });
      }
      req.sin = sin;
      next();
    });
  } else {
    next();
  }
};
