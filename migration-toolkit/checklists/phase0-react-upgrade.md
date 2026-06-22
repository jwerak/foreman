# Phase 0: Prerequisites

Complete these before starting the PF5 → PF6 migration.

## 0.1 React 16/17 → 18

### Prerequisites
- Node.js 18+
- npm 9+

### Steps
- [ ] Update `package.json`: `react` and `react-dom` to `^18.2.0`
- [ ] Update `react-redux` to `^8.1.0`
- [ ] Update `@testing-library/react` to `^14.0.0`
- [ ] Update `@testing-library/user-event` to `^14.0.0`
- [ ] Run `npm install`
- [ ] Replace `ReactDOM.render` with `createRoot`:
  ```javascript
  // BEFORE
  import ReactDOM from 'react-dom';
  ReactDOM.render(<App />, document.getElementById('root'));

  // AFTER
  import { createRoot } from 'react-dom/client';
  const root = createRoot(document.getElementById('root'));
  root.render(<App />);
  ```
- [ ] Fix React 18 StrictMode double-render warnings (if using StrictMode)
- [ ] Run tests: `npx jest --no-coverage`
- [ ] Fix any deprecation warnings in console

### Verification
```bash
grep -rn "ReactDOM.render" --include="*.js" --include="*.jsx" webpack/ | grep -v node_modules
# Should return 0 results
```

## 0.2 Remove PatternFly 3

### Steps
- [ ] Find all PF3 imports:
  ```bash
  grep -rn "from 'patternfly-react'" --include="*.js" --include="*.jsx" webpack/
  grep -rn "from 'patternfly'" --include="*.js" --include="*.jsx" webpack/
  ```
- [ ] Replace each PF3 component with its PF5 equivalent
- [ ] Remove `patternfly` and `patternfly-react` from `package.json`
- [ ] Run `npm install`
- [ ] Run tests

### Common PF3 → PF5 Replacements
| PF3 (`patternfly-react`) | PF5 (`@patternfly/react-core`) |
|---|---|
| `ListView` | `DataList` or `Table` |
| `MessageDialog` | `Modal` |
| `TypeAheadSelect` | `Select` with typeahead |
| `FieldLevelHelp` | `Popover` |
| `Spinner` | `Spinner` |
| `OverlayTrigger` | `Tooltip` or `Popover` |
| `ToastNotification` | `Alert` + `AlertGroup` |

### Verification
```bash
grep -rn "patternfly-react\|from 'patternfly'" --include="*.js" --include="*.jsx" webpack/
# Should return 0 results
```

## 0.3 Class Components → Functional

### Steps
- [ ] Find all class components:
  ```bash
  grep -rn "extends Component\|extends React\.Component" --include="*.js" --include="*.jsx" webpack/
  ```
- [ ] Convert each to functional component with hooks:
  - `this.state` → `useState`
  - `componentDidMount` → `useEffect(..., [])`
  - `componentDidUpdate` → `useEffect` with dependency array
  - `componentWillUnmount` → `useEffect` cleanup function
  - `this.props` → destructured function parameters
- [ ] Exception: `ErrorBoundary` remains as class (React requires it)
- [ ] Run tests after each conversion

### Verification
```bash
grep -rn "extends Component\|extends React\.Component" --include="*.js" --include="*.jsx" webpack/ | grep -v ErrorBoundary
# Should return 0 results
```

## 0.4 Enzyme → React Testing Library

### Steps
- [ ] Find all Enzyme test files:
  ```bash
  grep -rn "from 'enzyme'" --include="*.js" --include="*.test.js" webpack/
  ```
- [ ] Rewrite each test file using RTL patterns:
  - `shallow()`/`mount()` → `render()`
  - `wrapper.find()` → `screen.getByRole`/`screen.getByText`
  - `wrapper.simulate()` → `userEvent.click`/etc.
  - See `.claude/instructions/pf6-migration-patterns.md` section I
- [ ] Remove Enzyme packages from `package.json`:
  - `enzyme`
  - `enzyme-adapter-react-16`
  - `enzyme-to-json`
- [ ] Run `npm install`
- [ ] Run tests

### Verification
```bash
grep -rn "from 'enzyme'" --include="*.js" webpack/
# Should return 0 results
```
