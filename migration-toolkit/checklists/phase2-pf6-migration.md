# Phase 2: PF6 Package Upgrade

Upgrade PatternFly packages from 5.x to 6.x and apply automated + manual fixes.

## Prerequisites
- Phase 0 complete (React 18, no PF3, no Enzyme)
- Phase 1 complete (no deprecated PF5 components)

## 2.1 Bump Package Versions

Update `package.json`:
```json
{
  "@patternfly/patternfly": "^6.4.0",
  "@patternfly/react-core": "^6.4.0",
  "@patternfly/react-table": "^6.4.0",
  "@patternfly/react-icons": "^6.4.0",
  "@patternfly/react-styles": "^6.4.0",
  "@patternfly/react-tokens": "^6.4.0",
  "@patternfly/react-charts": "^8.4.0"
}
```

For plugins: you may not need these in `package.json` if they come from
`@theforeman/vendor`. Check with Foreman core team.

- [ ] Package versions updated
- [ ] `npm install` succeeds
- [ ] `rm -rf node_modules && npm install` (clean install)

## 2.2 Run pf-codemods (Dry Run)

```bash
npx @patternfly/pf-codemods@latest ./webpack --v6 2>&1 | tee /tmp/pf6-codemod-dryrun.log
```

Review the output. Expect issues in categories:
- `text-replace` — text prop changes
- `button-moveIcons-icon-prop` — icon moved to prop
- `modal-deprecated` — if any deprecated modals remain
- `formGroup-rename-labelIcon` — labelIcon → labelHelp
- `tokens-update` — CSS token renames
- CSS class prefix changes

- [ ] Dry run reviewed
- [ ] No unexpected issues

## 2.3 Apply Codemod Fixes

```bash
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix 2>&1 | tee /tmp/pf6-codemod-fix.log
```

- [ ] Fixes applied
- [ ] Review changes: `git diff`
- [ ] Commit codemod changes separately for easy rollback

## 2.4 CSS Variable Updater

```bash
npx @patternfly/pf-codemods@latest css-vars-updater ./webpack --v6 --fix --fileTypes scss 2>&1 | tee /tmp/pf6-css-vars.log
```

Also check Rails stylesheets:
```bash
npx @patternfly/pf-codemods@latest css-vars-updater ./app/assets/stylesheets --v6 --fix --fileTypes scss
```

- [ ] CSS variables updated
- [ ] Review changes

## 2.5 Manual CSS Token Fixes

The codemods leave `--pf-t--temp--dev--tbd` placeholders where automatic
mapping isn't possible. Fix these manually using the token mapping table
in `.claude/instructions/pf6-migration-patterns.md` section C.

```bash
grep -rn "pf-t--temp--dev--tbd" --include="*.scss" --include="*.css" webpack/ app/assets/stylesheets/
```

Use PatternFly MCP to look up correct semantic tokens:
```
searchPatternFlyDocs("design tokens")
usePatternFlyDocs("Tokens")
```

- [ ] Zero `--pf-t--temp--dev--tbd` placeholders remain

## 2.6 Chart Import Paths

```bash
grep -rn "from '@patternfly/react-charts'" --include="*.js" --include="*.jsx" webpack/ | grep -v "/victory"
```

All chart imports need the `/victory` subpath:
```javascript
// BEFORE
import { ChartDonut } from '@patternfly/react-charts';
// AFTER
import { ChartDonut } from '@patternfly/react-charts/victory';
```

- [ ] All chart imports use `/victory`

## 2.7 Manual Component Fixes

Codemod can't fix complex structural changes. Use `/migrate-component` for:
- Modal → ModalHeader + ModalBody + ModalFooter composition
- EmptyState restructuring (if not done in Phase 1)
- Button icon prop migration (children → `icon` prop)

- [ ] All component API changes applied
- [ ] No remaining `/* data-codemods */` markers

## 2.8 Clean Up Codemod Markers

After all other codemods are done:
```bash
npx @patternfly/pf-codemods@latest --only data-codemods-cleanup ./webpack --fix
```

- [ ] Markers cleaned up

## 2.9 Test Suite

```bash
npx jest --no-coverage 2>&1 | tee /tmp/pf6-test-results.log
```

Expected fixes:
- Snapshot updates (CSS class prefix changes)
- Button text assertions (PF6 wraps in span)
- Dropdown/Select test flows (menu renders only when open)

- [ ] All tests pass

## Verification

Run `/migrate-verify` for a comprehensive check:
```
/migrate-verify webpack/
```

- [ ] Clean verification report
