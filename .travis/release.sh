#!/usr/bin/env bash

MESSAGE=$(git log --format=%B -n 1 $TRAVIS_COMMIT)
mkdir getJenkinsFile
cd getJenkinsFile
git clone https://github.com/RedHatInsights/insights-advisor-frontend-build.git
cd insights-advisor-frontend-build
cp Jenkinsfile ../../Jenkinsfile
cd ../..
git init
git config --global user.name $COMMIT_AUTHOR_USERNAME
git config --global user.email $COMMIT_AUTHOR_EMAIL
git remote add travis-build ${REPO}.git
git add Jenkinsfile
git add dist
git commit -m 'Build by Travis'
git push --force --set-upstream travis-build master
