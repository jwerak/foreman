# PF5 → PF6 CSS Token Mapping

## Class Prefixes

| PF5 | PF6 |
|-----|-----|
| `pf-v5-c-*` | `pf-v6-c-*` (component) |
| `pf-v5-l-*` | `pf-v6-l-*` (layout) |
| `pf-v5-u-*` | `pf-v6-u-*` (utility) |

## CSS Variable Prefixes

| PF5 | PF6 |
|-----|-----|
| `--pf-v5-c-*` | `--pf-v6-c-*` (component vars) |
| `--pf-v5-global--*` | `--pf-t--global--*` (semantic tokens) |

## Common Global Token Mappings

### Colors
| PF5 | PF6 |
|-----|-----|
| `--pf-v5-global--palette--white` | `--pf-t--global--background--color--primary--default` |
| `--pf-v5-global--palette--black-500` | `--pf-t--global--text--color--placeholder` |
| `--pf-v5-global--palette--black-1000` | `--pf-t--global--text--color--regular` |
| `--pf-v5-global--palette--blue-500` | `--pf-t--global--color--nonstatus--blue--default` |
| `--pf-v5-global--link--Color` | `--pf-t--global--text--color--link--default` |
| `--pf-v5-global--link--Color--hover` | `--pf-t--global--text--color--link--hover` |

### Typography
| PF5 | PF6 |
|-----|-----|
| `--pf-v5-global--FontFamily--text` | `--pf-t--global--font--family--body` |
| `--pf-v5-global--FontSize--sm` | `--pf-t--global--font--size--body--sm` |
| `--pf-v5-global--FontSize--md` | `--pf-t--global--font--size--body--default` |
| `--pf-v5-global--FontWeight--normal` | `--pf-t--global--font--weight--body--default` |
| `--pf-v5-global--LineHeight--md` | `--pf-t--global--font--line-height--body` |

### Spacing
| PF5 | PF6 |
|-----|-----|
| `--pf-v5-global--spacer--xs` | `--pf-t--global--spacer--xs` |
| `--pf-v5-global--spacer--sm` | `--pf-t--global--spacer--sm` |
| `--pf-v5-global--spacer--md` | `--pf-t--global--spacer--md` |
| `--pf-v5-global--spacer--lg` | `--pf-t--global--spacer--lg` |
| `--pf-v5-global--spacer--xl` | `--pf-t--global--spacer--xl` |

## Important Notes

- Use PatternFly MCP (`searchPatternFlyDocs("tokens")`) to verify token names
- PF6 semantic tokens (`--pf-t--*`) automatically support dark mode
- Component-level variables (`--pf-v6-c-*`) may have been renamed, not just re-prefixed
- If pf-codemods leaves `--pf-t--temp--dev--tbd`, look up the real token via MCP
