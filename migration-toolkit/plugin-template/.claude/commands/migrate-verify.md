---
name: migrate-verify
description: Verify PF6 migration completeness for this plugin
triggers:
  - verify migration
  - check pf6
  - migration check
---

# Migrate Verify — Plugin PF6 Verification

Run verification checks to confirm the plugin has no PF5/PF3 remnants.

**Input:** A directory path (default: `webpack/`).

## Steps

1. **Import audit** — check for zero legacy/deprecated imports
2. **CSS audit** — check for zero `pf-v5-` class and variable references
3. **Code quality audit** — check for zero class components, connect(), Enzyme
4. **Plugin-specific:** check `foremanReact` imports don't reference deprecated paths
5. **Test execution:** `npx jest --no-coverage`
6. **Output** green/red checklist with overall PASS/FAIL

See Foreman core `/migrate-verify` skill for the full check list.
