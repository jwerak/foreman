# Phase 4: Modernization (Optional)

Additional modernization that can be done before, during, or after PF6 migration.
These are independent improvements that result in cleaner, more maintainable code.

## 4.1 Dark Mode Support

PF6 includes built-in dark mode via CSS custom properties. To enable:

- [ ] All colors use PF6 design tokens (no hardcoded hex/rgb)
- [ ] SCSS uses `--pf-t--global--*` semantic tokens
- [ ] Add theme toggle component (localStorage + `prefers-color-scheme`)
- [ ] Test all pages in both light and dark mode

## 4.2 SPA Navigation

Convert full-page-reload links to React Router SPA navigation:

- [ ] Index pages registered as React Router routes
- [ ] Links use `<Link to="...">` instead of `<a href="...">`
- [ ] URL params parsed for initial state (search, page, sort)
- [ ] Browser back/forward works correctly
- [ ] Breadcrumbs update dynamically

## 4.3 Reusable Page Infrastructure

Adopt Foreman's reusable page components:

- [ ] Index pages use `IndexPage` component (table, toolbar, pagination)
- [ ] Detail pages use `DetailPage` component (tabs, header, actions)
- [ ] Form pages use `FormPage` component (dynamic fields from API)
- [ ] Resource configs registered for automatic routing

## 4.4 jQuery Removal

If the plugin still uses jQuery:

```bash
grep -rn "from 'jquery'\|require.*jquery\|\\$.ajax\|\\$.get\|\\$.post" --include="*.js" --include="*.jsx" webpack/
```

- [ ] `$.ajax` → `fetch` or Foreman API helper
- [ ] `$.get` / `$.post` → `fetch` or API helper
- [ ] jQuery DOM manipulation → React state + refs
- [ ] jQuery event handlers → React event handlers
- [ ] Remove jQuery from package.json (if no longer needed)

## 4.5 Form Consolidation

If the plugin has custom form implementations:

- [ ] Evaluate if forms can use Foreman's `FormPage` with `fieldsUrl`
- [ ] Create `set_form_fields` method in controllers
- [ ] Add `/form_fields` API endpoint
- [ ] Replace custom form with `<FormPage fieldsUrl="/api/v2/resource/form_fields" />`

## Verification

These modernizations are optional and can be done incrementally.
No specific verification gate required — just ensure tests pass after each change.
