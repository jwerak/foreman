# Plan: Migrate Remaining ERB Pages to PF6 React Components (Phase 5–8)

## Context

After the dashboard redesign (Phase 4.11), the dashboard is fully React/PF6. However, **23 major index/list pages**, **44+ form pages**, and **24 jQuery files** still use legacy Bootstrap ERB patterns. The layout shell is already PF6, but page content is Bootstrap — creating visual inconsistency.

This plan organizes the remaining migration into 4 phases, each independently mergeable. The strategy: build reusable infrastructure first, then apply it systematically.

---

## Phase 5: Reusable Index Page Infrastructure ✅ COMPLETE (2026-06-20)

**Goal:** Create a generic `IndexPage` React component that replaces the repeating ERB pattern of `title + title_actions + search bar + table + pagination`. Once built, each index page migration becomes a ~30-line component + controller JSON serialization.

**Commit:** `f905c44` — Add reusable IndexPage React infrastructure for ERB migration (Phase 5)

### 5.1: Create `IndexPage` component ✅

**File:** `webpack/.../components/common/IndexPage/index.js`

Renders PF6 Toolbar (with SearchBar + ActionButtons + Pagination) + composable PF6 Table + bottom Pagination + Loading/Empty/Error states.

Props: `apiUrl`, `title`, `columns`, `controller`, `creatable`, `createUrl`, `exportable`, `exportUrl`, `hasHelpPage`, `documentationUrl`, `rowActions`, `searchable`, `initialSearch`, `idColumn`, `isStriped`, `customActions`

Column format: `[{ key, title, sortKey, wrapper }]` — array-based, each migration is ~30 lines.

**Design decisions:**
- Uses PF6 `Pagination` directly from `@patternfly/react-core` (NOT the existing `Pagination` wrapper) to avoid `useHistory()` dependency — makes IndexPage work in ERB-mounted contexts without Router context
- Reuses existing `SearchBar` (needs Redux store, provided automatically by componentRegistry)
- Reuses existing `EmptyPage` component for loading/empty/error states
- Registered in `componentRegistry.js` as `'IndexPage'` — mountable via `react_component('IndexPage', props)` from ERB

### 5.2: Create `useIndexData` hook ✅

**File:** `webpack/.../components/common/IndexPage/useIndexData.js`

Standalone hook using the axios `API` module directly (no Redux dependency for data fetching). Manages: `results`, `total`, `subtotal`, `page`, `perPage`, `sortBy`, `search`, `isLoading`, `error`, `canCreate`. Returns handler functions: `onPagination`, `onSort`, `onSearch`, `fetchData`.

### 5.3: Add `react_index_props` helper ✅

**File:** `app/helpers/layout_helper.rb`

Added `react_index_props(resource_class, options)` helper that serializes controller data (apiUrl, controller, createUrl, exportUrl, documentationUrl, searchable, creatable, exportable, hasHelpPage, initialSearch) as JSON props for React mounting.

### 5.4: Create `ActionButtons` component ✅

**File:** `webpack/.../components/common/IndexPage/ActionButtons.js`

Renders action button props as PF6 `Button` + `Dropdown` with `MenuToggle`. Replaces:
- `new_link` → PF6 primary Button (with `createUrl` prop)
- `select_action_button` → PF6 Dropdown with DropdownItems
- `documentation_button` → PF6 link Button with QuestionCircleIcon

### 5.5: Tests for IndexPage infrastructure ✅

28 tests across 3 test files, all passing:
- `__tests__/useIndexData.test.js` — 9 tests (fetch, pagination, sort, search, errors, initial params)
- `__tests__/ActionButtons.test.js` — 7 tests (render states, create/export/docs buttons, custom actions)
- `__tests__/IndexPage.test.js` — 12 tests (table rendering, loading/empty/error states, row actions, pagination, search bar)

---

## Phase 6: Index/List Page Migration ✅ COMPLETE (2026-06-21)

**Goal:** Convert all 23 ERB index pages to use the `IndexPage` component. Each page follows the same pattern:

1. Controller: add JSON response with serialized rows + pagination metadata
2. ERB: replace table HTML with `react_component('ResourceIndex', @props)`
3. React: thin wrapper component passing resource-specific columns to `IndexPage`

### Migration order (by user impact):

**Batch 6A — Core infrastructure pages (5 pages) ✅ COMPLETE (2026-06-20):**
- `domains/index` ✅ — React IndexPage with fullname/name, hosts_count columns
- `architectures/index` ✅ — React IndexPage with name, OS names, hosts_count columns
- `realms/index` ✅ — React IndexPage with name, hosts_count columns
- `media/index` ✅ — React IndexPage with name, path, OS family, OS names columns + clone action
- `compute_profiles/index` ✅ — React IndexPage with name column, rename + delete actions

**Batch 6B — Networking & provisioning (5 pages) ✅ COMPLETE (2026-06-20):**
- `subnets/index` ✅ — React IndexPage with name, network, vlanid, dhcp_name, hosts_count columns
- `compute_resources/index` ✅ — React IndexPage with name, provider_friendly_name columns + edit action
- `http_proxies/index` ✅ — React IndexPage with name, url columns
- `operatingsystems/index` ✅ — React IndexPage with title, hosts_count columns + clone action
- `ptables/index` ✅ — React IndexPage with name, os_family, operatingsystem_names, snippet/locked icons + clone/lock/unlock actions

**Batch 6C — Templates & reports (3 pages) ✅ COMPLETE (2026-06-20):**
- `provisioning_templates/index` ✅ — React IndexPage with name, combination, kind, snippet/locked icons + clone/export/lock/unlock actions + Build PXE Default custom action
- `report_templates/index` ✅ — React IndexPage with name, snippet/locked icons + clone/generate/export/lock/unlock actions
- `config_reports/index` ✅ — React IndexPage with host, reported_at, origin, applied/restarted/failed/failed_restarts/skipped/pending columns + CSV export + delete action

**Batch 6D — User management & access (3 of 5 pages) ✅ PARTIAL (2026-06-20):**
- `users/index` ✅ — React IndexPage with login, name, mail, admin, last_login, auth source columns
- `usergroups/index` ✅ — React IndexPage with name, user_names, usergroup_names columns
- `roles/index` ✅ — React IndexPage with name, description, locked icon, conditional actions
- `filters/index` — pending
- `common_parameters/index` — pending

**Batch 6F — Taxonomy pages (2 pages) ✅ COMPLETE (2026-06-20):**
- `locations/index` (via `taxonomies/index`) ✅ — TaxonomiesIndex with hosts_count, warning banner, mismatches report
- `organizations/index` (via `taxonomies/index`) ✅ — shared TaxonomiesIndex component

**Batch 6G — Bookmarks ✅ COMPLETE (2026-06-20):**
- `bookmarks/index` ✅ — React IndexPage with name, query, controller, public columns

**Batch 6E — Remaining pages (4 pages) ✅ COMPLETE (2026-06-21):**
- `hostgroups/index` ✅ — React IndexPage with title (ancestry path), hosts_count, children_hosts_count columns + nest/create host/clone/delete actions + API enhancement (2 new RABL nodes)
- `smart_proxies/index` ✅ — React IndexPage with name, url, features columns + edit/delete actions (locations/organizations/status columns omitted — not in API index response)
- `fact_values/index` ✅ — React IndexPage with host, fact_name, value, origin, reported_at columns + custom controller JSON (API v2 format incompatible, returns hash not array)
- `key_pairs/index` ✅ — React IndexPage with status, name, fingerprint columns + conditional download/recreate/delete actions + custom controller JSON (no API v2 endpoint, nested under compute_resources)

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

## Phase 7: Form Page Migration (7.1-7.4, 7D COMPLETE)

**Goal:** Convert the 44 ERB form pages from `form_for`/`form_tag` to React form components.

### 7.1: Create `FormPage` component ✅

**New file:** `webpack/.../components/common/FormPage/index.js`

Generic form wrapper using PF6 `Form`, `FormGroup`, `TextInput`, `Select`, `ActionGroup`. Handles:
- Field rendering from a schema (type, label, required, helpText)
- Validation display
- Submit via fetch (POST/PATCH with CSRF token)
- Cancel navigation

Reuse existing:
- `webpack/.../common/forms/FormField.js` — existing form field component
- `webpack/.../common/forms/InputFactory.js` — existing input type factory

### 7.2: Create form field type components ✅

Map Rails form helpers to PF6 equivalents:
- `text_field` → PF6 `TextInput`
- `text_area` → PF6 `TextArea`
- `select` → PF6 `FormSelect` or `Select` (searchable)
- `check_box` → PF6 `Checkbox`
- `password_field` → PF6 `TextInput` type="password"
- `file_field` → PF6 file upload

### 7.3: Migrate simple CRUD forms first

**Batch 7A — Simple single-tab forms (9 pages) ✅ COMPLETE (2026-06-21):**
- `architectures/_form` ✅ — FormPage with name field
- `realms/_form` ✅ — FormPage with name, realm_type select, realm_proxy_id select (taxonomy tabs deferred)
- `media/_form` ✅ — FormPage with name, path, os_family select (NFS conditional fields + taxonomy tabs deferred)
- `models/_form` ✅ — Already migrated to React routes (ModelForm component)
- `compute_profiles/_form` ✅ — FormPage with name field
- `http_proxies/_form` ✅ — FormPage with name, url, username, password, cacert (test connection + taxonomy tabs deferred)
- `bookmarks/_form` ✅ — FormPage with name, query, public checkbox, hidden controller field (edit-only)
- `common_parameters/_form` ✅ — FormPage with name, parameter_type select, value textarea, hidden_value checkbox
- `ssh_keys/_form` ✅ — FormPage with key textarea, name field (nested under users, create-only)
- `autosign/_form` — Deferred: AJAX-loaded Bootstrap modal in smart proxy show page, not a standalone CRUD form

**Batch 7B — Multi-field forms (7 pages) ✅ COMPLETE (2026-06-21):**
- `domains/_form` ✅ — FormPage with name, fullname, dns_id select (taxonomy tabs + parameters deferred)
- `smart_proxies/_form` ✅ — FormPage with name, url (taxonomy tabs deferred)
- `roles/_form` ✅ — FormPage with name (disabled if builtin), description textarea (filters tab + taxonomy handling deferred)
- `images/_form` ✅ — FormPage with name, operatingsystem_id select, architecture_id select (nested under compute_resource, provider-specific fields deferred)
- `auth_source_ldaps/_form` ✅ — FormPage with 3 sections: LDAP Server (name, host, tls, port, server_type), Account (account, password, base_dn, groups_base, ldap_group_membership, ldap_filter, onthefly_register, usergroup_sync), Attribute Mappings (attr_login/firstname/lastname/mail/photo). Test connection + taxonomy tabs deferred.
- `auth_source_externals/_form` ✅ — FormPage with name (disabled, edit-only). Taxonomy tabs deferred.
- `compute_resources/_form` ✅ — FormPage with name, provider select (disabled on edit), description textarea. Provider-specific partials + taxonomy tabs deferred.
- `lookup_keys/_edit` — Deferred: Puppet plugin partial with no standalone route, matchers/nested values too complex for FormPage pattern

**Batch 7C — Tabbed/complex forms (6 pages) ✅ COMPLETE (2026-06-21):**
Added PF6 Tabs support and `checkboxGroup` field type to FormPage infrastructure.
- `subnets/_form` ✅ — FormPage with 3 tabs: Subnet (name, description, network, cidr, gateway, dns_primary, dns_secondary, ipam, from/to, vlanid, mtu, nic_delay, boot_mode), Domains (checkboxGroup), Proxies (dhcp/tftp/httpboot/dns/template/bmc selects). Parameters + taxonomy tabs deferred.
- `operatingsystems/_form` ✅ — FormPage with 4 tabs: Operating System (name, major, minor, description, family, release_name, password_hash), Architectures (checkboxGroup), Partition Tables (checkboxGroup), Installation Media (checkboxGroup). Templates + Parameters tabs deferred.
- `hostgroups/_form` ✅ — FormPage with 2 tabs: Host Group (parent_id, name, description, compute_resource_id, compute_profile_id), Network (domain_id, subnet_id, subnet6_id, realm_id). OS tab, Parameters (Slot component), smart_proxy_fields, extensible main_tabs, taxonomy tabs deferred.
- `users/_form` ✅ — FormPage with 2 tabs: User (login, firstname, lastname, mail, description, locale, timezone, auth_source_id), Roles (admin checkbox, role_ids checkboxGroup). Password, Email Preferences, SSH Keys, PAT, Registration Tokens, UI Preferences, taxonomy tabs deferred.
- `usergroups/_form` ✅ — FormPage with 2 tabs: User Group (name, usergroup_ids checkboxGroup, user_ids checkboxGroup), Roles (admin checkbox, role_ids checkboxGroup). External Groups + extensible tabs deferred.
- `taxonomies/_form` ✅ — FormPage with 1 tab: Location/Organization (parent_id, name, description). All 13+ resource assignment tabs, cross-taxonomy tabs, Parameters deferred.

**Batch 7D — Host form ✅ COMPLETE (2026-06-21):**
Built a dedicated `HostForm` component tree (not using FormPage — too complex for schema-driven approach).
- `hosts/_form` ✅ — HostForm with 5 tabs: Host (name, org, location, hostgroup, compute_resource, compute_profile, realm + Slot extension), Operating System (architecture, OS, ptable, media, PXE loader, provision method, root password — with cascading API fetches), Interfaces (PF6 Table + InterfaceModal for add/edit/delete with domain→subnet cascading), Parameters (editable key-value pairs with add/remove), Additional Information (owner, enabled, model, comment). Hostgroup inheritance applies defaults to non-overridden fields. Taxonomy changes refresh scoped options. Plugin extensibility via Slot('host-form-main-fields') and Slot('host-form-extra-content'). Provider-specific VM tab deferred.

**Component architecture:**
```
webpack/.../components/HostForm/
  index.js                    -- Main: PF6 Tabs + Form + submit
  useHostForm.js              -- Hook: values, cascading, validation
  HostFormContext.js           -- Context shared across tabs
  InterfaceModal.js            -- PF6 Modal for NIC editing
  constants.js                 -- API paths
  tabs/HostTab.js              -- Host tab fields
  tabs/OperatingSystemTab.js   -- OS tab with cascading
  tabs/InterfacesTab.js        -- Interfaces table
  tabs/ParametersTab.js        -- Key-value parameter editor
  tabs/AdditionalInfoTab.js    -- Additional info fields
```

**Controller:** `set_host_form_data` in `hosts_controller.rb` serializes host attributes, select options, and interfaces/parameters as JSON props.

**49 tests** across 7 test suites (HostForm, useHostForm, InterfacesTab, ParametersTab, BulkEditParametersModal, BulkRebuildConfigModal, bulkDelete).

### 7.4: Migrate bulk operation modals ✅ COMPLETE (2026-06-21)

9 of 11 bulk modals already existed as React components in the React HostsIndex. Added the 2 missing modals:
- `BulkEditParametersModal` ✅ — PF6 Modal with dynamic name/value rows, Add/Remove. New API endpoint `PUT /api/v2/hosts/bulk/update_parameters`.
- `BulkRebuildConfigModal` ✅ — PF6 confirmation Modal, uses existing `PUT /api/v2/hosts/bulk/build` with `rebuild_configuration: true`.

Both wired into HostsIndex dropdown menu. Legacy ERB bulk views retained (old hosts index still uses them).

---

## Phase 8: Legacy JS & SCSS Cleanup ✅ COMPLETE (2026-06-21)

**Goal:** Remove jQuery dependencies from webpack files, clean up SCSS, convert error pages to PF6, and update Bootstrap modals.

### 8.1: Migrate jQuery files to vanilla JS + fetch ✅

Converted 19 webpack files from `import $ from 'jquery'` to vanilla JS + `fetch()`. All files maintain the same exported API for backward compatibility with Sprockets callers (`window.tfm.*`).

**Batch A — Trivial files (5 files) ✅:**
- `foreman_medium.js` — `.toggle()` → `style.display`
- `foreman_ssh_keys.js` — `.val()` → `.value`
- `foreman_advanced_fields.js` — jQuery DOM → vanilla `querySelector`/`classList`
- `foreman_lookup_keys.js` — jQuery DOM → vanilla
- `foreman_template_inputs.js` — jQuery DOM → vanilla, event delegation via `document.addEventListener`

**Batch B — AJAX files (5 files) ✅:**
- `foreman_http_proxies.js` — `$.ajax` → `fetch()` with CSRF token
- `foreman_users.js` — `$.ajax` → `fetch()`, DOM → vanilla
- `foreman_auth_source.js` — `$.ajax` → `fetch()`, `$(document).ready` → `DOMContentLoaded`
- `foreman_compute_resource.js` — `$.ajax` → `fetch()`, `.load()` → `fetch` + `DOMParser` + `innerHTML`
- `compute_resource/libvirt.js` — `$.ajax` → `fetch()`, `.button('toggle')` → `classList.toggle`

**Batch C — Compute resource sub-modules (3 files) ✅:**
- `compute_resource/ec2.js` — DOM → vanilla, `.multiSelect('refresh')` uses `window.$` guard
- `compute_resource/openstack.js` — `$.ajax` → `fetch()`
- `compute_resource/vmware.js` — `$.ajax` → `fetch()`, `.select2()` uses `window.$` guard

**Batch D — Console and host selection (3 files) ✅:**
- `bundle_novnc.js` — jQuery DOM → vanilla `getElementById`/`dataset`/`getAttribute`
- `spice.js` — jQuery DOM → vanilla
- `hosts/tableCheckboxes.js` — Complete rewrite: `$.inArray` → `.indexOf`, `$.param` → `URLSearchParams`, `.modal()` → vanilla `showModal`/`hideModal`, `.tooltip()` → removed (native title)

**Batch E — Complex utility (1 file) ✅:**
- `foreman_tools.js` — `activateTooltips()` → no-op (native browser tooltips), `activateDatatables()` → guarded with `window.$ && $.fn.DataTable`, `setTab`/`highlightTabErrors` → vanilla `querySelector` + manual tab activation. Added `showModal()`/`hideModal()` helpers.

**Batch F — React Select2 wrapper (1 file) ✅:**
- `react_app/components/common/forms/Select.js` — Removed `import $ from 'jquery'`, uses `window.$` guard for select2 plugin

**Kept as-is:** `foreman_overrides.js` — depends on `$.rails.allowAction` (jquery-ujs), cannot convert without replacing Rails UJS.

### 8.2: Clean up legacy SCSS ✅

**patternfly_and_overrides.scss:** Removed `.label-default`, `.badge.badge-inverse`, `.blank-slate-pf` (2 blocks), `.paneless .panel-*`, select2 border-radius overrides, `.form-control + .glyphicon`, `.glyphicon-info-sign`, `#history .glyphicon`.

**base.scss:** Removed `.label-light`, `.card-pf`, `.glyphicon.nic-flag`, select2 styling (`.select2-arrow`, font/height overrides, padding).

**multi-select-overrides.scss:** Removed `.form-control + .glyphicon` in `.ms-header`.

**base-pf4.scss:** Kept — still needed for PF6 compat with Bootstrap-sass tables/alerts.

### 8.3: Update bundle.js ✅

Added `window.showModal` and `window.hideModal` global functions (from `foreman_tools.js`) for ERB onclick handlers. All `window.tfm` exports kept — still called from Sprockets JS and ERB views.

### 8.4: Update jquery.js ✅

Removed `require('datatables.net-bs')` — `activateDatatables()` now guarded with `window.$ && $.fn.DataTable`. Kept `jquery-ujs` (Rails UJS), `multiselect` (taxonomy widgets), `select2` (Sprockets `activate_select2()` + compute resource sub-modules).

### 8.5: Update error pages ✅

Converted 4 ERB error pages to PF6 EmptyState CSS classes:
- `common/403.html.erb` — PF6 EmptyState with lock icon, permission list
- `common/404.html.erb` — PF6 EmptyState with search icon
- `common/500.html.erb` — PF6 EmptyState with danger status, error details, documentation link
- `common/503.html.erb` — PF6 EmptyState with danger status

Updated 2 static HTML error pages (`public/404.html`, `public/500.html`) with modern centered layout.

### 8.6: Replace Bootstrap modals ✅

Updated 3 modal views with PF6 Modal CSS classes (dual-compatible with Bootstrap JS for Sprockets):
- `common/_modal.html.erb` — Added `.pf-v6-c-modal-box` classes alongside Bootstrap classes
- `hosts/_list.html.erb` (confirmation-modal) — PF6 modal structure, vanilla JS `showModal`/`hideModal`
- `hosts/_dhcp_lease_errors.html.erb` — PF6 modal + alert classes

Updated `layout_helper.rb` `modal_close()` to generate PF6 button classes with vanilla JS close handler.

### 8.7: Update ERB views with legacy class references ✅

- `about/index.html.erb` — `.label.label-success`/`.label-default` → PF6 Label (`.pf-v6-c-label.pf-m-green`)
- `hosts/console/vmrc.html.erb` — `.blank-slate-pf` → PF6 EmptyState
- `ssh_keys/_ssh_keys_tab.html.erb` — `.blank-slate-pf` → PF6 EmptyState + PF6 alert

**Remaining jQuery in Sprockets:** `app/assets/javascripts/` files (application.js, host_edit.js, host_edit_interfaces.js, proxy_status.js, etc.) still use jQuery directly via `window.$`. These are in the Sprockets pipeline, not webpack, and will be addressed when those ERB views are migrated to React.

---

## Phase 9: Client-Side Routing for Migrated Pages

**Goal:** Eliminate full page reloads when navigating between already-migrated React pages. Currently, every sidebar click triggers `window.location.href` (full server round-trip + complete React tree re-mount), even though the Layout/sidebar is already React and uses `history.push()`. This is a legacy artifact of the hybrid Rails/React architecture.

### Root cause

The rendering pipeline is:

```
Sidebar click → Navigation.clickAndNavigate() → history.push(href)
    → React Router checks registered routes
    → Route registered?  YES → renderRoute() — only content swaps (SPA)
    →                     NO  → fallbackRoute() → window.location.href (FULL RELOAD)
```

Migrated index pages (Domains, Subnets, etc.) are mounted via ERB `react_component()`. They are NOT registered as React Router routes. So every navigation falls through to `fallbackRoute()` → full page reload → Rails renders full HTML → entire React tree (Layout + content) re-mounts from scratch.

Pages that ARE registered as React Router routes (e.g., `/new/hosts`, host details) already navigate without reloading — the Layout/sidebar stays mounted and only content swaps.

### 9.1: Register migrated index pages as React Router routes

**Files:**
- `webpack/.../routes/Routes.js` (or wherever routes are aggregated)
- New route files per page, e.g. `webpack/.../routes/Domains/index.js`

Each migrated IndexPage component needs a route registration:

```js
// webpack/.../routes/Domains/index.js
import DomainsIndex from '../../components/DomainsIndex';

export default {
  path: '/domains',
  render: props => <DomainsIndex apiUrl="/api/v2/domains" controller="domains" ... />,
};
```

**Key challenge:** The ERB helper `react_index_props` currently provides props (`apiUrl`, `createUrl`, `controller`, `documentationUrl`, etc.) from the server. When routing client-side, these props must be derived in JavaScript instead. Options:

- **Option A (simple):** Hardcode props in each route definition. The props are deterministic — `apiUrl` is always `/api/v2/{controller}`, `createUrl` is `/{path}/new`, etc.
- **Option B (DRY):** Create a `routeIndexProps(controller, options)` JS helper that mirrors `react_index_props` logic. One function, all routes use it.
- **Option C (hybrid):** Keep ERB rendering for initial page load (SEO, deep links), but register routes so subsequent navigation is client-side. The React component works with either prop source.

**Recommendation:** Option C — register React Router routes that hardcode the props, but keep the ERB views as fallbacks for direct URL access / bookmarks / first page load. The component doesn't need to change — it receives the same props either way.

### 9.2: Handle routes with `/templates/` prefix

Provisioning templates and report templates live under `/templates/provisioning_templates` and `/templates/report_templates`. These nested paths need correct route registration. Partition tables are at `/templates/ptables`. All three share the same prefix pattern.

### 9.3: Handle controller-specific search autocomplete

The `SearchBar` component needs `controller` for autocomplete URL construction (`/{controller}/auto_complete_search`). When mounted via ERB, this comes from `react_index_props`. When mounted via React Router, the route definition must supply it. The `getControllerSearchProps()` utility already handles this — just pass the controller name.

### 9.4: Handle breadcrumbs

Currently, breadcrumbs are rendered by Rails (via `breadcrumbs()` helper in ERB). When navigating client-side, the `BreadcrumbBar` React component (already registered) would need its props updated. The `ReactApp` already renders breadcrumbs from server-provided data — for client-side routes, the route definition should include breadcrumb metadata.

### 9.5: Preserve ERB fallback for non-JS / deep links

Keep the ERB views functional so that:
- Direct URL access (bookmarks, shared links) still works via server-side render
- Crawlers and non-JS clients get a rendered page
- Plugins that haven't migrated still work

The React Router route and the ERB view coexist — first load uses ERB, subsequent navigation uses the React route.

### 9.6: Plugin route extensibility

Foreman plugins register their own pages. The route registration system must remain extensible so plugins can add their own client-side routes via the existing `registerRoutes()` API in `RoutingService`.

---

## Known Issues

- **Logout link** — The "Log Out" link in the User menu does not respond (no navigation, no POST). Likely caused by `data-method: post` not being processed by React/PF6 navigation — Rails UJS or Turbo needs to handle it.
- **My Account link** — The "My Account" link in the User menu also does not respond. Same root cause — the React Layout renders these as plain links but the click handler or navigation is not wired up.

Both are in the Layout/sidebar React component, not in the index page migration. Needs investigation as a separate fix.

- **Dark mode contrast** — The dark mode toggle works (added in Phase 4) but table text and links in the migrated React IndexPage components have poor contrast against the dark background. The PF6 dark theme tokens (`pf-v6-theme-dark`) are applied correctly but some custom or inherited styles may be overriding the expected text colors. Needs a dark-mode-specific CSS pass across the IndexPage, ActionButtons, and table cell link styles.

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
    ↓
Phase 9 (client routing)  ←  After pages are React, make nav SPA-like
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
| 9 (client routing) | ~25 route registrations | Moderate — per-page route + props |
