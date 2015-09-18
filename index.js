'use strict';

var bitauth;
if (process.browser) {
  bitauth = require('./lib/bitauth-browserify');
} else {
  bitauth = require('./lib/bitauth-node');

  // add node-specific encrypt/decrypt
  bitauth.encrypt = require('./lib/encrypt');
  bitauth.decrypt = require('./lib/decrypt');
  bitauth.middleware = require('./lib/middleware/bitauth');
}

module.exports = bitauth;
