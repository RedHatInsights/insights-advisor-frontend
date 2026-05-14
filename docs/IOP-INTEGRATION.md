# IOP (Insights on Premise) Integration

## Overview

The Insights Advisor frontend supports both the standard Hybrid Cloud Console (HCC) environment and the IOP (Insights on Premise) environment. IOP is a self-hosted version of Red Hat Insights integrated with Satellite/Foreman environments, allowing customers to run Insights analysis locally without sending data to the cloud.

## Architecture

### Environment Detection & Context

The application uses React Context to manage environment-specific configuration and behavior. There are two context providers:

1. **Standard HCC Context** (`useHccEnvironmentContext`) - Used for cloud-hosted console.redhat.com
2. **IOP Context** (`useIopEnvironmentContext`) - Used for on-premise Satellite/Foreman integration

#### Context Properties

The `EnvironmentContext` contains configuration that controls application behavior:

| Property | HCC Value | IOP Value | Purpose |
|----------|-----------|-----------|---------|
| `displayGroupsTagsColumns` | `true` | `false` | Show/hide group and tag columns in tables |
| `displayRuleRatings` | `true` | `false` | Show/hide rule rating features |
| `displayRecPathways` | `true` | `false` | Enable/disable pathways feature |
| `displayExecReportLink` | `true` | `false` | Show/hide executive report link |
| `displayDownloadPlaybookButton` | `false` | `true` | Show/hide playbook download button |
| `changeRemediationButtonForIop` | `false` | `true` | Use IOP-specific remediation UI |
| `loadChromeless` | `false` | `true` | Load without console.redhat.com chrome |
| `BASE_URL` | `/api/insights/v1` | `/insights_cloud/api/insights/v1` | API base path |
| `INVENTORY_BASE_URL` | `/api/inventory/v1` | `/insights_cloud/api/inventory/v1` | Inventory API path |
| `REMEDIATIONS_BASE_URL` | `/api/remediations/v1` | `/insights_cloud/api/remediations/v1` | Remediations API path |

#### Context Hooks

**`useHccEnvironmentContext()`** - Standard cloud environment
```javascript
// src/Utilities/Hooks.js
export const useHccEnvironmentContext = () => {
  const chrome = useChrome(); // Console chrome integration
  const isLightspeedEnabled = useFeatureFlag('platform.lightspeed-rebrand');
  
  const [[canExport, canDisableRec, canViewRecs], isRbacLoading] = useRbac([
    PERMISSIONS.export,
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return useMemo(() => ({
    // Standard HCC configuration
    displayGroupsTagsColumns: true,
    displayRecPathways: true,
    BASE_URL: '/api/insights/v1',
    // Chrome integration
    updateDocumentTitle: chrome.updateDocumentTitle,
    on: chrome.on,
    // ... etc
  }), [...dependencies]);
};
```

**`useIopEnvironmentContext()`** - IOP on-premise environment
```javascript
// src/Utilities/Hooks.js
export const useIopEnvironmentContext = () => {
  const [[canDisableRec, canViewRecs], isRbacLoading] = useRbac([
    PERMISSIONS.disableRec,
    PERMISSIONS.viewRecs,
  ]);

  return useMemo(() => ({
    ...IOP_ENVIRONMENT_CONTEXT, // Predefined IOP config
    isLoading: isRbacLoading,
    isDisableRecEnabled: canDisableRec,
    isAllowedToViewRec: canViewRecs,
  }), [canDisableRec, canViewRecs, isRbacLoading]);
};
```

## IOP-Specific Components

### 1. ListWrapped (Module Federation Entry)

**File:** `src/SmartComponents/Recs/ListWrapped.js`

This is the **federated module entry point** for IOP. It's exposed via webpack module federation and consumed by Foreman/Satellite.

```javascript
const ListWrapped = (props) => {
  const envContext = useIopEnvironmentContext(); // IOP-specific context

  return (
    <IntlProvider locale="en" messages={messages}>
      <EnvironmentContext.Provider value={envContext}>
        <Provider store={dbStore}>
          <ListIop {...props} />
        </Provider>
      </EnvironmentContext.Provider>
    </IntlProvider>
  );
};
```

**Key Points:**
- Self-contained with its own Redux store (`initStore()`)
- Provides IOP environment context to all children
- Sets up internationalization (i18n)
- **Exposed as `./ListWrapped` in module federation config**

### 2. ListIop (Recommendations List Page)

**File:** `src/SmartComponents/Recs/ListIop.js`

The main recommendations list view for IOP environments.

**Structure:**
```
ListIop
├── PageHeader (with help popover)
├── IopOverviewDashbar
│   └── Statistics cards (Incidents, Critical, Important)
└── RulesTable
    └── Recommendations table with filters
```

**Features:**
- Permission check: Renders `MessageState` if user lacks `viewRecs` permission
- Document title updates
- Help popover with Advisor documentation link
- Overview statistics dashboard
- Rules table with dynamic refetching on changes

**Key Hook:**
```javascript
const { handleOverviewRefetchReady, handleRuleChange } = 
  useOverviewRefetchOnRuleChange();
```
This coordinates refetching overview stats when recommendations are disabled/enabled.

### 3. IopOverviewDashbar

**File:** `src/PresentationalComponents/OverviewDashbar/IopOverviewDashbar.js`

Displays summary statistics for recommendations.

**Cards:**
1. **Incidents** - Recommendations with incident tag
2. **Critical Recommendations** - Severity 4 (Critical)
3. **Important Recommendations** - Severity 3 (Important)

**Data Flow:**
```
IopOverviewDashbar
└── useOverviewData(envContext)
    └── dataFetch(envContext)
        └── GET envContext.STATS_OVERVIEW_FETCH_URL
            └── /insights_cloud/api/insights/v1/stats/overview/
```

**Click Handling:**
```javascript
const { onClickFilterByName } = useApplyFilters(changeTab);
```
Clicking a card applies filters to the recommendations table and changes to the recommendations tab.

### 4. IopOverviewDashbarCard

**File:** `src/PresentationalComponents/Cards/OverviewDashbarCard/IopOverviewDashbarCard.js`

Individual statistic card component.

**Features:**
- Loading state with skeleton
- Clickable count that applies filters
- Badge display (severity label or incident tag)
- Flat card design for IOP

### 5. IopRecommendationDetails

**File:** `src/SmartComponents/Recs/IopRecommendationDetails.js`

Recommendation detail page for IOP environments.

**Features:**
- Rule information and description
- Disable/enable rule functionality
- View systems modal (`IopViewHostAcks`)
- System-level acknowledgments
- CVE redirect handling
- Affected systems list

**Data Fetching:**
```javascript
const { data: rule } = useGetRecQuery({ 
  ruleId, 
  customBasePath: envContext.BASE_URL 
});

const { data: recAck } = useGetRecAcksQuery({ 
  ruleId, 
  customBasePath: envContext.BASE_URL 
});
```

### 6. IopViewHostAcks

**File:** `src/PresentationalComponents/Modals/IopViewHostAcks.js`

Modal displaying systems where a recommendation is disabled.

**Features:**
- Table of acknowledged systems
- System name, justification note, and disable date
- Enable button per system (deletes acknowledgment)
- Auto-closes when last system is enabled
- Pagination support

**API Integration:**
```javascript
const { data: hostAcks } = useGetHostAcksQuery({
  rule_id: rule.rule_id,
  limit: rule.hosts_acked_count,
  customBasePath: envContext.BASE_URL,
}, {
  skip: !isModalOpen,
  refetchOnMountOrArgChange: true,
});
```

## Component Communication & Data Flow

### Overview Refetch Coordination

The overview dashboard and recommendations table need to stay in sync when rules are enabled/disabled.

**Implementation:**
```javascript
// In ListIop.js
const { handleOverviewRefetchReady, handleRuleChange } = 
  useOverviewRefetchOnRuleChange();

// Register overview refetch function
<IopOverviewDashbar 
  onRefetchReady={handleOverviewRefetchReady}
/>

// Trigger refetch when rules change
<RulesTable 
  onRuleChange={handleRuleChange}
/>
```

**Hook Implementation:**
```javascript
// src/Utilities/Hooks.js
export const useOverviewRefetchOnRuleChange = () => {
  const overviewRefetchRef = useRef(null);

  // Called by IopOverviewDashbar to register its refetch function
  const handleOverviewRefetchReady = useCallback((refetchFn) => {
    overviewRefetchRef.current = refetchFn;
  }, []);

  // Called by RulesTable when a rule changes
  const handleRuleChange = useCallback(() => {
    overviewRefetchRef.current?.(); // Trigger refetch
  }, []);

  return { handleOverviewRefetchReady, handleRuleChange };
};
```

### Filter Application

Clicking overview cards applies filters to the recommendations table.

**Flow:**
```
User clicks "Critical Recommendations" card
└── IopOverviewDashbarCard onClick
    └── onClickFilterByName(CRITICAL_RECOMMENDATIONS)
        └── useApplyFilters.onClickFilterByName
            └── dispatch(updateRecFilters({ total_risk: 4 }))
            └── changeTab(RECOMMENDATIONS_TAB)
                └── RulesTable re-renders with filters
```

## Module Federation Configuration

**File:** `fec.config.js`

```javascript
moduleFederation: {
  exposes: {
    './ListWrapped': resolve(
      __dirname,
      './src/SmartComponents/Recs/ListWrapped.js',
    ),
    // ... other exposed modules
  },
}
```

**Consumption in Foreman/Satellite:**
```javascript
// Foreman loads the federated module
const AdvisorList = React.lazy(() => 
  import('advisor/ListWrapped')
);

// Renders in Foreman UI
<AdvisorList />
```

## API Endpoints (IOP-Specific)

All API calls in IOP use the custom base path from `envContext.BASE_URL`:

| Endpoint | Purpose |
|----------|---------|
| `GET /insights_cloud/api/insights/v1/stats/overview/` | Overview statistics |
| `GET /insights_cloud/api/insights/v1/rule/` | List recommendations |
| `GET /insights_cloud/api/insights/v1/rule/:id/` | Recommendation details |
| `GET /insights_cloud/api/insights/v1/ack/:rule_id/` | Rule acknowledgments |
| `GET /insights_cloud/api/insights/v1/hostack/?rule_id=:id` | Host acknowledgments |
| `DELETE /insights_cloud/api/insights/v1/hostack/:id/` | Enable rule for system |
| `POST /insights_cloud/api/insights/v1/ack/` | Disable rule |

## Permissions (RBAC)

IOP uses Kessel/RBAC for permission checks:

| Permission | Required For |
|------------|--------------|
| `advisor:recommendation-results:read` | View recommendations |
| `advisor:disable-recommendations:write` | Disable/enable rules |
| `advisor:exports:read` | Export recommendations (not used in IOP) |

**Check in Code:**
```javascript
const [[canDisableRec, canViewRecs], isRbacLoading] = useRbac([
  PERMISSIONS.disableRec,
  PERMISSIONS.viewRecs,
]);
```

## Development Setup for IOP

### Local Development with IOP Proxy

**Required:**
1. Frontend Development Proxy (`frontend-development-proxy` repo)
2. Foreman 3.18+ branch with IOP integration
3. Local advisor frontend with `IOP=true` environment variable

**Steps:**

1. **Set up proxy:**
```bash
cd frontend-development-proxy
cat > compose.yml <<EOF
version: '3'
services:
  proxy-iop:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - 1337:1337
    environment:
      HCC_ENV: iop
      PROXY_PORT: 1337
      HCC_ENV_URL: "https://ip-10-0-167-196.rhos-01.prod.psi.rdu2.redhat.com"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:Z
      - ./config/custom_routes.json:/config/custom_routes.json:Z
    extra_hosts:
      - "host.docker.internal:host-gateway"
EOF
```

2. **Create custom routes:**
```bash
cat > config/custom_routes.json <<EOF
{
  "/apps/advisor": { "url": "http://host.docker.internal:8004" },
  "/assets/apps/advisor*": { "url": "http://host.docker.internal:8004" },
  "/api/advisor/": { "url": "http://host.docker.internal:8000" }
}
EOF
```

3. **Start proxy:**
```bash
podman compose up proxy-iop
```

4. **Build and serve advisor:**
```bash
cd insights-advisor-frontend
IOP=true npm run static -- --port=8004
```

5. **Access IOP:**
```
https://iop.foo.redhat.com:1337/foreman_rh_cloud/insights_cloud
```

### Important: Module Federation Compatibility

**Critical:** Do NOT run `npm audit fix` on the foreman-3.18 branch. It breaks module federation by updating shared dependencies.

**Only update individual packages:**
```bash
# Good: Minimal update
npm install --save-dev lodash@4.18.1

# Bad: Breaks IOP module federation
npm audit fix
```

**Why:** Module federation requires precise shared dependency versions. `npm audit fix` updates many transitive dependencies, breaking the shared scope between the host (Foreman) and remote (Advisor).

**Error when broken:**
```
Error: Shared module react/jsx-runtime doesn't exist in shared scope default
```

## Testing

### Unit Tests

IOP components should be tested with `IOP_ENVIRONMENT_CONTEXT`:

```javascript
import { IOP_ENVIRONMENT_CONTEXT } from '../../AppConstants';

it('renders with IOP context', () => {
  mount(
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <ListIop />
    </EnvironmentContext.Provider>
  );
});
```

### Cypress Tests

Example from `src/PresentationalComponents/RulesTable/RulesTable.cy.js`:

```javascript
it('renders in IOP mode without groups/tags columns', () => {
  mount(
    <EnvironmentContext.Provider value={IOP_ENVIRONMENT_CONTEXT}>
      <RulesTable />
    </EnvironmentContext.Provider>
  );
  
  cy.get('[data-label="Groups"]').should('not.exist');
  cy.get('[data-label="Tags"]').should('not.exist');
});
```

## Key Differences: HCC vs IOP

| Feature | HCC (Cloud) | IOP (On-Premise) |
|---------|-------------|------------------|
| **Chrome Integration** | Full console.redhat.com chrome | Chromeless (no header/nav) |
| **Pathways** | Enabled | Disabled |
| **Groups & Tags** | Shown in tables | Hidden |
| **Rule Ratings** | Enabled | Disabled |
| **Remediation Button** | Standard console button | Custom IOP button |
| **Playbook Download** | Not shown | Download button shown |
| **API Base Path** | `/api/insights/v1` | `/insights_cloud/api/insights/v1` |
| **Module Loading** | Standalone app | Federated module in Foreman |
| **Global Filter** | Integrated with console | Not available |
| **Executive Reports** | Link shown | Hidden |

## Troubleshooting

### Module Federation Errors

**Problem:** `Error: Shared module react/jsx-runtime doesn't exist in shared scope default`

**Solution:** 
1. Check that you're using `IOP=true npm run static`
2. Verify `fec.config.js` has `deployment: 'assets/apps'` when `IOP=true`
3. Ensure package-lock.json hasn't been broken by `npm audit fix`
4. Rebuild from clean state: `rm -rf dist && npm install`

### Proxy Not Routing to Local

**Problem:** Changes not appearing in IOP environment

**Solution:**
1. Verify webpack built with `IOP=true`
2. Check custom_routes.json is mounted in container
3. Restart proxy: `podman compose restart proxy-iop`
4. Clear browser cache (Ctrl+Shift+R)
5. Check DevTools Network tab - requests should go to `iop.foo.redhat.com:1337`

### Permission Denied in IOP

**Problem:** User can't see recommendations or disable rules

**Solution:**
1. Check Kessel permissions in Foreman/Satellite
2. Verify `canViewRecs` and `canDisableRec` in React DevTools
3. Check `useRbac` hook is resolving correctly
4. Look for RBAC API errors in Network tab

## References

- [Frontend Components Config](https://github.com/RedHatInsights/frontend-components/tree/master/packages/config)
- [Module Federation Documentation](https://webpack.js.org/concepts/module-federation/)
- [Foreman Plugin Integration](https://github.com/theforeman/foreman_rh_cloud)
- [Kessel Permissions](./kessel-permissions.md)
