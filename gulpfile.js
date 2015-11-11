'use strict';

// Run these commands to make a release:
//
// gulp release:checkout-releases
// gulp release:install
// gulp test
// gulp release:bump:<major|minor|patch>
// gulp browser
// gulp release:build-commit
// gulp release:push-tag
// npm publish
// gulp release:checkout-master
// gulp release:bump:<major|minor|patch>
// gulp release:version-commit
// gulp release:push

var path = require('path');
var gulp = require('gulp');
var shell = require('gulp-shell');
var mocha = require('gulp-mocha');
var runsequence = require('run-sequence');
runsequence.use(gulp);
var bump = require('gulp-bump');
var git = require('gulp-git');

var binPath = path.resolve(__dirname, './node_modules/.bin/');
var browserifyPath = path.resolve(binPath, './browserify');
var derequirePath = path.resolve(binPath, './derequire');
var uglifyPath = path.resolve(binPath, './uglifyjs');
var indexPath = path.resolve(__dirname, './lib/bitauth-browserify');
var namePath = path.resolve(__dirname, './bitauth');
var bundlePath = namePath + '.js';
var minPath = namePath + '.min.js';
var standaloneBundlePath = namePath + '.standalone.js';
var standaloneMinPath = namePath + '.standalone.min.js';
var externsPath = namePath + '.ext.js';

var browserifyCommand = browserifyPath + ' -p bundle-collapser/plugin --require ' +
  indexPath + ':bitauth -o ' + bundlePath;
var browserifyStandaloneCommand = [browserifyPath, indexPath, '--standalone', 'bitauth', 
    '|', derequirePath, '>', standaloneBundlePath].join(' ');
var uglifyCommand = uglifyPath + ' ' + bundlePath + ' --compress --mangle -o ' + minPath;
var uglifyStandaloneCommand = [uglifyPath, standaloneBundlePath, '--compress', '--mangle', '-o',  standaloneMinPath].join(' ');

gulp.task('browser:uncompressed', shell.task([
  browserifyCommand
]));

gulp.task('browser:standalone:uncompressed', shell.task([
  browserifyStandaloneCommand
]));

gulp.task('browser:compressed', ['browser:uncompressed'], shell.task([
  uglifyCommand
]));

gulp.task('browser:standalone:compressed', shell.task([
  uglifyStandaloneCommand
]));

gulp.task('browser:maketests', shell.task([
  'find test/ -type f -name "*.js" | xargs ' + browserifyPath + ' -o tests.js'
]));

gulp.task('browser', function(callback) {
  runsequence(['browser:compressed', 'browser:standalone:compressed'], callback);
});


gulp.task('release:install', function() {
  return shell.task([
    'npm install',
  ]);
});

var releaseFiles = ['./package.json', './bower.json'];

var bumpVersion = function(importance) {
  return gulp.src(releaseFiles)
    .pipe(bump({
      type: importance
    }))
    .pipe(gulp.dest('./'));
};

['patch', 'minor', 'major'].forEach(function(importance) {
  gulp.task('release:bump:' + importance, function() {
    bumpVersion(importance);
  });
});

gulp.task('release:checkout-releases', function(cb) {
  var tempBranch = 'releases/' + new Date().getTime() + '-build';
  git.branch(tempBranch, {
    args: ''
  }, function() {
    git.checkout(tempBranch, {
      args: ''
    }, cb);
  });
});

gulp.task('release:checkout-master', function(cb) {
  git.checkout('master', {
    args: ''
  }, cb);
});

gulp.task('release:sign-built-files', 
		['browser:uncompressed', 
		 'browser:compressed',
		 'browser:standalone:uncompressed',
		 'browser:standalone:compressed'], 
  shell.task([
    'gpg --yes --out ' + bundlePath + '.sig --detach-sig ' + bundlePath,
    'gpg --yes --out ' + minPath + '.sig --detach-sig ' + minPath, 
    'gpg --yes --out ' + standaloneBundlePath + '.sig --detach-sig ' + standaloneBundlePath,
    'gpg --yes --out ' + standaloneMinPath + '.sig --detach-sig ' + standaloneMinPath,
    'gpg --yes --out ' + externsPath + '.sig --detach-sig ' + externsPath,
]));

var buildFiles = ['./package.json'];
var signatureFiles = [];
buildFiles.push(bundlePath);
buildFiles.push(bundlePath + '.sig');
buildFiles.push(minPath);
buildFiles.push(minPath + '.sig');
buildFiles.push(standaloneBundlePath);
buildFiles.push(standaloneBundlePath + '.sig');
buildFiles.push(standaloneMinPath);
buildFiles.push(standaloneMinPath + '.sig');
buildFiles.push(externsPath);
buildFiles.push(externsPath + '.sig');
buildFiles.push('./bower.json');
signatureFiles.push(bundlePath + '.sig');
signatureFiles.push(minPath + '.sig');
signatureFiles.push(standaloneBundlePath + '.sig');
signatureFiles.push(standaloneMinPath + '.sig');
signatureFiles.push(externsPath + '.sig');

var addFiles = function() {
  return gulp.src(buildFiles)
    .pipe(git.add({
      args: '-f'
    }));
};

var buildCommit = function() {
  var pjson = require('./package.json');
  return gulp.src(buildFiles)
    .pipe(git.commit('Build: ' + pjson.version, {
      args: ''
    }));
};

gulp.task('release:add-signed-files', ['release:sign-built-files'], addFiles);
gulp.task('release:add-built-files', addFiles);
gulp.task('release:build-commit', [
  'release:add-signed-files'
], buildCommit);

gulp.task('release:version-commit', function() {
  var pjson = require('./package.json');
  return gulp.src(releaseFiles)
    .pipe(git.commit('Bump package version to ' + pjson.version, {
      args: ''
    }));
});

gulp.task('release:push', function(cb) {
  git.push('upstream', 'master', {
    args: ''
  }, cb);
});

gulp.task('release:push-tag', function(cb) {
  var pjson = require('./package.json');
  var name = 'v' + pjson.version;
  git.tag(name, 'Release ' + name, function() {
    git.push('upstream', name, cb);
  });
});

gulp.task('release:publish', shell.task([
  'npm publish'
]));

var tests = ['test/**/*.js'];
var testmocha = function() {
  return gulp.src(tests).pipe(new mocha({
    recursive: true
  }));
};
var testkarma = shell.task([
  path.resolve(__dirname, './node_modules/karma/bin/karma') +
    ' start ' + path.resolve(__dirname, './karma.conf.js')
]);

gulp.task('test:node', testmocha);
gulp.task('test:browser', ['browser:uncompressed', 'browser:maketests'], testkarma);

gulp.task('test', function(callback) {
  runsequence(['test:node'], ['test:browser'], callback);
});

gulp.task('benchmark', shell.task([
  'node benchmarks/index.js'
]));
