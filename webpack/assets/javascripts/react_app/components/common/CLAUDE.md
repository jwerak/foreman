# Common / Shared Components

Reusable infrastructure components used across all pages.

## Core Page Components

### IndexPage
Generic table-based list page. Used by 22 index routes.
- Props: `apiUrl`, `controller`, `columns`, `createUrl`, `searchable`, `exportable`
- Features: PF6 Table, server-side search/sort/pagination, bulk actions, CSV export
- Usage: Each resource creates a thin wrapper passing resource-specific columns

### DetailPage
Generic resource detail page with tabs. Used by 21 resource configs.
- Configured via `routes/DetailPages/resourceConfigs.js`
- Props: `apiUrl`, `resourceName`, `nameField`, `fieldsUrl`, `customTabs`
- Features: Header with breadcrumb, edit/delete actions, dynamic tabs, form fields via `fieldsUrl`
- Custom tabs: Pass `customTabs` array with `{eventKey, title, component, getProps}` objects

### FormPage
Generic form page with dynamic field rendering.
- Uses `fieldsUrl` to fetch form field definitions from Rails
- Auto-generates PF6 form fields from server-provided field specs
- Handles create/edit modes, validation, submit

## Other Common Components
- `EmptyState/` — PF6 empty state for no-data scenarios
- `Loader/` — Loading spinner wrapper
- `SearchInput/` — Search bar with autocomplete
- `Pagination/` — Server-side pagination controls
- `ActionButtons/` — Standardized action button groups
- `ErrorBoundary/` — React error boundary (one of 2 class components)
- `charts/` — Chart wrapper utilities for PF6 Charts
- `Fill/` and `Slot/` — Named slot pattern for plugin extension points

## Adding a New Resource (3-file change)
1. Create `components/XxxIndex/index.js` — define columns array, render `<IndexPage columns={columns} {...props} />`
2. Add `route('/xxx', XxxIndex, { apiUrl: '/api/v2/xxx', controller: 'xxx', createUrl: '/xxx/new' }, __('Xxx'))` to `routes/IndexPages/index.js`
3. Add config object to `routes/DetailPages/resourceConfigs.js` with `{ indexPath, apiUrl, controller, resourceName, title, nameField, fieldsUrl }`
