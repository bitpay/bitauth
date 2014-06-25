// get base functionality
var bitauth = require('./lib/bitauth');

// add node-specific encrypt/decrypt
bitauth.encrypt = require('./lib/encrypt');
bitauth.decrypt = require('./lib/decrypt');


module.exports = bitauth;
