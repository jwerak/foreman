# PF6 Migration Patterns Reference

Concrete before/after code recipes for every migration type needed in the PF5-to-PF6 upgrade.
Used by `/migrate-component` skill and as manual reference.

## A. Import Path Changes

### Dropdown (deprecated → composable)
```javascript
// BEFORE (PF5 deprecated)
import {
  Dropdown, DropdownToggle, DropdownItem, DropdownSeparator,
  KebabToggle
} from '@patternfly/react-core/deprecated';

// AFTER (PF6)
import {
  Dropdown, DropdownItem, DropdownList, Divider,
  MenuToggle
} from '@patternfly/react-core';
```

### Select (deprecated → composable)
```javascript
// BEFORE
import {
  Select, SelectOption, SelectVariant, SelectGroup
} from '@patternfly/react-core/deprecated';

// AFTER
import {
  Select, SelectOption, SelectList, SelectGroup,
  MenuToggle
} from '@patternfly/react-core';
```

### Modal (deprecated → composable)
```javascript
// BEFORE
import { Modal, ModalVariant } from '@patternfly/react-core/deprecated';
// or
import { Modal } from '@patternfly/react-core/next';

// AFTER
import { Modal, ModalHeader, ModalBody, ModalFooter, ModalVariant } from '@patternfly/react-core';
```

### Charts
```javascript
// BEFORE
import { ChartDonut, ChartBar, ChartThemeColor } from '@patternfly/react-charts';

// AFTER
import { ChartDonut, ChartBar, ChartThemeColor } from '@patternfly/react-charts/victory';
```

### Table (deprecated → composable)
```javascript
// BEFORE
import { Table, TableHeader, TableBody, sortable, cellWidth } from '@patternfly/react-table/deprecated';

// AFTER
import { Table, Thead, Tbody, Tr, Th, Td, ThProps } from '@patternfly/react-table';
```

### EmptyState
```javascript
// BEFORE
import {
  EmptyState, EmptyStateIcon, EmptyStateBody, EmptyStateHeader
} from '@patternfly/react-core';
// Usage:
<EmptyState>
  <EmptyStateHeader titleText="No results" headingLevel="h4" icon={<EmptyStateIcon icon={SearchIcon} />} />
  <EmptyStateBody>Try adjusting your filters.</EmptyStateBody>
</EmptyState>

// AFTER — EmptyStateHeader and EmptyStateIcon removed, props moved to EmptyState
import { EmptyState, EmptyStateBody } from '@patternfly/react-core';
// Usage:
<EmptyState headingText="No results" headingLevel="h4" icon={SearchIcon}>
  <EmptyStateBody>Try adjusting your filters.</EmptyStateBody>
</EmptyState>
```

### Text / TextContent → Content
```javascript
// BEFORE
import { Text, TextContent, TextVariants } from '@patternfly/react-core';
<TextContent><Text component={TextVariants.h2}>Title</Text></TextContent>

// AFTER
import { Content } from '@patternfly/react-core';
<Content component="h2">Title</Content>
```

## B. Component API Changes

### Button icon prop
```javascript
// BEFORE — icon as child
<Button variant="plain"><TimesIcon /></Button>
<Button variant="primary"><PlusCircleIcon /> Add item</Button>

// AFTER — icon as prop
<Button variant="plain" icon={<TimesIcon />} />
<Button variant="primary" icon={<PlusCircleIcon />}>Add item</Button>
```

### Button isActive → isClicked
```javascript
// BEFORE
<Button isActive={isSelected}>Tab</Button>

// AFTER
<Button isClicked={isSelected}>Tab</Button>
```

### FormGroup labelIcon → labelHelp
```javascript
// BEFORE
<FormGroup label="Name" labelIcon={<Popover bodyContent="Help text"><HelpIcon /></Popover>}>

// AFTER
<FormGroup label="Name" labelHelp={<Popover bodyContent="Help text"><HelpIcon /></Popover>}>
```

### Toolbar align values
```javascript
// BEFORE
<ToolbarGroup align={{ default: 'alignRight' }}>
<ToolbarItem align={{ default: 'alignLeft' }}>

// AFTER
<ToolbarGroup align={{ default: 'alignEnd' }}>
<ToolbarItem align={{ default: 'alignStart' }}>
```

### Toolbar chip → label props
```javascript
// BEFORE
<ToolbarFilter chips={filters} deleteChip={onDelete} categoryName="Status">
<ToolbarChipGroup> / ToolbarChip

// AFTER
<ToolbarFilter labels={filters} deleteLabel={onDelete} categoryName="Status">
<ToolbarLabelGroup> / ToolbarLabel
```

### PageSection variant
```javascript
// BEFORE
<PageSection variant="light">
<PageSection variant="darker">

// AFTER
// 'light' and 'darker' removed; use default or explicit background tokens
<PageSection>
```

### Color prop values
```javascript
// BEFORE — in Banner, Label, etc.
color="cyan"
color="gold"

// AFTER
color="teal"    // cyan → teal
color="yellow"  // gold → yellow
```

### Checkbox/Radio label position
```javascript
// BEFORE
<Checkbox isLabelBeforeButton />

// AFTER
<Checkbox labelPosition="start" />
```

## C. CSS Token Mapping

### Global palette → semantic tokens
| PF5 (`--pf-v5-global--*`) | PF6 (`--pf-t--global--*`) |
|---|---|
| `--pf-v5-global--palette--white` | `--pf-t--global--background--color--primary--default` |
| `--pf-v5-global--palette--black-500` | `--pf-t--global--text--color--placeholder` |
| `--pf-v5-global--palette--black-1000` | `--pf-t--global--text--color--regular` |
| `--pf-v5-global--palette--blue-500` | `--pf-t--global--color--nonstatus--blue--default` |
| `--pf-v5-global--FontFamily--text` | `--pf-t--global--font--family--body` |
| `--pf-v5-global--FontSize--sm` | `--pf-t--global--font--size--body--sm` |
| `--pf-v5-global--FontSize--md` | `--pf-t--global--font--size--body--default` |
| `--pf-v5-global--FontWeight--normal` | `--pf-t--global--font--weight--body--default` |
| `--pf-v5-global--LineHeight--md` | `--pf-t--global--font--line-height--body` |
| `--pf-v5-global--link--Color` | `--pf-t--global--text--color--link--default` |
| `--pf-v5-global--link--Color--hover` | `--pf-t--global--text--color--link--hover` |
| `--pf-v5-global--spacer--xs` | `--pf-t--global--spacer--xs` |
| `--pf-v5-global--spacer--sm` | `--pf-t--global--spacer--sm` |
| `--pf-v5-global--spacer--md` | `--pf-t--global--spacer--md` |
| `--pf-v5-global--spacer--lg` | `--pf-t--global--spacer--lg` |
| `--pf-v5-global--spacer--xl` | `--pf-t--global--spacer--xl` |

### Component class prefixes
All `pf-v5-c-*` → `pf-v6-c-*` (simple prefix change).
All `pf-v5-l-*` → `pf-v6-l-*` (layout classes).
All `pf-v5-u-*` → `pf-v6-u-*` (utility classes).

### Component CSS variables
All `--pf-v5-c-*` → `--pf-v6-c-*` (component-level overrides).
Verify exact names via PatternFly MCP — some variables were renamed, not just re-prefixed.

## D. Dropdown Migration (most complex)

### Simple dropdown
```javascript
// BEFORE
const [isOpen, setIsOpen] = useState(false);
<Dropdown
  toggle={<DropdownToggle onToggle={() => setIsOpen(!isOpen)}>Actions</DropdownToggle>}
  isOpen={isOpen}
  dropdownItems={[
    <DropdownItem key="edit" onClick={handleEdit}>Edit</DropdownItem>,
    <DropdownSeparator key="sep" />,
    <DropdownItem key="delete" onClick={handleDelete}>Delete</DropdownItem>,
  ]}
/>

// AFTER
const [isOpen, setIsOpen] = useState(false);
<Dropdown
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
      Actions
    </MenuToggle>
  )}
>
  <DropdownList>
    <DropdownItem key="edit" onClick={handleEdit}>Edit</DropdownItem>
    <Divider key="sep" />
    <DropdownItem key="delete" onClick={handleDelete}>Delete</DropdownItem>
  </DropdownList>
</Dropdown>
```

### Kebab dropdown
```javascript
// BEFORE
<Dropdown
  toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
  isOpen={isOpen}
  isPlain
  position="right"
  dropdownItems={items}
/>

// AFTER
<Dropdown
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  popperProps={{ position: 'right' }}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} variant="plain" onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
      <EllipsisVIcon />
    </MenuToggle>
  )}
>
  <DropdownList>{items}</DropdownList>
</Dropdown>
```

## E. Modal Migration

```javascript
// BEFORE (deprecated)
<Modal
  title="Delete Item"
  variant={ModalVariant.small}
  isOpen={isOpen}
  onClose={handleClose}
  actions={[
    <Button key="confirm" variant="danger" onClick={handleDelete}>Delete</Button>,
    <Button key="cancel" variant="link" onClick={handleClose}>Cancel</Button>,
  ]}
>
  <p>Are you sure you want to delete this item?</p>
</Modal>

// AFTER (composable)
<Modal variant="small" isOpen={isOpen} onClose={handleClose}>
  <ModalHeader title="Delete Item" />
  <ModalBody>
    <p>Are you sure you want to delete this item?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
    <Button variant="link" onClick={handleClose}>Cancel</Button>
  </ModalFooter>
</Modal>
```

## F. Select Migration

### Single select
```javascript
// BEFORE
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState(null);
<Select
  variant={SelectVariant.single}
  isOpen={isOpen}
  onToggle={() => setIsOpen(!isOpen)}
  onSelect={(e, val) => { setSelected(val); setIsOpen(false); }}
  selections={selected}
>
  <SelectOption value="option1">Option 1</SelectOption>
  <SelectOption value="option2">Option 2</SelectOption>
</Select>

// AFTER
const [isOpen, setIsOpen] = useState(false);
const [selected, setSelected] = useState(null);
<Select
  isOpen={isOpen}
  onOpenChange={setIsOpen}
  selected={selected}
  onSelect={(e, val) => { setSelected(val); setIsOpen(false); }}
  toggle={toggleRef => (
    <MenuToggle ref={toggleRef} onClick={() => setIsOpen(!isOpen)} isExpanded={isOpen}>
      {selected || 'Select...'}
    </MenuToggle>
  )}
>
  <SelectList>
    <SelectOption value="option1">Option 1</SelectOption>
    <SelectOption value="option2">Option 2</SelectOption>
  </SelectList>
</Select>
```

## G. Class Component → Functional

```javascript
// BEFORE
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0, data: null };
  }
  componentDidMount() {
    this.fetchData();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) this.fetchData();
  }
  fetchData() {
    API.get(`/api/v2/items/${this.props.id}`).then(res => this.setState({ data: res.data }));
  }
  render() {
    const { count, data } = this.state;
    return <div>{data?.name} ({count})</div>;
  }
}

// AFTER
const MyComponent = ({ id }) => {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get(`/api/v2/items/${id}`).then(res => setData(res.data));
  }, [id]);

  return <div>{data?.name} ({count})</div>;
};
```

## H. connect() HOC → Hooks

```javascript
// BEFORE
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const MyComponent = ({ items, loading, fetchItems }) => {
  useEffect(() => { fetchItems(); }, []);
  return <div>{loading ? 'Loading...' : items.map(i => <p key={i.id}>{i.name}</p>)}</div>;
};

const mapStateToProps = state => ({
  items: state.items.results,
  loading: state.items.loading,
});
const mapDispatchToProps = dispatch => bindActionCreators({ fetchItems }, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);

// AFTER
import { useSelector, useDispatch } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch();
  const items = useSelector(state => state.items.results);
  const loading = useSelector(state => state.items.loading);

  useEffect(() => { dispatch(fetchItems()); }, [dispatch]);

  return <div>{loading ? 'Loading...' : items.map(i => <p key={i.id}>{i.name}</p>)}</div>;
};

export default MyComponent;
```

## I. Enzyme → React Testing Library

### Basic render
```javascript
// BEFORE (Enzyme)
import { shallow, mount } from 'enzyme';
const wrapper = shallow(<MyComponent />);
expect(wrapper.find('.my-class')).toHaveLength(1);

// AFTER (RTL)
import { render, screen } from '@testing-library/react';
render(<MyComponent />);
expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
```

### User interaction
```javascript
// BEFORE
wrapper.find('button').simulate('click');
expect(wrapper.state('count')).toBe(1);

// AFTER
import userEvent from '@testing-library/user-event';
const user = userEvent.setup();
await user.click(screen.getByRole('button', { name: 'Increment' }));
expect(screen.getByText('Count: 1')).toBeInTheDocument();
```

### Async operations
```javascript
// BEFORE
await wrapper.update();
expect(wrapper.find('tr')).toHaveLength(3);

// AFTER
import { waitFor } from '@testing-library/react';
await waitFor(() => {
  expect(screen.getAllByRole('row')).toHaveLength(3);
});
```

### Props and re-render
```javascript
// BEFORE
wrapper.setProps({ title: 'New Title' });
expect(wrapper.find('h1').text()).toBe('New Title');

// AFTER
const { rerender } = render(<MyComponent title="Old Title" />);
rerender(<MyComponent title="New Title" />);
expect(screen.getByRole('heading', { name: 'New Title' })).toBeInTheDocument();
```

### Snapshot
```javascript
// BEFORE
import toJson from 'enzyme-to-json';
expect(toJson(wrapper)).toMatchSnapshot();

// AFTER
const { container } = render(<MyComponent />);
expect(container).toMatchSnapshot();
```

### Redux-connected component
```javascript
// BEFORE
import { Provider } from 'react-redux';
import store from '../../redux';
mount(<Provider store={store}><ConnectedComponent /></Provider>);

// AFTER
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
const mockStore = configureMockStore();
const store = mockStore({ items: { results: [], loading: false } });
render(<Provider store={store}><MyComponent /></Provider>);
```

## J. PF6-Specific Test Fixes

### Button text wrapped in span
PF6 wraps button text in `<span class="pf-v6-c-button__text">`.
Use `getByRole` instead of `getByText` for buttons:
```javascript
// WRONG — may fail in PF6
screen.getByText('Submit');

// CORRECT
screen.getByRole('button', { name: 'Submit' });
```

### Dropdown/Select menus render only when open
PF6 does not render menu items until the dropdown is opened:
```javascript
// Must open the dropdown first
await user.click(screen.getByRole('button', { name: 'Actions' }));
// NOW you can query for menu items
expect(screen.getByText('Edit')).toBeInTheDocument();
```
