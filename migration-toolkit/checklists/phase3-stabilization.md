# Phase 3: Stabilization

Post-migration verification and visual testing.

## Prerequisites
- Phase 2 complete (PF6 packages, codemods applied, tests passing)

## 3.1 Full Test Suite

```bash
npx jest --no-coverage 2>&1 | tee /tmp/pf6-stabilization-tests.log
```

- [ ] All test suites pass
- [ ] No skipped tests that should be active
- [ ] Snapshot files reviewed and committed

## 3.2 Webpack Build

```bash
npx webpack --config config/webpack.config.js
```

For plugins using `@theforeman/builder`:
```bash
npx tfm-build
```

- [ ] Build succeeds with no errors
- [ ] No PF5 deprecation warnings in build output

## 3.3 Visual Testing

Deploy and check key pages manually:

- [ ] Login page renders correctly
- [ ] Main navigation sidebar (colors, spacing, hover states)
- [ ] Dashboard page (cards, charts)
- [ ] At least one index/list page (table, toolbar, pagination)
- [ ] At least one form page (form fields, validation, submit)
- [ ] At least one modal dialog (open, close, actions)
- [ ] At least one dropdown/select component
- [ ] Dark mode (if supported) — toggle and verify all pages

## 3.4 ERB Template Check

For pages that mix Rails ERB with React components:

```bash
grep -rn "react_component" app/views/ --include="*.erb" | head -20
```

- [ ] ERB-mounted React components render correctly
- [ ] No Bootstrap/PF5 CSS conflicts on mixed pages

## 3.5 Plugin Compatibility (Core Only)

If this is Foreman core, verify plugins still load:

- [ ] Plugin remoteEntry.js loads without errors
- [ ] Plugin routes are registered
- [ ] Plugin Fill/Slot components render in PF6 context
- [ ] Check browser console for Module Federation errors

## 3.6 Accessibility

- [ ] OUIA IDs present on interactive elements (`data-ouia-component-id`)
- [ ] Keyboard navigation works (tab through page, enter to activate)
- [ ] Screen reader labels present (aria-label, aria-labelledby)
- [ ] Color contrast meets WCAG AA (automatic with PF6 tokens)

## 3.7 Known Issues Log

Document any intentional exceptions or deferred items:
```
| File | Issue | Reason | Tracking |
|------|-------|--------|----------|
| Pf4DualList/index.js | deprecated DualListSelector | API incompatibility | #ISSUE |
```

- [ ] All exceptions documented with justification
- [ ] Tracking issues created for deferred items
