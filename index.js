// get base functionality
var bitauth = require('./lib/bitauth');

// add node-specific encrypt/decrypt
bitauth.encrypt = require('./lib/encrypt');
bitauth.decrypt = require('./lib/decrypt');
bitauth.middleware = require('./lib/middleware/bitauth');

module.exports = bitauth;
