node_modules/.bin/browserify lib/bitauth.js -s BitAuth -o dist/bitauth.browser.js
echo "Compiling bitcore and bitauth..."
node_modules/.bin/uglifyjs dist/bitauth.browser.js -o dist/bitauth.browser.min.js
echo "Done!"
