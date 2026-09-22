# Rules Table Filter Integration: Frontend Architecture & Backend Scoping

* **Target Application:** `insights-advisor-frontend`
* **Primary View:** `/recommendations` (`RulesTable.js`, `List.js`)
* **Related Backend:** `advisor-backend` (`/api/insights/v1/rule/`)

---

## 1. Overview

The Advisor Recommendations / Rules table (`/recommendations`) provides multi-dimensional filtering across global platform filters (Chrome header), local table toolbar filters (PatternFly `PrimaryToolbar`), and backend query optimizations.

This document details all supported filter dimensions, URL synchronization, precedence rules, data fetching hooks, and backend query contracts.

---

## 2. Supported Filter Categories

| Filter Name | URL / API Parameter | Type | Allowed / Sample Values | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Name / Search** | `text` | `string` | `"kernel"`, `"cve"` | Free-text search on rule description, summary, and reason. |
| **Total Risk** | `total_risk` | `number[]` | `1`, `2`, `3`, `4` | 1: Low, 2: Moderate, 3: Important, 4: Critical. |
| **Risk of Change** | `res_risk` | `number[]` | `1`, `2`, `3`, `4` | Resolution risk (1: Low to 4: High). Encapsulated via backend subquery. |
| **Impacted Systems** | `impacting` | `boolean` | `true`, `false`, `undefined` | Tri-state: `true` (hits $\ge 1$), `false` (0 hits), or omitted (unfiltered catalog). |
| **Rule Status** | `rule_status` | `string` | `enabled`, `disabled`, `rhdisabled`, `all` | User acks (`disabled`), Red Hat auto-acks (`rhdisabled`), or active (`enabled`). |
| **Workspace / Groups** | `groups` | `string[]` | `["Engineering"]`, `[""]` | Scopes recommendations to specific host groups. `""` indicates ungrouped hosts. |
| **Workloads** | `workloads[X]` | `boolean` | `workloads[SAP]=true`, `workloads[Ansible]=true` | Filters recommendations affecting specific workload-tagged systems. |
| **Tags** | `tags` | `string[]` | `["insights-client/env=prod"]` | Comma-separated tag filters with namespace, key, and optional value. |
| **Category** | `category` | `number[]` | `1` (Availability), `2` (Performance), `3` (Security), `4` (Stability) | Filter by rule domain category. |
| **Reboot Required** | `reboot` | `boolean` | `true`, `false` | Whether remediation requires system reboot. |
| **Incident** | `incident` | `boolean` | `true`, `false` | Filter for rules associated with active customer incidents. |
| **Remediation / Playbook** | `has_playbook` | `boolean` | `true`, `false` | Whether automated Ansible remediation playbooks are available. |

---

## 3. Architecture & Data Flow

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 Chrome Platform Shell (insights-chrome)                      │
│                                                                                              │
│   1. Global Filter Header: emits GLOBAL_FILTER_UPDATE ({ data: [workloads, groups, tags] })   │
│   2. Sentry Global Error Listener & Source Maps De-minification                              │
└──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    insights-advisor-frontend                                 │
│                                                                                              │
│  App.js                                                                                      │
│    └── Dispatches global filters to Redux:                                                   │
│        - updateWorkloads(workloads)                                                          │
│        - updateTags(selectedTags)                                                            │
│        - updateGroups(groups)                                                                │
│                                                                                              │
│  useWorkspaces.js (TanStack React Query)                                                     │
│    ├── Fetches all standard host groups from GET /api/inventory/v1/groups                    │
│    ├── Sequential pagination loop (per_page: 100) until all pages are retrieved             │
│    └── Transparent error propagation (no swallow-catch) for React Query retries & Sentry     │
│                                                                                              │
│  RulesTable.js & RulesTable/helpers.js                                                       │
│    ├── filterConfigItems(): Defines PatternFly PrimaryToolbar conditional filter items       │
│    ├── urlFilterBuilder(): Parses URL query params on page load into Redux filter state      │
│    ├── buildFilterChips() & getActiveFiltersConfig(): Renders removable filter chips         │
│    └── URL Synchronization: Local table filters override global Chrome header state          │
│                                                                                              │
│  DownloadHelper.js                                                                           │
│    └── Preserves local table filters over global Redux filters during CSV/JSON export        │
└──────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                               │
                                               │ HTTP GET /api/insights/v1/rule/?...
                                               ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         advisor-backend                                      │
│                                                                                              │
│  RuleViewSet.list -> filter_on_impacting()                                                   │
│    ├── 1. Explicit impacting? (true/false) -> Q(has_reports=impacting)                       │
│    ├── 2. Workspace scoping present? (groups/RBAC) -> Defaults to Q(has_reports=True)        │
│    └── 3. No workspace or impacting? -> Q() (returns full knowledge base catalog)           │
│                                                                                              │
│  RuleManager.for_account() -> get_reports_subquery()                                         │
│    └── Filters report annotations by host workspace (inventory.groups @> [{"name": ...}])   │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Filter Precedence & Behavior Matrix

To maintain intuitive UX, local table toolbar selections always take precedence over global platform filters:

| Local Table Filter (`filters`) | Global Header (`Redux`) | Outbound API Query Param | Behavior |
| :--- | :--- | :--- | :--- |
| `groups: ['Engineering']` | `selectedGroups: ['Production']` | `groups=Engineering` | **Local filter takes precedence.** |
| `groups: undefined` | `selectedGroups: ['Production']` | `groups=Production` | **Global filter applies** to the table. |
| `groups: ['']` (Ungrouped) | *(any)* | `groups=` | Scopes to ungrouped systems (`workspace_ungrouped=True`). |
| `groups: undefined` | `selectedGroups: []` | *(omitted)* | **Global organization scope** (all systems). |
| `impacting: ['false']` | *(any workspace)* | `groups=...&impacting=false` | Returns rules with 0 impacted systems in that workspace. |
| `impacting: undefined` | `groups: ['Engineering']` | `groups=Engineering` | **Defaults to `has_reports=True`** (rules with hits in workspace). |

---

## 5. Hook Implementation: `useWorkspaces`

The `useWorkspaces` hook (`src/Services/hooks/useWorkspaces.js`) retrieves host groups from the Host Inventory API to populate the workspace dropdown:

```javascript
export const useWorkspaces = (options = {}) => {
  const axios = useAxiosWithPlatformInterceptors();

  return useQuery({
    queryKey: [WORKSPACES_QUERY_KEY],
    queryFn: async () => {
      let page = 1;
      const per_page = 100;
      let allGroups = [];
      let total = Infinity;

      while (allGroups.length < total) {
        const response = await axios.get('/api/inventory/v1/groups', {
          params: { per_page, page, group_type: 'standard' },
        });

        const rawResults =
          response?.results ||
          response?.data?.results ||
          (Array.isArray(response?.data) ? response.data : []) ||
          (Array.isArray(response) ? response : []);

        const pageTotal =
          response?.total ??
          response?.data?.total ??
          response?.count ??
          rawResults.length;

        total = pageTotal;
        allGroups = [...allGroups, ...rawResults];

        if (rawResults.length === 0 || allGroups.length >= total) {
          break;
        }
        page += 1;
      }

      return allGroups.map((group) => ({
        id: group.id,
        label: group.name,
        value: group.name,
        hostCount: group.host_count,
      }));
    },
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};
```

### Observability & Error Handling
1. **Multi-Page Pagination:** Automatically pages through all host groups when an account has $>100$ workspaces.
2. **Transparent Error Propagation:** Network and HTTP errors are allowed to reject naturally, ensuring React Query captures `isError: true`, automated retries fire, and Sentry records de-minified stack traces.
3. **Safe Consumer Fallbacks:** Consumers destructure with safe defaults (`const { data: workspaces = [] } = useWorkspaces()`), preventing UI crashes if the API is unreachable.

---

## 6. Export Functionality (`DownloadHelper.js`)

During CSV and JSON exports, `DownloadHelper.js` respects filter precedence so the downloaded file exactly matches the on-screen table:

```javascript
let options = selectedTags?.length && { tags: selectedTags };
if (selectedGroups?.length && !filters?.groups?.length) {
  options = {
    ...options,
    groups: Array.isArray(selectedGroups)
      ? selectedGroups.join(',')
      : selectedGroups,
  };
}
workloads && (options = { ...options, ...workloadQueryBuilder(workloads) });
```

---

## 7. Key Files & References

* **Toolbar Configuration:** `src/PresentationalComponents/RulesTable/helpers.js` (`filterConfigItems`, `buildFilterChips`)
* **URL Parsing & Serialization:** `src/PresentationalComponents/Common/Tables.js` (`urlFilterBuilder`, `createOptions`)
* **Workspace Hook:** `src/Services/hooks/useWorkspaces.js`
* **Export Helper:** `src/PresentationalComponents/Common/DownloadHelper.js`
* **Backend Endpoint:** `advisor-backend/api/advisor/api/views/rules.py` (`filter_on_impacting`)
