# Foreman Reusable Page Infrastructure

Foreman provides three reusable page components that handle common page patterns.
All new pages should use these instead of building from scratch.

## IndexPage

**Location:** `webpack/assets/javascripts/react_app/components/common/IndexPage/`

A generic table-based list page with:
- PF6 Table with sortable columns
- Toolbar with search, per-page selector, action buttons
- Pagination (server-side)
- Bulk selection and actions
- Empty state handling

```javascript
import IndexPage from '../common/IndexPage';

const DomainsIndex = props => (
  <IndexPage
    columns={[
      { key: 'name', title: __('Name'), isSorted: true },
      { key: 'created_at', title: __('Created') },
    ]}
    {...props}
  />
);
```

## DetailPage

**Location:** `webpack/assets/javascripts/react_app/components/common/DetailPage/`

A generic resource detail page with:
- Header with resource name, breadcrumbs, action buttons
- Tab navigation (Details, Edit, custom tabs)
- Detail fields rendered from resource data
- Edit form integration

Custom tabs extend the page:
```javascript
const customTabs = [
  {
    eventKey: 'ssh-keys',
    title: __('SSH Keys'),
    component: SshKeysTab,
    getProps: resource => ({ userId: resource.id }),
  },
];
```

## FormPage

**Location:** `webpack/assets/javascripts/react_app/components/common/FormPage/`

A generic form page with:
- Dynamic field rendering from `fieldsUrl` API endpoint
- Standard field types (text, select, checkbox, textarea)
- Validation and error handling
- Submit/cancel actions

```javascript
<FormPage
  fieldsUrl={`/api/v2/domains/${id}/form_fields`}
  submitUrl={`/api/v2/domains/${id}`}
  controller="domains"
/>
```

## Adding a New Resource (3-file pattern)

1. Create `components/XxxIndex/index.js` with columns + `<IndexPage>`
2. Add `route()` to `routes/IndexPages/index.js`
3. Add config to `routes/DetailPages/resourceConfigs.js`

This gives you index, detail, and edit pages with SPA navigation.
