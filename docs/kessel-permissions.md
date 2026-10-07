# Kessel Permissions Migration

## Overview

Advisor supports two permission systems controlled by the `advisor.kessel_enabled` feature flag:

- **RBAC v1**: Legacy role-based access control via `/api/rbac/v1/access/`
- **Kessel**: New unified permissions system via Kessel API

## Feature Flag

**Flag name**: `advisor.kessel_enabled`
**Managed by**: Unleash
**Default**: `false` (uses RBAC v1)

## Provider Hierarchy

The standalone (HCC) entry point in `src/App.js` wraps the app in the Kessel
access-check provider, waits for feature flags, then branches to the matching
environment context:

```
AppWithHccContext                       (default export)
└─ AccessCheck.Provider                 (baseUrl=window.location.origin,
│                                        apiPath=KESSEL_API_BASE_URL)
   └─ AppWithContextProviders           (waits for flagsReady, reads
      │                                  useFeatureFlag('advisor.kessel_enabled'))
      ├─ AppWithKesselContext           (flag on → useKesselEnvironmentContext)
      │  └─ EnvironmentContext.Provider
      │     └─ App
      └─ AppWithRbacV1Context           (flag off → useHccEnvironmentContext)
         └─ EnvironmentContext.Provider
            └─ App
```

`AccessCheck.Provider` is always mounted so the Kessel client is available
regardless of flag state; only the context hook that supplies permission flags
differs between the two branches.

## Permission Hooks

### RBAC v1 (Legacy)

```javascript
import { useRbac } from './Utilities/Hooks';

const [[canExport, canDisableRec, canViewRecs], isLoading] = useRbac([
  PERMISSIONS.export,
  PERMISSIONS.disableRec,
  PERMISSIONS.viewRecs,
]);
```

**API Call**: `GET /api/rbac/v1/access/?application=advisor&limit=1000`

**Wildcard handling**: `useRbac` compares each required permission against the
user's granted permissions with `matchPermissions` (`src/Utilities/Hooks.js`).
The two colon-delimited strings must have the same number of segments, and each
segment matches when it is equal **or** either side is the wildcard `*`. So a
granted `advisor:*:*` satisfies a required `advisor:exports:read`, and a granted
`advisor:exports:*` satisfies `advisor:exports:read`. Kessel relations are exact
strings and have no wildcard semantics.

### Kessel (New)

```javascript
import { useKesselPermissions } from './Utilities/usePermissionCheck';

const [canExport, canDisableRec, canViewRecs, isLoading] =
  useKesselPermissions();
```

**API Call**: Uses `@project-kessel/react-kessel-access-check` package

## Environment Context Hooks

Two parallel hooks provide the same context interface with different permission backends:

### useHccEnvironmentContext (RBAC v1)

```javascript
import { useHccEnvironmentContext } from './Utilities/Hooks';

const envContext = useHccEnvironmentContext();
```

**Returns**:
- Permission flags: `isExportEnabled`, `isDisableRecEnabled`, `isAllowedToViewRec`
- Loading state: `isLoading`
- Chrome API methods: `updateDocumentTitle`, `getUser`, etc.
- API URLs: `BASE_URL`, `RULES_FETCH_URL`, etc.

### useKesselEnvironmentContext (Kessel)

```javascript
import { useKesselEnvironmentContext } from './Utilities/useKesselEnvironmentContext';

const envContext = useKesselEnvironmentContext();
```

**Returns**: Identical interface to `useHccEnvironmentContext`, but permissions come from Kessel

## Permission Constants

Defined in `src/AppConstants.js`. RBAC v1 uses `PERMISSIONS` (colon-delimited
`application:resource:operation`); Kessel uses the matching `KESSEL_RELATIONS`.

| Capability | `PERMISSIONS` (RBAC v1) | `KESSEL_RELATIONS` (Kessel) |
|------------|-------------------------|-----------------------------|
| Export | `advisor:exports:read` | `advisor_exports_view` |
| Disable recommendation | `advisor:disable-recommendations:write` | `advisor_disable_recommendations_edit` |
| View recommendations | `advisor:recommendation-results:read` | `advisor_recommendation_results_view_assigned` |

**Kessel API base path**: `KESSEL_API_BASE_URL = '/api/kessel/v1beta2'` (passed as
`apiPath` to `AccessCheck.Provider`).

**Schema source of truth**: The `KESSEL_RELATIONS` values mirror the `v2_perm`
entries in Advisor's Kessel schema, which maps each v1 permission to its v2
relation:
[`configs/prod/schemas/src/advisor.ksl`](https://github.com/RedHatInsights/rbac-config/blob/master/configs/prod/schemas/src/advisor.ksl)
in `RedHatInsights/rbac-config`. Keep this table in sync with that file when
relations change.

## API Endpoints

| Purpose | Method & path |
|---------|---------------|
| RBAC v1 access list | `GET /api/rbac/v1/access/?application=advisor&limit=1000` |
| Default workspace (Kessel resource id) | `GET /api/rbac/v2/workspaces/?type=default&with_ancestry=true` |
| Kessel bulk self-access check | `POST /api/kessel/v1beta2/checkselfbulk` |

- RBAC v1 is reached through Chrome's `getUserPermissions('advisor')`
  (`useRbac` in `src/Utilities/Hooks.js`).
- `useDefaultWorkspace` (`src/Utilities/useDefaultWorkspace.js`) calls
  `fetchDefaultWorkspace` from `@project-kessel/react-kessel-access-check` to
  resolve the workspace id used as the Kessel resource id. The result is cached
  at module scope so it is fetched once per page load.
- `useKesselPermissions` (`src/Utilities/usePermissionCheck.js`) runs a single
  bulk `useSelfAccessCheck` for all three relations against that workspace
  (`resourceType: 'workspace'`, `reporter: { type: 'rbac' }`). Requests are sent
  under the `KESSEL_API_BASE_URL` configured on `AccessCheck.Provider`.

## Components with Feature Flag Support

### App.js (Main Application)

```javascript
const AppWithContextProviders = () => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return (
      <Bullseye>
        <Spinner size="xl" />
      </Bullseye>
    );
  }

  return isKesselEnabled ? <AppWithKesselContext /> : <AppWithRbacV1Context />;
};
```

**Critical**: Waits for `flagsReady` before rendering either context to prevent race condition where RBAC v1 is called during flag loading phase.

### SystemDetail.js (Federated Module)

```javascript
const SystemDetail = (props) => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return <Spinner size="lg" />;
  }

  return isKesselEnabled ? (
    <SystemDetailWithKessel {...props} />
  ) : (
    <SystemDetailWithRbacV1 {...props} />
  );
};
```

**Note**: SystemDetailWrapped.js (IOP environment) only uses RBAC v1 since IOP doesn't support Kessel.

## Testing

### Unit Tests

Mock both hooks and feature flags:

```javascript
import { useFeatureFlag, useHccEnvironmentContext } from './Utilities/Hooks';
import { useKesselEnvironmentContext } from './Utilities/useKesselEnvironmentContext';
import { useFlagsStatus } from '@unleash/proxy-client-react';

jest.mock('./Utilities/Hooks');
jest.mock('./Utilities/useKesselEnvironmentContext');
jest.mock('@unleash/proxy-client-react');

beforeEach(() => {
  useFlagsStatus.mockReturnValue({ flagsReady: true });
  useFeatureFlag.mockReturnValue(false);
  useHccEnvironmentContext.mockReturnValue(mockContext);
  useKesselEnvironmentContext.mockReturnValue(mockContext);
});

it('uses RBAC v1 when Kessel flag is disabled', () => {
  useFeatureFlag.mockReturnValue(false);
  render(<MyComponent />);
  expect(useHccEnvironmentContext).toHaveBeenCalled();
  expect(useKesselEnvironmentContext).not.toHaveBeenCalled();
});

it('uses Kessel when Kessel flag is enabled', () => {
  useFeatureFlag.mockReturnValue(true);
  render(<MyComponent />);
  expect(useKesselEnvironmentContext).toHaveBeenCalled();
  expect(useHccEnvironmentContext).not.toHaveBeenCalled();
});

it('waits for flags to be ready', () => {
  useFlagsStatus.mockReturnValue({ flagsReady: false });
  render(<MyComponent />);
  expect(useHccEnvironmentContext).not.toHaveBeenCalled();
  expect(useKesselEnvironmentContext).not.toHaveBeenCalled();
});
```

### Integration Tests

Verify no RBAC v1 calls when Kessel is enabled:

1. Enable feature flag in Unleash
2. Navigate to app
3. Open browser DevTools → Network
4. Filter for `/api/rbac/v1/access/?application=advisor`
5. **Expected**: No requests (only Kessel API calls)
6. **Unexpected**: Any RBAC v1 calls indicate a bug

## Migration Checklist

When adding Kessel support to a new component:

- [ ] Add feature flag check: `useFeatureFlag('advisor.kessel_enabled')`
- [ ] Wait for flags: `useFlagsStatus().flagsReady`
- [ ] Create two wrapper components (RbacV1 and Kessel variants)
- [ ] Use appropriate environment context hook in each wrapper
- [ ] Add unit tests for both modes
- [ ] Add test for flag loading state
- [ ] Verify no RBAC v1 calls in integration testing

## Common Pitfalls

### Race Condition During Flag Loading

**Problem**: `useFeatureFlag` returns `false` while Unleash loads flags, causing brief RBAC v1 call before switching to Kessel.

**Solution**: Always check `flagsReady` before rendering either context:

```javascript
const { flagsReady } = useFlagsStatus();
if (!flagsReady) {
  return null;
}
```

### Missing Flag Status Check

**Problem**: Component renders immediately, calling RBAC v1 hooks before flag determination.

**Solution**: Import and use `useFlagsStatus` alongside `useFeatureFlag`.

### IOP Environment Confusion

**Problem**: Trying to use Kessel in IOP-specific components.

**Solution**: IOP environment doesn't support Kessel. Keep IOP components (like SystemDetailWrapped.js) using RBAC v1 only.

## Debugging

Enable verbose logging during development:

```javascript
const { flagsReady } = useFlagsStatus();
const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');
console.log('flagsReady:', flagsReady, 'isKesselEnabled:', isKesselEnabled);
```

Check network requests:
- **RBAC v1**: Look for `GET /api/rbac/v1/access/?application=advisor`
- **Kessel**: Look for requests to Kessel API endpoints

## Files Reference

**Environment Contexts**:
- `src/Utilities/Hooks.js` - RBAC v1 hooks (`useRbac`, `useHccEnvironmentContext`, `useIopEnvironmentContext`)
- `src/Utilities/useKesselEnvironmentContext.js` - Kessel hook (`useKesselEnvironmentContext`)
- `src/Utilities/usePermissionCheck.js` - Permission hooks (`useRbacV1Permissions`, `useKesselPermissions`)

**App Entry Points**:
- `src/App.js` - Main app with feature flag support
- `src/Modules/SystemDetail.js` - Federated module with feature flag support
- `src/Modules/SystemDetailWrapped.js` - IOP federated module (RBAC v1 only)

**Tests**:
- `src/App.test.js` - App component tests with both permission modes
- `src/Modules/SystemDetail.test.js` - SystemDetail tests with both modes

**Constants**:
- `src/AppConstants.js` - Permission definitions, environment configs
