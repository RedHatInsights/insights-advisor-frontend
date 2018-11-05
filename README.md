# Insights Advisor Frontend (IAF)

[![Build Status](https://travis-ci.org/RedHatInsights/insights-advisor-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-advisor-frontend)

## Getting Started
There is a [comprehensive quick start guide in the Storybook Documentation](https://github.com/RedHatInsights/insights-frontend-storybook/blob/master/src/docs/welcome/quickStart/DOC.md) to setting up an Insights environment complete with:
- [Insights-Frontend-Starter-App](https://github.com/RedHatInsights/insights-frontend-starter-app)
- [Insights Chroming](https://github.com/RedHatInsights/insights-chrome)
- [Insights Proxy](https://github.com/RedHatInsights/insights-proxy)

Note: You will need to set up the Insights environment if you want to develop with the starter app due to the consumption of the chroming service as well as setting up your global/app navigation through the API.

### Insights Proxy Environment
[Insights Proxy](https://github.com/RedHatInsights/insights-proxy) is required to run the Advisor frontend. **Note An Advisor-specific proxy configuration is required for the frontend to communicate to the Advisor API POC**. To run the proxy with advisor-specific configuration run:
```
cd /path/to/insights-advisor-frontend
```
OSX
```
docker run -e LOCAL_CHROME -v $PWD/config:/config -e PLATFORM -e PORT -e LOCAL_API -e SPANDX_HOST -e SPANDX_PORT --rm -ti --name insightsproxy -p 1337:1337 docker.io/redhatinsights/insights-proxy
```
Linux/Other
```
docker run -v $PWD/config:/config --rm --net='host' -p1337:1337 -e PLATFORM=linux -ti docker.io/redhatinsights/insights-proxy
```
### Build app
1. ```npm install```

2. ```npm start```

### Testing
- Travis is used to test the build for this code.
    - `npm run test` will run linters and tests
    
### Notes for Devs..   
In order to consume the latest n greatest api work be to clear the [prod base url located here](https://github.com/RedHatInsights/insights-advisor-frontend/blob/master/src/AppConstants.js#L10)

It should read `const BASE_URL = '';`

Also you are gonna have to stub the following header `x-rh-identity:{ "identity": { "account_number": "1234567"}}`
else you'll likely get a bunch of `{"detail":"You do not have permission to perform this action."}`

