# Insights Advisor Frontend

React-based frontend for Red Hat Insights Advisor, providing system recommendations, pathways, and remediation capabilities.

**Stack**: React 18, Redux Toolkit (RTK Query), PatternFly 5, Module Federation  
**Testing**: Jest + React Testing Library, Cypress

---

## Quick Links

- **[Testing Guide](docs/TESTING.md)** - Testing patterns, principles, and pitfalls
- **[Remediation Button Details](docs/remediation-button-details.md)** - Detailed implementation flows
- **[Kessel Permissions](docs/kessel-permissions.md)** - RBAC v1 vs Kessel migration guide
- **External**: [Tabletools Migration](file:///home/avoznese/Documents/Red%20hat%20important/Advisor%20tabletools%20migration/)

---

## Remediation Button Architecture

### Two Implementations Exist

| Implementation | When Used | Component | Feature Flag |
|---------------|-----------|-----------|--------------|
| **IOP Remediation** | Single rule contexts | `IopRemediationModal.WrappedComponent` | `changeRemediationButtonForIop: true` |
| **Standard Remediation** | Pathways + feature flag OFF | `RemediationButton` (from remediations package) | Default |

### Why Two Implementations?

- **IOP (Insights Orchestration Platform)**: Newer system with enhanced resolution selection per system
- **Standard**: Traditional system, still used for pathways (multiple rules per system)
- **Pathways can't use IOP**: Data structure incompatibility (pathways = many rules/system, IOP = one rule/many systems)

### Feature Flag: `changeRemediationButtonForIop`

**Location**: `src/AppConstants.js` (line 540), overridden by `src/Utilities/useKesselEnvironmentContext.js`

```javascript
// Default
changeRemediationButtonForIop: true

// Kessel environments
changeRemediationButtonForIop: false
```

**Effect**: When `true`, `IopRemediationModal` component is passed to pages for single-rule contexts

### Quick Decision Matrix

**IOP Modal appears when ALL of:**
1. ✅ Feature flag `changeRemediationButtonForIop: true`
2. ✅ Single-rule page (Recommendation Details OR System Details)
3. ✅ NOT a pathway page
4. ✅ At least one system/rule selected with playbook

**Otherwise** → Standard RemediationButton

### Context Breakdown

| Page | Rule/Pathway | Modal Passed? | Used Implementation |
|------|--------------|---------------|---------------------|
| Recommendation Details | `rule` (single) | Yes (if flag ON) | IOP or Standard |
| Pathway Details | `pathway` (multiple rules) | No | Standard only |
| System Details | Multiple rules for 1 system | Yes (if flag ON) | IOP or Standard |

**Component Prop Flow**:
```text
Recommendation: IopRemediationModal → Inventory.js → Conditional render
Pathway:        undefined → Inventory.js → Standard only
System:         IopRemediationModal → SystemAdvisor.js → Conditional render
```

---

## Critical Gotchas (Top 5)

### 1. Axios Response Auto-Unwrapping

**Reality**: `useAxiosWithPlatformInterceptors` hook has `responseDataInterceptor` that unwraps `response.data`

```javascript
// ✅ CORRECT
const response = await axios.get(url);
const count = response?.playbook_count;

// ❌ WRONG - Double unwrap
const count = response?.data?.playbook_count;
```

**Where it matters**: All `axios.get/post` calls in components
**Files**: `Inventory.js` (rulesCheck, pathwayCheck), anywhere using the custom axios instance

---

### 2. Pathway Guard in IOP useEffect

**Problem**: IOP flow expects single `rule` prop, pathways have none

**Solution**: Guard clause prevents execution

```javascript
useEffect(() => {
  if (!IopRemediationModal || pathway) {
    return;  // ← CRITICAL: Exits for pathways
  }
  // ... iopResolutionsMapper logic
}, [selectedIds, entities, rule, IopRemediationModal, pathway]);
```

**Why it works**: Pathways never pass `IopRemediationModal` AND have explicit `pathway` guard  
**File**: `src/PresentationalComponents/Inventory/Inventory.js:399-416`

---

### 3. URL Parameter Parsing (Cypress Testing)

**Problem**: `paramParser()` uses `window.location.search`, NOT React Router state

**Cypress Fix**:
```javascript
// ❌ BAD: MemoryRouter alone doesn't work
mount(
  <MemoryRouter initialEntries={['/recs?incident=true']}>
    <RulesTable />
  </MemoryRouter>
);

// ✅ GOOD: Set browser URL first
cy.window().then((win) => {
  win.history.pushState({}, '', '/recs?incident=true');
});
mount(<RulesTable />);
```

**Why**: `paramParser()` in `Common/Tables.js` reads `window.location.search` directly  
**Affects**: All Cypress tests with URL parameters

---

### 4. Filter Array Safety

**Problem**: URL params parsed as strings/booleans, filters expect arrays

**Fix Pattern**:
```javascript
value: Array.isArray(filters.incident)
  ? filters.incident
  : filters.incident
    ? [String(filters.incident)]
    : []
```

**Where applied**: All CheckboxFilter configurations in:
- `RulesTable/helpers.js` (8 filters)
- `PathwaysTable.js` (3 filters)
- `SystemsTable.js` (2 filters)
- `SystemAdvisorAssets.js` (3 filters)

**Bug prevented**: `TypeError: value.includes is not a function` when clicking filter dropdowns

---

### 5. API Error Handling Pattern

**Approach**: Always use try-catch with user notifications for API failures

```javascript
try {
  const data = await axios.get(url);
  setState(data);
} catch {
  addNotification({
    variant: 'danger',
    title: 'Failed to fetch ...',
    description: 'Unable to load ...',
  });
  setState(fallbackValue);
}
```

**Applied in**: `rulesCheck()`, `pathwayCheck()` in Inventory.js  
**Why**: Informs users of failures instead of silent breakage, disables remediation button gracefully

---

## Testing Philosophy

**Core Principle**: Test like a user, not like a developer

### Good Tests
✅ Mock at system edges (HTTP, user input)  
✅ Test user-visible behavior  
✅ Survive refactoring  
✅ Use `screen.getByRole()` queries (accessibility)

### Bad Tests
❌ Mock internal components  
❌ Test implementation details (internal state, props)  
❌ Use snapshots for behavior verification  
❌ Break on non-behavioral refactors

**See**: [docs/TESTING.md](docs/TESTING.md) for comprehensive testing guide

### Quick Commands

```bash
# Run tests with coverage
npm run test:coverage

# Cypress UI
npm run cypress

# Specific test
npm test -- Inventory.test.js
```

**Coverage Target**: 70% combined (Jest + Cypress)  
**Current**: ~67-68%

---

## Additional Architecture Notes

### Why Pathways Don't Use IOP

**Pathway data structure**:
- System A: Rule 1 + Rule 2
- System B: Rule 2 + Rule 3
- Remediation needs: Different rules per system

**IOP data structure**:
- Rule 1: System A + System B
- Remediation needs: Same rule, different resolution per system

**Incompatible** → Pathways always use Standard RemediationButton

### Early Returns in useEffect

**Pattern**: Use guard clauses to avoid deep nesting

```javascript
// ✅ GOOD
useEffect(() => {
  if (!condition) return;  // Guard
  if (!data?.length) {
    clearData();
    return;
  }
  processData();  // Main logic at top level
}, [deps]);
```

**Benefits**: Explicit conditions, prevents unnecessary work, easier to read

---

## Common Patterns

### React Hook Pattern (Tabletools Migration)

```javascript
// ✅ GOOD: Memoized hook
export const useMyColumns = () => {
  return useMemo(() => [
    { key: 'name', label: 'Name' },
    // ...
  ], []);
};

// ❌ BAD: Plain function
export const getMyColumns = () => [
  { key: 'name', label: 'Name' },
];
```

**Why**: Hooks with memoization prevent unnecessary re-renders  
**See**: Memory entry `tabletools_hook_pattern.md`

### Feature Flag Pattern

```javascript
import { useFeatureFlag } from 'Utilities/useFeatureFlag';

const MyComponent = () => {
  const isNewFeatureEnabled = useFeatureFlag('my-new-feature');
  
  return isNewFeatureEnabled ? <NewImplementation /> : <OldImplementation />;
};
```

**Example**: TopicsTable new/original toggle (RHINENG-25233)

---

## Project Structure

```
src/
├── PresentationalComponents/  # UI components (tables, filters, cards)
├── SmartComponents/           # Container components with business logic
├── Services/                  # RTK Query API slices
├── Utilities/                 # Shared utilities, hooks
├── Modules/                   # Federated module entry points
└── Store/                     # Redux store configuration

docs/
├── TESTING.md                 # Comprehensive testing guide
└── remediation-button-details.md  # Detailed implementation flows
```

---

## Key Technologies

### RTK Query
- API layer with automatic caching
- Endpoints defined in `src/Services/*.js`
- Testing: Mock at API slice level, not individual endpoints

### Module Federation
- App loaded as federated module into chrome (platform host)
- Props like `IopRemediationModal` passed from host
- Entry: `src/Modules/*.js`

### PatternFly 5
- Component library for UI
- Charts cause Jest issues → Test with Cypress instead
- Excluded from coverage: `TotalRiskCard.js`

---

## Documentation Maintenance

**When to update**:
- Architecture changes → This file
- Testing patterns → `docs/TESTING.md`
- Implementation details → `docs/remediation-button-details.md`
- Tabletools migration → External docs directory

**External Docs**: `/home/avoznese/Documents/Red hat important/Advisor tabletools migration/`

---

**Last Updated**: 2026-04-29  
**Maintainer**: Development Team
