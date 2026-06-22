# PatternFly MCP Configuration

The PatternFly MCP (Model Context Protocol) server gives AI tools access to
live PatternFly component documentation, JSON schemas, and design guidelines.

## Claude Code Setup

Already configured in `.mcp.json` at project root and enabled in
`.claude/settings.local.json`:

```json
{
  "enabledMcpjsonServers": ["patternfly-mcp"]
}
```

## Usage in Migration

### Find a component
```
searchPatternFlyDocs("Button")
```
Returns component names, documentation URLs, and resource URIs.

### Read component docs
```
usePatternFlyDocs("Button")
```
Returns markdown documentation and JSON schema with all props.

### Look up design tokens
```
searchPatternFlyDocs("tokens")
usePatternFlyDocs("Tokens")
```

### Common lookups during migration

| What you need | Search query |
|--------------|-------------|
| Dropdown API | `searchPatternFlyDocs("Dropdown")` |
| Select API | `searchPatternFlyDocs("Select")` |
| Modal API | `searchPatternFlyDocs("Modal")` |
| Table API | `searchPatternFlyDocs("Table")` |
| Design tokens | `searchPatternFlyDocs("tokens")` |
| Color tokens | `searchPatternFlyDocs("color")` |
| Spacing tokens | `searchPatternFlyDocs("spacer")` |
| Nav component | `searchPatternFlyDocs("Nav")` |

## Cursor Setup (context7 MCP)

For Cursor, add context7 MCP for live upstream PF docs:

```json
// ~/.cursor/mcp.json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

This provides always-current PatternFly documentation without needing
local copies.

## When to Use MCP

- Before replacing a deprecated component — verify the PF6 API
- When unsure about a prop name — PF5→PF6 renamed many props
- When fixing CSS tokens — look up exact semantic token names
- When the codemod leaves `--pf-t--temp--dev--tbd` — find the real token
