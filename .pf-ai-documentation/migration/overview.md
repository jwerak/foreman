# PF6 Migration Overview

## Strategy

The migration follows a strict phase order. Each phase builds on the previous
one and has clear entry/exit criteria.

```
Phase 0: Prerequisites
  ├── React 16 → 18
  ├── Remove PF3
  ├── Class → functional components
  └── Enzyme → RTL tests

Phase 1: PF5 Cleanup (while still on PF5 packages)
  ├── Replace deprecated Dropdown/Select/ContextSelector
  ├── Replace deprecated Table
  ├── Replace deprecated EmptyState pattern
  ├── Chip → Label
  └── connect() → hooks

Phase 2: PF6 Package Upgrade
  ├── Bump @patternfly/* to 6.x
  ├── Run pf-codemods (auto-fix ~60%)
  ├── CSS class/variable updates
  ├── Manual component fixes
  └── Chart import paths

Phase 3: Stabilization
  ├── Fix test failures
  ├── Visual testing
  └── Plugin compatibility check

Phase 4: Modernization (optional)
  ├── Dark mode
  ├── SPA navigation
  ├── Reusable page infrastructure
  └── jQuery removal
```

## Key Principles

1. **Phase 1 before Phase 2.** Replace deprecated PF5 components while still on
   PF5 packages. The composable replacements work in both PF5 and PF6, so this
   reduces the blast radius of the PF6 package upgrade.

2. **Codemods first, manual second.** `@patternfly/pf-codemods` handles ~60% of
   changes automatically. Run it first, commit the result, then do manual fixes.

3. **One component at a time.** Use `/migrate-component` on individual files.
   Run tests after each change.

4. **Verify with PatternFly MCP.** Don't guess PF6 prop names. Use
   `searchPatternFlyDocs` and `usePatternFlyDocs` to get the actual API.

5. **Plugins in sync.** When Foreman core upgrades PF, plugins must upgrade too
   because shared dependencies are singletons.

## Detailed Checklists

- `migration-toolkit/checklists/phase0-react-upgrade.md`
- `migration-toolkit/checklists/phase1-pf5-cleanup.md`
- `migration-toolkit/checklists/phase2-pf6-migration.md`
- `migration-toolkit/checklists/phase3-stabilization.md`
- `migration-toolkit/checklists/phase4-modernization.md`
