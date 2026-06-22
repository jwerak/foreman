# Foreman PF6 Migration Toolkit

AI-assisted migration tooling for upgrading Foreman and its plugins from
PatternFly 5 to PatternFly 6.

## Quick Start for Plugin Migration

1. **Copy the template** into your plugin:
   ```bash
   cp -r migration-toolkit/plugin-template/{AGENT.md,.claude,.cursor} /path/to/your-plugin/
   ```

2. **Customize `AGENT.md`** — replace `{PLUGIN_NAME}` and `{DESCRIPTION}` with
   your plugin's actual name and description.

3. **Or use the skill** (if using Claude Code with Foreman):
   ```
   /migrate-plugin-init /path/to/your-plugin
   ```
   This copies, customizes, and runs the initial analysis automatically.

4. **Run the initial audit:**
   ```
   /migrate-analyze webpack/
   ```

5. **Run automated codemods** (dry run first):
   ```bash
   npx @patternfly/pf-codemods@latest ./webpack --v6
   npx @patternfly/pf-codemods@latest ./webpack --v6 --fix
   ```

6. **Migrate remaining files** one at a time:
   ```
   /migrate-component webpack/assets/javascripts/react_app/components/MyComponent
   ```

7. **Verify clean state:**
   ```
   /migrate-verify webpack/
   ```

## Phased Migration Strategy

For large plugins, follow this order strictly. Each phase has a detailed
checklist in `checklists/`.

### Phase 0: Prerequisites (before touching PF)
- Upgrade React 16/17 to 18 → `checklists/phase0-react-upgrade.md`
- Remove PF3 (`patternfly`, `patternfly-react`)
- Convert class components to functional
- Migrate Enzyme tests to React Testing Library

### Phase 1: PF5 Cleanup (while still on PF5 packages)
- Replace deprecated PF5 components with composable equivalents
- See `checklists/phase1-pf5-cleanup.md`

### Phase 2: PF6 Package Upgrade
- Bump `@patternfly/*` to 6.x
- Run pf-codemods
- Fix CSS tokens and variables
- See `checklists/phase2-pf6-migration.md`

### Phase 3: Stabilization
- Fix test failures
- Visual testing
- See `checklists/phase3-stabilization.md`

### Phase 4: Modernization (optional)
- Additional modernization patterns
- See `checklists/phase4-modernization.md`

## Integration with Foreman Core

Foreman plugins share React, Redux, and PatternFly as singletons via
Webpack Module Federation. This means:

- **Plugins MUST match Foreman core's PF version.** When core upgrades to PF6,
  plugins must upgrade too or their UIs will break.
- **Shared dependencies are not bundled by plugins.** React, PF, Redux come
  from `@theforeman/vendor`. Update `@theforeman/builder` to get PF6 shared deps.
- **`foremanReact/` imports** resolve to Foreman core components. If core changed
  a component API during migration, plugin imports may need updating.
- **Fill/Slot content** must render PF6 markup. A Fill that renders PF5 components
  will look wrong in a PF6 core.

## PatternFly Ecosystem Tools

### @patternfly/pf-codemods
ESLint-based automated transformations for PF version upgrades. Handles ~60% of
breaking changes (import paths, CSS classes, token names, simple prop renames).

```bash
npx @patternfly/pf-codemods@latest ./webpack --v6          # dry run
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix    # apply fixes
```

See `codemods/README.md` for details.

### PatternFly MCP (Claude Code)
The PatternFly MCP server provides AI tools with live component documentation:

```
searchPatternFlyDocs("Button")     → find the component
usePatternFlyDocs("Button")        → read its PF6 API, props, examples
```

Configured in `.claude/settings.local.json` and `.mcp.json`.

### patternfly-ai-coding
Structured markdown docs for AI consumption. Clone into your workspace:
```bash
git clone https://github.com/nicolethoen/patternfly-ai-coding.git .pf-ai-docs
```

### PatternFly CLI
```bash
npx @patternfly/cli scaffold
```

## Worked Example: Katello Migration

1. **Setup:** Clone Katello alongside Foreman (standard dev setup).

2. **Bootstrap tooling:**
   ```
   /migrate-plugin-init /path/to/katello
   ```
   Creates AGENT.md, .claude config, .cursor rules in Katello.

3. **Run analysis:**
   ```
   /migrate-analyze webpack/
   ```
   Katello typically has 50-100 component files.

4. **Phase 0:** Coordinate with Foreman core for React 18 upgrade. Update
   `@theforeman/builder` which provides shared React.

5. **Phase 1-2:** Run pf-codemods first, then `/migrate-component` on
   remaining files. Focus on:
   - Deprecated Dropdown/Select (common in index pages)
   - Modal dialogs (common in action dialogs)
   - Table components (common in list views)

6. **Phase 3:** Run full test suite, visual test key pages.

7. **Coordinate:** Plugin PF6 PR should target the same Foreman release
   that includes PF6 core changes.

## File Reference

```
migration-toolkit/
├── README.md                          # This file
├── plugin-template/                   # Copy into your plugin
│   ├── AGENT.md                       # AI migration guide (customize)
│   ├── .claude/
│   │   ├── settings.local.json        # PF MCP + permissions
│   │   └── commands/
│   │       ├── migrate-analyze.md     # /migrate-analyze skill
│   │       ├── migrate-component.md   # /migrate-component skill
│   │       └── migrate-verify.md      # /migrate-verify skill
│   └── .cursor/
│       └── rules/
│           └── patternfly-migration.mdc
├── checklists/
│   ├── phase0-react-upgrade.md
│   ├── phase1-pf5-cleanup.md
│   ├── phase2-pf6-migration.md
│   ├── phase3-stabilization.md
│   └── phase4-modernization.md
└── codemods/
    └── README.md
```
