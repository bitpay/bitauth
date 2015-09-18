'use strict';

module.exports = function(config) {

  config.set({
    browsers: ['Firefox'],
    frameworks: ['mocha'],
    singleRun: true,
    files: [
      './tests.js'
    ],
    plugins: [
      'karma-mocha',
      'karma-firefox-launcher'
    ]
  });

};
