#!/bin/bash

# --------------------------------------------
# Export vars for helper scripts to use
# --------------------------------------------
# name of app-sre "application" folder this component lives in; needs to match for the push to quay.
export COMPONENT="insights-advisor"
export APP_NAME=`node -e 'console.log(require("./package.json").insights.appname)'`
export IMAGE="quay.io/cloudservices/$COMPONENT-frontend"
export WORKSPACE=${WORKSPACE:-$APP_ROOT}  # if running in jenkins, use the build's workspace
export APP_ROOT=$(pwd)
cat /etc/redhat-release
COMMON_BUILDER=https://raw.githubusercontent.com/RedHatInsights/insights-frontend-builder-common/master

# --------------------------------------------
# Options that must be configured by app owner
# --------------------------------------------
IQE_PLUGINS="advisor"
IQE_MARKER_EXPRESSION="smoke"
IQE_FILTER_EXPRESSION=""

set -e

# ---------------------------
# Build and Publish to Quay
# ---------------------------

npm ci
npm run verify

# Generate nginx config based on app name in package.json
curl -sSL $COMMON_BUILDER/src/nginx_conf_gen.sh | bash -s

# Set pr check images to expire so they don't clog the repo
echo "LABEL quay.expires-after=3d" >> $APP_ROOT/Dockerfile # tag expires in 3 days
curl -sSL $COMMON_BUILDER/src/quay_push.sh | bash -s

# Stubbed out for now, will be added as tests are enabled
mkdir -p $WORKSPACE/artifacts
cat << EOF > $WORKSPACE/artifacts/junit-dummy.xml
<testsuite tests="1">
    <testcase classname="dummy" name="dummytest"/>
</testsuite>
EOF
