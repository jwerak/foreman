# Dark Mode with PF6

## How It Works

PF6 supports dark mode via CSS custom properties (design tokens).
When the `.pf-v6-theme-dark` class is applied to the document root,
all PF6 tokens automatically switch to dark values.

## Implementation

### CSS — Use Design Tokens

```scss
// CORRECT — works in both light and dark mode
.my-component {
  color: var(--pf-t--global--text--color--regular);
  background: var(--pf-t--global--background--color--primary--default);
  border-color: var(--pf-t--global--border--color--default);
}

// WRONG — breaks dark mode
.my-component {
  color: #333;
  background: white;
}
```

### JavaScript — Theme Toggle

```javascript
const toggleDarkMode = () => {
  document.documentElement.classList.toggle('pf-v6-theme-dark');
  const isDark = document.documentElement.classList.contains('pf-v6-theme-dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

// On load: respect user preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('pf-v6-theme-dark');
}
```

## Migration Checklist

- [ ] All hardcoded colors replaced with PF6 design tokens
- [ ] No `background: white`, `color: black`, `color: #hex` in SCSS
- [ ] Charts use PF6 theme tokens (auto-supported by @patternfly/react-charts)
- [ ] Images/icons have appropriate dark mode variants (or use currentColor)
- [ ] Tested in both light and dark mode
