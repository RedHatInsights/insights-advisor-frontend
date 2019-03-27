#!/bin/bash
set -e
set -x

if [[ "${TRAVIS_BRANCH}" = "master" ]]; then
    .travis/release.sh "ci-beta"
    .travis/release.sh "qa-beta"

elif [[ "${TRAVIS_BRANCH}" = "master-stable" ]]; then
    .travis/release.sh "ci-stable"
    .travis/release.sh "qa-stable"

elif [[ "${TRAVIS_BRANCH}" = "prod-beta" || "${TRAVIS_BRANCH}" = "prod-stable" ]]; then
    .travis/release.sh "${TRAVIS_BRANCH}"
fi
