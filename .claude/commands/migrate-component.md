---
name: migrate-component
description: Migrate a single React component from PF5 to PF6 patterns
triggers:
  - migrate component
  - pf6 migrate
  - upgrade component
  - convert to pf6
---

# Migrate Component — PF5 to PF6 Single Component Migration

Migrate a single component file or directory from PatternFly 5 to PatternFly 6,
including its tests and co-located styles.

**Input:** Path to a component file or directory.

## Steps

1. **Read the component and its test file**

   Read the main component file (e.g., `ComponentName/index.js`) and its test
   file (`ComponentName/__tests__/ComponentName.test.js`). Also read any
   co-located SCSS (`ComponentName/ComponentName.scss`).

2. **Classify migration type**

   Check which of these patterns are present:
   - PF5 deprecated imports (`@patternfly/react-core/deprecated`)
   - PF5 next imports (`@patternfly/react-core/next`)
   - PF3 imports (`patternfly-react`, `patternfly`)
   - Class component (`extends Component`)
   - Redux `connect()` HOC
   - PF5 CSS classes in SCSS (`pf-v5-`)
   - PF5 CSS variables in SCSS (`--pf-v5-`)
   - Enzyme test imports
   - Chart imports without `/victory`

3. **Look up PF6 replacement APIs**

   For each deprecated component found, use the PatternFly MCP:
   ```
   searchPatternFlyDocs("ComponentName")
   usePatternFlyDocs("ComponentName")
   ```
   Read the PF6 component docs to understand the new prop interface.

4. **Apply transformations**

   Use the patterns documented in `.claude/instructions/pf6-migration-patterns.md`:

   **Import path changes:**
   - Update PF5 deprecated imports to PF6 equivalents
   - Update chart imports to use `/victory` subpath
   - Remove PF3 imports entirely

   **Component API changes:**
   - Dropdown: add `onOpenChange`, wrap toggle in callback, wrap items in `DropdownList`
   - Select: add `onOpenChange`, wrap toggle in callback, wrap items in `SelectList`
   - Modal: split into `ModalHeader` + `ModalBody` + `ModalFooter`
   - Button: move icon children to `icon` prop
   - EmptyState: merge `EmptyStateHeader`/`EmptyStateIcon` props into `EmptyState`
   - FormGroup: rename `labelIcon` to `labelHelp`
   - Text/TextContent: replace with `Content`

   **Structural changes:**
   - Class component → functional with hooks
   - `connect()` HOC → `useSelector` + `useDispatch`
   - See `.claude/instructions/pf6-migration-patterns.md` sections G and H

5. **Update co-located SCSS**

   If a `.scss` file exists:
   - Replace `pf-v5-c-*` → `pf-v6-c-*`
   - Replace `pf-v5-l-*` → `pf-v6-l-*`
   - Replace `--pf-v5-c-*` → `--pf-v6-c-*`
   - Replace `--pf-v5-global--*` with PF6 semantic tokens (see token mapping table)
   - Use PatternFly MCP to verify exact token names when unsure

6. **Migrate test file**

   If Enzyme:
   - Replace `shallow`/`mount` with RTL `render`
   - Replace `wrapper.find()` with `screen.getByRole`/`screen.getByText`
   - Replace `wrapper.simulate()` with `userEvent`
   - Replace `wrapper.setProps()` with `rerender`
   - See `.claude/instructions/pf6-testing-recipes.md` for recipes

   If already RTL but has PF5 assertions:
   - Update button text queries to use `getByRole` (PF6 wraps text in span)
   - Update snapshot expectations
   - Add dropdown/select open step before querying menu items

7. **Run tests**
   ```bash
   npx jest {component_path} --no-coverage
   ```
   Fix any failures. Update snapshots if only CSS class changes:
   ```bash
   npx jest {component_path} --no-coverage --updateSnapshot
   ```

8. **Report changes**

   Summarize:
   - Files modified
   - Patterns migrated (deprecated imports, class→functional, etc.)
   - Test status (pass/fail)
   - Any manual follow-up needed

## Important

- Always use PatternFly MCP to verify PF6 component APIs before writing code
- Do not guess prop names — PF5 to PF6 renamed many props
- If a component uses a PF5 pattern not in the migration patterns doc, look it up
  via `searchPatternFlyDocs` and document the new pattern
- For complex components with multiple deprecated patterns, migrate one pattern at a time
  and run tests between each change
