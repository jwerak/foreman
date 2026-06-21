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

### Step 1.1: Replace Deprecated PF5 Dropdown/Select/ContextSelector Components ✅

**Date:** 2026-06-20
**Files changed:** 18

Removed all imports from `@patternfly/react-core/deprecated` and `@patternfly/react-table/deprecated`:

#### Dropdown migrations (10 files)
- `PowerStatusDropDown.js` — `DropdownToggle` → `MenuToggle variant="plain"` + render function
- `UserDropdowns.js` — `DropdownToggle` + `DropdownSeparator` → `MenuToggle` + `Divider`
- `Bookmarks.js` + `BookmarkItems.js` — `DropdownToggle` + `DropdownGroup` + `DropdownSeparator`
  → `MenuToggle` + `DropdownGroup` + `Divider` (from `@patternfly/react-core`)
- `ActionButtons.js` — `KebabToggle` → `MenuToggle variant="plain"` + `EllipsisVIcon`
- `HostsIndex/index.js` — `KebabToggle` in legacyUIKebab → `MenuToggle` + `EllipsisVIcon`
- `helpers.js` (ReportsTab) — `KebabToggle` → `MenuToggle variant="plain"` + `EllipsisVIcon`
- `SelectAllCheckbox` — `DropdownToggleCheckbox` → `MenuToggleCheckbox`, split button pattern
- `DocumentationLink` — import moved from deprecated to `@patternfly/react-core`

#### Deprecated Select migrations (3 files)
- `SelectResourceType.js` — `Select` + `SelectVariant.typeahead` → composable `Select` +
  `MenuToggle variant="typeahead"` + `TextInputGroup` + `SelectList` + `SelectOption`
- `SelectRole.js` — Same typeahead Select migration pattern
- `EditTableRow.js` — Two `Select` instances (single variant) → composable `Select` +
  `MenuToggle` + `SelectList` + `SelectOption`

#### ContextSelector migration (1 file)
- `TaxonomyDropdown.js` — `ContextSelector` + `ContextSelectorItem` + `ContextSelectorFooter`
  → `Dropdown` + `MenuToggle` + `SearchInput` + `DropdownList` + `DropdownItem` + `Divider`
- `TaxonomyDropdown.scss` — Removed ContextSelector-specific CSS variable overrides

#### Deprecated Table migrations (2 files)
- `StatusTable.js` — `Table`/`TableHeader`/`TableBody` from deprecated → composable
  `Table`/`Thead`/`Th`/`Tbody`/`Tr`/`Td`/`ActionsColumn`
- `Details.js` (HostStatuses) — Same composable table pattern

#### ESLint config update (1 file)
- `require-ouiaid.js` — Removed deprecated component names (`Chip`, `ChipGroup`,
  `ContextSelector`, `DropdownSeparator`, `DropdownToggle`, `DropdownToggleCheckbox`,
  `TableComposable`), added new names (`MenuToggle`, `MenuToggleCheckbox`, `ActionsColumn`)

### Step 1.2: Replace Chip Component with Label ✅

**Date:** 2026-06-20
**Files changed:** 0

Audit found zero usage of `Chip` or `ChipGroup` in the codebase. No migration needed.

### Step 1.3: Replace Text/TextContent with Content ✅ (Deferred)

**Date:** 2026-06-20
**Files changed:** 0

`Content` component is NOT available in PF5 — it's a PF6-only component. The 15 files
using `Text`/`TextContent`/`TextList`/`TextListItem` will be automatically migrated by
the PF6 codemods in Phase 2. No manual migration needed at this stage.

### Step 1.4: Standardize EmptyState Usage ✅

**Date:** 2026-06-20
**Files changed:** 1

- `Loading.js` — Moved conditional title text from `Title` inside `EmptyStateFooter` to
  `titleText` prop on `EmptyStateHeader` (PF6 codemod-compatible pattern). Added `headingLevel`.
  Removed unused `Title` and `EmptyStateFooter` imports.
- `GlobalState.js` — Already uses correct PF5 composable pattern. No changes needed.
- `EmptyStatePattern.js` — Already uses `EmptyStateHeader` with `titleText`. No changes needed.

---

## Phase 1 Status (Steps 1.1-1.4): COMPLETE ✅

Zero `@patternfly/react-core/deprecated` or `@patternfly/react-table/deprecated` imports
remain in the codebase. All Dropdown, Select, ContextSelector, Table, and EmptyState components
use the current composable PF5 patterns that the PF6 codemods can cleanly transform.
**Phase 2 (PF6 Core Migration) is unblocked for steps 1.1-1.4.**

### Step 2.1: Update Package Dependencies ✅

**Date:** 2026-06-20
**Files changed:** 1 (package.json)

Updated all PatternFly packages to v6.4.x stable:

| Package | Before | After |
|---------|--------|-------|
| `@patternfly/patternfly` | ^5.4.2 | ~6.4.0 |
| `@patternfly/react-core` | ^5.4.8 | ~6.4.3 |
| `@patternfly/react-icons` | ^5.4.2 | ~6.4.0 |
| `@patternfly/react-styles` | ^5.4.1 | ~6.4.0 |
| `@patternfly/react-table` | ^5.4.8 | ~6.4.3 |
| `@patternfly/react-tokens` | ^5.4.1 | ~6.4.0 |
| `@patternfly/react-templates` | ^1.1.8 | ~6.4.3 |
| `@patternfly/react-charts` | ~7.4.5 | ~8.4.1 |

Added 17 `victory-*` peer dependencies (^37.3.6) required by `@patternfly/react-charts` v8.

### Step 2.2: Run PatternFly Codemods ✅

**Date:** 2026-06-20
**Files changed:** 84

Ran `npx @patternfly/pf-codemods@latest ./webpack --v6 --fix` which auto-fixed 199 issues:
- `text-replace-with-content` (84) — `Text`/`TextContent`/`TextList`/`TextListItem` → `Content`
- `button-moveIcons-icon-prop` (32) — Button icon children → `icon` prop
- `modal-deprecated` (21) — Modal imports moved to `@patternfly/react-core/deprecated`
- `formGroup-rename-labelIcon` (17) — `labelIcon` → `labelHelp` prop
- `tokens-update` (13) — PF5 React tokens → PF6 equivalents
- `emptyState-nonExported-components` (9) — EmptyStateHeader/Icon inlined into EmptyState
- `pageSection-update-variant-values` (7) — PageSection variant value changes
- `chartsImport-moved` (5) — Chart imports → `@patternfly/react-charts/victory`
- `emptyStateHeader-move-into-emptyState` (4) — EmptyState restructuring
- `toolbar-update-align-values` (3) — `alignLeft`/`alignRight` → `alignStart`/`alignEnd`
- Various other component API updates

### Steps 2.3-2.5: CSS Class, Token, and SCSS Variable Updates ✅

**Date:** 2026-06-20
**Files changed:** 70 (36 SCSS/CSS + 22 JS source + 12 test/fixture)

#### CSS class prefix updates
All `pf-v5-c-*`, `pf-v5-u-*`, `pf-v5-l-*`, `pf-v5-svg` class references → `pf-v6-*` across
all SCSS, CSS, JS, and test files. Zero `pf-v5-` references remain.

#### Global CSS variable mappings (PF5 → PF6 semantic tokens)
- `--pf-v5-global--BackgroundColor--100` → `--pf-t--global--background--color--primary--default`
- `--pf-v5-global--BackgroundColor--200` → `--pf-t--global--background--color--secondary--default`
- `--pf-v5-global--BorderColor--100` → `--pf-t--global--border--color--default`
- `--pf-v5-global--Color--100` → `--pf-t--global--text--color--regular`
- `--pf-v5-global--Color--200` → `--pf-t--global--text--color--subtle`
- `--pf-v5-global--disabled-color--100` → `--pf-t--global--text--color--disabled`
- `--pf-v5-global--success-color--100` → `--pf-t--global--icon--color--status--success--default`
- `--pf-v5-global--danger-color--100` → `--pf-t--global--icon--color--status--danger--default`
- `--pf-v5-global--warning-color--100` → `--pf-t--global--icon--color--status--warning--default`
- `--pf-v5-global--spacer--*` → `--pf-t--global--spacer--*` (xs/sm/md/lg)
- `--pf-v5-global--FontSize--*` → `--pf-t--global--font--size--body--*`
- Component variables: `--pf-v5-c-*` → `--pf-v6-c-*`
- Sass variables: `$pf-v5-global--*` → `$pf-v6-global--*`, `$pf-prefix: 'pf-v6-'`

#### Codemod placeholder tokens resolved
Replaced all `--pf-t--temp--dev--tbd` placeholders with correct PF6 semantic tokens.

### Build & Infrastructure Fixes ✅

**Date:** 2026-06-20
**Files changed:** 5

#### SCSS build fix (variables.scss)
- Replaced `@import '~@patternfly/patternfly/base/patternfly-variables'` with
  `@import '~@patternfly/patternfly/sass-utilities/scss-variables'` — PF6's
  `patternfly-variables.scss` uses Sass `@use` modules internally which conflicts
  with our `@import`-based system.
- Changed PF6 CSS import in `vendor-core.scss` from `.scss` source to pre-compiled
  `.css` to avoid `@use`/`@import` `$fa-font-path` variable collision.

#### Webpack config fixes
- `webpack.vendor.js` — Changed `@patternfly/react-charts` → `@patternfly/react-charts/victory`
  (PF6 react-charts v8 has no main entry, only subpath exports).
- `webpack.config.js` — Excluded `@patternfly/react-charts` from Module Federation shared
  config (no main entry to resolve).
- `jest.config.js` — Added moduleNameMapper for `@patternfly/react-icons/dist/esm/` → `dist/js/`
  (PF6 icons ESM not parseable by Jest 26).

### Test Fixes ✅

**Date:** 2026-06-20
**Files changed:** 33

#### Component fixes for PF6 API changes
- `DiskForm.js` — `TypeaheadSelect` props: `selectOptions` → `initialOptions`, moved `selected`
  state into option objects (PF6 `@patternfly/react-templates` API change).
- `ActionButtons.js` — `DropdownItem` `href` → `to` prop (PF6 MenuItem API change).
- `FieldConstructor.js` — `FormGroup` `labelIcon` → `labelHelp` prop.

#### Test assertion fixes for PF6 DOM changes
- Button text wrapping: PF6 wraps button text in `<span class="pf-v6-c-button__text">`, so
  `getByText()` returns the span not the button. Fixed with `.closest('button')` or
  `.closest('a')` in EmptyState, UpgradePage, PersonalAccessTokenModal tests.
- NotificationBadge: `span.pf-m-expanded` → `[aria-expanded="true"]` (PF6 uses button attrs).
- Select `aria-label` duplication: `getByLabelText()` → `getAllByLabelText()` + filter for INPUT
  (PF6 composable Select puts aria-label on both toggle and input).
- TaxonomySelect: `.scrollable-container` → OUIA attribute queries (PF6 Select only renders
  Menu when open).
- FormField snapshots: Added time-value normalization to `stabilizeHtml` for deterministic
  Time/DateTime snapshots.

#### Snapshot updates
58 snapshots updated across 40 test suites for PF6 HTML/class changes.

**All 222 test suites pass (1139 tests, 375 snapshots).**

---

## Phase 2 Status: COMPLETE ✅

All PatternFly packages upgraded to v6.4.x. All CSS classes, tokens, and variables updated.
Webpack build compiles cleanly. All 222 test suites pass. App deploys and serves on
http://127.0.0.1:3000 with PF6.

### Steps 2.6-2.11: Manual Token Fixes, Modal Migration, Test Fixes ✅

**Date:** 2026-06-20
**Files changed:** 22 (21 modal files + jest.config.js)

#### Audit results (Steps 2.6, 2.7, 2.8, 2.10 — all clear)
- **Step 2.6 (Manual tokens):** Zero `--pf-t--temp--dev--tbd` placeholder tokens remain
- **Step 2.7 (Chart imports):** All 5 chart files already use `@patternfly/react-charts/victory`
- **Step 2.8 (SearchModal /next):** Zero `@patternfly/react-core/next` imports remain
- **Step 2.10 (Breakpoint logic):** Zero pixel-based breakpoint values in JS conditional logic

#### Deprecated Modal → PF6 promoted Modal migration (21 files)
Migrated all `@patternfly/react-core/deprecated` Modal imports to PF6 composable
Modal with `ModalHeader`/`ModalBody`/`ModalFooter`:
- ChartBox, ColumnSelector, ConfirmModal, DiffModal, EditorModal, ForemanModal
- BuildModal, StatusesModal, ReviewModal, ImpersonateIcon, DeleteModal
- ModalProgressBar (also removed invalid `showClose` prop)
- PersonalAccessTokenModal, RepositoryModal
- All 7 BulkAction modals (Assign, Build, ChangeOwner, Disassociate, ManageNotifications,
  PowerState, Reassign)

Pattern: `ModalVariant.small` → `variant="small"`, `title` prop → `<ModalHeader title="..." />`,
`actions` prop → `<ModalFooter>`, body content → `<ModalBody>`, added `aria-labelledby`

#### Step 2.9 (Button test assertions)
Already handled in Phase 2.1-2.5 test fixes.

#### Step 2.11 (CSS override review)
Audited 20 SCSS files with 84 PatternFly variable references:
- 11 component variable overrides (`--pf-v6-c-*`) — all valid PF6 variables
- 73 design token references (`--pf-t--global--*`) — all valid semantic tokens
- Zero `--pf-v5` leftovers, zero invalid tokens, zero placeholder tokens
- All overrides are intentional theming customizations

#### Jest config fix
- Added explicit `moduleNameMapper` entries for `@patternfly/react-core` and
  `@patternfly/react-table` pointing to `dist/js/index.js` (prevents Jest 26 from
  resolving PF6 TypeScript sources instead of compiled output)

#### Remaining deprecated import
- `Pf4DualList/index.js` still imports `DualListSelector` from `@patternfly/react-core/deprecated`.
  PF6's composable DualListSelector has a fundamentally different API (no `availableOptions`,
  `chosenOptions`, `onListChange` props). Migration requires rewriting the component and all
  consumers. Deferred to a separate task.

**All 222 test suites pass (1139 tests, 375 snapshots).**

---

## Phase 3 Status: COMPLETE ✅

### Step 3.1: Fix Failing Tests ✅

**Date:** 2026-06-20
**Files changed:** 0

Full test suite run: **222 test suites pass (1139 tests, 375 snapshots, 1 skipped).**
All snapshot files are current — zero obsolete, zero needing update. No test fixes required
beyond what was already done in Phase 2.

### Step 3.2: Stabilization Audit ✅

**Date:** 2026-06-20

Comprehensive audit for remaining PF5/deprecated patterns:
- **`@patternfly/react-core/deprecated`:** 1 file — `Pf4DualList/index.js` (DualListSelector,
  already documented as deferred due to fundamental API change)
- **`@patternfly/react-core/next`:** None
- **`pf-v5-` CSS classes:** None
- **`--pf-v5` CSS variables:** None
- **`$pf-v5` Sass variables:** None
- **`--pf-t--temp--dev--tbd` placeholders:** None
- **Legacy PF3 imports:** None
- **Deprecated `TextContent`/`TextList`/`TextListItem`:** None (all migrated to `Content`)

The codebase is clean except for the one known deferred DualListSelector migration.

### Step 3.2b: Visual Regression Testing ✅

**Date:** 2026-06-20

Container rebuild with PF6 code deployed and verified on http://127.0.0.1:3000:
- Webpack production build compiles cleanly (27 warnings — all Sass `/` division deprecations
  from the `patternfly` PF3 npm package in `variables.scss`, cosmetic only)
- App deploys and serves with PF6 styling
- Login page renders correctly
- Dashboard loads with PF6 components (`pf-v6-c-page`, `pf-v6-c-page__main-section`)
- Hosts, Settings, Audits, Models pages all respond HTTP 200
- Zero `pf-v5` CSS classes in rendered HTML output

#### Additional fixes discovered during visual testing

**ERB template fixes (2 files):**
- `app/views/layouts/base.html.erb` — `pf-v5-c-page` → `pf-v6-c-page`
- `app/views/layouts/_application_content.html.erb` — 3× `pf-v5-c-page__*` → `pf-v6-c-page__*`

**Ruby integration test selector updates (12 files, ~30 changes):**
- `test/integration_test_helper.rb` — `pf-v5-c-nav__link`, `pf-v5-c-nav__item` → `pf-v6-c-*`;
  `pf-v5-c-context-selector__toggle` → `pf-v6-c-menu-toggle` (ContextSelector → Dropdown in PF6);
  `pf-v5-c-context-selector__menu` → `pf-v6-c-menu`
- 11 integration test files — all `pf-v5-c-*` selectors → `pf-v6-c-*` (pagination, button,
  breadcrumb, menu, modal-box, skeleton, masthead, text-input-group, page__main-breadcrumb)

### Steps 3.3-3.4: @theforeman Packages & Plugin Communication

**Status:** Out of scope for this PR. These are coordination tasks:
- `@theforeman/vendor` update to provide PF6 as shared dependency
- `@theforeman/builder` Babel config review
- Plugin maintainer notification and migration guide

These require upstream coordination and will be handled as separate follow-up tasks.

## Phase 4 Status: PF6 Native Sidebar, Dark Mode, Multi-Expand Nav

**Date:** 2026-06-20

### Step 4.6: Remove Custom Sidebar Color Overrides ✅

Removed hardcoded dark teal (#024d6c) sidebar color overrides so PF6 design-token-based
theming takes over (light gray in light mode, dark gray in dark mode).

**Files changed:**
- `app/assets/stylesheets/patternfly_colors_overrides.scss` — removed `@import './colors.scss'`,
  `--pf-v6-c-page__sidebar--BackgroundColor`, `.pf-v6-c-nav__link` color overrides,
  `.pf-v6-c-nav__subnav` and `.pf-v6-c-nav__item` blocks. Added `.pf-v6-c-nav__toggle { display: none }`
  to hide expand/collapse chevrons.
- `app/assets/stylesheets/colors.scss` — removed unused nav variables (`$navbar-default-link-color`,
  `$topbar-default-color`, `$nav-pf-vertical-*-bg-color`)
- `webpack/.../common/colors.scss` — removed unused nav variables

### Step 4.7: Remove Masthead Background Image & Fix Brand Colors ✅

**Files changed:**
- `app/assets/stylesheets/navigation.scss` — replaced `background: ... image-url('navbar.png')`
  with `background-color: var(--pf-v6-c-masthead--BackgroundColor)`
- `webpack/.../Toolbar/HeaderToolbar.scss` — brand text `color: white` → `var(--pf-t--global--text--color--regular)`
- `webpack/.../Layout/layout.scss` — removed `background-repeat`/`background-size` from masthead,
  fixed hover color to use PF6 token, fixed search bar alignment (padding instead of hardcoded width),
  hid nav toggle chevrons

### Step 4.8: Multi-Expand Navigation ✅

Replaced accordion behavior (one section at a time) with multi-expand (multiple sections
open simultaneously, like OpenShift Console).

**Files changed:**
- `webpack/.../Layout/Navigation.js` — replaced `currentExpanded` string state with
  `expandedSections` Set; `isExpanded` checks `set.has(title)`; `onExpand` toggles set membership.
  Secondary NavExpandables remain accordion-style within each section.

### Step 4.9: Dark/Light Mode Toggle ✅

Added a toolbar toggle button for dark/light mode with system preference support
and FOUC prevention.

**New files:**
- `webpack/.../ThemeToggle/useTheme.js` — custom hook managing localStorage key
  `foreman-theme-preference`, `prefers-color-scheme` media query, and `pf-v6-theme-dark` class
- `webpack/.../ThemeToggle/ThemeToggle.js` — plain Button with MoonIcon/SunIcon and Tooltip

**Files changed:**
- `webpack/.../Toolbar/HeaderToolbar.js` — added ThemeToggle ToolbarItem before notification icon
- `app/views/layouts/base.html.erb` — added inline `<script>` in `<head>` to apply dark class
  synchronously (prevents flash of light theme)

### Step 4.10: Test Updates ✅

**Files changed:**
- `webpack/.../Layout/__tests__/Layout.test.js` — updated assertions for multi-expand
  (Dashboard stays visible after expanding Hosts), added collapse-on-re-click test
- `webpack/.../ThemeToggle/ThemeToggle.test.js` — **new**, 4 tests for render, toggle, persist, round-trip
- `webpack/.../Toolbar/__snapshots__/HeaderToolbar.test.js.snap` — regenerated with ThemeToggle
- `webpack/global_test_setup.js` — added global `window.matchMedia` mock for jsdom

**Test results:** 223 suites pass, 1145 tests (1144 pass, 1 skipped), 375 snapshots.

### Step 4.11: Dashboard Redesign with PF6 Native Components ✅

Replaced the legacy jQuery/Gridster-based dashboard with a modern React + PF6 component
architecture. All data is now passed as props from the controller (no per-widget AJAX).

**Key changes:**
- **Controller** (`app/controllers/dashboard_controller.rb`): Rebuilt to serialize all dashboard
  data (status, charts, events, hosts) as JSON props. Removed widget CRUD actions.
- **ERB** (`app/views/dashboard/index.html.erb`): Replaced Gridster grid with single
  `react_component('Dashboard', @dashboard_props)` call.
- **React components** (7 new files in `webpack/.../Dashboard/`):
  - `Dashboard/index.js` — main layout with PF6 Grid, origin filter, fetch-on-change
  - `AggregateStatusCard.js` — status summary bar with origin dropdown (PF6 Select)
  - `StatusChartCard.js` — donut chart (reuses existing `DonutChart`)
  - `RunDistributionCard.js` — bar chart (reuses existing `BarChart`)
  - `LatestEventsCard.js` — PF6 Table with color-coded Labels
  - `NewHostsCard.js` — PF6 Table with relative dates
  - `BuildModeCard.js` — PF6 Table with status icons (conditional render)
- **Component registry** (`componentRegistry.js`): Registered `Dashboard` component.
- **Gridster removal**: Removed `dsmorse-gridster` dependency, Gridster JS/SCSS, jQuery
  plugin require, vendor CSS import. Cleaned up `bundle.js` dashboard import.
- **Routes** (`config/routes.rb`): Removed widget CRUD routes (show/create/destroy/save_positions/reset_default).
- **Plugin extensibility**: `<Slot id="dashboard-cards" multi />` at bottom of grid.
- **Dark mode**: All components use PF6 design tokens — no hardcoded colors.

**Files added:**
- `webpack/.../Dashboard/index.js`
- `webpack/.../Dashboard/AggregateStatusCard.js`
- `webpack/.../Dashboard/StatusChartCard.js`
- `webpack/.../Dashboard/RunDistributionCard.js`
- `webpack/.../Dashboard/LatestEventsCard.js`
- `webpack/.../Dashboard/NewHostsCard.js`
- `webpack/.../Dashboard/BuildModeCard.js`
- `webpack/.../Dashboard/__tests__/Dashboard.test.js`
- `webpack/.../Dashboard/__tests__/AggregateStatusCard.test.js`
- `webpack/.../Dashboard/__tests__/StatusChartCard.test.js`
- `webpack/.../Dashboard/__tests__/LatestEventsCard.test.js`
- `webpack/.../Dashboard/__tests__/NewHostsCard.test.js`
- `webpack/.../Dashboard/__tests__/BuildModeCard.test.js`

**Files modified:**
- `app/controllers/dashboard_controller.rb`
- `app/views/dashboard/index.html.erb`
- `webpack/.../componentRegistry.js`
- `webpack/assets/javascripts/bundle.js`
- `webpack/assets/javascripts/jquery.js`
- `webpack/assets/javascripts/dashboard/index.js` (gutted)
- `webpack/assets/javascripts/dashboard/index.scss` (gutted)
- `webpack/.../common/scss/vendor-core.scss`
- `webpack/assets/javascripts/all_react_app_exports.js` (regenerated)
- `config/routes.rb`
- `package.json`

**Files removed:**
- `webpack/assets/javascripts/dashboard/gridster.scss`

**Test results:** 229 suites pass, 1172 tests (1171 pass, 1 skipped), 375 snapshots.

## Phase 11: Unified Detail Pages with OpenShift-style Layout

**Goal:** Create SPA detail/edit pages for all resources so clicking a row in an index table navigates without full reload, with proper sidebar highlighting and breadcrumb navigation.

**Full plan:** `.claude/plans/unified-detail-pages.md`

### Phase 11.1: Fix Sidebar Active State ✅ COMPLETE (2026-06-21)

**Problem:** Navigating to `/domains/5` lost sidebar highlighting because all path matching was exact (`/domains` !== `/domains/5`).

**File modified:** `webpack/.../components/Layout/Navigation.js`

**Changes:**
1. Added `findActiveParent(path)` helper (lines 60-70) — resolves a path to its parent menu title via `subItemToItemMap`, tries exact match first, falls back to longest prefix match with `/` separator guard
2. Updated sub-item `isActive` logic (lines 104-112) — added `currentPath.startsWith(href + '/')` fallback
3. Replaced 3 exact `subItemToItemMap[...]` lookups with `findActiveParent()` for initial expand, navigation update, and `NavExpandable` `isActive` prop
4. Updated secondary expand match (lines 138-143) — added prefix fallback for nested menu groups

**Test file added:** `webpack/.../components/Layout/__tests__/Navigation.test.js`

### Phase 11.2: Form Fields API Endpoint ✅ COMPLETE (2026-06-21)

**New file:** `app/controllers/concerns/foreman/controller/form_fields_api.rb`

Concern that adds a `form_fields` action calling `set_form_fields` and rendering `{ fields: @form_fields || [] }` as JSON.

**Controllers updated (21 includes):**
ArchitecturesController, DomainsController, BookmarksController, HostgroupsController,
OperatingsystemsController, RealmsController, MediaController, ComputeProfilesController,
SubnetsController, ComputeResourcesController, HttpProxiesController, RolesController,
UsersController, UsergroupsController, SmartProxiesController, CommonParametersController,
ImagesController, SshKeysController, AuthSourceExternalsController, AuthSourceLdapsController,
Foreman::Controller::TaxonomiesController (concern — covers LocationsController + OrganizationsController)

**Routes added:** 20 `get 'form_fields'` collection routes in `config/routes.rb` for all
top-level resources with `set_form_fields`.

**Test file added:** `test/controllers/concerns/form_fields_api_test.rb`

### Phase 11.4D: Rails Routes for Direct URL Access ✅ COMPLETE (2026-06-21)

Added `get ':resource/:id', to: 'react#index'` with `constraints(id: /\d+/)` at the top of
`config/routes.rb` for 23 resources:

**FormPage resources (20):** architectures, domains, hostgroups, operatingsystems, realms,
media, compute_profiles, subnets, compute_resources, http_proxies, bookmarks, roles, users,
usergroups, smart_proxies, common_parameters, auth_source_ldaps, auth_source_externals,
locations, organizations

**TemplateForm resources (3):** templates/provisioning_templates, templates/ptables,
templates/report_templates

Routes are placed before all resource definitions so they take priority over existing `show`
actions (e.g., smart_proxies, compute_resources). The `\d+` constraint ensures only numeric
IDs are matched, preventing conflicts with named routes like `/users/login`.

### Phase 11.3: DetailPage Component ✅ COMPLETE (2026-06-21)

Created the unified DetailPage component system with three sub-components:

**New files:**
- `webpack/.../components/common/DetailPage/useDetailData.js` — Custom hook that parallel-fetches
  resource data (`GET /api/v2/{resource}/{id}`) and field definitions (`GET /{resource}/form_fields`).
  Returns `{ resource, fields, isLoading, error }` with cancellation on unmount.
- `webpack/.../components/common/DetailPage/DetailsTabContent.js` — Renders resource data as PF6
  `DescriptionList`. Groups fields by `tab` property into `Card` sections. Formats by type:
  `select` → option label lookup, `checkbox` → Yes/No, `checkboxGroup` → comma-separated names,
  `password` → masked (********), `hidden` → skipped, default → string value or dash.
- `webpack/.../components/common/DetailPage/index.js` — Main DetailPage layout with `PageSection`
  breadcrumb (Link to index), `Title` heading, and `Tabs` (Details + Edit). Uses `useDetailData`
  hook, passes fields to both `DetailsTabContent` and `FormPage`. Edit tab uses `onSubmitSuccess`
  callback for SPA navigation back to index via `useHistory().push()`.

**Modified file:**
- `webpack/.../components/common/FormPage/index.js` — Added `embedded` prop (default false).
  When true, skips outer `pf-v6-c-page__main-section` wrapper div and renders form content
  directly. Uses a `Wrapper` component pattern (Fragment vs div) to avoid code duplication.

**Test files (20 tests, all passing):**
- `__tests__/useDetailData.test.js` — 4 tests: loading state, parallel fetch, error handling,
  empty fields response
- `__tests__/DetailsTabContent.test.js` — 9 tests: text fields, empty values, hidden fields,
  checkbox Yes/No, password masking, select label lookup, checkboxGroup names, empty checkboxGroup,
  tab grouping into cards
- `__tests__/DetailPage.test.js` — 7 tests: loading spinner, error alert, breadcrumb/title/tabs,
  tab switching to edit form, initialTab="edit", nameField prop, breadcrumb link href

### Phase 11.4A-C: Resource Configuration Registry + Route Generator ✅ COMPLETE (2026-06-21)

**New files:**
- `webpack/.../routes/DetailPages/resourceConfigs.js` — Data-driven registry with one entry per
  resource. Each config has: `indexPath`, `apiUrl`, `controller`, `resourceName`, `title`,
  `nameField`, `fieldsUrl`. 18 FormPage resources + 3 TemplateForm resources (with
  `formComponent: 'TemplateForm'` flag, `fieldsUrl: null`). TemplateForm resources are excluded
  from route generation (deferred to Phase 11.5+ when TemplateForm supports embedded mode).
- `webpack/.../routes/DetailPages/index.js` — Route generator that creates two routes per
  FormPage config: `/:indexPath/:id` (details tab) and `/:indexPath/:id/edit` (edit tab).
  Edit routes are listed first so `/edit` suffix matches before the catch-all `:id` pattern.

**Modified file:**
- `webpack/.../routes/routes.js` — Added `...DetailPages` import and spread before `...IndexPages`
  so detail routes take priority over index catch-all.

### Phase 11.5: Update Index Page Links ✅ COMPLETE (2026-06-21)

Changed `<a href="/resource/:id/edit">` to `<Link to="/resource/:id">` in 18 index page
components for SPA navigation. Also updated 3 edit row actions from `window.location.href`
to `history.push()` using React Router's `useHistory` hook.

**Components modified (18):**
DomainsIndex, ArchitecturesIndex, HostgroupsIndex, OperatingsystemsIndex, RealmsIndex,
MediaIndex, ComputeProfilesIndex, SubnetsIndex, ComputeResourcesIndex, HttpProxiesIndex,
PtablesIndex, ProvisioningTemplatesIndex, ReportTemplatesIndex, UsersIndex, UserGroupsIndex,
RolesIndex, BookmarksIndex, SmartProxiesIndex

**Pattern (15 components — Link only):**
- Import `{ Link } from 'react-router-dom'`
- `<a href={`/resource/${row.id}/edit`}>` → `<Link to={`/resource/${row.id}`}>`

**Pattern (3 components — Link + useHistory for edit row action):**
- ComputeProfilesIndex: "Rename" action → `history.push()`
- ComputeResourcesIndex: "Edit" action → `history.push()`
- SmartProxiesIndex: "Edit" action → `history.push()`

**Test files updated (18):**
- Added `<MemoryRouter>` wrapper around all test renders (required for `<Link>`)
- Updated href assertions from `/resource/:id/edit` → `/resource/:id`
- Renamed test descriptions from "links to edit page" → "links to detail page"
