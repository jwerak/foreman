# {PLUGIN_NAME} — PF6 Migration Guide

This file provides AI coding assistants with context for performing PatternFly 5 to 6
migration on this Foreman plugin.

## Plugin Identity

**{PLUGIN_NAME}** is a Foreman plugin for {DESCRIPTION}.

- Frontend directory: `webpack/`
- Entry points: `webpack/index.js` (and/or `webpack/*_index.js`)
- Current PF version: {CURRENT_PF_VERSION}
- Target PF version: 6.4.x (matching Foreman core {FOREMAN_PF_VERSION})

## Foreman Core Dependencies

This plugin imports from Foreman core via the `foremanReact/` alias.
These imports resolve at runtime through Webpack Module Federation.

Key core components available:
- `foremanReact/components/common/IndexPage` — reusable table-based list page
- `foremanReact/components/common/DetailPage` — reusable resource detail page
- `foremanReact/components/common/FormPage` — reusable form with dynamic fields
- `foremanReact/components/common/Fill` — extension point fill component
- `foremanReact/components/common/Slot` — extension point slot component
- `foremanReact/routes/RoutingService` — `registerRoutes(pluginId, routes)`
- `foremanReact/common/I18n` — `translate as __`
- `foremanReact/redux/API/API` — API client

Shared singletons (DO NOT bundle separately):
- `react`, `react-dom`, `react-redux`, `@reduxjs/toolkit`
- `@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-icons`
- `react-router-dom`

## Coding Standards

Follow Foreman core conventions:

### Components
- Functional components only (no class components)
- Hooks: `useState`, `useEffect`, `useSelector`, `useDispatch`
- Never use `connect()` HOC
- I18n: `import { translate as __ } from 'foremanReact/common/I18n'`

### Imports
```javascript
// CORRECT — PF6
import { Button, Modal, ModalHeader, ModalBody } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';

// WRONG
import { Dropdown } from '@patternfly/react-core/deprecated';  // NO
import { Chart } from '@patternfly/react-charts';               // NO — use /victory
```

### Styling
- SCSS co-located with component: `ComponentName/ComponentName.scss`
- PF6 design tokens: `--pf-t--global--*` (semantic), `--pf-v6-c-*` (component)
- Never hardcode colors

### Testing
- React Testing Library + Jest only (no Enzyme)
- `__tests__/ComponentName.test.js`
- Query priority: `getByRole` > `getByLabelText` > `getByText`

## Migration Phases

### Phase 0: Prerequisites
1. Ensure `@theforeman/builder` provides React 18 + PF6 as shared deps
2. Remove any `patternfly` or `patternfly-react` (PF3) imports
3. Convert class components to functional
4. Migrate Enzyme tests to RTL

### Phase 1: PF5 Cleanup
Replace deprecated PF5 components with composable equivalents.
See `.claude/instructions/pf6-migration-patterns.md` for before/after code.

### Phase 2: PF6 Upgrade
1. Run: `npx @patternfly/pf-codemods@latest ./webpack --v6 --fix`
2. Fix remaining CSS tokens manually
3. Update test assertions

### Phase 3: Verification
Run `/migrate-verify` for a clean report.

## Plugin Extension Points

### Fill/Slot
```javascript
import { addGlobalFill } from 'foremanReact/components/common/Fill/GlobalFill';

addGlobalFill('host-details-tab', 'my-plugin-tab', <MyTabComponent />, 100);
```
Fills MUST render PF6 components to match core UI.

### Routes
```javascript
import { registerRoutes } from 'foremanReact/routes/RoutingService';

registerRoutes('my-plugin', [
  { path: '/my-plugin/items', component: MyItemsIndex, exact: true },
]);
```

### Component Registry
```javascript
import componentRegistry from 'foremanReact/components/componentRegistry';

componentRegistry.register({ name: 'MyComponent', type: MyComponent });
```

## PatternFly MCP

When uncertain about PF6 APIs, use the PatternFly MCP:
```
searchPatternFlyDocs("ComponentName")  → find the component
usePatternFlyDocs("ComponentName")     → read PF6 props and examples
```

## Reference

- Foreman AGENT.md — root migration guide in Foreman core
- `.claude/instructions/pf6-migration-patterns.md` — before/after code recipes
- `.claude/instructions/pf6-testing-recipes.md` — PF6 test patterns
- Foreman `migration-toolkit/checklists/` — phase-by-phase checklists
