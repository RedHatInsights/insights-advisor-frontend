#!/bin/bash
set -e
set -x

if [ "${TRAVIS_BRANCH}" = "master-beta" ]; then
    rm -rf ./dist
    BUILD_BETA=true npm run travis:build
    for env in ci qa; do
        echo
        echo "PUSHING ${env}-beta"
        rm -rf ./dist/.git
        .travis/release.sh "${env}-beta"
    done
fi
if [ "${TRAVIS_BRANCH}" = "master" ]; then
    rm -rf ./dist
    BUILD_BETA=true npm run travis:build
    rm -rf ./dist/.git
    echo
    echo "PUSHING prod-beta"
    .travis/release.sh "prod-beta"
fi
if [ "${TRAVIS_BRANCH}" = "master-stable" ]; then
    rm -rf ./dist
    BUILD_BETA=true npm run travis:build
    for env in ci qa prod; do
        echo
        echo "PUSHING ${env}-stable"
        rm -rf ./dist/.git
        .travis/release.sh "${env}-stable"
    done
fi
