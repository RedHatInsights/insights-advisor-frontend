# Insights Advisor Frontend

React-based frontend for Red Hat Insights Advisor, providing system recommendations, pathways, and remediation capabilities.

**Stack**: React 18, Redux Toolkit (RTK Query), PatternFly 6, Module Federation
**Testing**: Jest + React Testing Library, Cypress

---

## Quick Links

- **[Testing Guide](docs/TESTING.md)** - Testing patterns, principles, and pitfalls
- **[Remediation Button Details](docs/remediation-button-details.md)** - Detailed implementation flows
- **[IOP Integration](docs/IOP-INTEGRATION.md)** - Insights Orchestration Platform integration
- **[Kessel Permissions](docs/kessel-permissions.md)** - RBAC v1 vs Kessel migration guide
- **[RBAC v1 Kessel Analysis](docs/rbac-v1-kessel-analysis.md)** - Detailed RBAC v1 to Kessel analysis

---

## Build & Test Commands

```bash
npm start              # Start dev server
npm run build          # Production build
npm test               # Run Jest tests
npm run test:ct        # Run Cypress component tests
npm run test:coverage  # Generate coverage report
```


## Architecture Overview

### Directory Structure
- `src/PresentationalComponents/` - UI components (tables, filters, cards, modals)
- `src/SmartComponents/` - Container components with business logic
- `src/Services/` - RTK Query API slices (Recs, Pathways, Systems, Topics, Acks)
- `src/Store/` - Redux store configuration with RTK Query middleware
- `src/Modules/` - Module federation entry points (SystemDetail exposed to chrome)
- `src/Utilities/` - Shared hooks, helpers, feature flags

### State Management
**Redux Toolkit Query**: API layer with automatic caching
- **Slices**: `Recs`, `Pathways`, `Systems`, `Topics`, `Acks`, `SystemVariety`
- **Additional reducers**: `filters` (global/tags/workloads), `systemReducer`, `entitiesDetailsReducer`
- **Middleware**: RTK Query middleware + redux-promise-middleware

### Routing
React Router v6 with lazy-loaded route components:
- `/recommendations` - Rules list
- `/recommendations/pathways` - Pathways list
- `/recommendations/:id` - Single recommendation details
- `/recommendations/pathways/:id` - Pathway details
- `/systems` - Systems list
- `/topics` - Topics list

### Module Federation
- **Exposed module**: `SystemDetail` component consumed by chrome's System Detail page
- **Host integration**: Chrome passes props (`IopRemediationModal`, `envContext`, `store`)
- **Global filters**: Synced via chrome's `GLOBAL_FILTER_UPDATE` event (tags/workloads)

### Remediation Button
Two implementations (IOP vs Standard). IOP used for single-rule contexts when feature flag enabled. Pathways always use Standard. See [remediation-button-details.md](docs/remediation-button-details.md).
