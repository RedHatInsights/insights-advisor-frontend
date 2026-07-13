# IoP Pathways Development Guide

## Overview

This guide documents the development and testing process for enabling the Pathways feature in IoP (Insights on Premises) Satellite/Foreman environments. The Pathways feature groups related recommendations into actionable pathways, helping users prioritize and remediate issues more effectively.

---

## Table of Contents

- [Branch Information](#branch-information)
- [Feature Overview](#feature-overview)
- [Local Development Setup](#local-development-setup)
  - [Quick Start](#quick-start)
    - [Option A: Local Foreman VM](#option-a-local-foreman-vm)
    - [Option B: Remote Satellite Environment](#option-b-remote-satellite-environment)
- [Testing](#testing)
  - [Registering Test Clients](#registering-test-clients)
- [Architecture Notes](#architecture-notes)
- [Troubleshooting](#troubleshooting)

---

## Branch Information

**Branch**: `foreman-pathways-dev`  
**Base**: `foreman-3.18` (Satellite 6.19)  
**Purpose**: Enable Pathways functionality for IoP/Satellite/Foreman environments

### Key Changes from Base

The branch contains 18 commits compared to foreman-3.18:
- **Main Feature**: Pathways tab and functionality in IoP
- **Files Changed**: 18 files (+330 / -59 lines)
- **Key Commit**: `f6bce9fe` - "Enable Pathways in IoP Satellite / Foreman"

---

## Feature Overview

### What is Pathways?

Pathways groups related recommendations into actionable workflows based on:
- **Category**: Security, Availability, Performance, Stability
- **Severity**: Critical, Important, Moderate, Low
- **Impact**: Number of systems affected

### IoP vs HCC Environments

The same codebase runs in two environments:
- **HCC (Hybrid Cloud Console)**: console.redhat.com - uses Chrome navigation framework
- **IoP (Insights on Premises)**: Local Foreman/Satellite - standalone environment

This requires conditional routing and component usage.

---

### 2. Environment Configuration

**File**: `src/AppConstants.js`

```javascript
export const IOP_ENVIRONMENT_CONTEXT = {
  loadChromeless: true,
  displayRecPathways: true,  // Enables Pathways feature
  pathwayDetailBasePath: '/foreman_rh_cloud/recommendations/pathways',
  // ... other IoP-specific settings
}
```

### 3. New Components

#### ForemanPathwaySystems.js
- **Purpose**: Display systems affected by a pathway in IoP
- **Location**: `src/SmartComponents/HybridInventoryTabs/ConventionalSystems/`
- **Features**: Paginated table, system names, last seen dates

#### PathwayDetailsWrapped.js
- **Purpose**: Webpack-exposed wrapper for pathway details
- **Location**: `src/SmartComponents/Recs/`
- **Features**: Lazy loading support

### 4. Modified Components

#### ListIop.js
- Added tabs: "Recommendations" and "Pathways"
- Permission checks with lock icon for unauthorized users
- Lazy loads PathwaysTable
- Dynamic count updates

#### DetailsPathways.js
- Supports both chromeless and chrome-enabled modes
- Conditional loading of PathwaySystems vs HybridInventory
- Simplified to conventional systems only

### 5. foreman_rh_cloud Plugin Changes

**Repository**: https://github.com/theforeman/foreman_rh_cloud
**PR**: #1219

**Changes Required**:
1. **Routes** (`config/routes.rb`):
   ```ruby
   get 'recommendations/pathways/:slug', ...
   ```

2. **Scalprum Module** (`webpack/IopRecommendationDetails/IopRecommendationDetails.js`):
   ```javascript
   const pathwayMatch = useRouteMatch({
     path: '/foreman_rh_cloud/recommendations/pathways/:slug',
   });
   // ... render PathwayDetailsWrapped module
   ```

---

## Local Development Setup

### Prerequisites

- VPN connection (for stage registry access)
- Vagrant + libvirt (Linux) or VirtualBox (Mac)
- Node.js 18+
- Ethel staging registry credentials

### Environment Architecture

```
┌─────────────────────┐         ┌──────────────────────┐
│  Foreman VM         │         │   Dev Machine        │
│  <foreman-ip>       │◄────────┤   127.0.0.1          │
│                     │         │                      │
│  - IoP Services     │         │  - Frontend (8004)   │
│  - Advisor Backend  │         │  - Proxy (1337)      │
│  - Host Inventory   │         │  - Live Reload       │
└─────────────────────┘         └──────────────────────┘
```

### Quick Start

#### Option A: Local Foreman VM

1. **Start Foreman VM**:
   ```bash
   cd <iop-dev-directory>
   iop local foreman up
   # First time: ~50-60 minutes
   # Subsequent: ~2-3 minutes
   ```

2. **Verify Health**:
   ```bash
   iop local foreman health
   # All checks should pass
   ```

3. **Set Up Frontend Dev Environment**:
   ```bash
   iop frontend setup
   # Point to: <foreman-ip> (default: 192.168.56.10)

   cd <insights-advisor-frontend-directory>
   git checkout foreman-pathways-dev
   npm install
   ```

4. **Add /etc/hosts Entry** (if not already present):
   ```bash
   echo "127.0.0.1 iop.foo.redhat.com" | sudo tee -a /etc/hosts
   ```

5. **Start Frontend Development**:
   ```bash
   cd <iop-dev-directory>
   iop frontend up --app advisor
   ```

6. **Access the UI**:
   ```
   https://iop.foo.redhat.com:1337/foreman_rh_cloud/recommendations
   ```
   - Accept self-signed certificate
   - Login: `admin` / `changeme`

#### Option B: Remote Satellite Environment

If you have access to a provisioned satellite environment (e.g., via broker):

1. **Set Up Frontend Dev Environment** (one-time):
   ```bash
   cd <iop-dev-directory>
   iop frontend setup
   # When prompted, you can configure default host or override later

   cd <insights-advisor-frontend-directory>
   git checkout foreman-pathways-dev
   npm install
   ```

2. **Add /etc/hosts Entry** (if not already present):
   ```bash
   echo "127.0.0.1 iop.foo.redhat.com" | sudo tee -a /etc/hosts
   ```

3. **Start Frontend Development with Satellite Host**:
   ```bash
   cd <iop-dev-directory>
   iop frontend up --app advisor --host <satellite-hostname>
   ```

   Example (replace with your actual satellite host):
   ```bash
   iop frontend up --app advisor --host ip-10-0-XXX-XXX.rhos-01.prod.psi.rdu2.redhat.com
   ```

   This command:
   - Configures `HCC_ENV_URL` to point to your satellite host
   - Starts the advisor dev server with live reload on port 8004
   - Starts the frontend-development-proxy with IoP-specific configuration
   - Handles TLS certificate skip-verify and location rewrites automatically

4. **Access the UI**:
   ```
   https://iop.foo.redhat.com:1337/foreman_rh_cloud/recommendations
   ```
   - Accept self-signed certificate
   - Login: `admin` / `changeme`

5. **Check Status**:
   ```bash
   iop frontend status
   # Shows target host, running processes, and access URL
   ```

**Benefits of Satellite Environment**:
- No local VM resource requirements (RAM, disk, CPU)
- Faster startup (no VM provisioning time)
- Access to pre-configured test data and registrations
- Can switch between environments with `--host` flag

---

## Testing

### Testing the Pathways Feature

1. **Verify Pathways Tab Appears**:
   - Navigate to Recommendations page
   - Check for "Pathways" tab next to "Recommendations"

2. **Test Pathways List**:
   - Click Pathways tab
   - Verify table loads with: Name, Category, Impacted Systems, Risk Level

3. **Test Category Filtering**:
   - Try each category filter: Security, Availability, Performance, Stability
   - Verify filtering works correctly
   - Check browser console for errors

4. **Test Pathway Detail Page**:
   - Click on a pathway name
   - Verify URL: `/foreman_rh_cloud/recommendations/pathways/:slug`
   - Check tabs: "Details" and "Affected Systems"

5. **Test Navigation**:
   - Browser back button should return to Pathways tab
   - Switching between tabs should work smoothly

### Live Reload Testing

With `iop frontend up` running:

```bash
cd <insights-advisor-frontend-directory>
# Edit PathwaysTable.js
nano src/PresentationalComponents/PathwaysTable/PathwaysTable.js

# Add a console.log for debugging:
console.log('Pathways data:', pathways);

# Save → browser auto-refreshes
```

### Registering Test Clients

To test with real data, you need RHEL-based systems registered to your Foreman/Satellite instance.

#### Recommended: Using Foreman UI Registration

The easiest and most reliable method is to use Foreman's built-in host registration:

1. **Generate Registration Command**:
   - Log into Foreman UI: `https://<foreman-host>`
   - Navigate to **Hosts** → **Register Host**
   - Configure registration options:
     - Select the appropriate **Organization** and **Location**
     - Under the **Advanced** tab, enable **Insights** to automatically set up insights-client
     - (Optional) Configure activation key, lifecycle environment, etc.
   - Click **Generate** to create the registration command

2. **Run Command on Target Host**:
   - Copy the generated `curl` command
   - Run it on your RHEL host as root:
     ```bash
     curl -sS '<registration-url>' | bash
     ```

3. **Verify**:
   - Host should appear in **Hosts** → **All Hosts**
   - Insights data should appear after the first check-in (~5-10 minutes)
   - View recommendations/pathways in the Advisor UI

**Why This Method?**
- Handles all registration aspects automatically (subscription, insights, katello agent)
- Generates proper certificates and configurations
- Ensures the host appears correctly in the Foreman UI
- No manual `insights-client` configuration needed

#### Alternative: Manual insights-client Configuration

If you need to manually configure insights-client (e.g., for troubleshooting or custom setups):

> ⚠️ **Important**: You must first register the host to Foreman using one of these methods:
> - Foreman UI registration (recommended, see above)
> - `subscription-manager` or activation key
> - Foreman's Global Registration API
>
> **The host will not appear in the UI** if you only configure insights-client without completing Foreman registration first.

1. **Register Host to Foreman** (if not already done):
   ```bash
   # Using subscription-manager
   sudo subscription-manager register \
     --org=<org-id> \
     --activationkey=<key-name> \
     --serverurl=<foreman-host>
   ```

2. **Install insights-client**:
   ```bash
   sudo dnf install -y insights-client
   ```

3. **Configure for Foreman**:
   ```bash
   sudo mkdir -p /etc/insights-client
   sudo cat > /etc/insights-client/insights-client.conf <<EOF
   [insights-client]
   auto_config=False
   base_url=<foreman-hostname>/redhat_access/r/insights
   cert_verify=False
   EOF
   ```

4. **Register insights-client**:
   ```bash
   sudo insights-client --register
   sudo insights-client --check-results
   ```

5. **View in UI**: Host should now show insights data with recommendations/pathways

---

## Architecture Notes

### Routing Strategy

**IoP Routes** (foreman_rh_cloud plugin):
- `/foreman_rh_cloud/recommendations` - Main page
- `/foreman_rh_cloud/recommendations/pathways` - Pathways list
- `/foreman_rh_cloud/recommendations/pathways/:slug` - Pathway details

**HCC Routes** (console.redhat.com):
- `/recommendations` - Main page
- `/recommendations/pathways` - Pathways list
- `/recommendations/pathways/:slug` - Pathway details

### Component Loading

- **Lazy Loading**: PathwaysTable is lazy loaded for better performance
- **Scalprum Modules**: Pathway details use federated modules
- **Conditional Rendering**: Based on `envContext.loadChromeless` flag

### API Endpoints

- **Pathways List**: `GET /insights_cloud/v1/pathway/`
- **Pathway Detail**: `GET /insights_cloud/v1/pathway/:id`
- **Systems**: `GET /insights_cloud/v1/systems/`
- **Filtering**: Query params like `?category=1&risk=high`

### Category IDs

```javascript
const CATEGORIES = {
  1: 'availability',
  2: 'security',
  3: 'stability',
  4: 'performance'
};
```

---

## Troubleshooting

### Pathways Tab Doesn't Appear

**Check**:
1. foreman_rh_cloud plugin changes applied?
2. Foreman Rails server restarted?
3. Webpack bundles rebuilt?
4. Browser console for errors?

**Solution**:
```bash
# Inside Foreman VM
cd /home/vagrant/foreman
bundle exec foreman-rake webpack:compile
sudo systemctl restart foreman-dev
```

### Category Filter Not Working

**Debug Steps**:
1. Open browser DevTools → Network tab
2. Filter by "pathway" requests
3. Check query parameters: `?category=1`
4. Inspect response data structure

**Common Issue**: `pathway.categories` format mismatch
- Frontend expects: Array of IDs `[1, 2]`
- Backend returns: Array of objects `[{id: 1, name: "availability"}]`

**Solution**: Update filter logic to match backend format

### 502/504 Gateway Errors

**Check**:
```bash
iop local foreman fix-gateway-dns
iop local foreman health
```

**Verify** IoP services are running:
```bash
vagrant ssh foreman -c "sudo systemctl status iop-service-advisor-backend-api"
```

### Frontend Dev Server Won't Start

**Solution**:
```bash
cd <insights-advisor-frontend-directory>
rm -rf node_modules package-lock.json
npm install
cd <iop-dev-directory>
iop frontend up --app advisor
```

### No Pathways Data

**Check if systems are registered**:
```bash
curl -k -u admin:changeme \
  https://<foreman-host>/insights_cloud/v1/systems/ | jq
```

**Verify advisor backend**:
```bash
vagrant ssh foreman -c \
  "sudo journalctl -u iop-service-advisor-backend-service -f"
```

### Links Not Working

**Verify environment context**:
```javascript
// In browser console
console.log(window.insights.chrome);
// Check if loadChromeless is set correctly
```

**Check route configuration**:
- IoP should use `Link` component
- HCC should use `InsightsLink` component

---

## Key Files Reference

### Frontend (insights-advisor-frontend)

```
src/
├── PresentationalComponents/
│   └── PathwaysTable/
│       └── PathwaysTable.js         # Main table component
├── SmartComponents/
│   ├── Recs/
│   │   ├── ListIop.js               # Main IoP page with tabs
│   │   ├── DetailsPathways.js       # Pathway details
│   │   └── PathwayDetailsWrapped.js # Webpack wrapper
│   └── HybridInventoryTabs/
│       └── ConventionalSystems/
│           └── ForemanPathwaySystems.js # IoP systems list
├── Services/
│   └── Pathways.js                  # API service
└── AppConstants.js                  # Environment config
```

### Backend (foreman_rh_cloud plugin)

```
config/
└── routes.rb                        # Rails routes
webpack/
└── IopRecommendationDetails/
    └── IopRecommendationDetails.js  # Scalprum module config
```

---

## Related Resources

- **foreman_rh_cloud PR**: https://github.com/theforeman/foreman_rh_cloud/pull/1219
- **Base Branch**: `foreman-3.18` (Satellite 6.19)
- **Feature Branch**: `foreman-pathways-dev`

### JIRA Tickets

- RHINENG-24551: Dynamic overview counts
- RHINENG-23663: Permissions improvements
- RHINENG-22380: Disable rules permissions
- RHINENG-24344: Incidents filter crash fix

---

## Development Timeline

| Task | Duration | Notes |
|------|----------|-------|
| First Foreman VM provision | 50-60 min | One-time |
| Foreman VM restart | 2-3 min | Subsequent starts |
| Frontend setup | 10 min | One-time |
| Code changes + testing | Variable | With live reload |

---

## Success Criteria

- [ ] Foreman VM running and healthy
- [ ] Frontend dev environment with live reload
- [ ] Pathways tab visible in UI
- [ ] Pathways list loads correctly
- [ ] Category filtering works
- [ ] Pathway detail pages render
- [ ] Systems tab shows affected hosts
- [ ] Navigation works (tabs, back button, links)
- [ ] No console errors
- [ ] Conditional routing works (IoP vs HCC)

---

**Last Updated**: 2026-07-08  
**Branch**: `foreman-pathways-dev`  
**Environment**: Local IoP via iop-dev
