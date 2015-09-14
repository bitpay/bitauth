#!/bin/bash

# Unofficial strict mode
set -euo pipefail
IFS=$'\n\t'

# Directory of this script
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

[ -d ${DIR}/../dist ] || mkdir ${DIR}/../dist

(cd ${DIR}/.. ;
 echo "Building browser bundle for bitauth..." ;
 # Bundle puts full path names in its output, so pipe to sed to kill that noise
 ./node_modules/.bin/browserify lib/bitauth.js -s bitauth | \
	 sed -e "s|${HOME}/.*/\(.*\.js\)|\1|" > ./dist/bitauth.bundle.js ;
 echo "Minifying bitauth..." ;
 ./node_modules/.bin/uglifyjs ./dist/bitauth.bundle.js --compress --mangle -o ./dist/bitauth.browser.min.js)
echo "Done!"
