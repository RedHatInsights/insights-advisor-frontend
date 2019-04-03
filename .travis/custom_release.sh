#!/bin/bash
set -e
set -x

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    # for a limited time prod too
    for env in ci qa prod
    do
        echo
        echo
        echo "PUSHING ${env}-beta"

        # note to Allen.. remove the temp .git dir
        # not all of dist O_o
        rm -rf ./dist/.git
        .travis/release.sh "${env}-beta"
    done
fi

if [ "${TRAVIS_BRANCH}" = "master-stable" ]; then
    # for a limited time prod too
    for env in ci qa prod
    do
        echo
        echo
        echo "PUSHING ${env}-beta"
        rm -rf ./dist/.git
        .travis/release.sh "${env}-stable"
    done
fi

if [[ "${TRAVIS_BRANCH}" = "prod-beta" || "${TRAVIS_BRANCH}" = "prod-stable" ]]; then
    .travis/release.sh "${TRAVIS_BRANCH}"
fi
