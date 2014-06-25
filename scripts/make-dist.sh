cd node_modules/bitcore
echo "Building browser bundle for bitcore..."
node browser/build -s lib/Key,lib/SINKey,lib/SIN,util/util
echo "Building browser bundle for bitauth..."
cd ../../
node_modules/.bin/browserify lib/bitauth.js -s bitauth -x buffertools -i bitcore -o dist/bitauth.browser.js
echo "Compiling bitcore and bitauth..."
node_modules/.bin/uglifyjs node_modules/bitcore/browser/bundle.js dist/bitauth.browser.js -b -o dist/bitauth.browser.js
echo "Minifying bundle..."
node_modules/.bin/uglifyjs dist/bitauth.browser.js -o dist/bitauth.browser.min.js
echo "Done!"
