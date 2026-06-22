---
name: migrate-verify
description: Run comprehensive PF6 migration verification checks on a directory
triggers:
  - verify migration
  - check pf6
  - migration check
  - pf6 verify
---

# Migrate Verify — PF6 Migration Verification

Run a comprehensive verification pass to confirm all PF5/PF3 remnants are removed
and the codebase is clean PF6.

**Input:** A directory path (default: `webpack/assets/javascripts/react_app`).

## Steps

1. **Import audit**

   Check for zero occurrences of legacy imports:
   ```bash
   echo "=== PF3 imports ==="
   grep -rn "from 'patternfly-react'\|from 'patternfly'" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules || echo "PASS: 0 PF3 imports"

   echo "=== PF5 deprecated imports ==="
   grep -rn "@patternfly/react-core/deprecated\|@patternfly/react-table/deprecated" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules || echo "PASS: 0 deprecated imports"

   echo "=== PF5 /next imports ==="
   grep -rn "@patternfly/react-core/next" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules || echo "PASS: 0 /next imports"

   echo "=== Chart imports without /victory ==="
   grep -rn "from '@patternfly/react-charts'" --include="*.js" --include="*.jsx" {DIR} | grep -v "/victory" | grep -v node_modules || echo "PASS: all chart imports use /victory"
   ```

   **Known exceptions:** Document any intentional deprecated imports (e.g.,
   `Pf4DualList/index.js` uses DualListSelector from deprecated due to
   fundamental API incompatibility — this is an accepted exception).

2. **CSS audit**

   Check for zero PF5 class and variable references:
   ```bash
   echo "=== PF5 CSS classes ==="
   grep -rn "pf-v5-" --include="*.scss" --include="*.css" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules | grep -v "data-codemods" || echo "PASS: 0 pf-v5- class references"

   echo "=== PF5 CSS variables ==="
   grep -rn "\-\-pf-v5-" --include="*.scss" --include="*.css" --include="*.js" {DIR} | grep -v node_modules || echo "PASS: 0 --pf-v5- variable references"

   echo "=== Placeholder tokens ==="
   grep -rn "pf-t--temp--dev--tbd" --include="*.scss" --include="*.css" --include="*.js" {DIR} | grep -v node_modules || echo "PASS: 0 placeholder tokens"
   ```

   Also check Rails SCSS:
   ```bash
   echo "=== Rails SCSS PF5 references ==="
   grep -rn "pf-v5-\|--pf-v5-" app/assets/stylesheets/ || echo "PASS: 0 PF5 references in Rails SCSS"
   ```

3. **Code quality audit**

   Check for legacy code patterns:
   ```bash
   echo "=== Class components ==="
   grep -rn "extends Component\|extends React\.Component" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules | grep -v ErrorBoundary || echo "PASS: 0 class components (except ErrorBoundary)"

   echo "=== Redux connect() HOC ==="
   grep -rn "^\s*export default connect\|^connect(" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules | grep -v "\.test\." || echo "PASS: 0 connect() HOC usage"

   echo "=== Enzyme imports ==="
   grep -rn "from 'enzyme'" --include="*.js" --include="*.jsx" {DIR} | grep -v node_modules || echo "PASS: 0 Enzyme imports"
   ```

4. **Test execution**

   Run the test suite for the target directory:
   ```bash
   npx jest {DIR} --no-coverage 2>&1 | tail -20
   ```
   Report pass/fail count.

5. **Generate verification report**

   Output format:
   ```
   ## PF6 Migration Verification: {directory}

   ### Import Audit
   - [x] PF3 imports: 0 (PASS)
   - [x] PF5 deprecated imports: 0 (PASS)
   - [x] PF5 /next imports: 0 (PASS)
   - [x] Chart imports: all use /victory (PASS)

   ### CSS Audit
   - [x] PF5 classes (pf-v5-): 0 (PASS)
   - [x] PF5 variables (--pf-v5-): 0 (PASS)
   - [x] Placeholder tokens: 0 (PASS)
   - [x] Rails SCSS: 0 PF5 references (PASS)

   ### Code Quality
   - [x] Class components: 0 (PASS) [ErrorBoundary exempted]
   - [x] connect() HOC: 0 (PASS)
   - [x] Enzyme tests: 0 (PASS)

   ### Tests
   - [x] X suites passed, Y tests total (PASS)

   ### Exceptions
   - Pf4DualList/index.js: DualListSelector from deprecated (accepted: API incompatibility)

   ### Overall: PASS / FAIL
   ```

## For Plugins

When verifying a plugin, also check:
```bash
echo "=== foremanReact deprecated imports ==="
grep -rn "foremanReact.*deprecated" --include="*.js" --include="*.jsx" {DIR} || echo "PASS"

echo "=== Plugin PF version in package.json ==="
python3 -c "import json; d=json.load(open('package.json')); deps={**d.get('dependencies',{}), **d.get('devDependencies',{})}; pf=[f'{k}: {v}' for k,v in deps.items() if 'patternfly' in k]; print('\n'.join(pf) if pf else 'No PF deps (uses shared from core)')"
```
