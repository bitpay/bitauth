echo "Building browser bundle for bitauth..."
node_modules/.bin/browserify lib/bitauth.js -s bitauth -o dist/bitauth.bundle.js
echo "Minifying bitauth..."
node_modules/.bin/uglifyjs dist/bitauth.bundle.js --compress --mangle -o dist/bitauth.browser.min.js
echo "Done!"
