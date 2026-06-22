---
name: migrate-analyze
description: Scan a directory for PF6 migration needs — classify files by migration complexity
triggers:
  - migrate analyze
  - analyze migration
  - scan for pf5
  - migration audit
  - pf6 audit
---

# Migrate Analyze — PF6 Migration Audit

Scan a directory tree and produce a structured migration report showing what needs
to change for PF5-to-PF6 compatibility.

**Input:** A directory path (default: `webpack/assets/javascripts/react_app`).

## Steps

1. **Scan for PF3 legacy imports**
   ```bash
   grep -rn "from 'patternfly-react'" --include="*.js" --include="*.jsx" {DIR}
   grep -rn "from 'patternfly'" --include="*.js" --include="*.jsx" {DIR}
   ```
   These must be completely removed before PF6 migration.

2. **Scan for PF5 deprecated imports**
   ```bash
   grep -rn "@patternfly/react-core/deprecated" --include="*.js" --include="*.jsx" {DIR}
   grep -rn "@patternfly/react-core/next" --include="*.js" --include="*.jsx" {DIR}
   grep -rn "@patternfly/react-table/deprecated" --include="*.js" --include="*.jsx" {DIR}
   ```

3. **Scan for PF5 CSS class references**
   ```bash
   grep -rn "pf-v5-" --include="*.scss" --include="*.css" --include="*.js" --include="*.jsx" {DIR}
   ```

4. **Scan for PF5 CSS variable references**
   ```bash
   grep -rn "\-\-pf-v5-" --include="*.scss" --include="*.css" --include="*.js" {DIR}
   ```

5. **Scan for class components**
   ```bash
   grep -rn "extends Component\|extends React\.Component" --include="*.js" --include="*.jsx" {DIR}
   ```

6. **Scan for Redux connect() HOC**
   ```bash
   grep -rn "connect(" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules | grep -v "\.test\."
   ```

7. **Scan for Enzyme test imports**
   ```bash
   grep -rn "from 'enzyme'" --include="*.js" --include="*.jsx" --include="*.test.js" {DIR}
   ```

8. **Scan for old chart imports**
   ```bash
   grep -rn "from '@patternfly/react-charts'" --include="*.js" --include="*.jsx" {DIR} | grep -v "/victory"
   ```

9. **Classify and report**

   Categorize each finding:

   | Category | Severity | Fix Method |
   |----------|----------|------------|
   | PF3 imports | Red | Manual removal (Phase 0) |
   | PF5 deprecated imports | Red | Manual component replacement (Phase 1) |
   | PF5 CSS classes (pf-v5-) | Yellow | pf-codemods auto-fix |
   | PF5 CSS variables (--pf-v5-) | Yellow | pf-codemods + manual token mapping |
   | Class components | Red | Manual conversion (Phase 0) |
   | connect() HOC | Red | Manual hooks conversion (Phase 0) |
   | Enzyme tests | Red | Manual RTL rewrite (Phase 0) |
   | Chart imports without /victory | Yellow | pf-codemods auto-fix |

   **Green files** have none of the above patterns.

   Output the report in this format:
   ```
   ## Migration Analysis: {directory}

   ### Summary
   | Category | Files | Est. Effort |
   |----------|-------|-------------|
   | No changes needed | X | 0 |
   | Codemod-fixable (Yellow) | Y | ~Z min |
   | Manual migration (Red) | W | ~V hours |

   ### Phase 0: Prerequisites
   #### PF3 Legacy (must remove first)
   - path/to/file.js:15 — import from 'patternfly-react'

   #### Class Components
   - path/to/Component.js:8 — extends React.Component

   #### Enzyme Tests
   - path/to/__tests__/Component.test.js:3 — from 'enzyme'

   #### Redux connect() HOC
   - path/to/Component.js:42 — connect(mapState, mapDispatch)

   ### Phase 1: PF5 Deprecated Components
   - path/to/file.js:5 — @patternfly/react-core/deprecated (Dropdown)
   - path/to/file.js:3 — @patternfly/react-core/next (Modal)

   ### Phase 2: Codemod-Fixable
   #### CSS Classes
   - path/to/style.scss:12 — pf-v5-c-button

   #### CSS Variables
   - path/to/style.scss:25 — --pf-v5-global--FontSize--sm

   #### Chart Imports
   - path/to/Chart.js:2 — from '@patternfly/react-charts' (needs /victory)
   ```

## Effort Estimation

- Green file: 0 minutes
- Yellow file (codemod-fixable): ~2 minutes (run codemod + verify)
- Red file (deprecated component): ~30 minutes per component
- Red file (class → functional): ~15 minutes
- Red file (Enzyme → RTL): ~20 minutes per test file
- Red file (connect → hooks): ~10 minutes

## Notes

- Also scan `app/assets/stylesheets/*.scss` for Rails SCSS files with PF5 references
- For plugins: scan their `webpack/` directory AND any SCSS in `app/assets/`
- Reference `.claude/instructions/pf6-migration-patterns.md` for fix recipes
