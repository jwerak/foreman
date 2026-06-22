# Accessibility Guidelines

## OUIA IDs

Foreman requires OUIA IDs on interactive elements for testing and automation.
ESLint rule `require-ouiaid` enforces this.

```javascript
<Button ouiaId="submit-form-button">Submit</Button>
<Table aria-label="Items table" ouiaId="items-table">
```

## ARIA Labels

- All interactive elements must have accessible names
- Use `aria-label` or `aria-labelledby`
- PF6 components include ARIA by default — don't override unless needed
- Modal: `ModalHeader title` sets `aria-labelledby`
- Table: `aria-label` on `<Table>` element

## Keyboard Navigation

- All interactive elements must be keyboard-accessible
- Tab order must be logical
- Dropdown/Select: Enter/Space to open, arrow keys to navigate, Escape to close
- Modal: focus trap (PF6 handles automatically)
- Form: Enter to submit (ensure form has proper `onSubmit`)

## Color Contrast

PF6 design tokens meet WCAG AA contrast requirements.
Using tokens (not hardcoded colors) ensures automatic compliance
in both light and dark mode.

## Screen Reader Support

- Use semantic HTML elements (button, nav, main, aside)
- PF6 components use semantic elements by default
- Don't use `<div onClick>` — use `<Button>` or `<button>`
- Provide alt text for images
- Use `aria-live` for dynamic content updates
