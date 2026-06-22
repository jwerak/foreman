# Using pf-codemods

See `migration-toolkit/codemods/README.md` for the complete guide.

## Quick Reference

```bash
# Dry run
npx @patternfly/pf-codemods@latest ./webpack --v6

# Apply fixes
npx @patternfly/pf-codemods@latest ./webpack --v6 --fix

# CSS variables
npx @patternfly/pf-codemods@latest css-vars-updater ./webpack --v6 --fix --fileTypes scss

# Specific rule only
npx @patternfly/pf-codemods@latest --only button-moveIcons-icon-prop ./webpack --v6 --fix

# Clean up markers (run last)
npx @patternfly/pf-codemods@latest --only data-codemods-cleanup ./webpack --fix
```

## What Gets Fixed Automatically

- Import paths (charts → charts/victory)
- CSS class prefixes (pf-v5- → pf-v6-)
- CSS variable names (--pf-v5- → --pf-v6- / --pf-t--)
- Simple prop renames (labelIcon → labelHelp, isActive → isClicked)
- Button icon migration (children → icon prop)
- Color name changes (cyan → teal, gold → yellow)
- Toolbar chip → label props

## What Needs Manual Work

- Deprecated Modal → composable (ModalHeader + ModalBody + ModalFooter)
- Deprecated Dropdown/Select → composable with MenuToggle
- EmptyState restructuring
- CSS token placeholders (--pf-t--temp--dev--tbd)
- Test assertion updates
