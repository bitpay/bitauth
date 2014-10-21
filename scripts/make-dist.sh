cd node_modules/bitcore
echo "Building browser bundle for bitcore..."
node browser/build -s lib/Key,lib/SINKey,lib/SIN,util/util
cd ../../
cp node_modules/bitcore/browser/bundle.js dist/bitcore.bundle.js
echo "Building browser bundle for bitauth..."
browserify lib/bitauth.js -s bitauth -x buffertools -x bitcore -o dist/bitauth.bundle.js
echo "Minifying bitcore and bitauth..."
node_modules/.bin/uglifyjs dist/bitcore.bundle.js dist/bitauth.bundle.js -o dist/bitauth.browser.min.js
echo "Done!"
