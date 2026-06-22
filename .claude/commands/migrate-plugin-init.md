---
name: migrate-plugin-init
description: Initialize PF6 migration tooling in a Foreman plugin repository
triggers:
  - init plugin migration
  - bootstrap plugin
  - setup plugin pf6
  - plugin migrate init
---

# Migrate Plugin Init — Bootstrap PF6 Migration for a Foreman Plugin

Initialize migration tooling in a Foreman plugin repository by copying templates,
configuring AI tools, and running an initial analysis.

**Input:** Path to the plugin root directory (default: current directory).

## Steps

1. **Detect plugin type**

   Verify this is a Foreman plugin:
   ```bash
   # Check for Foreman plugin engine
   grep -r "Foreman::Plugin.register" {DIR}/lib/ || echo "WARNING: No Foreman plugin registration found"

   # Check for webpack frontend
   ls {DIR}/webpack/index.js 2>/dev/null || ls {DIR}/webpack/*_index.js 2>/dev/null || echo "WARNING: No webpack entry point found"

   # Check for package.json
   ls {DIR}/package.json 2>/dev/null || echo "WARNING: No package.json found"
   ```

   Extract plugin name:
   ```bash
   grep -oP "Foreman::Plugin.register\s+:(\w+)" {DIR}/lib/*/engine.rb | head -1
   ```

2. **Audit current PF version**

   ```bash
   cd {DIR} && python3 -c "
   import json
   d = json.load(open('package.json'))
   deps = {**d.get('dependencies', {}), **d.get('devDependencies', {})}
   pf = {k: v for k, v in deps.items() if 'patternfly' in k.lower()}
   react = {k: v for k, v in deps.items() if k in ('react', 'react-dom', 'react-redux')}
   enzyme = {k: v for k, v in deps.items() if 'enzyme' in k.lower()}
   rtl = {k: v for k, v in deps.items() if 'testing-library' in k.lower()}
   print('PatternFly:', json.dumps(pf, indent=2))
   print('React:', json.dumps(react, indent=2))
   print('Enzyme:', json.dumps(enzyme, indent=2))
   print('RTL:', json.dumps(rtl, indent=2))
   "
   ```

   Determine migration starting phase:
   - Has PF3 imports (`patternfly`, `patternfly-react`) → Start at Phase 0
   - Has React 16/17 → Start at Phase 0 (React upgrade)
   - Has PF5 but no PF3 → Start at Phase 1
   - Has PF6 already → Run `/migrate-verify` to check completeness

3. **Copy AGENT.md from template**

   Read `{FOREMAN_ROOT}/migration-toolkit/plugin-template/AGENT.md` and write it
   to `{DIR}/AGENT.md`, replacing placeholders:
   - `{PLUGIN_NAME}` → actual plugin name from step 1
   - `{DESCRIPTION}` → plugin description from gemspec or README
   - `{FOREMAN_PF_VERSION}` → current Foreman PF version (6.4.x)
   - `{CURRENT_PF_VERSION}` → plugin's current PF version from step 2

4. **Copy .claude/ configuration**

   Create `.claude/` directory in the plugin:
   ```bash
   mkdir -p {DIR}/.claude/commands
   mkdir -p {DIR}/.claude/instructions
   ```

   Copy from Foreman's template:
   - `migration-toolkit/plugin-template/.claude/settings.local.json` → `{DIR}/.claude/settings.local.json`
   - `migration-toolkit/plugin-template/.claude/commands/migrate-analyze.md` → `{DIR}/.claude/commands/`
   - `migration-toolkit/plugin-template/.claude/commands/migrate-component.md` → `{DIR}/.claude/commands/`
   - `migration-toolkit/plugin-template/.claude/commands/migrate-verify.md` → `{DIR}/.claude/commands/`

   Copy instruction files from Foreman core (these are universal):
   - `.claude/instructions/pf6-migration-patterns.md` → `{DIR}/.claude/instructions/`
   - `.claude/instructions/pf6-testing-recipes.md` → `{DIR}/.claude/instructions/`

5. **Copy Cursor rules**

   ```bash
   mkdir -p {DIR}/.cursor/rules
   ```

   Copy from Foreman's template:
   - `migration-toolkit/plugin-template/.cursor/rules/patternfly-migration.mdc` → `{DIR}/.cursor/rules/`

6. **Scan foremanReact imports**

   Identify which Foreman core components the plugin uses:
   ```bash
   grep -rn "foremanReact/" --include="*.js" --include="*.jsx" {DIR}/webpack/ | \
     sed 's/.*foremanReact\//foremanReact\//' | sort -u
   ```

   Add this list to the AGENT.md under a "Core Dependencies" section so the AI
   knows which Foreman APIs the plugin relies on.

7. **Run initial migration analysis**

   Execute the `/migrate-analyze` skill on the plugin's webpack directory:
   - Target: `{DIR}/webpack/`
   - Also scan: `{DIR}/app/assets/stylesheets/` for SCSS

   Append a summary to the AGENT.md as "Current Migration Status".

8. **Report**

   Output:
   ```
   ## Plugin Migration Initialized: {PLUGIN_NAME}

   ### Files Created
   - AGENT.md (customized with plugin name and current state)
   - .claude/settings.local.json (PF MCP + permissions)
   - .claude/commands/migrate-analyze.md
   - .claude/commands/migrate-component.md
   - .claude/commands/migrate-verify.md
   - .claude/instructions/pf6-migration-patterns.md
   - .claude/instructions/pf6-testing-recipes.md
   - .cursor/rules/patternfly-migration.mdc

   ### Current State
   - PF version: {version}
   - React version: {version}
   - Starting phase: {phase}
   - Files needing migration: {count}

   ### Next Steps
   1. Review and customize AGENT.md
   2. Run: npx @patternfly/pf-codemods@latest ./webpack --v6 (dry run first)
   3. Use /migrate-component on each flagged file
   4. Run /migrate-verify when done
   ```

## Notes

- This skill assumes Foreman core is available at `../foreman/` or a known path
  for copying template files. If not found, prompt the user for the Foreman path.
- For plugins without a webpack directory (Ruby-only), skip frontend migration steps.
- Plugin's `package.json` may list PF as a devDependency (for tests) or not at all
  (using shared from core). Both are valid.
