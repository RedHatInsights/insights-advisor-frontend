# Setting Up and Running PDF Generator Environment

To test PDF generation locally, three services must run together: insights-chrome (proxy on port 1337), pdf-generator (server on port 8000), and the advisor frontend (static assets on port 8003). The repos are assumed to be siblings: `../insights-chrome` and `../pdf-generator`.

## Prerequisites

1. **quay.io authentication** (one-time): `podman login quay.io`
2. Clone [insights-chrome](https://github.com/RedHatInsights/insights-chrome) and [pdf-generator](https://github.com/RedHatInsights/pdf-generator) as sibling directories.

## insights-chrome Setup

In `../insights-chrome/config/webpack.config.js`, ensure the `routes` object inside `nonKonfluxDevServerConfiguration()` includes:

```javascript
routes: {
  '/apps/advisor/': { host: 'http://localhost:8003' },
  '/api/crc-pdf-generator/': { host: 'http://localhost:8000' },
  // ... existing routes
}
```

## pdf-generator Setup

Ensure `../pdf-generator/.env` contains:

```dotenv
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MAX_CONCURRENCY=2
```

## Starting Services (4 terminals)

**Terminal 1 - insights-chrome:**
```bash
cd ../insights-chrome
npm run dev
```

**Terminal 2 - pdf-generator containers (MinIO + Redis):**
```bash
cd ../pdf-generator
podman-compose up
```

**Terminal 3 - pdf-generator server:**
```bash
cd ../pdf-generator
PROXY_AGENT=http://squid.corp.redhat.com:3128/ \
ASSETS_HOST=https://localhost:1337/ \
API_HOST=https://console.stage.redhat.com/ \
npm run start:server
```

- `ASSETS_HOST` points to insights-chrome where federated module assets are served
- `API_HOST` is the backend API proxy target (stage or prod console)
- `PROXY_AGENT` is required when on the corporate VPN

**Terminal 4 - advisor frontend (static build):**
```bash
npm run static
```

This serves the advisor's federated module chunks on port 8003 (the default for `fec static`).

## Access

Open https://stage.foo.redhat.com:1337/insights/advisor and trigger a PDF export (e.g., Executive Report).

## Common Issues

- **504 Gateway Timeout from fetchData**: `API_HOST` is not set or unreachable. Ensure `API_HOST=https://console.stage.redhat.com/` is passed when starting pdf-generator server.