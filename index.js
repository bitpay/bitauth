'use strict';

// get base functionality
var BitAuth = require('./lib/bitauth');

// add node-specific encrypt/decrypt
BitAuth.encrypt    = require('./lib/encrypt');
BitAuth.decrypt    = require('./lib/decrypt');
BitAuth.middleware = require('./lib/middleware/bitauth');

module.exports = BitAuth;
