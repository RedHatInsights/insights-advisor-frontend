# Advisor Frontend (AF)

[![Build Status](https://travis-ci.org/RedHatInsights/insights-advisor-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-advisor-frontend)
## Getting Started
There is a [comprehensive quick start guide in the Storybook Documentation](https://github.com/RedHatInsights/insights-frontend-storybook/blob/master/src/docs/welcome/quickStart/DOC.md) to setting up an Insights environment complete with:
- [Insights-Frontend-Starter-App](https://github.com/RedHatInsights/insights-frontend-starter-app)
- [Insights Chroming](https://github.com/RedHatInsights/insights-chrome)
- [Insights Proxy](https://github.com/RedHatInsights/insights-proxy)

Note: You will need to set up the Insights environment if you want to develop with the starter app due to the consumption of the chroming service as well as setting up your global/app navigation through the API.
## Running locally
1. `npm install`
2. `npm run start:proxy` And enjoy! Thats it! Local proxy is no longer required to run local advisor
3. https://prod.foo.redhat.com:1337/insights/advisor/ (or whatever enviroment is specified)

Note: The API endpont can be specified by appending 
`API_ENDOINT=foo_endpoint ` so yah  end up with something like `API_ENDOINT=https://ci.cloud.redhat.com  npm run start` if you wish to specify a ci API.

Additionally, if you would prefer to run it the old way, `npm start` this requires [insights-proxy](https://github.com/RedHatInsights/insights-proxy) to be installed under PROXY_PATH and run (in another terminal) the following command:

```shell
SPANDX_CONFIG="./profiles/local-frontend.js" bash $PROXY_PATH/scripts/run.sh
```
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
##### Running the Frontend against a particular Insights API branch
To start the Insights API against a particular branch in the insights-advisor-api git repo use the `scripts/setup_insights_api.sh` script, like so ...

``` shell
[insights-advisor-frontend]$ ./scripts/setup_insights_api.sh
Usage: ./scripts/setup_insights_api.sh <branch>|-c
Start an Insights API environment (as a set of containers) from <branch> in the insights-advisor-api git repo

    <branch> : checkout <branch> and start the containers
    -c       : stop and cleanup the containers

[insights-advisor-frontend]$ ./scripts/setup_insights_api.sh stat_time_series
...
Running 'git clone --branch stat_time_series --single-branch git@github.com:RedHatInsights/insights-advisor-api.git /tmp/insights-advisor-api' ...
...

Finished setting up Insights API environment.
The Insights API is available at http://localhost:8000/api/insights/v1/
The Insights Frontend is available at https://ci.foo.redhat.com:1337
```

This starts a few containers related to the Insights API as well as an insights-proxy container.

Make sure to still perform steps 1, 3 and 4 above.  That is, `npm install` and `npm start`.  Running `scripts/setup_insights_api.sh` essentially replaces step 2.

Use docker commands, eg `docker ps` and `docker logs -f <container_name>` to access the logs from the API or other containers.

##### Start insights-proxy directly with docker
If you are running linux and have docker installed, you can skip the installation of the insights-proxy and run it directly with:
``` shell
 docker run -v $PWD/config:/config --rm --net='host' -p1337:1337 -e PLATFORM=linux -ti docker.io/redhatinsights/insights-proxy
```
#### Running against a local API
Set `apiHost` in the ./profiles/local-frontend.js to http://127.0.0.1:8000
