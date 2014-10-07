'use strict';

// get base functionality
var BitAuth = require('./lib/bitauth');
var bitauth = new BitAuth();

// add node-specific encrypt/decrypt
bitauth.encrypt    = require('./lib/encrypt');
bitauth.decrypt    = require('./lib/decrypt');
bitauth.middleware = require('./lib/middleware/bitauth');

module.exports = bitauth;
