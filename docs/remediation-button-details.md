# Remediation Button - Detailed Implementation

This document contains detailed implementation flows, component specifications, and data structures for the remediation button feature.

For high-level architecture and decision-making guidance, see [CLAUDE.md](../CLAUDE.md).

## Table of Contents
- [Implementation by Page](#implementation-by-page)
- [Key Components](#key-components)
- [Data Flow Diagrams](#data-flow-diagrams)
- [File Reference](#file-reference)

---

## Implementation by Page

### 1. Recommendation Details Page (Single Rule)

**Route**: `/recommendations/:rule_id`

**File Chain**: `Details.js` → `HybridInventory` → `RecommendationSystems.js` → `Inventory.js`

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

```javascript
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
    try {
      const associatedRuleDetails = (
        await axios.get(
          `${RULES_FETCH_URL}${rule.rule_id}/`,
          { params: { name: filters.name } }
        )
      )?.playbook_count;  // ← Note: axios response auto-unwrapped by interceptor
      setRulesPlaybookCount(associatedRuleDetails);
    } catch {
      addNotification({
        variant: 'danger',
        title: 'Failed to fetch playbook information',
        description: `Unable to load remediation details for this recommendation.`,
      });
      setRulesPlaybookCount(0);
    }
  }
};
```

---

### 2. Pathway Details Page (Multiple Rules)

**Route**: `/pathways/:pathway_slug`

**File Chain**: `DetailsPathways.js` → `HybridInventory` → `PathwaySystems.js` → `Inventory.js`

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

#### Remediation Button Logic

Always renders the Standard RemediationButton (IopRemediationModal is undefined for pathways).

#### Data Fetching

**Pathway data fetched ONCE on mount** (`pathwayCheck()` lines 168-185):

```javascript
const pathwayCheck = async () => {
  if (!hasPathwayDetails) {
    if (pathway) {
      try {
        const rulesRes = await axios.get(
          `${BASE_URL}/pathway/${pathway.slug}/rules/`
        );
        
        const reportsRes = await axios.get(
          `${BASE_URL}/pathway/${pathway.slug}/reports/`
        );
        
        const pathwayRulesFromApi = rulesRes?.data ?? [];
        const pathwayReportRules = reportsRes?.data?.rules ?? {};
        
        setHasPathwayDetails(true);
        setPathwayReportList(pathwayReportRules);  // { rule_id: [system_ids] }
        setPathwayRulesList(pathwayRulesFromApi);  // [{ rule_id, description, ... }]
      } catch {
        addNotification({
          variant: 'danger',
          title: 'Failed to fetch pathway information',
          description: `Unable to load remediation details for this pathway.`,
        });
        setHasPathwayDetails(true);
        setPathwayReportList({});
        setPathwayRulesList([]);
      }
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

**File Chain**: `SystemDetail.js` → `SystemAdvisor.js`

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

**Last Updated**: 2026-04-29  
**Maintainer**: Development Team
