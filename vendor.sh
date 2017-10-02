#!/bin/sh
yarn install
yarn upgrade
mkdir -pv vendor/featherlight/
cp -v $(find node_modules -type f -name jquery.min.js) vendor/
cp -v $(find node_modules -type f -name purify.min.js) vendor/
cp -v $(find node_modules -type f -name featherlight.min.css) vendor/featherlight/
cp -v $(find node_modules -type f -name featherlight.min.js) vendor/featherlight/
find vendor -type f -print0 | xargs -0rn1 chmod -x
