# Insights Advisor Frontend (IAF)

[![Build Status](https://travis-ci.org/RedHatInsights/insights-advisor-frontend.svg?branch=master)](https://travis-ci.org/RedHatInsights/insights-advisor-frontend)

## Getting Started
There is a [comprehensive quick start guide in the Storybook Documentation](https://github.com/RedHatInsights/insights-frontend-storybook/blob/master/src/docs/welcome/quickStart/DOC.md) to setting up an Insights environment complete with:
- [Insights-Frontend-Starter-App](https://github.com/RedHatInsights/insights-frontend-starter-app)
- [Insights Chroming](https://github.com/RedHatInsights/insights-chrome)
- [Insights Proxy](https://github.com/RedHatInsights/insights-proxy)

Note: You will need to set up the Insights environment if you want to develop with the starter app due to the consumption of the chroming service as well as setting up your global/app navigation through the API.

## Running locally
Have [insights-proxy](https://github.com/RedHatInsights/insights-proxy) installed under PROXY_PATH

```shell
SPANDX_CONFIG="./config/spandx.config.js" bash $PROXY_PATH/scripts/run.sh
```

### Build app
1. ```npm install```

2. ```npm start```

### Testing
- Travis is used to test the build for this code.
    - `npm run test` will run linters and tests
    
### Notes for Devs..   
You are gonna have to stub the following header `x-rh-identity:{ "identity": { "account_number": "1234567"}}`
else you'll likely get a bunch of `{"detail":"You do not have permission to perform this action."}`

