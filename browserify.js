const fs = require('fs');
const browserify = require('browserify');
const minifyStream = require('minify-stream');

// This currently generates the dist files but there are no tests done

browserify('index.js')
  .bundle()
  .pipe(fs.createWriteStream('./dist/bitauth.js'));

fs.createReadStream('./dist/bitauth.js')
  .pipe(minifyStream({ sourceMap: false }))
  .pipe(fs.createWriteStream('./dist/bitauth.min.js'));

