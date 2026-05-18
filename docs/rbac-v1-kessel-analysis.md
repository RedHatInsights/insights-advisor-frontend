# RBAC v1 Calls with Kessel Feature Flag Enabled - Analysis

**Date**: 2026-04-29  
**Issue**: Advisor app making RBAC v1 calls even when `advisor.kessel_enabled` feature flag is enabled

---

## Executive Summary

The Advisor frontend has a **critical bug** where RBAC v1 calls can still be made even when the Kessel feature flag is enabled. The root cause is **inconsistent context provider usage** in the SystemDetail federated module.

**Severity**: HIGH - This bypasses Kessel permissions and uses legacy RBAC v1, potentially causing permission mismatches.

---

## Root Cause: SystemDetail Module

### Location
`src/Modules/SystemDetail.js` (Line 19)

### Problem
The SystemDetail module **always** uses `useHccEnvironmentContext()` (RBAC v1) regardless of feature flag state:

```javascript
// src/Modules/SystemDetail.js
const SystemDetail = ({ ... }) => {
  const envContext = useHccEnvironmentContext();  // ❌ ALWAYS RBAC v1
  return (
    <EnvironmentContext.Provider value={envContext}>
      <SystemAdvisor {...props} IopRemediationModal={IopRemediationModal} />
    </EnvironmentContext.Provider>
  );
};
```

### Why This Happens
The SystemDetail module is a **federated module entry point** that creates its own context provider. It does not respect the parent app's feature flag decision made in `App.js`.

### Expected Behavior
Should follow the same pattern as `App.js`:

```javascript
// App.js - CORRECT pattern
const AppWithContextProviders = () => {
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');
  return isKesselEnabled ? <AppWithKesselContext /> : <AppWithRbacV1Context />;
};
```

---

## Identified RBAC v1 Call Paths

### 1. SystemDetail Module (CONFIRMED BUG)

**Path**: Federated module → `SystemDetail.js` → `SystemAdvisor.js` → Permission checks

**Impact**: HIGH
- All system detail page permission checks use RBAC v1
- Affects: export, disable recommendation, view recommendations permissions
- Occurs even when `advisor.kessel_enabled = true`

**RBAC v1 Call Chain**:
```text
SystemDetail.js (line 19)
  ↓
useHccEnvironmentContext()
  ↓
useRbac([PERMISSIONS.export, PERMISSIONS.disableRec, PERMISSIONS.viewRecs])
  ↓
chrome.getUserPermissions('advisor')  ← RBAC v1 API call
```

**Files Affected**:
- `src/Modules/SystemDetail.js`
- `src/SmartComponents/SystemAdvisor/SystemAdvisor.js`
- Any component using `envContext` from SystemDetail

---

### 2. InventoryTable Component (POTENTIAL)

**Component**: `@redhat-cloud-services/frontend-components/Inventory` (InventoryTable)

**Status**: NEEDS VERIFICATION

**Analysis**: Based on insights-inventory-frontend repo investigation:
- The inventory frontend repo has `ActionWithRBAC.js` component
- It uses `useConditionalRBAC` hook for permission checks
- **However**: No evidence found of Kessel integration in inventory frontend yet
- The hook may make RBAC v1 calls internally

**RBAC Call Path (Hypothetical)**:
```text
InventoryTable (from frontend-components package)
  ↓
ActionWithRBAC component (for row actions)
  ↓
useConditionalRBAC hook
  ↓
chrome.getUserPermissions('inventory')  ← RBAC v1 API call (UNCONFIRMED)
```

**Used In Advisor**:
- `src/PresentationalComponents/Inventory/Inventory.js` (line 529)
- `src/PresentationalComponents/SystemsTable/SystemsTable.js` (line ~200+)

**Recommendation**: 
1. Check `@redhat-cloud-services/frontend-components` version 7.4.1 source code
2. Verify if InventoryTable makes independent RBAC calls
3. Check if it respects parent app's permission context

---

### 3. IOPInventoryTable Component (POTENTIAL)

**Component**: Federated module from `inventory` scope - `./IOPInventoryTable`

**Status**: NEEDS VERIFICATION

**Analysis**:
- Used when `envContext.loadChromeless = true`
- Loaded as federated module from inventory app
- Unknown if it makes its own RBAC v1 calls
- Inventory app doesn't appear to have Kessel integration yet (based on repo search)

**Used In**:
- `src/PresentationalComponents/Inventory/Inventory.js` (line 493-519)

**RBAC Call Path (Hypothetical)**:
```text
AsyncComponent (scope: inventory, module: ./IOPInventoryTable)
  ↓
IOPInventoryTable component (from inventory federated module)
  ↓
Potentially makes own RBAC v1 calls (UNCONFIRMED)
```

**Recommendation**:
1. Check insights-inventory-frontend federated module exports
2. Verify if IOPInventoryTable makes permission checks
3. Confirm if it uses parent context or makes independent calls

---

## Main App Flow (Correct Implementation)

### App.js - Context Provider Selection

**File**: `src/App.js`

**Flow** (CORRECT):
```javascript
AppWithHccContext
  ↓
AccessCheck.Provider (Kessel provider wrapper)
  ↓
AppWithContextProviders
  ↓
isKesselEnabled = useFeatureFlag('advisor.kessel_enabled')
  ↓
  ├─ TRUE  → AppWithKesselContext → useKesselEnvironmentContext()
  │                                    ↓
  │                                  useKesselPermissions()
  │                                    ↓
  │                                  useSelfAccessCheck() ← KESSEL API
  │
  └─ FALSE → AppWithRbacV1Context → useHccEnvironmentContext()
                                       ↓
                                     useRbac()
                                       ↓
                                     chrome.getUserPermissions() ← RBAC v1 API
```

**This works correctly** for the main app routes, but **NOT for SystemDetail module**.

---

## Permission Check Implementations

### RBAC v1 (useRbacV1Permissions)

**File**: `src/Utilities/usePermissionCheck.js` (lines 7-15)

```javascript
export const useRbacV1Permissions = () => {
  const [[canExport, canDisableRec, canViewRecs], isLoading] = useRbac([
    PERMISSIONS.export,        // 'advisor:*:export'
    PERMISSIONS.disableRec,    // 'advisor:*:disable'
    PERMISSIONS.viewRecs,      // 'advisor:*:read'
  ]);
  return [canExport, canDisableRec, canViewRecs, isLoading];
};
```

**API Call**: 
```javascript
chrome.getUserPermissions('advisor')  // RBAC v1 endpoint
```

---

### Kessel (useKesselPermissions)

**File**: `src/Utilities/usePermissionCheck.js` (lines 17-52)

```javascript
export const useKesselPermissions = () => {
  const { workspaceId, isLoading: workspaceLoading } = useDefaultWorkspace();
  
  const params = getKesselAccessCheckParams({
    requiredPermissions: [
      KESSEL_RELATIONS.export,      // 'advisor_export'
      KESSEL_RELATIONS.disableRec,  // 'advisor_disable'
      KESSEL_RELATIONS.viewRecs,    // 'advisor_view'
    ],
    resourceIdOrIds: workspaceId,
    options: {
      resourceType: 'workspace',
      reporter: { type: 'rbac' },  // Note: Still reports to RBAC for compatibility
    },
  });
  
  const { data, loading, error } = useSelfAccessCheck(params);  // Kessel API
  // ... process permissions
};
```

**API Call**:
```javascript
useSelfAccessCheck()  // Kessel check-access endpoint
```

**Note**: The `reporter: { type: 'rbac' }` option tells Kessel to report access checks to RBAC for auditing, but permissions are evaluated via Kessel.

---

## Components Using EnvironmentContext

**Count**: 15 files use environment context for permission checks

**Critical Files** (68 permission check usages across codebase):
1. `src/App.js` - App-level permission gate ✅ CORRECT
2. `src/Modules/SystemDetail.js` - Federated module ❌ BUG
3. `src/Modules/SystemDetailWrapped.js` - Wrapper for SystemDetail
4. `src/PresentationalComponents/Inventory/Inventory.js` - Remediation/disable buttons
5. `src/PresentationalComponents/SystemsTable/SystemsTable.js` - Systems table
6. `src/PresentationalComponents/Export/SystemsPdf.js` - Export functionality
7. `src/PresentationalComponents/ExecutiveReport/Download.js` - Report download
8. `src/Utilities/DownloadPlaybookButton.js` - Playbook download

---

## Potential RBAC v1 Call Scenarios

### Scenario 1: User Opens System Detail Page (CONFIRMED)

**Steps**:
1. Kessel flag enabled globally
2. User navigates to `/systems/{inventory_id}`
3. SystemDetail federated module loads
4. `useHccEnvironmentContext()` is called
5. RBAC v1 `getUserPermissions('advisor')` API call made
6. Permissions evaluated via RBAC v1 instead of Kessel

**Impact**: User might have different permissions in system detail vs main app

---

### Scenario 2: InventoryTable Row Actions (NEEDS VERIFICATION)

**Steps**:
1. Kessel flag enabled
2. User views Inventory table with row actions
3. InventoryTable component renders ActionWithRBAC
4. `useConditionalRBAC` hook called (from inventory frontend)
5. **Unknown**: Does it make independent RBAC v1 call?

**Impact**: Potentially inconsistent permission checks

---

### Scenario 3: IOPInventoryTable Federated Module (NEEDS VERIFICATION)

**Steps**:
1. Kessel flag enabled
2. User in IOP environment (`envContext.loadChromeless = true`)
3. AsyncComponent loads `inventory/IOPInventoryTable`
4. **Unknown**: Does federated module make own RBAC calls?

**Impact**: Potentially bypasses Kessel entirely

---

## Comparison with insights-inventory-frontend

### Findings from Repository Investigation

**Repository**: https://github.com/RedHatInsights/insights-inventory-frontend

**Key Files Reviewed**:
- `src/components/InventoryTable/ActionWithRBAC.js`
- `src/components/InventoryTable/InventoryTable.js`
- `src/components/InventoryTable/hooks/` directory

**RBAC Implementation**:
```javascript
// ActionWithRBAC.js pattern
const { hasAccess: enabled } = override !== undefined
  ? { hasAccess: override }
  : useConditionalRBAC(requiredPermissions, checkAll, !ignoreResourceDefinitions);
```

**Kessel Integration Status**:
- ❌ No `isKesselEnabled` references found
- ❌ No `@project-kessel` imports found
- ❌ No `useKesselPermissions` hook found
- ❌ No feature flag checks for Kessel found

**Conclusion**: The insights-inventory-frontend repository **does not appear to have Kessel integration yet** as of the latest check. This means:
1. InventoryTable likely still uses RBAC v1 internally
2. IOPInventoryTable probably also uses RBAC v1
3. These components may not respect parent app's Kessel context

---

## Recommendations

### Priority 1: Fix SystemDetail Module (CRITICAL)

**File**: `src/Modules/SystemDetail.js`

**Current Code**:
```javascript
const SystemDetail = ({ ... }) => {
  const envContext = useHccEnvironmentContext();  // ❌ Always RBAC v1
  // ...
};
```

**Recommended Fix**:
```javascript
import { useFeatureFlag } from '../Utilities/Hooks';
import { useHccEnvironmentContext } from '../Utilities/Hooks';
import { useKesselEnvironmentContext } from '../Utilities/useKesselEnvironmentContext';

const SystemDetail = ({ ... }) => {
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');
  const rbacContext = useHccEnvironmentContext();
  const kesselContext = useKesselEnvironmentContext();
  const envContext = isKesselEnabled ? kesselContext : rbacContext;
  
  return (
    <EnvironmentContext.Provider value={envContext}>
      <SystemAdvisor {...props} IopRemediationModal={IopRemediationModal} />
    </EnvironmentContext.Provider>
  );
};
```

**Alternative Fix** (cleaner):
```javascript
const SystemDetailWithRbacV1Context = (props) => {
  const envContext = useHccEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

const SystemDetailWithKesselContext = (props) => {
  const envContext = useKesselEnvironmentContext();
  return <SystemDetailContent envContext={envContext} {...props} />;
};

const SystemDetail = (props) => {
  const isKesselEnabled = useFeatureFlag('advisor.kessel_enabled');
  return isKesselEnabled 
    ? <SystemDetailWithKesselContext {...props} />
    : <SystemDetailWithRbacV1Context {...props} />;
};
```

---

### Priority 2: Verify InventoryTable RBAC Behavior

**Action Items**:
1. Inspect `@redhat-cloud-services/frontend-components@7.4.1` source code
2. Check if `InventoryTable` component makes independent permission calls
3. Verify if `ActionWithRBAC` from inventory frontend is used
4. Test with network monitoring to confirm API calls

**Testing Approach**:
```bash
# Monitor network traffic when using inventory table
1. Enable Kessel flag
2. Open browser dev tools → Network tab
3. Filter for: /api/rbac/v1/access
4. Navigate to inventory table page
5. Check if RBAC v1 calls are made
```

---

### Priority 3: Investigate IOPInventoryTable

**Action Items**:
1. Check insights-inventory-frontend federated module exports
2. Verify if `IOPInventoryTable` module exists
3. Review its permission checking implementation
4. Test in IOP environment with Kessel enabled

---

### Priority 4: Add Monitoring/Logging

**Recommendation**: Add telemetry to track which permission system is being used

```javascript
// Add to useHccEnvironmentContext and useKesselEnvironmentContext
useEffect(() => {
  console.warn('[RBAC] Using RBAC v1 permissions', {
    location: window.location.pathname,
    timestamp: new Date().toISOString(),
  });
}, []);
```

This will help identify unexpected RBAC v1 calls in production.

---

## Testing Checklist

### Manual Testing

- [ ] **SystemDetail with Kessel ON**
  - [ ] Enable `advisor.kessel_enabled` feature flag
  - [ ] Navigate to `/systems/{id}`
  - [ ] Open network tab, filter for `/api/rbac/v1/access`
  - [ ] Verify NO RBAC v1 calls are made
  - [ ] Verify Kessel check-access calls ARE made
  
- [ ] **Inventory Table with Kessel ON**
  - [ ] Enable `advisor.kessel_enabled`
  - [ ] Navigate to recommendations inventory
  - [ ] Check network tab for RBAC v1 calls
  - [ ] Test row actions (if any)
  
- [ ] **IOP Environment with Kessel ON**
  - [ ] Set `loadChromeless: true`
  - [ ] Load IOPInventoryTable
  - [ ] Monitor network for RBAC v1 calls

### Automated Testing

- [ ] Add integration test for SystemDetail context provider
- [ ] Test feature flag switching between RBAC v1/Kessel
- [ ] Mock API calls to verify correct endpoint usage

---

## Summary of Findings

| Component | RBAC v1 Risk | Status | Priority |
|-----------|--------------|--------|----------|
| SystemDetail Module | ✅ CONFIRMED | Always uses RBAC v1 | P0 - CRITICAL |
| InventoryTable | ⚠️ LIKELY | Needs verification | P1 - HIGH |
| IOPInventoryTable | ⚠️ POSSIBLE | Needs investigation | P2 - MEDIUM |
| Main App Routes | ✅ CORRECT | Working as expected | - |

---

## Related Files

**Core Permission Files**:
- `src/App.js` - Context provider selection (CORRECT)
- `src/Modules/SystemDetail.js` - Federated module (BUG)
- `src/Utilities/usePermissionCheck.js` - Permission hooks
- `src/Utilities/Hooks.js` - RBAC v1 useRbac hook
- `src/Utilities/useKesselEnvironmentContext.js` - Kessel context

**Component Files Using Permissions**:
- `src/PresentationalComponents/Inventory/Inventory.js`
- `src/PresentationalComponents/SystemsTable/SystemsTable.js`
- `src/SmartComponents/SystemAdvisor/SystemAdvisor.js`

**External Dependencies**:
- `@redhat-cloud-services/frontend-components@7.4.1` - InventoryTable source
- `insights-inventory-frontend` - Federated module source

---

**Document Version**: 1.0  
**Last Updated**: 2026-04-29  
**Author**: Development Team
