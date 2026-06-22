# PF6 Testing Recipes

Test patterns specific to PF6 component behavior and the Foreman test infrastructure.

## Recipe 1: Button Text in PF6

PF6 wraps button text in `<span class="pf-v6-c-button__text">`. Direct text queries
may not match. Always query buttons by role:

```javascript
// CORRECT
screen.getByRole('button', { name: 'Submit' });
screen.getByRole('button', { name: /delete/i });

// AVOID — fragile with PF6
screen.getByText('Submit');
```

## Recipe 2: Dropdown/Select Menus

PF6 renders menu content only when the dropdown is open. You must open
the toggle before querying menu items:

```javascript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();

// Open the dropdown
await user.click(screen.getByRole('button', { name: 'Actions' }));

// Now items are rendered
expect(screen.getByText('Edit')).toBeInTheDocument();
expect(screen.getByText('Delete')).toBeInTheDocument();

// Select an item
await user.click(screen.getByText('Edit'));

// Menu closes — items are no longer in DOM
expect(screen.queryByText('Edit')).not.toBeInTheDocument();
```

## Recipe 3: Modal Accessibility

PF6 Modal uses `aria-labelledby` linked to `ModalHeader`. Test the full
composition:

```javascript
render(
  <Modal isOpen onClose={jest.fn()}>
    <ModalHeader title="Confirm Delete" />
    <ModalBody>Are you sure?</ModalBody>
    <ModalFooter>
      <Button variant="danger">Delete</Button>
    </ModalFooter>
  </Modal>
);

expect(screen.getByRole('dialog', { name: 'Confirm Delete' })).toBeInTheDocument();
expect(screen.getByText('Are you sure?')).toBeInTheDocument();
expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
```

## Recipe 4: Foreman Test Wrappers

### Provider wrapper for Redux
```javascript
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore();

const renderWithProviders = (ui, { initialState = {}, route = '/' } = {}) => {
  const store = mockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        {ui}
      </MemoryRouter>
    </Provider>
  );
};
```

### Rendering with I18n
```javascript
// Foreman's I18n uses Jed. In tests, the translate function returns the key:
jest.mock('../../common/I18n', () => ({
  translate: str => str,
  ngettext: (singular, plural, n) => (n === 1 ? singular : plural),
}));
```

## Recipe 5: Mocking the API Layer

### Mock Foreman API module
```javascript
import API from '../../redux/API/API';

jest.mock('../../redux/API/API');

// In test:
API.get.mockResolvedValue({ data: { results: [{ id: 1, name: 'Test' }], total: 1 } });

// Trigger the component to fetch
render(<MyComponent />);

await waitFor(() => {
  expect(API.get).toHaveBeenCalledWith('/api/v2/items', expect.any(Object));
  expect(screen.getByText('Test')).toBeInTheDocument();
});
```

### Mock API error
```javascript
API.get.mockRejectedValue(new Error('Network error'));

render(<MyComponent />);

await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Recipe 6: Router-Dependent Components

Components using `Link`, `useHistory`, `useParams`, or `useLocation`
require a router wrapper:

```javascript
import { MemoryRouter, Route } from 'react-router-dom';

// Simple case
render(
  <MemoryRouter>
    <MyComponent />
  </MemoryRouter>
);

// With route params
render(
  <MemoryRouter initialEntries={['/domains/42']}>
    <Route path="/domains/:id">
      <DetailComponent />
    </Route>
  </MemoryRouter>
);

// Verify navigation
const user = userEvent.setup();
await user.click(screen.getByRole('link', { name: 'View Details' }));
// Check the link's href
expect(screen.getByRole('link', { name: 'View Details' })).toHaveAttribute('href', '/domains/42');
```

## Recipe 7: Table Testing in PF6

PF6 composable tables have different DOM structure:

```javascript
render(
  <Table aria-label="Items table">
    <Thead>
      <Tr><Th>Name</Th><Th>Status</Th></Tr>
    </Thead>
    <Tbody>
      <Tr><Td>Item 1</Td><Td>Active</Td></Tr>
    </Tbody>
  </Table>
);

// Query table structure
const table = screen.getByRole('table', { name: 'Items table' });
expect(table).toBeInTheDocument();

// Count rows (includes header row)
const rows = screen.getAllByRole('row');
expect(rows).toHaveLength(2); // 1 header + 1 data

// Check column headers
expect(screen.getByRole('columnheader', { name: 'Name' })).toBeInTheDocument();

// Check cell content
expect(screen.getByRole('cell', { name: 'Item 1' })).toBeInTheDocument();
```

## Recipe 8: Snapshot Updates After PF6

After PF6 migration, many snapshots break due to CSS class changes
(`pf-v5-*` → `pf-v6-*`). Update them in bulk:

```bash
# Update all snapshots
npx jest --updateSnapshot

# Update snapshots for specific component
npx jest ComponentName --updateSnapshot

# Review changes before committing
git diff -- '*.snap'
```

Verify that snapshot changes are only CSS class prefixes and expected
structural changes (EmptyState, Button icon wrapping, etc.).

## Recipe 9: Testing Dark Mode

Components using PF6 design tokens automatically support dark mode.
To test theme-dependent rendering:

```javascript
// Mock matchMedia for dark mode
beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(query => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
});
```

## Recipe 10: Testing with OUIA IDs

Foreman requires OUIA IDs on interactive elements. Test that they're present:

```javascript
const { container } = render(<MyComponent />);

// Check OUIA ID on a specific element
expect(container.querySelector('[data-ouia-component-id="my-button"]')).toBeInTheDocument();

// Or via test ID if OUIA maps to data-testid
expect(screen.getByTestId('my-component')).toBeInTheDocument();
```
