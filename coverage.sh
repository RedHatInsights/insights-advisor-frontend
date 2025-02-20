#!/bin/bash
#
# Merges coverage reports from cypress and jest tests
# and generates an HTML report to view and json report to submit to codecov
#
# For jest coverage to be collected and submitted correctly
#  * Ensure the *coverageDirectory* is set to "coverage-jest" in packages.json
#  * Ensure there is a npm "test" script
#
# For cypress collection to work correctly
#  * Ensure "babel" (and dependencies) are at the latest (possible) version (aligned with frontend-components preferably)
#  * Ensure the babel "istanbul" plugin is included and configured in babel.config.js
#  * Ensure "nyc" is configuerd to output to "coverage-cypress"
#  * Ensure there is a npm "test:ct" script
#
case $(uname) in
Darwin)
	export CODECOV_BIN="https://uploader.codecov.io/latest/macos/codecov"
	;;
Linux)
	export CODECOV_BIN="https://uploader.codecov.io/latest/linux/codecov"
	;;
esac

rm -rf ./nyc_output
rm -rf ./coverage-jest
rm -rf ./coverage-cypress
rm -rf ./coverage

mkdir -p coverage/src
npm run test
cp ./coverage-jest/coverage-final.json ./coverage/src/jest.json

if [ -f cypress.config.js ]; then
	npm run test:ct
	cp ./coverage-cypress/coverage-final.json ./coverage/src/cypress.json
else
	echo "No cypress config found!"
fi

npx nyc merge ./coverage/src ./coverage/coverage-final.json
npx nyc report -t ./coverage --reporter html --report-dir ./coverage/html

if [ -z "${TRAVIS}" ]; then
	echo "Not on travis..."
else
	# Workaround for https://github.com/codecov/uploader/issues/475
	unset NODE_OPTIONS
	echo "Downloading codecov binary from $CODECOV_BIN"

	curl -Os "$CODECOV_BIN"
	chmod +x codecov

	echo "Uploading to codecov"

	./codecov --verbose -F "combined" -t "$CODECOV_TOKEN" -f ./coverage/coverage-final.json
	./codecov --verbose -F "jest" -t "$CODECOV_TOKEN" -f ./coverage-jest/coverage-final.json

	if [ -f cypress.config.js ]; then
		./codecov --verbose -F "cypress" -t "$CODECOV_TOKEN" -f ./coverage-cypress/coverage-final.json
	fi
fi