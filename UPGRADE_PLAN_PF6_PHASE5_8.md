# Plan: Migrate Remaining ERB Pages to PF6 React Components (Phase 5–8)

## Context

After the dashboard redesign (Phase 4.11), the dashboard is fully React/PF6. However, **23 major index/list pages**, **44+ form pages**, and **24 jQuery files** still use legacy Bootstrap ERB patterns. The layout shell is already PF6, but page content is Bootstrap — creating visual inconsistency.

This plan organizes the remaining migration into 4 phases, each independently mergeable. The strategy: build reusable infrastructure first, then apply it systematically.

---

## Phase 5: Reusable Index Page Infrastructure

**Goal:** Create a generic `IndexPage` React component that replaces the repeating ERB pattern of `title + title_actions + search bar + table + pagination`. Once built, each index page migration becomes a ~30-line component + controller JSON serialization.

### 5.1: Create `IndexPage` component

**New file:** `webpack/.../components/common/IndexPage/index.js`

A generic wrapper that renders:
- PF6 `PageSection` with title
- PF6 `Toolbar` with action buttons (create, export, etc.) + search slot
- PF6 `Table` (from `@patternfly/react-table`) with sortable columns
- PF6 `Pagination` (already exists as React component)
- Empty state when no data

Props: `title`, `columns`, `rows`, `actions`, `searchUrl`, `pagination`, `createUrl`, `documentationUrl`

Reuse existing components:
- `webpack/.../common/EmptyState/EmptyStatePattern.js` — empty state
- `webpack/.../Pagination/index.js` — existing pagination component
- `webpack/.../SearchBar/` — existing search bar

### 5.2: Create `useIndexData` hook

**New file:** `webpack/.../components/common/IndexPage/useIndexData.js`

Custom hook that handles:
- Fetching JSON data from the controller (`GET /resource.json`)
- Pagination state (page, perPage)
- Sort state (column, direction)
- Search query forwarding
- Loading state

This replaces the ERB pattern where the controller renders HTML with `will_paginate`.

### 5.3: Update `title_actions` helper to pass props

**File:** `app/helpers/layout_helper.rb`

Add a `react_title_actions` helper that serializes action buttons as JSON props (label, url, method, icon) instead of rendering Bootstrap HTML. This enables gradual migration — pages can switch one at a time.

### 5.4: Create `ActionButtons` component

**New file:** `webpack/.../components/common/IndexPage/ActionButtons.js`

Renders action button props as PF6 `Button` and `Dropdown` components. Replaces:
- `new_link` → PF6 primary Button
- `select_action_button` → PF6 Dropdown with MenuItems
- `documentation_button` → PF6 link Button with ExternalLinkAltIcon

### 5.5: Tests for IndexPage infrastructure

Test files for IndexPage, useIndexData, ActionButtons.

---

## Phase 6: Index/List Page Migration

**Goal:** Convert all 23 ERB index pages to use the `IndexPage` component. Each page follows the same pattern:

1. Controller: add JSON response with serialized rows + pagination metadata
2. ERB: replace table HTML with `react_component('ResourceIndex', @props)`
3. React: thin wrapper component passing resource-specific columns to `IndexPage`

### Migration order (by user impact):

**Batch 6A — Core infrastructure pages (5 pages):**
- `domains/index` — simplest CRUD table, good first target
- `architectures/index` — minimal columns, validates the pattern
- `realms/index` — similar structure
- `media/index` — similar structure
- `compute_profiles/index` — similar structure

**Batch 6B — Networking & provisioning (5 pages):**
- `subnets/index`
- `compute_resources/index`
- `http_proxies/index`
- `operatingsystems/index`
- `ptables/index`

**Batch 6C — Templates & reports (4 pages):**
- `provisioning_templates/index`
- `report_templates/index`
- `config_reports/index`
- `bookmarks/index`

**Batch 6D — User management & access (5 pages):**
- `users/index`
- `usergroups/index`
- `roles/index`
- `filters/index`
- `common_parameters/index`

**Batch 6E — Remaining pages (4 pages):**
- `hostgroups/index`
- `smart_proxies/index`
- `fact_values/index`
- `key_pairs/index`

### Per-page pattern (example: `domains/index`):

**Controller** (`app/controllers/domains_controller.rb`):
```ruby
def index
  # ... existing logic ...
  respond_to do |format|
    format.html
    format.json { render json: serialize_index(@domains) }
  end
end
```

**ERB** (`app/views/domains/index.html.erb`):
```erb
<%= react_component('DomainsIndex', @index_props) %>
```

**React** (`webpack/.../components/DomainsIndex/index.js`):
```jsx
const DomainsIndex = (props) => (
  <IndexPage
    title={__('Domains')}
    columns={[
      { title: __('Name'), sort: 'name' },
      { title: __('Hosts'), sort: 'hosts_count' },
    ]}
    {...props}
  />
);
```

---

## Phase 7: Form Page Migration

**Goal:** Convert the 44 ERB form pages from `form_for`/`form_tag` to React form components.

### 7.1: Create `FormPage` component

**New file:** `webpack/.../components/common/FormPage/index.js`

Generic form wrapper using PF6 `Form`, `FormGroup`, `TextInput`, `Select`, `ActionGroup`. Handles:
- Field rendering from a schema (type, label, required, helpText)
- Validation display
- Submit via fetch (POST/PATCH with CSRF token)
- Cancel navigation

Reuse existing:
- `webpack/.../common/forms/FormField.js` — existing form field component
- `webpack/.../common/forms/InputFactory.js` — existing input type factory

### 7.2: Create form field type components

Map Rails form helpers to PF6 equivalents:
- `text_field` → PF6 `TextInput`
- `text_area` → PF6 `TextArea`
- `select` → PF6 `FormSelect` or `Select` (searchable)
- `check_box` → PF6 `Checkbox`
- `password_field` → PF6 `TextInput` type="password"
- `file_field` → PF6 file upload

### 7.3: Migrate simple CRUD forms first

**Batch 7A — Simple single-tab forms (10 pages):**
- `architectures/_form`
- `realms/_form`
- `media/_form`
- `models/_form`
- `compute_profiles/_form`
- `http_proxies/_form`
- `bookmarks/_form`
- `common_parameters/_form`
- `ssh_keys/_form`
- `autosign/_form`

**Batch 7B — Multi-field forms (8 pages):**
- `domains/_form`
- `smart_proxies/_form`
- `roles/_form`
- `images/_form`
- `auth_source_ldaps/_form`
- `auth_source_externals/_form`
- `compute_resources/_form`
- `lookup_keys/_edit`

**Batch 7C — Tabbed/complex forms (6 pages):**
- `subnets/_form` (tabs: subnet, domains, proxies)
- `operatingsystems/_form` (tabs: OS, ptables, media, templates)
- `hostgroups/_form` (tabs: host group, network, OS, parameters)
- `users/_form` (tabs: user, locations, orgs, roles)
- `usergroups/_form` (tabs: group, roles, external)
- `taxonomies/_form` + step wizards

**Batch 7D — Host forms (deferred — highest complexity):**
- `hosts/_form` — the most complex form in Foreman, with dynamic tabs, compute resource integration, AJAX loading. Migrate last or as a separate phase.

### 7.4: Migrate bulk operation modals

Convert the 11 host bulk operation forms (`multiple_build`, `multiple_destroy`, `select_multiple_*`, etc.) to use PF6 Modal + Form components. These are simpler forms rendered in modals.

---

## Phase 8: Legacy JS & SCSS Cleanup

**Goal:** Remove jQuery dependencies, clean up SCSS, and eliminate `window.tfm` pattern.

### 8.1: Migrate jQuery AJAX files to fetch

24 files import jQuery. Strategy per file:
- Replace `$.ajax()` → `fetch()` or the existing `API` module (`webpack/.../react_app/API.js`)
- Replace DOM manipulation → React components or remove if the page is already React
- Replace jQuery plugins (DataTables, select2, tooltips) → PF6 equivalents

**Priority order:**
1. `foreman_tools.js` — used everywhere, migrate `activateTooltips()`, `foremanUrl()` etc.
2. `foreman_compute_resource.js` — compute resource AJAX
3. `foreman_auth_source.js` — LDAP test connection
4. `foreman_http_proxies.js` — proxy test connection
5. `foreman_hosts.js` — host page JS
6. `compute_resource/*.js` (ec2, libvirt, openstack, vmware)
7. Remaining files (`foreman_users`, `foreman_medium`, etc.)

### 8.2: Clean up legacy SCSS

**Files to clean:**
- `app/assets/stylesheets/patternfly_and_overrides.scss` — remove `.label-default`, `.panel-*`, `.badge-*` selectors, replace `$color-pf-blue-500` with PF6 token
- `app/assets/stylesheets/base.scss` — remove `.label-light`
- `app/assets/stylesheets/base-pf4.scss` — PF3→PF4 compat layer, can be removed after form migration
- `app/assets/stylesheets/multi-select-overrides.scss` — `.glyphicon` reference

### 8.3: Remove `window.tfm` exports incrementally

As each jQuery file is replaced by React, remove its entry from `bundle.js`:
```js
// Remove from window.tfm as each module is migrated:
// authSource, computeResource, httpProxies, hosts, etc.
```

### 8.4: Remove jQuery dependency

After all `window.tfm` modules are migrated:
- Remove `require('dsmorse-gridster')` — **already done**
- Remove `require('jquery-ujs')` → replaced by Rails UJS or Turbo
- Remove `require('select2')` → replaced by PF6 Select
- Remove `require('datatables.net-bs')` → replaced by PF6 Table
- Eventually remove jQuery itself from `webpack/assets/javascripts/jquery.js`

### 8.5: Update error pages

Convert `common/403.html.erb`, `404.html.erb`, `500.html.erb`, `503.html.erb` to use PF6 `EmptyState` with appropriate icons. These are static pages — can use plain PF6 CSS classes without React.

### 8.6: Replace Bootstrap modals

7 files use Bootstrap modals. Replace with PF6 `Modal` component (already available as `ForemanModal` React component in `webpack/.../ForemanModal/`):
- `common/_modal.html.erb` — generic wrapper
- `hosts/_conflicts.html.erb` — conflict resolution
- `hosts/_dhcp_lease_errors.html.erb` — DHCP errors
- `hosts/_interfaces.html.erb` — network interface editor
- `hosts/_list.html.erb` — bulk operations
- `hosts/show.html.erb` — host detail modals

---

## Execution Order

```
Phase 5 (infrastructure)  ←  Do first, enables everything else
    ↓
Phase 6A-6E (index pages) ←  Can be done in parallel batches
    ↓
Phase 7A-7C (forms)       ←  Depends on Phase 6 for pattern validation
    ↓
Phase 7D (host forms)     ←  Most complex, do last
    ↓
Phase 8 (cleanup)         ←  Incremental, can overlap with 6/7
```

Each batch within a phase is independently mergeable.

## Verification

After each batch:
1. `npm test` — all test suites pass
2. `/deploy-local` — rebuild and verify in browser
3. Visual checks: PF6 styling, dark mode, responsive layout
4. Functional checks: CRUD operations, search, pagination, sort
5. Plugin compatibility: Slot/Fill extension points still work

## Scale Estimate

| Phase | Pages/Files | Estimated effort |
|-------|------------|-----------------|
| 5 (infrastructure) | 5 new files | Foundation — do carefully |
| 6 (index pages) | 23 pages | Repeatable pattern, fast after first 2-3 |
| 7A-7C (simple forms) | 24 pages | Moderate — schema-driven |
| 7D (host forms) | 1 page | High complexity — separate effort |
| 8 (cleanup) | 24 JS + SCSS files | Incremental, low risk |
