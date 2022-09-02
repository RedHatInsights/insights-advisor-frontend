# Advisor Frontend

[![Build Status](https://travis-ci.com/RedHatInsights/insights-advisor-frontend.svg?branch=master)](https://app.travis-ci.com/github/RedHatInsights/insights-advisor-frontend)

## First time setup
1. Make sure you have [Node.js](https://nodejs.org/en/) version >= 16 installed
2. Run [script to patch your `/etc/hosts`](https://github.com/RedHatInsights/insights-proxy/blob/master/scripts/patch-etc-hosts.sh)
3. Make sure you are using [Red Hat proxy](http://hdn.corp.redhat.com/proxy.pac)

## Running locally
1. Install dependencies with `npm install`
2. Run development server with `npm run start:proxy:beta`
3. Local version of the app will be available at https://stage.foo.redhat.com:1337/beta/insights/advisor/

## Testing
Travis is used to test the build for this code.
- `npm run test` will run tests.
- `npm run lint` will run all linters.

## Deploying
Any push to the following branches will trigger a build in [insights-advisor-frontend-build repository](https://github.com/RedHatInsights/insights-advisor-frontend-build) which will deploy to corresponding environment. Travis is used to deploy the application.

| Push to branch in this repo  | Updated branch in build repo  | Environment       | Available at
| :--------------------------- | :---------------------------- | :---------------- | :-----------
| master                       | stage-beta                    | stage beta        | https://console.stage.redhat.com/beta
| master-stable                | stage-stable                  | stage stable      | https://console.stage.redhat.com
| prod-beta                    | prod-beta                     | production beta   | https://console.redhat.com/beta 
| prod-stable                  | prod-stable                   | production stable | https://console.redhat.com

## Internationalization

### Translation keys
Translation keys are saved in [`messages.js`](https://github.com/RedHatInsights/insights-advisor-frontend/blob/master/src/Messages.js). 

### Generating translation keys
Each time you add a new translation keys you need to run `npm run translations`, which will automatically generate JSON files for every language into [`locales/`](https://github.com/RedHatInsights/insights-advisor-frontend/tree/master/locales) folder based on the entries in the [`messages.js`](https://github.com/RedHatInsights/insights-advisor-frontend/blob/master/src/Messages.js). 

### Using translated strings
There are two ways to use translated strings:
1. With `intl.formatMessage(messages.messageId)`
2. With `<FormattedMessage {...messages.messageId}/>`

## Design System
This project uses [Patternfly React](https://github.com/patternfly/patternfly-react).

## Insights Components
This app imports components from [Insights Front-end Components library](https://github.com/RedHatInsights/frontend-components). ESI tags are used to import [Insights Chrome](https://github.com/RedHatInsights/insights-chrome) which takes care of the header, sidebar, and footer.
