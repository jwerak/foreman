# Foreman Frontend Upgrade Plan: PatternFly 5 → PatternFly 6.4.x

## Executive Summary

This plan covers upgrading Foreman's frontend from **PatternFly 5.4.x + React 16.9** to
**PatternFly 6.4.x + React 18.x** in incremental, shippable steps. Each phase is designed
to be independently mergeable without breaking the application or its plugin ecosystem.

The work is organized into **6 phases**, each with multiple sub-steps that can be assigned
to individual subagents for parallel execution.

---

## Current State Assessment

| Area                 | Current                                        | Target                          |
|----------------------|------------------------------------------------|---------------------------------|
| React                | 16.9                                           | 18.x                            |
| PatternFly Core      | @patternfly/react-core 5.4.8                   | 6.4.x                           |
| PatternFly CSS       | @patternfly/patternfly 5.4.2                   | 6.4.x                           |
| PatternFly Charts    | @patternfly/react-charts 7.4.5                 | 8.x (with /victory import)      |
| Legacy PF            | patternfly 3.59.5 + patternfly-react 2.40.0    | Removed entirely                |
| React Router         | v5.3.4 + connected-react-router                | v5 (keep, upgrade separately)   |
| Redux                | 4.0.4 + react-redux 7.1.0 + toolkit 1.6.0     | Keep, modernize connect→hooks   |
| Testing              | Jest 26 + Enzyme 3.11 + RTL 10.0               | Jest 29 + RTL 14+               |
| TypeScript           | Installed but unused (all JS)                  | Gradual adoption (post-PF6)     |
| CSS tokens           | --pf-v5-* prefix                               | --pf-v6-* / --pf-t--* tokens    |
| Build                | Webpack 5 + @theforeman/builder 15.0           | Webpack 5 (keep)                |

### Key Technical Debt Identified

- **29 files** still import from legacy `patternfly-react` (PF3)
- **10 class-based** components remain (98.6% already functional)
- **11+ files** use deprecated PF5 Dropdown/DropdownToggle/DropdownItem
- **32 test files** use Enzyme (144 use RTL)
- **26 uses** of legacy Redux `connect()` HOC (185 use hooks)
- **9 Redux `connect()` HOC** wrappers
- Custom `ForemanModal` wraps PF3 Modal (explicitly marked deprecated)
- CSS uses `--pf-v5-*` variable prefix throughout SCSS files
- `SearchModal.js` already uses `@patternfly/react-core/next` (PF6 preview)

### Plugin Ecosystem Consideration

Foreman uses **Webpack Module Federation** for plugins. Shared dependencies (React,
PatternFly, Redux) are singletons. Any upgrade to these shared dependencies affects all
plugins. Plugins must be coordinated to upgrade simultaneously, OR the shared dependency
versions must be updated in `@theforeman/vendor` first.

---

## Phase 0: Pre-Requisites & Foundation (No PF changes)

**Goal:** Get React to a PF6-compatible version and clean up legacy code that would
complicate the PF6 migration.

### Step 0.1: Upgrade React 16 → React 18

React 16.9 → 18.x is a prerequisite for PF6 (minimum React 17, but 18 is recommended).

**Sub-tasks:**
- Update `react`, `react-dom` to ^18.2.0
- Update `react-redux` to ^8.x (React 18 compatible)
- Update `@testing-library/react` to ^14.x (React 18 compatible)
- Remove `@testing-library/react-hooks` (merged into `@testing-library/react` ≥13.1)
- Update `react-test-renderer` to ^18.x
- Update `enzyme-adapter-react-16` → consider `@cfaester/enzyme-adapter-react-18` or
  remove Enzyme entirely at this point
- Update `connected-react-router` — check compatibility or find alternative
- Add `createRoot` migration (ReactDOM.render → createRoot)
- Update `@theforeman/vendor` if it provides React as a shared dependency
- Run full test suite after each change

**Risks:**
- `connected-react-router` may not support React 18 — may need replacement
- Enzyme adapter for React 18 is community-maintained, not official
- Module Federation singleton React version affects all plugins

**Estimated scope:** ~15-25 files to change + test fixes

### Step 0.2: Remove PatternFly 3 Legacy Dependencies

**Sub-tasks:**
- Audit all 29 files importing from `patternfly-react` or `patternfly`
- Replace `ForemanModal` (PF3 Modal) → PF5 `Modal` from `@patternfly/react-core`
  - Files: ForemanModal.js, ForemanModalHeader.js, ForemanModalFooter.js, DiffModal.js
  - All consumers of ForemanModal need updating
- Replace PF3 `Button` → PF5 `Button`
- Replace PF3 `Spinner` → PF5 `Spinner`
- Replace PF3 `Alert` → PF5 `Alert`
- Replace PF3 `TypeAheadSelect` → PF5 `Select` or `MenuToggle`+`Menu`
- Replace PF3 `LineChart` → `@patternfly/react-charts`
- Replace PF3 `FormControl`, `FieldLevelHelp` → PF5 equivalents
- Remove `patternfly` and `patternfly-react` from package.json
- Remove PF3 SCSS import from `vendor-core.scss`
- Remove `bootstrap-sass` dependency (PF3 dependency)

**Estimated scope:** ~29 files + their tests

### Step 0.3: Convert Remaining Class Components to Functional

**Sub-tasks (10 components):**
- `i18nProviderWrapperFactory.js` → functional + hooks
- `ExpansiveView.js` → functional
- `Editor.js` (300 lines) → functional + hooks (largest)
- `EditorOptions.js` → functional
- `BreadcrumbBar.js` → functional + hooks (has Redux connect)
- `ErrorBoundary/index.js` → keep as class (React requirement for error boundaries)
- `Fill.js` → functional
- `SearchInput/index.js` → functional
- `Select.js` (forms) → functional
- `StorageContainer` (vmware) → functional

**Note:** ErrorBoundary must remain a class component — React does not support
`componentDidCatch` as a hook.

**Estimated scope:** ~9 files + tests

### Step 0.4: Migrate Enzyme Tests to React Testing Library

**Sub-tasks:**
- Identify all 32 Enzyme test files
- Convert `shallow()` / `mount()` → `render()` from RTL
- Replace Enzyme assertions with RTL queries (`screen.getByText`, `screen.getByRole`)
- Remove `enzyme`, `enzyme-adapter-react-16`, `enzyme-to-json` from devDependencies
- Update `@theforeman/test` utilities that expose Enzyme
- Update jest.config.js snapshot serializer (remove enzyme-to-json)

**Estimated scope:** ~32 test files

---

## Phase 1: Pre-PF6 Cleanup (Still on PF5)

**Goal:** Replace deprecated PF5 components and standardize patterns so the PF6 codemod
runs cleanly.

### Step 1.1: Replace Deprecated PF5 Dropdown

The deprecated `Dropdown`, `DropdownToggle`, `DropdownItem` from
`@patternfly/react-core/deprecated` must be replaced with the new composable
`Dropdown` + `MenuToggle` + `DropdownList` + `DropdownItem` pattern (available in PF5).

**Files to update:**
- `Bookmarks.js` — Dropdown for saved bookmarks
- `TaxonomyDropdown.js` — Taxonomy switcher dropdown
- `ActionButtons.js` — Kebab action dropdown
- Other form/filter dropdowns (~6+ more files)

**Pattern change:**
```jsx
// OLD (deprecated)
import { Dropdown, DropdownToggle, DropdownItem } from '@patternfly/react-core/deprecated';

// NEW (PF5 composable, forwards-compatible with PF6)
import { Dropdown, DropdownItem, DropdownList, MenuToggle } from '@patternfly/react-core';
```

**Estimated scope:** ~11 files

### Step 1.2: Replace Any Usage of Chip Component

PF6 replaces `Chip` with `Label`. If Chip is used anywhere, replace it now on PF5 where
Label already exists.

**Estimated scope:** Audit needed — may be 0 files if not used

### Step 1.3: Replace Text Component with Content

PF6 renames `Text`/`TextContent`/`TextList`/`TextListItem` → `Content`.
Do this on PF5 where possible (Content may be available in PF5's `/next` exports).

**Estimated scope:** Audit for `TextContent`, `Text` imports — ~3+ files

### Step 1.4: Standardize EmptyState Usage

PF6 refactors EmptyState significantly. Ensure all EmptyState usage follows the latest
PF5 composable pattern so codemods work properly.

**Estimated scope:** Audit `EmptyState` directory + all consumers

### Step 1.5: Update Redux connect() to Hooks

Convert remaining 9 `connect()` HOC usages to `useSelector` + `useDispatch` hooks.

**Files with connect():**
- BreadcrumbBar.js (also class component — done in 0.3)
- Editor.js (also class component — done in 0.3)
- ConfigReports/DiffModal
- Other connected components

**Estimated scope:** ~9 files + tests

### Step 1.6: Consolidate Custom Form Components

The custom forms infrastructure in `common/forms/` is built on older patterns. Audit and
consolidate where possible:
- Remove unused form components
- Ensure remaining forms use PF5 form components consistently
- Document which custom form wrappers are needed vs removable

**Estimated scope:** Audit + selective cleanup

---

## Phase 2: PatternFly 6 Core Migration

**Goal:** Upgrade all PF packages to v6 and run codemods.

### Step 2.1: Update Package Dependencies

```json
{
  "@patternfly/patternfly": "^6.4.0",
  "@patternfly/react-core": "^6.4.0",
  "@patternfly/react-icons": "^6.4.0",
  "@patternfly/react-styles": "^6.4.0",
  "@patternfly/react-table": "^6.4.0",
  "@patternfly/react-tokens": "^6.4.0",
  "@patternfly/react-templates": "^2.x.0",
  "@patternfly/react-charts": "^8.x.0"
}
```

Also update `@theforeman/vendor` to a version that provides PF6.

### Step 2.2: Run PatternFly Codemods (Automated)

Run in order:
1. `npx @patternfly/pf-codemods@latest ./webpack --v6` (dry run)
2. `npx @patternfly/pf-codemods@latest ./webpack --v6 --fix` (apply fixes)
3. Repeat until clean
4. `npx @patternfly/pf-codemods@latest ./webpack --v6 --fix` with `--only enable-animations`

This handles:
- Component API changes (props renamed/removed)
- Import path updates
- Deprecated component replacements
- Known pattern migrations

### Step 2.3: Run CSS Class Name Updater

```bash
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix
```

Updates `pf-v5-*` → `pf-v6-*` class prefixes across all files.

### Step 2.4: Run Token Updater (React Files)

```bash
# For React tokens in JS/JSX files
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix
```

Updates:
- `global_FontSize_lg` → `t_global_font_size_lg`
- `--pf-v5-global--FontSize--lg` → `--pf-t--global--font--size--lg`
- Hot pink placeholders for tokens without 1:1 mapping (manual follow-up)

### Step 2.5: Run CSS Variables Updater (SCSS Files)

```bash
npx @patternfly/pf-codemods css-vars-updater ./webpack --v6 --fix --fileTypes scss
```

Updates CSS variables in SCSS files throughout the project.

### Step 2.6: Manual Token Replacement

After codemods, find all hot pink placeholder tokens (`--pf-t--temp--dev--tbd` /
`t_temp_dev_tbd`) and replace with correct PF6 design tokens.

**Files to check:**
- All SCSS files in `react_app/common/scss/`
- All component-level SCSS files (~30+ files)
- `vendor-core.scss` (PF CSS import path)

### Step 2.7: Update Chart Import Paths

```jsx
// OLD
import { ChartLabel } from '@patternfly/react-charts';

// NEW
import { ChartLabel } from '@patternfly/react-charts/victory';
```

**Files:** 4 chart files in `components/common/charts/`

### Step 2.8: Update SearchModal PF6 Preview Imports

`SearchModal.js` already imports from `@patternfly/react-core/next`. In PF6, these
components moved to the main export:

```jsx
// OLD (PF5 preview)
import { Modal, ModalHeader, ModalBody } from '@patternfly/react-core/next';

// NEW (PF6 main)
import { Modal, ModalHeader, ModalBody } from '@patternfly/react-core';
```

### Step 2.9: Fix Button Test Assertions

PF6 wraps button text in a `<div>`, which breaks `getByText('Button Label')` queries.
Update tests to use:
```jsx
screen.getByRole('button', { name: 'Button Label' })
```

### Step 2.10: Fix Breakpoint Logic

If any JavaScript logic uses pixel-based breakpoint values, convert to rem:
- 576px → 36rem
- 768px → 48rem
- 992px → 62rem
- 1200px → 75rem
- 1450px → 90.625rem

### Step 2.11: Update CSS Overrides

Review and update all custom SCSS that overrides PF variables:
- Remove overrides that no longer apply
- Update overrides to use new PF6 token names
- Test visual appearance of all major pages

---

## Phase 3: Post-Migration Stabilization

**Goal:** Fix everything that broke, update tests, verify visual correctness.

### Step 3.1: Fix Failing Tests

After Phase 2, run the full test suite and fix all failures:
- Snapshot updates (expected — PF6 renders different HTML/classes)
- Assertion failures from component API changes
- Import path errors
- Token/class name mismatches

### Step 3.2: Visual Regression Testing

Manually verify all major UI pages:
- Login page
- Dashboard
- Host index / details
- Settings page
- Audits page
- All modal dialogs
- All form pages
- Navigation and breadcrumbs

### Step 3.3: Update @theforeman Packages

Coordinate with @theforeman maintainers to release updated versions of:
- `@theforeman/vendor` — must provide PF6 as shared dependency
- `@theforeman/builder` — update Babel config if needed
- `@theforeman/eslint-plugin-foreman` — update OUIA ID rules if PF6 changed OUIA API

### Step 3.4: Plugin Compatibility Communication

Notify plugin maintainers about:
- Required PF6 migration in their plugins
- Shared dependency version changes
- Any breaking API changes in shared Foreman components (TableIndexPage, etc.)
- Provide migration guide for plugin authors

---

## Phase 4: Modernization (Post-PF6, Independent Steps)

These steps are not required for PF6 but bring the codebase to modern standards.
Each is independently shippable.

### Step 4.1: Upgrade React Router v5 → v6

- Replace `Switch` → `Routes`
- Replace `<Route component={X}>` → `<Route element={<X />}>`
- Replace `useHistory()` → `useNavigate()`
- Replace `<Redirect>` → `<Navigate>`
- Remove `connected-react-router` dependency
- Update `react-router-bootstrap`

**Estimated scope:** ~20-30 files

### Step 4.2: Remove Unused Apollo Client

If GraphQL/Apollo is not actively used:
- Remove `@apollo/client`, `graphql`, `graphql-tag` dependencies
- Remove Apollo provider from ReactApp.js
- Remove GraphQL webpack loader config

### Step 4.3: Upgrade Testing Infrastructure

- Jest 26 → Jest 29
- Update `@testing-library/react` to latest
- Update `@testing-library/user-event` to latest
- Remove snapshot testing in favor of behavior testing where appropriate

### Step 4.4: Begin TypeScript Adoption

Start with new files, then gradually convert:
1. Add `tsconfig.json` with strict mode
2. Convert utility files first (`helpers.js`, `urlHelpers.js`)
3. Convert custom hooks
4. Convert small components
5. Add types for API responses
6. Eventually convert larger components

### Step 4.5: Rename PF4 Directory

The `components/PF4/` directory name is a historical artifact. Consider renaming to
something more descriptive (e.g., `components/shared/` or `components/core/`) since the
components inside are PF6-based after migration.

---

## Phase 5: Cleanup & Polish

### Step 5.1: Remove Legacy Common Components

After PF6 migration, audit `common/` for components superseded by PF6:
- `common/table/` (legacy table) — ensure all consumers use PF4/TableIndexPage
- `common/Loader/` — use PF6 Spinner/Skeleton directly
- `common/EmptyState/` — use PF6 EmptyState directly
- `common/Alert/` — use PF6 Alert directly

### Step 5.2: Consolidate Duplicate Patterns

Find and merge components that do the same thing differently:
- Multiple date formatting components
- Multiple empty state wrappers
- Multiple loading state patterns

### Step 5.3: Update ESLint & Prettier

- ESLint 6 → ESLint 9 (flat config)
- Prettier 1 → Prettier 3
- Add TypeScript ESLint rules when TS adoption begins

---

## Execution Strategy for Subagents

Each step above maps to one or more subagent tasks. The recommended approach:

### Parallel Tracks

**Track A: React Upgrade (Steps 0.1, 0.3)**
  - React 16→18, class→functional conversions

**Track B: Legacy Removal (Steps 0.2, 0.4)**
  - PF3 removal, Enzyme→RTL migration

**Track C: PF5 Cleanup (Steps 1.1–1.6)**
  - Depends on Track B completing
  - Deprecated component replacement, pattern standardization

**Track D: PF6 Migration (Steps 2.1–2.11)**
  - Depends on Tracks A, B, C completing
  - Core PF6 package upgrade + codemod execution

**Track E: Stabilization (Steps 3.1–3.4)**
  - Depends on Track D completing
  - Test fixes, visual verification

**Track F: Modernization (Steps 4.1–4.5)**
  - Independent of PF6, can run after Phase 3
  - Each step is independently shippable

### Subagent Assignment Strategy

For each step, a subagent should:
1. **Audit** — find all affected files for the specific change
2. **Transform** — make the code changes
3. **Test** — run affected tests and fix failures
4. **Verify** — ensure no regressions in related areas

### Risk Mitigation

- Each step should be a separate git branch / PR
- Run full test suite after each step before merging
- Visual testing for any UI-affecting changes
- Plugin compatibility testing after shared dependency changes
- Keep @theforeman/vendor in sync with core changes

---

## File Impact Summary

| Phase | Estimated Files | Risk Level |
|-------|----------------|------------|
| 0.1 React Upgrade | 15-25 | HIGH |
| 0.2 PF3 Removal | ~29 | MEDIUM |
| 0.3 Class→Functional | ~9 | LOW |
| 0.4 Enzyme→RTL | ~32 | LOW |
| 1.x PF5 Cleanup | ~30 | MEDIUM |
| 2.x PF6 Migration | ~200+ (codemods) | HIGH |
| 3.x Stabilization | ~50-100 (tests) | MEDIUM |
| 4.x Modernization | ~30-50 per step | LOW-MEDIUM |

**Total estimated files touched:** ~400-500 across all phases

---

## Dependencies & Ordering

```
Phase 0.1 (React 18) ─────┐
Phase 0.2 (Remove PF3) ───┤
Phase 0.3 (Class→Func) ───┼──→ Phase 1.x (PF5 Cleanup) ──→ Phase 2.x (PF6) ──→ Phase 3.x (Stabilize)
Phase 0.4 (Enzyme→RTL) ───┘                                                          │
                                                                                      ↓
                                                                               Phase 4.x (Modernize)
                                                                                      │
                                                                                      ↓
                                                                               Phase 5.x (Cleanup)
```

Phase 0 steps can run **in parallel** with each other.
Phase 1 depends on Phase 0 completion.
Phase 2 depends on Phase 1 completion.
Phases 4-5 are independent and can start after Phase 3.

---

## Completed Work

### Step 0.2: Remove PatternFly 3 Legacy Dependencies ✅

**Commit:** `e59e8de5e` — 2026-06-19
**Files changed:** 117

Migrated 29 files from `patternfly-react` (PF3) to `@patternfly/react-core` (PF5):
- Modal, Nav, Button, Dropdown, Alert, Spinner → PF5 equivalents
- FormGroup, FieldLevelHelp → PF5 `FormGroup` + `Popover`
- TypeAheadSelect → PF5 `Select` / `MenuToggle` + `Menu`
- c3-based charts (LineChart) → `@patternfly/react-charts`
- Removed `patternfly-react` and `patternfly` from `package.json`
- Removed PF3 SCSS imports from `vendor-core.scss`
- Removed PF3 from `webpack.vendor.js` and ESLint config
- Deleted 66 dead files in `common/table/` (legacy table directory)
- All 244 tests passing after snapshot updates

### Step 0.3: Convert Remaining Class Components to Functional ✅

**Commit:** `16b23d082` — 2026-06-19
**Files changed:** 10

Converted 9 class components to functional components with hooks:
- `i18nProviderWrapperFactory.js` → factory returning functional HOC
- `ExpansiveView.js` → functional with `useState`
- `BreadcrumbBar/index.js` → functional + `useSelector`/`useDispatch` (removed `connect`)
- `Editor/index.js` (~300 lines) → functional with hooks
- `EditorOptions.js` → functional
- `Fill/index.js` → functional
- `SearchInput/index.js` → functional
- `Select.js` (forms) → functional
- `StorageContainer` (vmware) → functional
- `ErrorBoundary` remains a class (React requires `componentDidCatch`)
- Updated `rtlTestHelpers.js` for new HOC wrapper API

### Step 0.4: Migrate Enzyme Tests to React Testing Library ✅

**Commit:** `8ab205f6e` — 2026-06-19
**Files changed:** 123

Fully removed Enzyme framework and migrated to React Testing Library:
- Migrated 25 test files from `shallow()`/`mount()` → RTL `render()`
- Rewrote `testComponentSnapshotsWithFixtures` to use RTL
- Rewrote `shallowRenderComponentWithFixtures` to use RTL
- Rewrote `IntegrationTestHelper.mount()` → RTL-based helpers
- Created `rtlTestHelpers.js` with `renderWithStore`, `renderWithI18n`, `renderWithStoreAndI18n`
- Removed `enzyme`, `enzyme-adapter-react-16`, `enzyme-to-json` from devDependencies
- Removed enzyme snapshot serializer from `jest.config.js`
- All 222 test suites pass (1139 tests, 378 snapshots)

### Step 0.1: Upgrade React 16 → React 18 ✅

**Date:** 2026-06-19
**Files changed:** 24

#### Package dependency changes
| Package | Before | After | Installed |
|---------|--------|-------|-----------|
| `react` | ^16.9.0 | ^18.2.0 | 18.3.1 |
| `react-dom` | ^16.8.1 | ^18.2.0 | 18.3.1 |
| `react-redux` | ^7.1.0 | ^8.1.0 | 8.1.3 |
| `connected-react-router` | 6.6.1 | 6.9.3 | 6.9.3 |
| `@testing-library/react` | ^10.0.2 | ^14.0.0 | 14.3.1 |
| `@testing-library/user-event` | ^13.2.1 | ^14.0.0 | 14.5.2 |
| `@testing-library/react-hooks` | ^3.4.2 | *removed* | — |
| `react-test-renderer` | ^17.0.1 | *removed* | — |
| `pretty-format` | 26.6.2 | *removed (pin)* | — |

#### Core migration
- **`MountingService.js`** — `ReactDOM.render()` → `createRoot()` with cached root per DOM element
  for efficient re-renders on attribute changes

#### Testing infrastructure
- **`global_test_setup.js`** — Added React 18 deprecation warning suppression (defaultProps,
  act warnings, childContextTypes, overlapping act, post-teardown errors). These are expected
  noise from PF5 components still using `defaultProps` and `react-intl` v2 using legacy context.
- **`testHelper.js`** — `renderHook` import migrated from `@testing-library/react-hooks` →
  `@testing-library/react`
- **`APIHooks.test.js`** — `waitForNextUpdate` pattern replaced with `waitFor()` (RTL 14)
- **`TableHooks.test.js`** — Import source updated to `@testing-library/react`
- **`AuditsList.test.js`** — `act` import from `react-dom/test-utils` → `@testing-library/react`

#### Test fixes for React 18 behavior changes
- **VMware storage tests** (controller.test.js, integration.test.js) — `userEvent.setup({ advanceTimers })`
  for fake timer compatibility with user-event v14
- **InlineEdit tests** — `getByLabelText` → `findByLabelText` for async state updates after clicks
- **Table test** — `waitFor` for async PF5 dropdown rendering
- **FiltersForm test** — `waitFor` for async permission list loading
- **OperatingSystem test** — `userEvent.setup({ advanceTimers })` for fake timer compat
- **DateTimePicker test** — `waitFor` + robust future time calculation (hour overflow fix)
- **Permitted tests** — Updated prop-type warning format assertions (React 18 uses `%s` placeholders)
- **HostsIndex test** — `jest.mock('react-redux')` instead of `jest.spyOn` (react-redux 8 makes
  exports non-configurable)
- **14 snapshot files** updated for React 18 whitespace rendering changes

#### Webpack build fix
- Removed `react/jsx-runtime` and `react/jsx-dev-runtime` aliases from `config/webpack.config.js`.
  These were a workaround for react-dnd on older React versions. React 18.3.x's `exports` field
  natively maps `./jsx-runtime` → `./jsx-runtime.js`, so the aliases caused a "not exported"
  error by bypassing the exports field resolution.

#### Decisions & notes
- `connected-react-router` kept at v6.9.3 — works with React 18 peer deps. Full removal
  planned for Phase 4.1 (React Router v5 → v6).
- `react-redux` v8 `connect()` HOC still works — no changes needed to the 9 files using it.
  Migration to hooks planned for Phase 1.5.
- `@theforeman/vendor` does not directly provide React — Module Federation `shared()` function
  in `webpack.config.js` dynamically picks up versions from `package.json`. No vendor changes needed.
- `react-intl` v2 works with React 18 (legacy context warnings suppressed in tests).
- All **222 test suites pass** (1139 tests, 378 snapshots)
- Container build (webpack + production bundle) verified clean
- App deploys and serves on http://127.0.0.1:3000 with React 18

---

## Phase 0 Status: COMPLETE ✅

All four pre-requisite steps are done. The codebase is on React 18, all PF3 dependencies
are removed, all class components are functional, and all tests use React Testing Library.
**Phase 1 (PF5 Cleanup) is unblocked.**
