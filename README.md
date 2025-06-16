# Advisor Frontend

[![Build Status](https://img.shields.io/github/actions/workflow/status/RedhatInsights/insights-advisor-frontend/test.yml?branch=master)](https://github.com/github/RedHatInsights/insights-advisor-frontend//actions/workflows/test.yml) [![codecov](https://codecov.io/github/RedHatInsights/insights-advisor-frontend/branch/master/graph/badge.svg?token=g9fj8a4SW9)](https://codecov.io/github/RedHatInsights/insights-advisor-frontend)

## First time setup
1. Make sure you have [Node.js](https://nodejs.org/en/) version >= 18 installed.
2. Run [script to patch your `/etc/hosts`](https://github.com/RedHatInsights/insights-proxy/blob/master/scripts/patch-etc-hosts.sh)
3. Make sure you are using [Red Hat proxy](http://hdn.corp.redhat.com/proxy.pac)

## Running locally
1. Install dependencies with `npm install`
2. Run development server with `npm run start:proxy`
3. Local version of the app will be available at https://stage.foo.redhat.com:1337/insights/advisor/

In case you want to use the stable environment instead of beta you can run the app with `npm run start:proxy` and access it from https://stage.foo.redhat.com:1337/insights/advisor/. Usually there is no difference between these two environments unless there is a large feature in progress which is hidden behind `isBeta` flag.

## Testing federated modules with another application

If you want to test Advisor with another application deployed locally, you can utilise `LOCAL_APPS` environment variable and deploy the needed application on separate ports. To learn more about the variable, see https://github.com/RedHatInsights/frontend-components/tree/master/packages/config#running-multiple-local-frontend-applications.

### Example

We'll take for example [insights-inventory-frontend](https://github.com/RedHatInsights/insights-inventory-frontend).

Open new terminal, navigate to Inventory repository, and run it on a separate port without proxy:

```
npm run start -- --port=8003
```

In a separate terminal, run Advisor with proxy enabled and list Inventory:

```
LOCAL_APPS=inventory:8003~http npm run start:proxy
```

## Testing
Travis is used to test the build for this code.
- `npm run test` will run tests.
- `npm run lint` will run all linters.

Before opening a pull request, you can run `npm run verify:local` to make sure your changes pass automated tests (Jest and Cypress) and linter (both JS and CSS linters).

## Deploying
The app uses containerized builds which are configured in [`app-interface`](https://gitlab.cee.redhat.com/service/app-interface/-/blob/master/data/services/insights/advisor/deploy.yml).

| Push to branch in this repo  | Updated branch in build repo  | Environment       | Available at
| :--------------------------- | :---------------------------- | :---------------- | :-----------
| master                       | stage-beta                    | stage beta        | master branch
| master-stable                | stage-stable                  | stage stable      | master branch
| prod-beta                    | prod-beta                     | production beta   | up to the commit configured in `app-interface`
| prod-stable                  | prod-stable                   | production stable | up to the commit configured in `app-interface`

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
