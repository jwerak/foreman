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

## Phase 9: Client-Side Routing for Migrated Pages ✅ COMPLETE (2026-06-21)

**Goal:** Eliminate full page reloads when navigating between already-migrated React pages. Sidebar clicks now trigger SPA-like navigation (React Router `history.push()`) instead of full server round-trips.

### Root cause (resolved)

Previously, migrated index pages were mounted via ERB `react_component()` but NOT registered as React Router routes. Every sidebar navigation fell through to `fallbackRoute()` → `window.location.href` → full page reload. Now all 22 migrated index pages are registered as React Router routes, so sidebar navigation between them swaps content without reloading.

### 9.1: Register migrated index pages as React Router routes ✅

**Approach:** Option C (hybrid) — registered React Router routes with hardcoded props mirroring `react_index_props`, while keeping ERB views as fallbacks for direct URL access/bookmarks/first page load.

**New files:**
- `webpack/.../routes/IndexPages/IndexPageRoute.js` — Wrapper component that renders `Head` (document title), `BreadcrumbBar` (page title as H1 via single-item breadcrumb), and the index component with hardcoded props + `initialSearch` extracted from URL query string.
- `webpack/.../routes/IndexPages/index.js` — Exports array of 22 route definitions using a `route()` helper function. Each route has `path`, `exact: true`, and `render` function.

**Updated file:**
- `webpack/.../routes/routes.js` — Added `...IndexPages` to the core routes array.

**22 routes registered:**

| Path | Component | Key Props |
|------|-----------|-----------|
| `/domains` | DomainsIndex | apiUrl, controller, createUrl, hasHelpPage |
| `/architectures` | ArchitecturesIndex | apiUrl, controller, createUrl, hasHelpPage |
| `/realms` | RealmsIndex | apiUrl, controller, createUrl, documentationUrl |
| `/media` | MediaIndex | apiUrl, controller, createUrl, hasHelpPage, documentationUrl |
| `/compute_profiles` | ComputeProfilesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/subnets` | SubnetsIndex | apiUrl, controller, createUrl |
| `/compute_resources` | ComputeResourcesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/http_proxies` | HttpProxiesIndex | apiUrl, controller, createUrl, hasHelpPage |
| `/operatingsystems` | OperatingsystemsIndex | apiUrl, controller, createUrl, documentationUrl |
| `/templates/ptables` | PtablesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/templates/provisioning_templates` | ProvisioningTemplatesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/templates/report_templates` | ReportTemplatesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/config_reports` | ConfigReportsIndex | apiUrl, controller, creatable:false, exportable, exportUrl, documentationUrl |
| `/users` | UsersIndex | apiUrl, controller, createUrl |
| `/usergroups` | UserGroupsIndex | apiUrl, controller, createUrl |
| `/roles` | RolesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/locations` | TaxonomiesIndex | apiUrl, controller, createUrl, taxonomyResource, taxonomySingle, mismatchesUrl |
| `/organizations` | TaxonomiesIndex | apiUrl, controller, createUrl, taxonomyResource, taxonomySingle, mismatchesUrl |
| `/bookmarks` | BookmarksIndex | apiUrl, controller, creatable:false, documentationUrl |
| `/hostgroups` | HostgroupsIndex | apiUrl, controller, createUrl, hasHelpPage, exportable, exportUrl |
| `/smart_proxies` | SmartProxiesIndex | apiUrl, controller, createUrl, documentationUrl |
| `/fact_values` | FactValuesIndex | apiUrl (custom: `/fact_values.json`), controller, creatable:false, exportable, exportUrl, documentationUrl |

### 9.2: Handle routes with `/templates/` prefix ✅

Three routes registered with `/templates/` prefix:
- `/templates/ptables` → PtablesIndex (controller: `ptables`, createUrl: `/templates/ptables/new`)
- `/templates/provisioning_templates` → ProvisioningTemplatesIndex
- `/templates/report_templates` → ReportTemplatesIndex

### 9.3: Handle controller-specific search autocomplete ✅

Each route passes `controller` prop to the index component. The `IndexPage` component uses `getControllerSearchProps(controller)` to configure `SearchBar` autocomplete URL (`/{controller}/auto_complete_search`). Works identically to ERB-provided props.

### 9.4: Handle breadcrumbs ✅

`IndexPageRoute` wrapper renders `BreadcrumbBar` with a single breadcrumb item (the page title). With one item, `BreadcrumbBar` renders in "title mode" — displaying the caption as a PF6 `<h1>` heading, matching the ERB layout behavior. Also renders `<Head>` component to set the document `<title>`.

### 9.5: Preserve ERB fallback for non-JS / deep links ✅

All ERB views (`app/views/*/index.html.erb`) are kept intact. The React Router route and ERB view coexist:
- First page load / direct URL / bookmarks → Rails serves ERB → `react_component()` mounts the index component with server-provided props
- Subsequent sidebar navigation → React Router matches the route → `IndexPageRoute` renders the component with hardcoded props (no server round-trip)

### 9.6: Plugin route extensibility ✅

No changes to the `registerRoutes()` API. Plugins continue to add their own client-side routes via `registerRoutes(pluginId, routesArray)`. The new index page routes are added to the core `routes` array in `routes.js`, not via the plugin Fill/Slot system — they're core routes, not plugin routes.

### 9.7: Not registered (intentionally excluded)

- **KeyPairsIndex** — Nested under `/compute_resources/:id/key_pairs`, requires dynamic `computeResourceId` and `computeResourceName` props from the URL. Would need a dynamic wrapper that fetches compute resource data. Low traffic page, kept as ERB-only.
- **HostsIndex** — Already registered as a React Router route (pre-existing, at `/new/hosts`).

### 9.8: Tests ✅

9 tests across 2 test files:
- `__tests__/IndexPageRoute.test.js` — 4 tests (breadcrumb rendering, props passing, initialSearch from URL, empty search)
- `__tests__/indexRoutes.test.js` — 5 tests (route count, structure, all paths, /templates/ prefix, taxonomy routes)

---

## Phase 10: Remaining ERB Page Migration

**Goal:** Migrate the remaining ERB pages that still use Bootstrap form helpers, tab navigation, and old-style layouts to PF6 React components. These fall into 3 categories: template editor forms (most complex), show/detail pages, and deferred form features (taxonomy tabs, parameters, provider partials).

### Current state (audit 2026-06-21)

**Phase 7 migrated 24 form pages** — the `edit.html.erb` / `new.html.erb` views now use `react_component('FormPage', ...)`. However:
- The old `_form.html.erb` ERB partials still exist (unused by the migrated pages but kept for fallback)
- Several features were **deferred** on migrated forms (taxonomy tabs, parameters tabs, provider partials, etc.)
- **3 form pages were NOT migrated at all** — they still render old ERB `_form` partials with Bootstrap `form_for`, `text_f`, `nav-tabs` (down from 6; provisioning_templates, report_templates, ptables done in 10.1)

### 10.1: Template editor forms (3 pages — highest complexity) ✅ COMPLETE (2026-06-21)

Built a dedicated `TemplateForm` React component tree (similar to HostForm — too complex for schema-driven FormPage). Replaces the shared `templates/_form.html.erb` Bootstrap tabbed form with PF6 Tabs + embedded Editor React component.

- `provisioning_templates/edit.html.erb` + `new.html.erb` ✅ — TemplateForm with Template tab (Editor + name/default/description/audit), Inputs tab (dynamic add/remove), Type tab (snippet + kind selector), Locations tab, Organizations tab
- `report_templates/edit.html.erb` + `new.html.erb` ✅ — TemplateForm with Template tab, Inputs tab, Type tab (snippet only), Locations tab, Organizations tab
- `ptables/edit.html.erb` + `new.html.erb` ✅ — TemplateForm with Template tab (Editor + snippet + OS family inline), Inputs tab, Locations tab, Organizations tab (no separate Type tab)

**Component architecture:**
```
webpack/.../components/TemplateForm/
  index.js                    -- Main: PF6 Tabs + Form + submit via API
  useTemplateForm.js          -- Hook: values, validation, submit (reads Editor Redux state)
  TemplateFormContext.js       -- Context shared across tabs
  constants.js                 -- Template type constants
  tabs/TemplateTab.js          -- Editor + name/default/description/audit fields
  tabs/InputsTab.js            -- Dynamic template input rows with add/remove (PF6 Cards)
  tabs/TypeTab.js              -- Snippet checkbox + kind selector (provisioning only)
  tabs/TaxonomyTab.js          -- Reusable Locations/Organizations checkbox group
```

**Controller:** `set_template_form_data` in `templates_controller.rb` serializes template attributes, select options (template kinds, OS families, input types, value types, locations, organizations), editor props (DSL cache, render paths, safemode), and meta (isNew, cancelUrl, templateType, apiUrl) as JSON props. Called as `before_action` for `:new` and `:edit`, and explicitly in `clone_template`, `create` (on error), and `update` (on error).

**32 tests** across 4 test suites (TemplateForm, useTemplateForm, InputsTab, TypeTab).

**Deferred features:**
- History tab — needs audit API integration
- Help tab — safemode methods/variables reference
- Association tab (provisioning) — OS multi-select + hostgroup combinations
- Template combinations (provisioning) — hostgroup-specific template assignment
- Plugin pagelets — `render_pagelets_for(:tab_headers/:tab_content)`

Old `templates/_form.html.erb` partial retained as fallback.

### 10.2: Compute attribute forms (2 pages)

| Page | ERB View | Key challenges |
|------|----------|---------------|
| Compute Attributes edit | `compute_attributes/edit.html.erb` | Provider-specific VM config partials (EC2, Libvirt, VMware, OpenStack) |
| Compute Attributes new | `compute_attributes/new.html.erb` | Same — renders provider-specific base, networks, volumes partials |

**Approach:** These are deeply provider-specific. Each provider has its own form partial with unique fields (instance types, flavors, networks, storage). Consider a plugin-extensible `ComputeAttributeForm` with Slot/Fill for provider-specific sections. Low priority — compute resource VM configuration is a niche workflow.

### 10.3: Show/detail pages (5 pages)

| Page | ERB View | Current style |
|------|----------|--------------|
| Smart Proxy show | `smart_proxies/show.html.erb` | Bootstrap panels, AJAX status checks, feature tabs |
| Host show | `hosts/show.html.erb` | Bootstrap tabs, metrics, facts — **already has React HostDetails at `/new/hosts/:name`** |
| Compute Resource show | `compute_resources/show.html.erb` | Bootstrap tabs, VM list, provider-specific tabs |
| Compute Profile show | `compute_profiles/show.html.erb` | List of compute attribute links per compute resource |
| Compute Resource VM show | `compute_resources_vms/show.html.erb` | Provider-specific VM details |

**Note:** `hosts/show.html.erb` is the legacy host detail page. The React `HostDetails` component at `/new/hosts/:name` is the modern replacement. The legacy page can be removed once all plugins migrate to the React host detail page.

### 10.4: Deferred features on migrated forms

Phase 7 created React `FormPage` components for 24 forms but deferred these features:

**Taxonomy tabs (locations/organizations)** — 12 forms defer this:
- domains, subnets, hostgroups, compute_resources, smart_proxies, http_proxies, media, auth_source_externals, auth_source_ldaps, realms, users, taxonomies

**Parameters tabs** — 6 forms defer this:
- domains, subnets, hostgroups, operatingsystems, hosts (React HostForm has its own), taxonomies

**Provider-specific partials** — 2 forms defer this:
- compute_resources (EC2/Libvirt/VMware/OpenStack provider fields)
- images (provider-specific image fields)

**Other deferred features:**
- `http_proxies`: Test Connection button
- `hostgroups`: smart_proxy_fields, extensible main_tabs, OS tab
- `users`: Password fields, Email Preferences, SSH Keys, PAT, Registration Tokens, UI Preferences tabs
- `taxonomies`: 13+ resource assignment tabs (Users, Smart Proxies, Subnets, Compute Resources, Media, Templates, Ptables, Domains, Realms, Hostgroups, cross-taxonomy)

**Approach for taxonomy tabs:** Create a reusable `TaxonomyTabs` React component that renders Location/Organization checkbox groups. Add to FormPage as optional tab sections. This one component unblocks 12 forms.

**Approach for parameters:** Create a reusable `ParametersTab` React component (key-value editor with inheritance display). The `HostForm` already has `ParametersTab` — extract and generalize.

### 10.5: Other remaining ERB pages

| Page | Path | Notes |
|------|------|-------|
| Compute Resource VM new | `compute_resources_vms/new.html.erb` | Provider-specific VM creation — very niche |
| About | `about/index.html.erb` | Already updated with PF6 labels (Phase 8.7) |
| Settings | `settings/index.html.erb` | Partially React (`SettingsTable`), ERB tab navigation |
| Filters index/form | `filters/index`, `filters/_form` | Not yet migrated to React IndexPage/FormPage |
| Common Parameters index | `common_parameters/index` | Not yet migrated to React IndexPage |

### Execution order

```
10.1  Template editor forms       ✅  COMPLETE
  ↓
10.4a Taxonomy tabs component     ←  Unblocks 12 forms, do next
  ↓
10.4b Parameters tab component    ←  Unblocks 6 forms
  ↓
10.3  Show pages                  ←  Smart proxy show, compute resource show
  ↓
10.2  Compute attribute forms     ←  Low priority, provider-specific
  ↓
10.4c Provider partials           ←  Lowest priority, niche workflows
```

---

## Known Issues

- **Logout link** — The "Log Out" link in the User menu does not respond (no navigation, no POST). Likely caused by `data-method: post` not being processed by React/PF6 navigation — Rails UJS or Turbo needs to handle it.
- **My Account link** — The "My Account" link in the User menu also does not respond. Same root cause — the React Layout renders these as plain links but the click handler or navigation is not wired up.

Both are in the Layout/sidebar React component, not in the index page migration. Needs investigation as a separate fix.

- **Dark mode contrast** — The dark mode toggle works (added in Phase 4) but table text and links in the migrated React IndexPage components have poor contrast against the dark background. The PF6 dark theme tokens (`pf-v6-theme-dark`) are applied correctly but some custom or inherited styles may be overriding the expected text colors. Needs a dark-mode-specific CSS pass across the IndexPage, ActionButtons, and table cell link styles.

---

## Execution Order

```
Phase 5 (infrastructure)  ✅  COMPLETE
    ↓
Phase 6A-6G (index pages) ✅  COMPLETE
    ↓
Phase 7A-7C (forms)       ✅  COMPLETE
    ↓
Phase 7D (host forms)     ✅  COMPLETE
    ↓
Phase 8 (cleanup)         ✅  COMPLETE
    ↓
Phase 9 (client routing)  ✅  COMPLETE — SPA navigation for all migrated pages
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
