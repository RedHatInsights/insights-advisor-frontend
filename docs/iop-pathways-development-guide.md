# IoP Pathways Development Guide

## Overview

This guide documents the development and testing process for enabling the Pathways feature in IoP (Insights on Premises) Satellite/Foreman environments. The Pathways feature groups related recommendations into actionable pathways, helping users prioritize and remediate issues more effectively.

---

## Table of Contents

- [Branch Information](#branch-information)
- [Feature Overview](#feature-overview)
- [Code Changes](#code-changes)
- [Local Development Setup](#local-development-setup)
- [Testing](#testing)
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

## Code Changes

### 1. PathwaysTable Component

**File**: `src/PresentationalComponents/PathwaysTable/PathwaysTable.js`

**Key Change**: Conditional link rendering based on environment

```javascript
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import { Link } from 'react-router-dom';

// In render:
{envContext.loadChromeless ? (
  // IoP/Foreman/Satellite
  <Link to={`/foreman_rh_cloud/recommendations/pathways/${pathway.slug}`}>
    {pathway.name}
  </Link>
) : (
  // HCC (Hybrid Cloud Console)
  <InsightsLink to={`/recommendations/pathways/${pathway.slug}`}>
    {pathway.name}
  </InsightsLink>
)}
```

**Why This Matters**:
- `InsightsLink`: Provides Chrome integration, analytics, cross-app routing for HCC
- `Link`: Standard React Router for standalone IoP installations
- Pattern matches `RulesTable` implementation for consistency

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
│  192.168.56.10      │◄────────┤   127.0.0.1          │
│                     │         │                      │
│  - IoP Services     │         │  - Frontend (8004)   │
│  - Advisor Backend  │         │  - Proxy (1337)      │
│  - Host Inventory   │         │  - Live Reload       │
└─────────────────────┘         └──────────────────────┘
```

### Quick Start

1. **Start Foreman VM**:
   ```bash
   cd /path/to/iop-dev
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
   # Point to: 192.168.56.10 (Foreman VM)
   
   cd /path/to/insights-advisor-frontend
   git checkout foreman-pathways-dev
   npm install
   ```

4. **Add /etc/hosts Entry**:
   ```bash
   echo "127.0.0.1 iop.foo.redhat.com" | sudo tee -a /etc/hosts
   ```

5. **Start Frontend Development**:
   ```bash
   cd /path/to/iop-dev
   iop frontend up --app advisor
   ```

6. **Access the UI**:
   ```
   https://iop.foo.redhat.com:1337/foreman_rh_cloud/recommendations
   ```
   - Accept self-signed certificate
   - Login: `admin` / `changeme`

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
cd /path/to/insights-advisor-frontend
# Edit PathwaysTable.js
nano src/PresentationalComponents/PathwaysTable/PathwaysTable.js

# Add a console.log for debugging:
console.log('Pathways data:', pathways);

# Save → browser auto-refreshes
```

### Registering Test Clients

To test with real data, you need a RHEL-based system with insights-client:

1. **Install insights-client** (on RHEL/CentOS Stream):
   ```bash
   sudo dnf install -y insights-client
   ```

2. **Configure for Local Foreman**:
   ```bash
   sudo mkdir -p /etc/insights-client
   sudo cat > /etc/insights-client/insights-client.conf <<EOF
   [insights-client]
   auto_config=False
   base_url=<foreman-hostname>/redhat_access/r/insights
   cert_verify=False
   EOF
   ```

3. **Register**:
   ```bash
   sudo insights-client --register
   sudo insights-client --check-results
   ```

4. **View in UI**: Host should appear with recommendations/pathways

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
cd /path/to/insights-advisor-frontend
rm -rf node_modules package-lock.json
npm install
cd /path/to/iop-dev
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

**Last Updated**: 2026-07-07  
**Branch**: foreman-pathways-dev  
**Environment**: Local IoP via iop-dev
