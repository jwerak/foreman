# Phase 1: PF5 Cleanup

Replace deprecated PF5 components with their composable equivalents.
Do this WHILE STILL ON PF5 packages — the composable APIs work in both PF5 and PF6.

## Prerequisites
- Phase 0 complete (React 18, no PF3, no Enzyme, no class components)

## 1.1 Replace Deprecated Dropdown

```bash
grep -rn "from '@patternfly/react-core/deprecated'" --include="*.js" --include="*.jsx" webpack/ | grep -i dropdown
```

For each file, replace deprecated Dropdown with composable pattern.
See `.claude/instructions/pf6-migration-patterns.md` section D for before/after.

- [ ] Simple dropdowns migrated
- [ ] Kebab dropdowns migrated
- [ ] Split button dropdowns migrated (if any)
- [ ] Tests updated and passing

## 1.2 Replace Deprecated Select

```bash
grep -rn "from '@patternfly/react-core/deprecated'" --include="*.js" --include="*.jsx" webpack/ | grep -i select
```

See `.claude/instructions/pf6-migration-patterns.md` section F.

- [ ] Single selects migrated
- [ ] Typeahead selects migrated (if any)
- [ ] Multi-selects migrated (if any)
- [ ] Tests updated and passing

## 1.3 Replace Deprecated ContextSelector

```bash
grep -rn "ContextSelector" --include="*.js" --include="*.jsx" webpack/
```

ContextSelector → Dropdown with search. Use composable Dropdown with
TextInputGroup as toggle content.

- [ ] ContextSelectors replaced
- [ ] Tests updated

## 1.4 Replace Deprecated Table

```bash
grep -rn "from '@patternfly/react-table/deprecated'" --include="*.js" --include="*.jsx" webpack/
```

Replace `Table`/`TableHeader`/`TableBody` with composable `Table`/`Thead`/`Tbody`/`Tr`/`Th`/`Td`.

- [ ] Tables migrated to composable pattern
- [ ] Sort functions updated (`ThProps` instead of `sortable` transformer)
- [ ] Action columns use `ActionsColumn` component
- [ ] Tests updated

## 1.5 Replace Deprecated EmptyState Pattern

```bash
grep -rn "EmptyStateHeader\|EmptyStateIcon" --include="*.js" --include="*.jsx" webpack/
```

PF6 merges EmptyStateHeader/EmptyStateIcon into EmptyState props.
See `.claude/instructions/pf6-migration-patterns.md` section A.

- [ ] EmptyState patterns updated
- [ ] Tests updated

## 1.6 Replace Chip with Label

```bash
grep -rn "Chip" --include="*.js" --include="*.jsx" webpack/ | grep -i "from.*patternfly"
```

- [ ] All `Chip` → `Label`
- [ ] All `ChipGroup` → `LabelGroup`
- [ ] Toolbar `chips` prop → `labels` prop
- [ ] Tests updated

## 1.7 Redux connect() → Hooks

```bash
grep -rn "export default connect\|connect(map" --include="*.js" --include="*.jsx" webpack/ | grep -v node_modules
```

See `.claude/instructions/pf6-migration-patterns.md` section H.

- [ ] All connect() → useSelector + useDispatch
- [ ] Tests updated

## Verification

```bash
grep -rn "@patternfly/react-core/deprecated\|@patternfly/react-table/deprecated" --include="*.js" --include="*.jsx" webpack/
# Should return 0 results (or only accepted exceptions like DualListSelector)
```

Run full test suite:
```bash
npx jest --no-coverage
```
