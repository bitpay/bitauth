module.exports = function(config) {
  config.set({
    basePath: './',
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/*.js'
    ],
    exclude: [
    ],
    preprocessors: {
      'test/*.js': [ 'browserify' ]
    },
    browserify: {
      debug: true
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['Chrome'],
    singleRun: true
  })
}
