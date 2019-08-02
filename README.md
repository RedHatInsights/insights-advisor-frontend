# Insights Frontend (IF)

[![Build Status](https://travis-ci.org/RedHatInsights/insights-advisor-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-advisor-frontend)
## Getting Started
There is a [comprehensive quick start guide in the Storybook Documentation](https://github.com/RedHatInsights/insights-frontend-storybook/blob/master/src/docs/welcome/quickStart/DOC.md) to setting up an Insights environment complete with:
- [Insights-Frontend-Starter-App](https://github.com/RedHatInsights/insights-frontend-starter-app)
- [Insights Chroming](https://github.com/RedHatInsights/insights-chrome)
- [Insights Proxy](https://github.com/RedHatInsights/insights-proxy)

Note: You will need to set up the Insights environment if you want to develop with the starter app due to the consumption of the chroming service as well as setting up your global/app navigation through the API.
## Running locally
1. `npm install`
2. Have [insights-proxy](https://github.com/RedHatInsights/insights-proxy) installed under PROXY_PATH and run the following command:

```shell
SPANDX_CONFIG="./config/spandx.config.js" bash $PROXY_PATH/scripts/run.sh
```
3. `npm start`
4. Checkout https://ci.foo.redhat.com:1337/insights/actions or https://prod.foo.redhat.com:1337/insights/actions depending on which api env your testing against
### Testing
- Travis is used to test the build for this code.
    - `npm run test` will run linters and tests
### Deploying
The follow six branches are used by IF
- prod-stable, prod-beta
- ci-stable, ci-beta
- qa-stable, qa-beta

A push or merge to master will automatically release to ci-beta and qa-beta
The same will happen with action against master-stable, it will automatically release to ci-stable and qa-stable
The prod-beta and prod-stable environments are updated by a deliberate push, (to each branch)

### Nuggets and Tidbits
##### Start insights-proxy directly with docker
If you are running linux and have docker installed, you can skip the installation of the insights-proxy and run it directly with:
``` shell
 docker run -v $PWD/config:/config --rm --net='host' -p1337:1337 -e PLATFORM=linux -ti docker.io/redhatinsights/insights-proxy
```
#### Running against a local API
Set `apiHost` in the spandx.config.js to http://127.0.0.1:8000
