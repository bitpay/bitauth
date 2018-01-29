'use strict';

module.exports = function(config) {

  config.set({
    browsers: ['PhantomJS'],
    frameworks: ['mocha'],
    singleRun: true,
    files: [
      './tests.js'
    ],
    plugins: [
      'karma-mocha',
      'karma-phantomjs-launcher'
    ]
  });

};
