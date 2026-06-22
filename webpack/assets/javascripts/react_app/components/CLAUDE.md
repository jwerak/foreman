# Components Directory

Contains all React components for Foreman. 65+ top-level directories, ~700 JS files, 280 test files.

## Conventions
- One directory per component/feature: `ComponentName/index.js` + `ComponentName.scss` + `__tests__/`
- Functional components only (hooks, no class components)
- Props: destructured in function signature
- SCSS: co-located, imported at top of component file
- Tests: `__tests__/ComponentName.test.js` using React Testing Library + Jest
- No inline styles; use PF6 utility classes or co-located SCSS

## Key Directories
- `common/` — Shared infrastructure: IndexPage, DetailPage, FormPage, EmptyState, Loader, etc.
- `Layout/` — App shell: sidebar navigation, header toolbar, theme toggle
- `Dashboard/` — SPA dashboard with PF6 Cards
- `HostsIndex/` — Main hosts listing page
- `HostForm/` — Host creation/edit form
- `Topology/` — Network topology visualization (PF Topology)
- `componentRegistry.js` — Maps string names to components for Rails `react_component` helper

## Index Page Components (22)
Each `XxxIndex/` directory contains a thin wrapper that configures the shared `common/IndexPage` component with resource-specific columns and actions. Pattern:
```js
import IndexPage from '../common/IndexPage';
const columns = [...];
const XxxIndex = (props) => <IndexPage columns={columns} {...props} />;
```

## Import Patterns
- PF6: `import { Button } from '@patternfly/react-core'`
- Icons: `import { PlusCircleIcon } from '@patternfly/react-icons'`
- I18n: `import { translate as __ } from '../../common/I18n'`
- API: `import { APIMiddleware } from '../../redux/API'` or `import API from '../../API'`
