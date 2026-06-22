# Foreman AI Migration Guide

This file provides AI coding assistants (Claude Code, Cursor, GitHub Copilot, Windsurf, Roo)
with the context needed to perform PatternFly 5 to 6 migration on the Foreman frontend.

## Project Identity

Foreman is a Rails 7 + React application for lifecycle management of physical and virtual servers.
The frontend lives under `webpack/assets/javascripts/react_app/`.

**Current stack (pre-migration):**
- React 16.9, react-dom 16.8, react-redux 7.1
- PatternFly 5.4.x (`@patternfly/react-core`, `@patternfly/react-table`, `@patternfly/react-charts`)
- PatternFly 3.59.5 (`patternfly`, `patternfly-react`) — legacy, must be removed
- Enzyme 3.11 + React Testing Library 10 — Enzyme must be replaced
- Webpack 5 with Module Federation (@scalprum) for plugin isolation
- Bootstrap 3.4 for legacy ERB pages

**Target stack (post-migration):**
- React 18.2, react-dom 18.2, react-redux 8.1
- PatternFly 6.4.x exclusively — no PF3, no PF5 deprecated imports
- React Testing Library 14 exclusively — no Enzyme
- CSS design tokens: `--pf-t--global--*` (semantic), `--pf-v6-c-*` (component)
- Dark mode support via PF6 tokens + `prefers-color-scheme`

## Architecture

```
webpack/assets/javascripts/react_app/
├── Root/                    # App bootstrap, store, router
├── components/              # 65+ component directories (~700 JS files)
│   ├── common/              # Shared: IndexPage, DetailPage, FormPage
│   └── [Resource]/          # Per-resource components (HostsIndex, DomainsIndex, etc.)
├── routes/                  # SPA routing (IndexPages, DetailPages, resourceConfigs)
├── redux/                   # Store, reducers, API middleware
└── common/                  # Utilities (I18n, API.js, hooks)
```

**Plugin integration:**
- Plugins discovered via gemspec `metadata["is_foreman_plugin"]`
- Webpack Module Federation: each plugin compiles a `{pluginName}_remoteEntry.js`
- Shared deps (React, Redux, PF) are singletons — plugin MUST match core versions
- Extension points: Fill/Slot system (`<Slot id="...">` / `<Fill slotId="...">`)
- Route registration: `registerRoutes(pluginId, routesArray)` in plugin's `webpack/index.js`
- Component mounting from Rails: `react_component('Name', props)` helper

## Migration Phases

The migration follows a strict phase order. Each phase has a checklist in `migration-toolkit/checklists/`.

### Phase 0: Prerequisites
1. **React 16 to 18** — `createRoot`, StrictMode, react-redux 8, testing-library 14
2. **Remove PatternFly 3** — eliminate all `patternfly` and `patternfly-react` imports
3. **Class to functional** — convert all class components (except ErrorBoundary)
4. **Enzyme to RTL** — rewrite all Enzyme tests with React Testing Library

### Phase 1: PF5 Cleanup (while still on PF5)
Replace deprecated PF5 components with their composable equivalents:
- `Dropdown` / `DropdownToggle` / `DropdownItem` from `/deprecated` → composable Dropdown + MenuToggle
- `Select` / `SelectOption` / `SelectVariant` from `/deprecated` → composable Select + MenuToggle
- `ContextSelector` from `/deprecated` → composable Dropdown
- `Table` / `TableHeader` / `TableBody` from `/deprecated` → composable Table/Thead/Tbody/Tr/Th/Td
- `EmptyState` props restructuring (HeaderIcon props merged into EmptyState)
- `Chip` → `Label`

### Phase 2: PF6 Package Upgrade
1. Bump all `@patternfly/*` packages to 6.x
2. Run `npx @patternfly/pf-codemods@latest ./webpack --v6 --fix` — handles ~60% of changes
3. CSS class updater: `pf-v5-c-*` → `pf-v6-c-*`
4. CSS variable updater: `--pf-v5-*` → `--pf-v6-*` or `--pf-t--*` (semantic tokens)
5. Manual fixes for complex changes (Modal, Button icons, FormGroup labelHelp)
6. Chart imports: `@patternfly/react-charts` → `@patternfly/react-charts/victory`

### Phase 3: Stabilization
1. Fix all test failures (snapshot updates, assertion changes)
2. Visual testing on deployed instance
3. SCSS file updates for Rails stylesheets (they use PF CSS variables)

### Phase 4: PF6 Native Features
Dark mode, multi-expand nav, dashboard redesign with PF6 components.

## Coding Standards

These are the target standards. All new and migrated code MUST follow these.

### Components
- **Functional only** — no class components except ErrorBoundary
- **Hooks for state** — `useState`, `useEffect`, `useMemo`, `useCallback`
- **Redux hooks** — `useSelector`, `useDispatch` — never `connect()` HOC
- **Props** — destructured in function signature, validated with `prop-types`
- **I18n** — `import { translate as __ } from '../../common/I18n'`

### Imports
```javascript
// CORRECT — PF6 imports
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ChartDonut } from '@patternfly/react-charts/victory';

// WRONG — never use these
import { Dropdown } from '@patternfly/react-core/deprecated';  // NO
import { Modal } from '@patternfly/react-core/next';            // NO
import { LineChart } from 'patternfly-react';                   // NO (PF3)
```

### Styling
- SCSS co-located: `ComponentName/ComponentName.scss`
- Import in component: `import './ComponentName.scss'`
- Use PF6 design tokens — never hardcode colors
  - Semantic: `--pf-t--global--color--brand--default`, `--pf-t--global--spacer--md`
  - Component: `--pf-v6-c-button--FontSize`
- Class prefixes: `pf-v6-c-*` (never `pf-v5-c-*`)

### Testing
- React Testing Library + Jest — never Enzyme
- File location: `ComponentName/__tests__/ComponentName.test.js`
- Queries by priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- User interactions: `@testing-library/user-event` (not `fireEvent`)
- Async: `waitFor`, `findBy*` queries
- Wrapper: `MemoryRouter` for routing, `Provider` for Redux

### File Organization
```
ComponentName/
├── index.js                         # Component implementation
├── ComponentName.scss               # Co-located styles (optional)
├── ComponentNameHelpers.js          # Helper functions (optional)
└── __tests__/
    └── ComponentName.test.js        # Tests
```

## Adding a New SPA Resource

Three files to create/modify:

1. **Component**: `components/XxxIndex/index.js` — render `<IndexPage columns={[...]} />`
2. **Route**: add `route()` call to `routes/IndexPages/index.js`
3. **Config**: add entry to `routes/DetailPages/resourceConfigs.js`

Reference implementations:
- Minimal: `components/DomainsIndex/index.js`
- Complex with custom tabs: `components/UsersIndex/index.js`

## PatternFly MCP Integration

When uncertain about a PF6 component API, use the PatternFly MCP tools:

1. `searchPatternFlyDocs("component name")` — find the component
2. `usePatternFlyDocs("Component")` — read its schema, props, and examples

This is especially important for:
- Verifying prop names (many changed between PF5 and PF6)
- Looking up design token names (`--pf-t--global--*`)
- Checking component composition patterns (Modal, Dropdown, Select)

## Plugin Migration

Plugins share React, Redux, and PatternFly as singletons via Module Federation.
When Foreman core upgrades to PF6, plugins MUST upgrade in sync.

Plugin migration follows the same phases but additionally requires:
- Updating `foremanReact/` import paths if core component APIs changed
- Updating Fill components to render PF6 markup
- Coordinating with `@theforeman/vendor` for shared dependency versions

See `migration-toolkit/README.md` for the complete plugin migration guide.
See `migration-toolkit/plugin-template/` for a ready-to-use starter kit.

## Reference Documents

- `UPGRADE_PLAN_PF6.md` — Strategic migration plan with all phases
- `UPGRADE_REPORT_PF6.md` — Before/after analysis and progress scorecard
- `migration-toolkit/checklists/` — Phase-by-phase verification checklists
- `.claude/instructions/pf6-migration-patterns.md` — Before/after code recipes
- `.claude/instructions/pf6-testing-recipes.md` — PF6-specific test patterns
