---
name: migrate-component
description: Migrate a single plugin component from PF5 to PF6
triggers:
  - migrate component
  - pf6 migrate
  - upgrade component
---

# Migrate Component — Plugin PF5 to PF6 Migration

Migrate a single component in this Foreman plugin from PF5 to PF6.

**Input:** Path to a component file or directory.

## Steps

1. **Read** the component, its test file, and any co-located SCSS.

2. **Classify** which migration patterns are needed (deprecated imports,
   class component, connect(), Enzyme, CSS tokens).

3. **Look up PF6 APIs** via PatternFly MCP:
   ```
   searchPatternFlyDocs("ComponentName")
   usePatternFlyDocs("ComponentName")
   ```

4. **Apply transformations** using patterns from
   `.claude/instructions/pf6-migration-patterns.md`.

5. **Update SCSS** — replace `pf-v5-*` classes and `--pf-v5-*` variables.

6. **Migrate tests** — Enzyme to RTL, update PF6-specific assertions
   (see `.claude/instructions/pf6-testing-recipes.md`).

7. **Run tests:** `npx jest {path} --no-coverage`

8. **Report** changes made and test status.

## Plugin-Specific Notes

- For `foremanReact/` imports: check if the core component API changed.
  If the import path resolves to a core component that was restructured
  in PF6, update the usage accordingly.
- Fill components must render PF6 markup to match core.
- Test helpers from core (`foremanReact/common/rtlTestHelpers`) are available.
