# Operating System Filter: Advisor + Inventory Integration

## Overview

The OS filter on the Advisor Systems table (`/insights/advisor/systems`) is a cross-application integration between `insights-advisor-frontend` and `insights-inventory-frontend`. The filter UI is owned by Inventory (loaded via Module Federation / Scalprum), while filter persistence (URL sync, API calls) is handled by Advisor.

This document explains the full data flow for selection, deselection, URL synchronization, and API communication.

---

## Architecture

```
┌─────────────────────────────────────┐
│        insights-advisor-frontend     │
│                                      │
│  SystemsTable.js                     │
│    ├── Redux: filters.sysState       │
│    ├── customFilters.advisorFilters   │
│    ├── getEntities() → API call      │
│    ├── handleRefresh() → URL sync    │
│    └── buildFilterChips() → chips    │
│                                      │
│  helper.js                           │
│    └── createOptions() → API params  │
│                                      │
│  AppConstants.js                     │
│    └── SYSTEM_FILTER_CATEGORIES      │
│                                      │
│  Common/Tables.js                    │
│    ├── paramParser() → URL → state   │
│    ├── urlBuilder() → state → URL    │
│    └── pruneFilters() → chip data    │
├──────────────────────────────────────┤
│    Module Federation boundary        │
├──────────────────────────────────────┤
│       insights-inventory-frontend    │
│                                      │
│  EntityTableToolbar.js               │
│    ├── useOperatingSystemFilter()    │
│    ├── osFilterValue state           │
│    ├── osFilterChips (native chips)  │
│    └── onSetFilter() → activeFilters │
│                                      │
│  useOperatingSystemFilter.js         │
│    ├── operatingSystemsValue {}      │
│    ├── setValue() / setOsValue()     │
│    ├── handleMajorVersionToggle()    │
│    └── chips[] (from state → groups) │
│                                      │
│  helpers.js                          │
│    ├── toOsFilterGroups()            │
│    ├── appendGroupSelection()        │
│    └── filterGroup() / filterGroupItem() │
└──────────────────────────────────────┘
```

---

## Data Structures

### Inventory OS Filter State

The Inventory OS filter uses a nested object keyed by major version group:

```js
// operatingSystemsValue when RHEL 9.4 and 9.7 are selected:
{
  "RHEL-9": {
    "RHEL-9": null,           // null = some (not all) minor versions selected
    "RHEL-9-9.4": true,
    "RHEL-9-9.7": true
  }
}

// When ALL minor versions of RHEL 9 are selected:
{
  "RHEL-9": {
    "RHEL-9": true,           // true = all minor versions selected (major toggle)
    "RHEL-9-9.0": true,
    "RHEL-9-9.1": true,
    // ... all versions
  }
}
```

### Inventory Filter Groups (from API)

`toOsFilterGroups()` transforms the API response into PatternFly group filter format:

```js
[
  {
    groupSelectable: true,
    label: "RHEL-9",        // display label (was groupName, fixed to groupKey)
    value: "RHEL-9",        // used as groupKey
    type: "checkbox",
    major: 9,
    items: [
      { label: "RHEL 9.7", value: "RHEL-9-9.7", major: 9, minor: 7 },
      { label: "RHEL 9.6", value: "RHEL-9-9.6", major: 9, minor: 6 },
      // ... sorted by minor desc
    ]
  },
  // ... sorted by major desc
]
```

### Advisor Redux State (`filters.sysState`)

```js
{
  sort: '-last_seen',
  limit: 20,
  offset: 0,
  hits: ['all'],
  rhel_version: ['9.7', '9.4'],  // flat array of version strings
  // ... other filters
}
```

### Advisor `SYSTEM_FILTER_CATEGORIES` (AppConstants.js)

```js
{
  hits: { type: 'checkbox', title: 'total risk', urlParam: 'hits', values: [...] },
  incident: { type: 'checkbox', title: 'Incidents', urlParam: 'incident', values: [...] },
  rhel_version: { type: 'checkbox', title: 'Operating system', urlParam: 'rhel_version' },
  // NOTE: rhel_version has NO `values` property — it cannot enumerate OS versions statically
  workload: { ... },
}
```

---

## Flow 1: User Selects Minor Version (e.g., RHEL 9.4)

```
User clicks "RHEL 9.4" checkbox
        │
        ▼
[Inventory] useOperatingSystemFilter.onChange()
  - itemValue !== groupValue → calls setValue(newSelection)
        │
        ▼
[Inventory] appendGroupSelection(newSelection, groups)
  - Computes group-level flag (true = all selected, null = partial)
  - Returns normalized selection object
        │
        ▼
[Inventory] setOsValue(fullSelection)
  - Updates operatingSystemsValue state
        │
        ▼
[Inventory] EntityTableToolbar useEffect([osFilterValue])
  - Calls onSetFilter(osFilterValue, 'osFilter', debouncedRefresh)
  - Pushes { osFilter: <value> } into activeFilters array
  - Triggers table refresh
        │
        ▼
[Advisor] getEntities() callback fires
  - Receives config.filters containing osFilter
  - Calls createOptions(advisorFilters, page, per_page, sort, null, filters, ...)
        │
        ▼
[Advisor] createOptions() (helper.js)
  - buildOsFilter(filters.osFilter) extracts minor version strings
  - Returns ['9.4'] for single selection
  - Spreads as: { rhel_version: '9.4' } (joined with comma)
  - This OVERRIDES any advisorFilters.rhel_version
        │
        ▼
[Advisor] API call: GET /api/insights/v1/system/?rhel_version=9.4&...
  - Qs.stringify with arrayFormat: 'repeat'
  - Since rhel_version is already a string (comma-joined), no repeat issue
        │
        ▼
[Advisor] handleRefresh(options)
  - Whitelists recognized keys (hits, incident, rhel_version, etc.)
  - Calls urlBuilder() → URL updated to ?rhel_version=9.4&sort=-last_seen&...
        │
        ▼
[Inventory] OS filter chips rendered natively by useOperatingSystemFilter
  - chip = [{ category: 'Operating system', chips: [{name: 'RHEL 9.4', value: 'RHEL-9-9.4'}] }]
```

---

## Flow 2: User Selects Major Version (e.g., all of RHEL 9)

```
User clicks "RHEL-9" group checkbox
        │
        ▼
[Inventory] onChange: itemValue === groupValue → handleMajorVersionToggle(groupValue)
  - If NOT fully selected: selects ALL minor versions + major flag
    { "RHEL-9": { "RHEL-9": true, "RHEL-9-9.0": true, "RHEL-9-9.1": true, ... } }
  - If already fully selected: removes entire group
    { [groupValue]: _, ...rest } → deselects all
        │
        ▼
[Inventory] setOsValue(newState) → same flow as minor version
        │
        ▼
[Advisor] createOptions() → buildOsFilter() extracts all minor versions
  - Returns ['9.0', '9.1', '9.2', ...] → joined as '9.0,9.1,9.2,...'
        │
        ▼
API call: ?rhel_version=9.0,9.1,9.2,...
```

---

## Flow 3: Page Reload with `rhel_version` in URL

```
Browser loads: /insights/advisor/systems?rhel_version=9.7,9.4&sort=-last_seen&limit=20&offset=0
        │
        ▼
[Advisor] SystemsTable useEffect runs (search is truthy)
  - paramParser() splits URL params:
    { rhel_version: ['9.7', '9.4'], sort: ['-last_seen'], ... }
  - Normalizes: sort → string, offset → number, limit → number
  - incident normalization (string → array) happens BEFORE combinedFilters
  - combinedFilters = { ...filters, ...paramsObject }
  - setFilters(combinedFilters) → Redux updated with rhel_version: ['9.7', '9.4']
        │
        ▼
[Advisor] InventoryTable renders with customFilters:
  {
    advisorFilters: {
      ...filters,                          // includes rhel_version: ['9.7', '9.4']
      'filter[system_profile]': true
    },
    workloads, selectedTags
  }
        │
        ▼
[Advisor] getEntities() fires
  - advisorFilters contains rhel_version: ['9.7', '9.4']
  - createOptions() destructures rhel_version from advisorFilters
  - Joins to comma string: '9.7,9.4'
  - osFilter from Inventory is empty (Inventory starts with {} on mount)
  - Since osFilter is empty, advisorRhelVersion is used
  - API gets: ?rhel_version=9.7,9.4
        │
        ▼
[Inventory] OS filter UI shows NO checkboxes selected
  - operatingSystemsValue starts as {} — no URL initialization mechanism
  - The data IS correctly filtered, but the UI doesn't reflect the URL state
  - This is a known limitation (see Limitations section)
```

---

## Flow 4: Chip Deletion

### Single Chip Deletion (Inventory-managed)

```
User clicks X on "RHEL 9.4" chip
        │
        ▼
[Inventory] EntityTableToolbar.onDeleteFilter()
  - Calls setOsFilterValue(onDeleteGroupFilter(deleted, osFilterValue))
  - Removes the specific version from operatingSystemsValue
        │
        ▼
[Inventory] useEffect([osFilterValue]) → onSetFilter → table refresh
        │
        ▼
[Advisor] getEntities() → createOptions() rebuilds API params without 9.4
```

### "Clear All" Chip Deletion

```
User clicks "Clear filters"
        │
        ▼
[Advisor] activeFiltersConfig.onDelete(event, items, isAll=true)
  - Resets Redux to: { sort, limit, offset, hits: ['all'], tags }
  - rhel_version is removed from Redux state
        │
        ▼
[Inventory] EntityTableToolbar onDeleteFilter
  - Calls setOsFilterValue([]) → clears OS filter state
        │
        ▼
Both advisor Redux and Inventory local state are cleared
```

---

## Flow 5: Chip Rendering (Avoiding Duplication)

Two sources can produce OS filter chips:

1. **Inventory chips**: `useOperatingSystemFilter` returns `chip` array with `category: 'Operating system'`
2. **Advisor chips**: `buildFilterChips()` → `pruneFilters()` could create chips from `filters.rhel_version`

To prevent duplication, `buildFilterChips()` deletes `rhel_version` from `localFilters` before calling `pruneFilters()`. This ensures only Inventory's native chips are shown.

```js
// SystemsTable.js — buildFilterChips()
const localFilters = { ...filters };
delete localFilters.rhel_version;  // Inventory handles OS chips
return pruneFilters(localFilters, SFC);
```

---

## Key Functions Reference

### `buildOsFilter(osFilter)` — helper.js

Converts Inventory's nested OS filter state to flat version array:

```js
// Input:  { "RHEL-9": { "RHEL-9": null, "RHEL-9-9.4": true, "RHEL-9-9.7": true } }
// Output: ['9.4', '9.7']
```

Logic: iterates all groups → all entries where value is `true` → extracts the version part after the last `-` → keeps only versions containing `.` (filters out major-only keys).

### `createOptions()` — helper.js

Builds the API query params object. Key `rhel_version` handling:

1. Destructures `rhel_version` from `advisorFilters` (Redux state from URL params on reload)
2. If present, joins array to comma-separated string
3. If Inventory's `osFilter` is also present (user interacted with UI), it **overrides** the advisor value
4. This prevents `Qs.stringify` from generating repeated params (`rhel_version=9.7&rhel_version=9.4`)

### `handleRefresh(options)` — SystemsTable.js

Writes API params back to the URL. Uses a whitelist to prevent polluting the URL with internal params like `filter[system_profile]`:

```js
const urlKeys = ['hits', 'incident', 'display_name', 'rhel_version',
                 'workload', 'sort', 'limit', 'offset', 'tags'];
```

### `paramParser()` — Tables.js

Parses URL query string into state object. Splits comma-separated values into arrays:

```js
// URL: ?rhel_version=9.7,9.4
// Output: { rhel_version: ['9.7', '9.4'] }
```

### `addFilterParam()` — SystemsTable.js

Handles advisor-side filter changes. For `rhel_version`, flattens the Inventory nested object into a flat version array:

```js
const passValue =
  param === SFC.rhel_version.urlParam
    ? Object.values(values || {}).flatMap((majorOsVersion) =>
        Object.keys(majorOsVersion))
    : values;
```

### `pruneFilters()` — Tables.js

Generates chip data for the active filters display. For `rhel_version`, uses a special branch that formats chips as `RHEL <version>` without looking up a `values` array (since `SFC.rhel_version` has no `values`). The non-array fallback uses optional chaining (`category.values?.find(...)?.label`) to prevent crashes when `values` is undefined.

### `handleMajorVersionToggle()` — useOperatingSystemFilter.js

Toggles all minor versions under a major version group. If the group was fully selected, it deselects all. Otherwise, it selects every minor version plus the group flag.

### `appendGroupSelection()` — helpers.js (inventory)

Normalizes the group filter selection after any change. Ensures the group-level key (`RHEL-9`) is `true` when all children are selected, `null` when partial, and removes the group entirely when all children are deselected.

---

## Serialization: URL ↔ API

| Format | Example | Used where |
|--------|---------|------------|
| Comma-separated | `rhel_version=9.7,9.4` | URL, API query param |
| Array | `['9.7', '9.4']` | Redux state, internal |
| Repeated params | `rhel_version=9.7&rhel_version=9.4` | NOT used (would cause API 400) |

The `createOptions()` function ensures arrays are joined before `Qs.stringify` runs, preventing the repeated params format.

URL encoding note: `%2C` and `,` are equivalent after URL decoding — the web server/browser handles this transparently.

---

## Limitations

1. **No Inventory UI restoration from URL**: When the page loads with `rhel_version` in the URL, the data is correctly filtered via `advisorFilters`, but the Inventory OS filter checkboxes remain unchecked. Inventory's `useOperatingSystemFilter` always initializes with empty state `{}` and has no mechanism to receive initial values from URL params.

2. **Two-way override**: When a user interacts with the OS filter after a URL-based reload, the Inventory `osFilter` takes precedence and replaces the advisor `rhel_version` value. This is correct behavior — user interaction should override URL state.

3. **`rhel_version` has no static values**: Unlike `hits` or `incident`, the `SYSTEM_FILTER_CATEGORIES.rhel_version` entry has no `values` property because OS versions are fetched dynamically from the API. Code that assumes all filter categories have `values` must use optional chaining.

---

## Files Summary

| File | Repo | Role |
|------|------|------|
| `src/PresentationalComponents/SystemsTable/SystemsTable.js` | advisor | Main table component, Redux integration, filter chips, URL sync |
| `src/PresentationalComponents/helper.js` | advisor | `createOptions()`, `buildOsFilter()`, API param construction |
| `src/PresentationalComponents/Common/Tables.js` | advisor | `paramParser()`, `urlBuilder()`, `pruneFilters()` |
| `src/AppConstants.js` | advisor | `SYSTEM_FILTER_CATEGORIES` definition |
| `src/Services/Filters.js` | advisor | Redux slice, initial state |
| `src/components/InventoryTable/EntityTableToolbar.js` | inventory | Toolbar with all filters, connects OS filter to table |
| `src/components/filters/useOperatingSystemFilter.js` | inventory | OS filter hook: state, onChange, chips, major toggle |
| `src/components/filters/helpers.js` | inventory | `toOsFilterGroups()`, `appendGroupSelection()`, group/item builders |
