# Test Migration Patterns

Complete PF6-specific test recipes are in:
`.claude/instructions/pf6-testing-recipes.md`

## Recipes

1. **Button text in PF6** — use `getByRole` not `getByText` (text wrapped in span)
2. **Dropdown/Select menus** — render only when open, click toggle first
3. **Modal accessibility** — test `aria-labelledby` via `getByRole('dialog')`
4. **Foreman test wrappers** — Provider, MemoryRouter, I18n mocking
5. **API mocking** — `jest.mock('../../redux/API/API')`
6. **Router components** — MemoryRouter wrapping with route params
7. **Table testing** — composable table role queries
8. **Snapshot updates** — bulk update after CSS class prefix changes
9. **Dark mode testing** — matchMedia mocking
10. **OUIA IDs** — `data-ouia-component-id` testing
