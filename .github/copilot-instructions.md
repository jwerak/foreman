# Foreman — GitHub Copilot Instructions

## Project

Foreman is a Rails + React app for server lifecycle management.
Frontend: `webpack/assets/javascripts/react_app/`.

## PatternFly 6 Migration

This project is migrating from PatternFly 5 to PatternFly 6.
All new and modified code must use PF6 patterns exclusively.

### Import Rules
```javascript
// CORRECT
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from '@patternfly/react-core';
import { Table, Thead, Tbody, Tr, Th, Td } from '@patternfly/react-table';
import { ChartDonut } from '@patternfly/react-charts/victory';

// NEVER USE
import { Dropdown } from '@patternfly/react-core/deprecated';
import { Modal } from '@patternfly/react-core/next';
import { Chart } from 'patternfly-react';
```

### Component Rules
- Functional components only (no class components)
- Hooks only: `useState`, `useEffect`, `useSelector`, `useDispatch`
- Never use `connect()` HOC from react-redux
- I18n: `import { translate as __ } from '../../common/I18n'`

### CSS Rules
- Use PF6 design tokens: `--pf-t--global--*` (semantic), `--pf-v6-c-*` (component)
- Never use `pf-v5-` class prefixes or `--pf-v5-*` variables
- Never hardcode colors — use tokens for dark mode compatibility
- SCSS co-located: `ComponentName/ComponentName.scss`

### Testing Rules
- React Testing Library + Jest only (no Enzyme)
- `getByRole` preferred over `getByText` for interactive elements
- PF6 buttons wrap text in span — always use `getByRole('button', { name: ... })`
- Dropdown/Select menus render only when open — click toggle first

### Key Patterns
- Modal: `<Modal>` → `<ModalHeader>` + `<ModalBody>` + `<ModalFooter>`
- Dropdown: `<Dropdown>` → `<MenuToggle>` + `<DropdownList>`
- Button icon: `icon` prop, not children
- EmptyState: `headingText` and `icon` as props

See `AGENT.md` for full migration guide and architecture details.
