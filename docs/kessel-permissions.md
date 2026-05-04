# Kessel Permissions Migration

## Overview

Advisor supports two permission systems controlled by the `advisor.kessel_enabled` feature flag:

- **RBAC v1**: Legacy role-based access control via `/api/rbac/v1/access/`
- **Kessel**: New unified permissions system via Kessel API

## Feature Flag

**Flag name**: `advisor.kessel_enabled`  
**Managed by**: Unleash  
**Default**: `false` (uses RBAC v1)

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

## Components with Feature Flag Support

### App.js (Main Application)

```javascript
const AppWithContextProviders = () => {
  const { flagsReady } = useFlagsStatus();
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');

  if (!flagsReady) {
    return null;
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
