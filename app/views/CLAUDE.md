# Views Directory

548 ERB templates. Mix of legacy full-ERB pages and modern React-mounting templates.

## Migration Status
- 108 ERB files use `react_component` to mount React components
- ~100 ERB files still use Bootstrap 3 grid/components (legacy, pending migration)
- Remaining ERB pages will be migrated to React SPA over time

## Layout
- `layouts/base.html.erb` — Main application layout (loads PF6 CSS + React bundles)
- `layouts/` — Various layout templates for login, modal, etc.

## React Integration
ERB templates mount React components via the `react_component` Rails helper:
```erb
<%= react_component('ComponentName', props: { key: value }) %>
```
The component name maps to `componentRegistry.js` in the webpack React app.

## API Views
- `api/v2/` — 321 RABL templates for REST API JSON responses
- These are NOT being migrated — they serve the API, not the browser UI

## Legacy vs Modern
- **Legacy ERB pages**: Use Bootstrap grid, PF3 icons, jQuery plugins — pending migration to React
- **React-mounting ERB**: Thin wrappers that just mount a React component — will be replaced by SPA routes
- **API RABL**: Stable, not part of frontend migration
