---
name: migrate-analyze
description: Scan plugin directory for PF6 migration needs — classify files by migration complexity
triggers:
  - migrate analyze
  - analyze migration
  - scan for pf5
  - migration audit
---

# Migrate Analyze — Plugin PF6 Migration Audit

Scan the plugin's frontend directory and produce a migration report.

**Input:** A directory path (default: `webpack/`).

## Steps

1. **Scan for legacy and deprecated imports**
   ```bash
   echo "=== PF3 legacy ===" && grep -rn "from 'patternfly-react'\|from 'patternfly'" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null || echo "None"
   echo "=== PF5 deprecated ===" && grep -rn "@patternfly/react-core/deprecated\|@patternfly/react-table/deprecated" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null || echo "None"
   echo "=== PF5 /next ===" && grep -rn "@patternfly/react-core/next" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null || echo "None"
   echo "=== Charts without /victory ===" && grep -rn "from '@patternfly/react-charts'" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null | grep -v "/victory" || echo "None"
   ```

2. **Scan for PF5 CSS references**
   ```bash
   echo "=== CSS classes ===" && grep -rn "pf-v5-" --include="*.scss" --include="*.css" --include="*.js" {DIR} 2>/dev/null || echo "None"
   echo "=== CSS variables ===" && grep -rn "\-\-pf-v5-" --include="*.scss" --include="*.css" {DIR} 2>/dev/null || echo "None"
   ```

3. **Scan for legacy patterns**
   ```bash
   echo "=== Class components ===" && grep -rn "extends Component\|extends React\.Component" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null || echo "None"
   echo "=== connect() HOC ===" && grep -rn "connect(" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null | grep -v node_modules | grep -v "\.test\." || echo "None"
   echo "=== Enzyme ===" && grep -rn "from 'enzyme'" --include="*.js" --include="*.jsx" {DIR} 2>/dev/null || echo "None"
   ```

4. **Also scan Rails SCSS** (if applicable)
   ```bash
   echo "=== Rails SCSS ===" && grep -rn "pf-v5-\|--pf-v5-" app/assets/stylesheets/ 2>/dev/null || echo "None"
   ```

5. **Classify and report**

   Categorize findings:
   - **Red (manual):** PF3 imports, deprecated PF5 components, class components, connect(), Enzyme
   - **Yellow (codemod):** PF5 CSS classes, CSS variables, chart imports
   - **Green:** No issues found

   Output summary table with file counts and estimated effort.

## Reference

- `.claude/instructions/pf6-migration-patterns.md` — fix recipes for each pattern
- `.claude/instructions/pf6-testing-recipes.md` — test migration patterns
