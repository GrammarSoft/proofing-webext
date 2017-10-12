#!/bin/sh
yarn install
yarn upgrade
rm -rf vendor
mkdir -pv vendor/
cp -v $(find node_modules/jquery -type f -name jquery.min.js) vendor/
cp -v $(find node_modules/dompurify -type f -name purify.min.js) vendor/
cp -v $(find node_modules/popper.js -type f -name popper.min.js) vendor/
cp -v $(find node_modules/bootstrap -type f -name bootstrap.min.css) vendor/
cp -v $(find node_modules/bootstrap -type f -name bootstrap.min.js) vendor/
cat $(find node_modules/featherlight -type f -name featherlight.min.css) | perl -wpne 's/\.featherlight/\.gt-popup/g;' > vendor/featherlight.min.css
cp -v $(find node_modules/featherlight -type f -name featherlight.min.js) vendor/
find vendor -type f -print0 | xargs -0rn1 chmod -x
