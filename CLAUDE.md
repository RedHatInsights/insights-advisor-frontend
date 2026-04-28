# Insights Advisor Frontend - Codebase Documentation

This document provides architectural guidance and implementation details for the Insights Advisor Frontend application.

---

## Remediation Button Architecture

The remediation button allows users to create Ansible playbooks to fix issues identified by Advisor. The implementation varies based on context and feature flags.

### Table of Contents
- [Overview](#overview)
- [Feature Flags](#feature-flags)
- [Implementation by Page](#implementation-by-page)
  - [Recommendation Details Page (Single Rule)](#1-recommendation-details-page-single-rule)
  - [Pathway Details Page (Multiple Rules)](#2-pathway-details-page-multiple-rules)
  - [System Details Page (System-Specific Recommendations)](#3-system-details-page-system-specific-recommendations)
- [Key Components](#key-components)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Common Pitfalls](#common-pitfalls)

---

## Overview

There are **two different remediation button implementations** in the codebase:

| Implementation | When Used | Component | Data Source |
|---------------|-----------|-----------|-------------|
| **IOP Remediation Modal** | Single rule contexts when feature flag is ON | `IopRemediationModal.WrappedComponent` | `iopResolutionsMapper()` API + `/resolutions` endpoint |
| **Standard Remediation Button** | All other cases (default) | `RemediationButton` from `@redhat-cloud-services/frontend-components-remediations` | `remediationDataProvider()` or `processRemediation()` |

### Why Two Implementations?

- **IOP (Insights Orchestration Platform)**: Newer remediation system with enhanced resolution selection capabilities
- **Standard**: Traditional remediation system, still default for pathways and when feature flag is OFF
- **Feature Flag**: `changeRemediationButtonForIop` controls which implementation is used in single-rule contexts

---

## Feature Flags

### `changeRemediationButtonForIop`

**Location**: `src/AppConstants.js` (line 540) and `src/Utilities/useKesselEnvironmentContext.js`

```javascript
// Default in AppConstants.js
changeRemediationButtonForIop: true

// Kessel environments override to false
changeRemediationButtonForIop: false
```
**Effect**:
- `true` → `IopRemediationModal` component is passed to pages, enables IOP flow
- `false` → `IopRemediationModal` is undefined, uses standard `RemediationButton`

---

## Implementation by Page

### 1. Recommendation Details Page (Single Rule)

**Route**: `/recommendations/:rule_id`

**File**: `src/SmartComponents/Recs/Details.js` → `HybridInventory` → `RecommendationSystems.js` → `Inventory.js`

#### Flow Diagram

```text
User on Recommendation Details
        ↓
[HybridInventory component]
        ↓
ConventionalSystems tab (RecommendationSystems.js)
        ↓
<Inventory 
  rule={rule}
  IopRemediationModal={IopRemediationModal} ← Passed from feature flag
  pathway={undefined} />
```
#### Component Props

```javascript
// src/SmartComponents/HybridInventoryTabs/ConventionalSystems/RecommendationSystems.js
<Inventory
  rule={rule}                                    // Single rule object
  IopRemediationModal={props.IopRemediationModal} // Conditional: from feature flag
  pathway={undefined}                            // NOT a pathway
  selectedTags={selectedTags}
  workloads={workloads}
  axios={axios}
/>
```
#### Remediation Button Logic (Inventory.js:421)

```text
{IopRemediationModal ? (
  // IOP FLOW (when feature flag ON)
  <IopRemediationModal.WrappedComponent
    selectedIds={selectedIds}
    iopData={resolutions}  // ← From useEffect with iopResolutionsMapper
    isDisabled={isRemediationButtonDisabled}
  />
) : (
  // STANDARD FLOW (when feature flag OFF)
  <RemediationButton
    isDisabled={isRemediationButtonDisabled}
    dataProvider={remediationDataProvider}  // ← Inline function
  >
    Plan remediation
  </RemediationButton>
)}
```
#### Data Fetching

**IOP Flow** (useEffect on lines 399-416):
```javascript
useEffect(() => {
  if (!IopRemediationModal || pathway) {
    return;  // Guard: Skip if no modal OR in pathway mode
  }
  
  if (!selectedIds?.length) {
    setResolutions([]);
    return;  // Guard: Clear data if no selection
  }
  
  // Fetch resolutions from IOP API
  const fetchAndSetData = async () => {
    const resolutionsData = await iopResolutionsMapper(
      entities,
      rule,        // Single rule
      selectedIds, // Selected systems
    );
    setResolutions(resolutionsData);
  };
  fetchAndSetData();
}, [selectedIds, entities, rule, IopRemediationModal, pathway]);
```
**What `iopResolutionsMapper` does** (helpers.js:259):
1. Makes POST request to `/insights_cloud/api/remediations/v1/resolutions`
2. Sends issue: `advisor:${rule.rule_id}`
3. Returns array of resolution options for each selected system
4. Format: `[{ hostid, host_name, resolutions, rulename, description, rebootable }, ...]`

**Standard Flow**:
```javascript
const remediationDataProvider = async () => {
  // For single rule (not pathway)
  return {
    issues: [{
      id: `advisor:${rule.rule_id}`,
      description: rule.description,
    }],
    systems: selectedIds,  // All selected system IDs
  };
};
```
#### Button Enabled/Disabled Logic

**Function**: `checkRemediationButtonStatus()` (lines 193-231)

```javascript
// For single rules (NOT pathway):
if (rulesPlaybookCount > 0 && selectedIds?.length > 0) {
  setIsRemediationButtonDisabled(false);
} else {
  setIsRemediationButtonDisabled(true);
}
```
**Playbook count fetched on mount** (`rulesCheck()` lines 154-161):
```javascript
const rulesCheck = async () => {
  if (rulesPlaybookCount < 0) {
    const associatedRuleDetails = (
      await axios.get(
        `${RULES_FETCH_URL}${rule.rule_id}/`,
        { params: { name: filters.name } }
      )
    )?.playbook_count;  // ← Note: axios response auto-unwrapped by interceptor
    setRulesPlaybookCount(associatedRuleDetails);
  }
};
```
---

### 2. Pathway Details Page (Multiple Rules)

**Route**: `/pathways/:pathway_slug`

**File**: `src/SmartComponents/Recs/DetailsPathways.js` → `HybridInventory` → `PathwaySystems.js` → `Inventory.js`

#### Flow Diagram

```text
User on Pathway Details
        ↓
[HybridInventory component]
        ↓
PathwaySystemsTab (PathwaySystems.js)
        ↓
<Inventory 
  pathway={pathway}
  rule={undefined}
  IopRemediationModal={undefined} ← Never passed for pathways
/>
```
#### Component Props

```javascript
// src/SmartComponents/HybridInventoryTabs/ConventionalSystems/PathwaySystems.js
<Inventory
  pathway={pathway}           // Pathway object with slug
  selectedTags={selectedTags}
  workloads={workloads}
  axios={axios}
  // NOTE: No rule prop
  // NOTE: No IopRemediationModal prop
/>
```
#### Remediation Button Logic (Inventory.js:421)

```javascript
{IopRemediationModal ? (
  // NEVER RENDERED - IopRemediationModal is undefined for pathways
  <IopRemediationModal.WrappedComponent ... />
) : (
  // ALWAYS RENDERED FOR PATHWAYS
  <RemediationButton
    isDisabled={isRemediationButtonDisabled}
    dataProvider={remediationDataProvider}
  >
    Plan remediation
  </RemediationButton>
)}
```
#### Data Fetching

**Pathway data fetched ONCE on mount** (`pathwayCheck()` lines 168-185):

```javascript
const pathwayCheck = async () => {
  if (!hasPathwayDetails) {
    if (pathway) {
      // Fetch all rules in pathway
      const rulesRes = await axios.get(
        `${BASE_URL}/pathway/${pathway.slug}/rules/`
      );
      
      // Fetch system-rule mapping
      const reportsRes = await axios.get(
        `${BASE_URL}/pathway/${pathway.slug}/reports/`
      );
      
      const pathwayRulesFromApi = rulesRes?.data ?? [];
      const pathwayReportRules = reportsRes?.data?.rules ?? {};
      
      setHasPathwayDetails(true);
      setPathwayReportList(pathwayReportRules);  // { rule_id: [system_ids] }
      setPathwayRulesList(pathwayRulesFromApi);  // [{ rule_id, description, ... }]
    }
  }
};
```
**IOP effect DOES NOT RUN** (lines 399-416):
```javascript
useEffect(() => {
  if (!IopRemediationModal || pathway) {
    return;  // ← EXITS HERE for pathways
  }
  // ... rest never executes
}, [selectedIds, entities, rule, IopRemediationModal, pathway]);
```
**Why the guard?**
- Prevents calling `iopResolutionsMapper()` which expects a single `rule` (undefined in pathway mode)
- Pathway remediation uses different data structure (multiple rules per system)

**Remediation data provider for pathways**:

```javascript
const remediationDataProvider = async () => {
  if (pathway) {
    const pathwayRules = pathwayRulesList;
    const systems = pathwayReportList;  // { rule_id: [system_ids] }

    let issues = [];
    pathwayRules.forEach((rec) => {
      const systemsForRule = systems[rec.rule_id];
      if (!Array.isArray(systemsForRule)) return;
      
      // Filter to only selected systems
      const filteredSystems = systemsForRule.filter((system) =>
        selectedIds.includes(system)
      );

      if (filteredSystems.length) {
        issues.push({
          id: `advisor:${rec.rule_id}`,
          description: rec.description,
          systems: filteredSystems,  // ← Systems per rule
        });
      }
    });

    return { issues };  // Array of issues, each with own systems list
  }
};
```
#### Button Enabled/Disabled Logic

**For pathways** (lines 198-224):
```javascript
// For each selected system...
for (let i = 0; i < selectedIds?.length; i++) {
  let system = selectedIds[i];
  
  // Check all rules to see if any have playbooks for this system
  ruleKeys.forEach((ruleKey) => {
    const systemsForRule = pathwayReportList[ruleKey];
    
    // Skip if this rule doesn't affect this system
    if (!Array.isArray(systemsForRule) || !systemsForRule.includes(system)) {
      return;
    }
    
    // Find the rule details
    const item = pathwayRulesList.find(
      (report) => report.rule_id === ruleKey
    );
    
    // Check if it has a playbook
    if (item?.resolution_set?.[0]?.has_playbook) {
      playbookFound = true;
      setIsRemediationButtonDisabled(false);
    }
  });
}

if (!playbookFound) {
  setIsRemediationButtonDisabled(true);
}
```
**Logic**: Button enabled if ANY selected system has ANY rule with a playbook

---

### 3. System Details Page (System-Specific Recommendations)

**Route**: `/systems/:inventory_id`

**File**: `src/Modules/SystemDetail.js` → `SystemAdvisor.js`

#### Flow Diagram

```text
User on System Details
        ↓
SystemDetail.js (Module entry point)
        ↓
<SystemAdvisor 
  IopRemediationModal={IopRemediationModal} ← From props
  inventoryId={inventoryId} />
```
#### Component Props

```javascript
// src/Modules/SystemDetail.js
const SystemDetail = ({
  IopRemediationModal,  // ← Passed from federated module
  ...props
}) => {
  return (
    <SystemAdvisor {...props} IopRemediationModal={IopRemediationModal} />
  );
};
```
#### Remediation Button Logic (SystemAdvisor.js:146)

```javascript
const actions = systemProfile?.host_type !== 'edge' ? [
  <Flex key="inventory-actions">
    {IopRemediationModal ? (
      // IOP FLOW
      <IopRemediationModal.WrappedComponent
        selectedIds={selectedAnsibleRules}  // ← Array of rule objects
        iopData={resolutions}               // ← From fetchResolutionsData
        isDisabled={selectedAnsibleRules.length === 0}
      />
    ) : (
      // STANDARD FLOW
      <RemediationButton
        isDisabled={selectedAnsibleRules.length === 0}
        dataProvider={() => processRemediation(selectedAnsibleRules)}
        onRemediationCreated={(result) => onRemediationCreated(result)}
      >
        Plan remediation
      </RemediationButton>
    )}
  </Flex>
] : [];
```
#### Selected Rules (SystemAdvisor.js:80)

```javascript
const selectedAnsibleRules = useMemo(() => {
  return rows
    .filter((row) => row.selected)  // Only checked rows
    .map((row) => ({
      rule: row.rule,           // Rule object
      resolution: row.resolution, // Resolution object
    }))
    .filter((row) => row.resolution?.has_playbook);  // Only rules with playbooks
}, [rows]);
```
#### Data Fetching

**IOP Flow** (useEffect on lines 91-104):
```javascript
useEffect(() => {
  if (selectedAnsibleRules.length > 0) {
    const dataFetch = async () => {
      const resolutionsData = await fetchResolutionsData(
        selectedAnsibleRules,
        inventoryId
      );
      setResolutions(resolutionsData);
    };
    dataFetch();
  }
}, [selectedAnsibleRules, inventoryId]);
```
**`fetchResolutionsData` function** (helpers.js):
```javascript
export const fetchResolutionsData = async (selectedRules, inventoryId) => {
  const issues = selectedRules.map((r) => `advisor:${r.rule.rule_id}`);
  
  const response = await fetch(
    '/insights_cloud/api/remediations/v1/resolutions',
    {
      method: 'POST',
      body: JSON.stringify({ issues }),
      headers: { 'content-type': 'application/json', ...getCsrfTokenHeader() },
    }
  );
  
  const data = await response.json();
  
  // Format for IOP modal
  return selectedRules.map((r) => {
    const ruleKey = `advisor:${r.rule.rule_id}`;
    return {
      hostid: inventoryId,
      host_name: 'Current System',
      resolutions: data[ruleKey]?.resolutions || [],
      rulename: r.rule.rule_id,
      description: r.rule.description,
      rebootable: r.rule.reboot_required,
    };
  });
};
```
**Standard Flow** (`useProcessRemediation` in SystemAdvisorAssets.js:104):
```javascript
export const useProcessRemediation = (inventoryId) =>
  useCallback(
    (selectedAnsibleRules) => {
      const playbookRows = selectedAnsibleRules.filter(
        (r) => r.resolution?.has_playbook
      );
      
      const issues = playbookRows.map((r) => ({
        id: `advisor:${r.rule.rule_id}`,
        description: r.rule.description,
      }));
      
      return issues.length 
        ? { issues, systems: [inventoryId] }  // All issues for one system
        : false;
    },
    [inventoryId]
  );
```
#### Button Enabled/Disabled Logic

**Simple**: Button disabled when `selectedAnsibleRules.length === 0`

The `selectedAnsibleRules` array is already filtered to only include rules with playbooks (see lines 80-92), so if the array has items, they're all remediable.

---

## Key Components

### `Inventory.js`

**Location**: `src/PresentationalComponents/Inventory/Inventory.js`

**Purpose**: Reusable inventory table component used in both recommendation and pathway details pages

**Key Props**:
- `rule` - Single rule object (for recommendation pages)
- `pathway` - Pathway object (for pathway pages)
- `IopRemediationModal` - Conditional modal component (from feature flag)
- `selectedTags`, `workloads` - Filters
- `axios` - Axios instance with platform interceptors

**Key State**:
- `selectedIds` - Array of selected system UUIDs
- `resolutions` - IOP resolution data (only for IOP modal)
- `rulesPlaybookCount` - Playbook count for single rule (-1 = not fetched, 0 = none, >0 = count)
- `pathwayRulesList` - All rules in pathway
- `pathwayReportList` - System-to-rules mapping `{ rule_id: [system_ids] }`
- `isRemediationButtonDisabled` - Button state

**Key Functions**:
- `rulesCheck()` - Fetches playbook count for single rule (mount)
- `pathwayCheck()` - Fetches pathway rules and reports (mount)
- `checkRemediationButtonStatus()` - Determines button enabled/disabled state
- `remediationDataProvider()` - Provides data to standard RemediationButton
- `iopResolutionsMapper()` - Fetches IOP resolution data (via useEffect)

---

### `SystemAdvisor.js`

**Location**: `src/SmartComponents/SystemAdvisor/SystemAdvisor.js`

**Purpose**: System details page showing all recommendations for a specific system

**Key Props**:
- `IopRemediationModal` - Conditional modal component
- `inventoryId` - System UUID (from route params)

**Key State**:
- `rows` - Table rows with recommendations
- `selectedAnsibleRules` - Derived from selected rows with playbooks
- `resolutions` - IOP resolution data

**Key Functions**:
- `processRemediation()` - Provides data to standard RemediationButton
- `fetchResolutionsData()` - Fetches IOP resolution data

---

### `iopResolutionsMapper()`

**Location**: `src/PresentationalComponents/Inventory/helpers.js:259`

**Purpose**: Fetch resolution options from IOP API for selected systems

**Parameters**:
- `entities` - Redux entities object with system rows
- `rule` - Single rule object
- `selectedIds` - Array of selected system UUIDs

**Returns**: 
```javascript
[
  {
    hostid: "system-uuid",
    host_name: "system-name",
    resolutions: [{ id: "fix-1", description: "...", ... }],
    rulename: "rule_id",
    description: "rule description",
    rebootable: true/false
  },
  // ... one per selected system
]
```
**API Call**:
```javascript
POST /insights_cloud/api/remediations/v1/resolutions
Body: { issues: ["advisor:RULE_ID"] }
```
**Guard**: Returns `[]` if `rule.rule_id` is missing (prevents errors in pathway mode)

---

### `remediationDataProvider()`

**Location**: `src/PresentationalComponents/Inventory/Inventory.js:242`

**Purpose**: Provide remediation data for standard RemediationButton

**Logic**:
```javascript
if (pathway) {
  // Multiple issues, each with their own systems list
  return {
    issues: [
      { id: "advisor:RULE_1", description: "...", systems: ["sys-1", "sys-2"] },
      { id: "advisor:RULE_2", description: "...", systems: ["sys-3"] },
    ]
  };
} else {
  // Single issue with all selected systems
  return {
    issues: [{ id: "advisor:RULE_ID", description: "..." }],
    systems: ["sys-1", "sys-2", "sys-3"]
  };
}
```
---

## Data Flow Diagrams

### IOP Flow (Single Rule, Feature Flag ON)

```text
1. Component Mount
   ↓
2. rulesCheck() - Fetch playbook count
   ↓
3. User selects systems
   ↓
4. useEffect triggers (selectedIds changed)
   ↓
5. iopResolutionsMapper(entities, rule, selectedIds)
   ↓
6. POST /api/remediations/v1/resolutions
   ↓
7. setResolutions(data)
   ↓
8. IopRemediationModal.WrappedComponent receives resolutions
   ↓
9. User clicks modal, selects resolution options
   ↓
10. Modal creates remediation plan
```
### Standard Flow (Single Rule, Feature Flag OFF)

```text
1. Component Mount
   ↓
2. rulesCheck() - Fetch playbook count
   ↓
3. User selects systems
   ↓
4. checkRemediationButtonStatus() - Enable/disable button
   ↓
5. User clicks "Plan remediation"
   ↓
6. remediationDataProvider() called
   ↓
7. Returns { issues: [...], systems: [...] }
   ↓
8. RemediationButton creates remediation plan
```
### Pathway Flow (Always Standard)

```text
1. Component Mount
   ↓
2. pathwayCheck() - Fetch pathway rules & reports ONCE
   ↓
3. setPathwayRulesList([...]) + setPathwayReportList({...})
   ↓
4. User selects systems
   ↓
5. checkRemediationButtonStatus() - Check if any rule has playbook
   ↓
6. User clicks "Plan remediation"
   ↓
7. remediationDataProvider() called
   ↓
8. Filters pathwayRulesList by selected systems
   ↓
9. Returns { issues: [{ id, description, systems: [...] }, ...] }
   ↓
10. RemediationButton creates remediation plan
```
### System Details IOP Flow

```text
1. Component Mount
   ↓
2. Fetch system recommendations
   ↓
3. User checks rule checkboxes
   ↓
4. selectedAnsibleRules derived (only rules with playbooks)
   ↓
5. useEffect triggers (selectedAnsibleRules changed)
   ↓
6. fetchResolutionsData(selectedAnsibleRules, inventoryId)
   ↓
7. POST /api/remediations/v1/resolutions (multiple issues)
   ↓
8. setResolutions(formattedData)
   ↓
9. IopRemediationModal.WrappedComponent receives resolutions
   ↓
10. User selects resolution options
   ↓
11. Modal creates remediation plan
```
---

## Common Pitfalls

### 1. Axios Response Structure

**Problem**: Assuming standard axios response structure `response.data`

**Reality**: The `useAxiosWithPlatformInterceptors` hook has a `responseDataInterceptor` that automatically unwraps `response.data`:

```javascript
// interceptors.js:102
function responseDataInterceptor(response) {
  if (response.data) {
    return response.data;  // ← Automatically unwraps
  }
  return response;
}
```
**Correct Usage**:
```javascript
const response = await axios.get(url);
const data = response?.playbook_count;  // ✅ Correct - already unwrapped

// NOT:
const data = response?.data?.playbook_count;  // ❌ Wrong - double unwrap
```
**Where this matters**:
- `rulesCheck()` in Inventory.js:158
- `pathwayCheck()` in Inventory.js:177-179

---

### 2. Pathway Guard in IOP useEffect

**Problem**: Calling `iopResolutionsMapper()` in pathway mode

**Issue**: 
- Pathway mode has no single `rule` prop
- `rule` is `undefined`
- `iopResolutionsMapper()` expects `rule.rule_id`
- Would cause: API call with undefined rule_id, returns empty array
- Modal would be enabled but with no data

**Solution**: Guard clause exits early for pathways

```javascript
useEffect(() => {
  if (!IopRemediationModal || pathway) {
    return;  // ← CRITICAL: Prevents error in pathway mode
  }
  // ... fetch resolutions
}, [selectedIds, entities, rule, IopRemediationModal, pathway]);
```
**Why the guard works**:
- Pathways never pass `IopRemediationModal` prop (always undefined)
- Even if they did, `pathway` guard prevents execution
- Pathways use `remediationDataProvider()` instead

---

### 3. Playbook Count Fallback

**Problem**: Using `?? 0` fallback when fetching playbook count

**Issue**:
```javascript
// WRONG:
const playbook_count = response?.playbook_count ?? 0;

// If API returns undefined (error/timeout):
// - Sets playbook_count to 0
// - Button thinks "no playbooks available"
// - Should actually show "not yet fetched" state
```
**Correct**:
```javascript
// RIGHT:
const playbook_count = response?.playbook_count;

// If API returns undefined:
// - playbook_count stays undefined
// - Can distinguish between "0 playbooks" vs "unknown"
```
**State meanings**:
- `-1` = Not yet fetched (initial state)
- `undefined` = Fetch failed
- `0` = No playbooks available
- `> 0` = Playbooks available

---

### 4. Early Returns in useEffect

**Why use early returns?**

```javascript
// ❌ BAD: Deep nesting
useEffect(() => {
  if (IopRemediationModal && !pathway) {
    if (selectedIds?.length) {
      fetchData();
    } else {
      clearData();
    }
  }
}, [...]);

// ✅ GOOD: Guard clauses
useEffect(() => {
  if (!IopRemediationModal || pathway) return;  // Skip wrong context
  if (!selectedIds?.length) {                   // Skip no selection
    setResolutions([]);
    return;
  }
  fetchData();  // Main logic at top level
}, [...]);
```
**Benefits**:
- Avoids deep nesting
- Makes conditions explicit
- Prevents unnecessary work
- Easier to read and maintain

---

### 5. Feature Flag Propagation

**Problem**: IopRemediationModal not being passed through component chain

**Chain**:
```text
App/Router
  ↓ (via federated module)
SystemDetail module (receives IopRemediationModal prop)
  ↓ (passes via props)
SystemAdvisor component
  ↓ (renders conditionally)
IopRemediationModal.WrappedComponent
```
**For Recommendation/Pathway pages**:
```text
App/Router
  ↓ (via federated module)
Details component (receives IopRemediationModal)
  ↓
HybridInventory
  ↓
RecommendationSystems (passes props.IopRemediationModal)
  ↓
Inventory component
```
**Key**: The `IopRemediationModal` component is passed from the **federated module host**, not defined in this app. Feature flag in host determines if it's passed.

---

## Testing Considerations

### Testing IOP Flow
1. Mock `IopRemediationModal` component
2. Mock `iopResolutionsMapper` API call
3. Test that useEffect calls mapper when:
   - Modal exists
   - Not in pathway mode
   - Systems are selected
4. Test that useEffect doesn't call mapper when:
   - Modal doesn't exist
   - In pathway mode
   - No systems selected

### Testing Pathway Flow
1. Mock `axios.get` for `/pathway/{slug}/rules/` and `/pathway/{slug}/reports/`
2. Test `remediationDataProvider()` returns correct format
3. Test button enabled state with various system-rule combinations
4. Verify IOP effect doesn't run (no `iopResolutionsMapper` call)

### Testing Standard Flow
1. Mock `axios.get` for `${RULES_FETCH_URL}${rule_id}/`
2. Test `remediationDataProvider()` returns correct single-rule format
3. Test button enabled based on `rulesPlaybookCount`

---

## File Reference

| File | Purpose | Key Exports/Components |
|------|---------|----------------------|
| `src/PresentationalComponents/Inventory/Inventory.js` | Reusable inventory table with remediation | `Inventory` component |
| `src/PresentationalComponents/Inventory/helpers.js` | Inventory helper functions | `iopResolutionsMapper`, `getEntities`, `allCurrentSystemIds` |
| `src/SmartComponents/SystemAdvisor/SystemAdvisor.js` | System details page | `SystemAdvisor` component |
| `src/SmartComponents/SystemAdvisor/SystemAdvisorAssets.js` | System advisor helpers | `useProcessRemediation`, `useBuildRows` |
| `src/SmartComponents/SystemAdvisor/helpers.js` | System advisor utilities | `fetchResolutionsData` |
| `src/SmartComponents/HybridInventoryTabs/ConventionalSystems/RecommendationSystems.js` | Recommendation systems tab | `ConventionalSystems` component |
| `src/SmartComponents/HybridInventoryTabs/ConventionalSystems/PathwaySystems.js` | Pathway systems tab | `PathwaySystems` component |
| `src/Modules/SystemDetail.js` | System detail module entry | `SystemDetail` component |
| `src/AppConstants.js` | Application constants | `changeRemediationButtonForIop` flag |

---

## Additional Notes

### Why Pathways Don't Use IOP

Pathways involve **multiple rules** with **different systems** per rule:
- System A might have Rule 1 + Rule 2
- System B might have Rule 2 + Rule 3
- Need to create remediation with different rules per system

IOP modal is designed for **single rule** with **multiple systems**:
- All systems get the same rule
- Just picking resolution variant

The data structures are incompatible, so pathways always use standard RemediationButton.

### When Will IOP Modal Appear?

User must meet ALL conditions:
1. ✅ Feature flag `changeRemediationButtonForIop: true` (in environment)
2. ✅ On a single-rule page (Recommendation Details OR System Details)
3. ✅ NOT on a pathway page
4. ✅ Selected at least one system/rule with playbook

If ANY condition fails → Standard RemediationButton is used.

---

**Last Updated**: 2026-04-28  
**Maintainer**: Development Team
