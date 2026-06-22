# PatternFly Codemods Guide

How and when to use `@patternfly/pf-codemods` for automated PF6 migration.

## Installation

No installation needed — run via npx:
```bash
npx @patternfly/pf-codemods@latest --help
```

For large codebases, increase Node memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx @patternfly/pf-codemods@latest ./webpack --v6
```

## Workflow

### 1. Dry Run First

Always preview changes before applying:
```bash
npx @patternfly/pf-codemods@latest ./webpack --v6
```

Review the output. Each issue links to the relevant PatternFly breaking change PR.

### 2. Apply Fixes

```bash
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix
```

Commit the changes separately so they can be reviewed and rolled back:
```bash
git add -A && git commit -m "Apply pf-codemods v5→v6 automated fixes"
```

### 3. CSS Variables

Separate command for SCSS/CSS variable updates:
```bash
npx @patternfly/pf-codemods@latest css-vars-updater ./webpack --v6 --fix --fileTypes scss
```

Also run on Rails stylesheets if applicable:
```bash
npx @patternfly/pf-codemods@latest css-vars-updater ./app/assets/stylesheets --v6 --fix --fileTypes scss
```

### 4. Selective Rules

Run only specific rules:
```bash
npx @patternfly/pf-codemods@latest --only button-moveIcons-icon-prop ./webpack --v6 --fix
```

Exclude specific rules:
```bash
npx @patternfly/pf-codemods@latest --exclude modal-deprecated ./webpack --v6 --fix
```

### 5. Clean Up Markers

After all codemods are complete, remove `/* data-codemods */` markers:
```bash
npx @patternfly/pf-codemods@latest --only data-codemods-cleanup ./webpack --fix
```

## What Codemods Fix (Automated)

| Category | Example | Auto-fixable |
|----------|---------|-------------|
| Import path changes | `react-charts` → `react-charts/victory` | Yes |
| CSS class prefixes | `pf-v5-c-*` → `pf-v6-c-*` | Yes |
| CSS variable names | `--pf-v5-*` → `--pf-v6-*` | Mostly |
| Simple prop renames | `labelIcon` → `labelHelp` | Yes |
| Button icon migration | children → `icon` prop | Yes |
| Color value changes | `cyan` → `teal`, `gold` → `yellow` | Yes |
| Toolbar chip → label | `chips` → `labels`, `deleteChip` → `deleteLabel` | Yes |
| Align value changes | `alignLeft` → `alignStart` | Yes |

## What Codemods Leave (Manual)

| Category | Why | Fix Method |
|----------|-----|------------|
| `--pf-t--temp--dev--tbd` tokens | No automatic mapping | Look up via PF MCP |
| Deprecated Modal restructuring | Complex structural change | Manual (see patterns doc) |
| Deprecated Dropdown/Select | Complex API change | Manual (see patterns doc) |
| EmptyState restructuring | Complex structural change | Manual (see patterns doc) |
| Test assertion changes | Context-dependent | Manual (see testing recipes) |
| Behavioral changes | Runtime differences | Manual testing required |

## Useful pf-codemods Rules for v5→v6

Key rules to know about:
- `button-moveIcons-icon-prop` — moves icon from children to `icon` prop
- `modal-deprecated` — flags deprecated Modal usage
- `chartsImport-moved` — fixes chart import paths
- `formGroup-rename-labelIcon` — renames `labelIcon` to `labelHelp`
- `colorProps-replaced-colors` — updates color value names
- `toolbar-replace-chip-instances` — renames chip→label props
- `data-codemods-cleanup` — removes temporary markers (run last)

## Troubleshooting

**"out of memory" error:**
```bash
NODE_OPTIONS=--max-old-space-size=4096 npx @patternfly/pf-codemods@latest ./webpack --v6
```

**"no files matching the pattern" error:**
Check that the path exists and contains .js/.jsx/.tsx files.

**Codemod changes break tests:**
This is expected. Run tests after codemods and fix assertion changes.
Most failures are snapshot updates (CSS class prefix changes).
