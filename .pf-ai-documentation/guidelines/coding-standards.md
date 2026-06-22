# Foreman Frontend Coding Standards

## React Components

- **Functional only** — no class components (exception: ErrorBoundary)
- **Hooks** — useState, useEffect, useMemo, useCallback, useSelector, useDispatch
- **Never connect()** — use useSelector/useDispatch for Redux
- **Props** — destructured in function signature, typed with prop-types
- **I18n** — `import { translate as __ } from '../../common/I18n'`
- **One dir per component** — `ComponentName/index.js`

## PatternFly Imports (PF6)

```javascript
import { Button, Modal } from '@patternfly/react-core';
import { Table, Thead } from '@patternfly/react-table';
import { ChartDonut } from '@patternfly/react-charts/victory';
import { CogIcon } from '@patternfly/react-icons';
```

Never: `/deprecated`, `/next`, `patternfly-react`, `patternfly`

## SCSS

- Co-located: `ComponentName/ComponentName.scss`
- Import in component: `import './ComponentName.scss'`
- Use PF6 design tokens (never hardcode colors):
  - `--pf-t--global--color--brand--default` (semantic)
  - `--pf-t--global--spacer--md` (spacing)
  - `--pf-v6-c-button--FontSize` (component)
- Classes: `pf-v6-c-*`, `pf-v6-l-*`, `pf-v6-u-*`

## Testing

- **Framework:** Jest + React Testing Library
- **Location:** `ComponentName/__tests__/ComponentName.test.js`
- **Query priority:** getByRole > getByLabelText > getByText > getByTestId
- **Interactions:** `@testing-library/user-event` (not fireEvent)
- **Async:** `waitFor`, `findBy*`
- **Wrappers:** MemoryRouter for routing, Provider for Redux

## File Organization

```
ComponentName/
├── index.js                    # Component
├── ComponentName.scss          # Styles (optional)
├── ComponentNameHelpers.js     # Helpers (optional)
└── __tests__/
    └── ComponentName.test.js   # Tests
```

## API Integration

- All API calls through `redux/API/API.js` (Axios wrapper)
- REST v2 endpoints: `/api/v2/{resource}`
- Pagination: `?page=X&per_page=Y`
- Search: `?search=query` (scoped_search format)
