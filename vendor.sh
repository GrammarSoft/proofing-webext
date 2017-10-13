#!/bin/sh
yarn install
yarn upgrade
set -e
rm -rf vendor
mkdir -pv vendor/
cp -v node_modules/jquery/dist/jquery.min.js vendor/
cp -v node_modules/dompurify/dist/purify.min.js vendor/
cp -v node_modules/popper.js/dist/umd/popper.min.js vendor/
cp -v node_modules/bootstrap/dist/css/bootstrap.min.css vendor/
cp -v node_modules/bootstrap/dist/js/bootstrap.min.js vendor/
cat node_modules/featherlight/release/featherlight.min.css | perl -wpne 's/\.featherlight/\.gt-popup/g;' > vendor/featherlight.min.css
cp -v node_modules/featherlight/release/featherlight.min.js vendor/
find vendor -type f -print0 | xargs -0rn1 chmod -x
