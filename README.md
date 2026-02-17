# Advisor Frontend

[![Build Status](https://img.shields.io/github/actions/workflow/status/RedhatInsights/insights-advisor-frontend/test.yml?branch=master)](https://github.com/github/RedHatInsights/insights-advisor-frontend//actions/workflows/test.yml) [![codecov](https://codecov.io/github/RedHatInsights/insights-advisor-frontend/branch/master/graph/badge.svg?token=g9fj8a4SW9)](https://codecov.io/github/RedHatInsights/insights-advisor-frontend)

## First time setup
1. Make sure you have [Node.js](https://nodejs.org/en/) version >= 18 installed
2. Run [script to patch your `/etc/hosts`](https://github.com/RedHatInsights/insights-proxy/blob/master/scripts/patch-etc-hosts.sh)
3. Make sure you are using [Red Hat proxy](http://hdn.corp.redhat.com/proxy.pac)

## Running locally
1. Install dependencies with `npm install`
2. Run development server with `npm run start:proxy`
3. Local version of the app will be available at https://stage.foo.redhat.com:1337/insights/advisor/

In case you want to use the stable environment instead of beta you can run the app with `npm run start:proxy` and access it from https://stage.foo.redhat.com:1337/insights/advisor/. Usually there is no difference between these two environments unless there is a large feature in progress which is hidden behind `isBeta` flag.

## Running with PDF Generator

To test PDF generation features locally, you'll need to run additional services alongside the advisor frontend.

### Prerequisites

Clone the required repositories:
- [insights-chrome](https://github.com/RedHatInsights/insights-chrome)
- [pdf-generator](https://github.com/RedHatInsights/pdf-generator)

### Quick Start

1. **Authenticate with quay.io** - Login once to access Red Hat container images:
   ```bash
   podman login quay.io
   ```
   Your credentials will be saved persistently and you won't need to login again after reboot.

2. **Configure insights-chrome** - Add routing for advisor and pdf-generator in `config/webpack.config.js` routes object that contain ...(process.env.CHROME_SERVICE && {

   ```javascript
   '/apps/advisor/': { host: 'http://localhost:8003/' },
   '/api/crc-pdf-generator/': { host: 'http://localhost:8000/' },
   ```

3. **Start services in separate terminals:**

   Terminal 1 - insights-chrome:
   ```bash
   cd ~/RH/insights-chrome
   npm run dev
   ```

   Terminal 2 - pdf-generator containers:
   ```bash
   cd ~/RH/pdf-generator
   cat <<EOF > .env
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MAX_CONCURRENCY=2
EOF
   podman-compose up
   ```

   Terminal 3 - pdf-generator server:
   ```bash
   cd ~/RH/pdf-generator
   PROXY_AGENT=http://squid.corp.redhat.com:3128/ \
   ASSETS_HOST=https://localhost:1337/ \
   API_HOST=https://console.stage.redhat.com/ \
   npm run start:server
   ```

   Terminal 4 - advisor frontend:
   ```bash
   npm run static
   ```

1. **Access the app** at https://stage.foo.redhat.com:1337/insights/advisor


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

## Running Advisor + Inventory together with Chrome

An alternative approach to test Advisor and Inventory integration is to use Chrome as the proxy and run both apps in static mode.

### Prerequisites

Clone the required repositories:
- [insights-chrome](https://github.com/RedHatInsights/insights-chrome)
- [insights-inventory-frontend](https://github.com/RedHatInsights/insights-inventory-frontend)

### Setup Steps

1. **Configure insights-chrome** - Add routing for both apps in `config/webpack.config.js`:
   ```javascript
   '/apps/inventory': {
     host: `http://localhost:8003`,
   },
   '/apps/advisor': {
     host: `http://localhost:8004`,
   },
   ```

2. **Start services in separate terminals:**

   Terminal 1 - insights-chrome:
   ```bash
   cd insights-chrome
   npm run dev
   ```

   Terminal 2 - inventory-frontend:
   ```bash
   cd insights-inventory-frontend
   npm run static
   ```

   Terminal 3 - advisor-frontend:
   ```bash
   npm run static -- --port=8004
   ```

3. **Access the app** at https://stage.foo.redhat.com:1337/insights/advisor

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
