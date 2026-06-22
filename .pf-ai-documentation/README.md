# PatternFly AI Documentation — Foreman

This directory provides AI-indexed documentation for PatternFly 6 migration
and development in the Foreman project. It follows the structure from
[patternfly-ai-coding](https://github.com/nicolethoen/patternfly-ai-coding).

## Table of Contents

### Setup
- [setup/getting-started.md](setup/getting-started.md) — Project setup, dependencies, build system
- [setup/patternfly-mcp.md](setup/patternfly-mcp.md) — PatternFly MCP server configuration

### Migration
- [migration/overview.md](migration/overview.md) — Migration phases and strategy
- [migration/codemods.md](migration/codemods.md) — Using @patternfly/pf-codemods
- [migration/patterns.md](migration/patterns.md) — Before/after code patterns (link to .claude/instructions)
- [migration/testing.md](migration/testing.md) — Test migration patterns (link to .claude/instructions)
- [migration/css-tokens.md](migration/css-tokens.md) — PF5 → PF6 CSS token mapping

### Components
- [components/foreman-infrastructure.md](components/foreman-infrastructure.md) — IndexPage, DetailPage, FormPage
- [components/plugin-extension.md](components/plugin-extension.md) — Fill/Slot, registerRoutes, componentRegistry

### Guidelines
- [guidelines/coding-standards.md](guidelines/coding-standards.md) — React, SCSS, testing conventions
- [guidelines/accessibility.md](guidelines/accessibility.md) — OUIA IDs, ARIA, keyboard nav
- [guidelines/dark-mode.md](guidelines/dark-mode.md) — Dark mode with PF6 tokens

## How to Use

### With Claude Code
The PatternFly MCP is already configured in `.claude/settings.local.json`.
Use the `/migrate-*` skills for migration workflows.

### With Cursor
1. Open Foreman in Cursor
2. `.cursor/rules/patternfly-migration.mdc` loads automatically
3. This documentation directory is indexed for AI context
4. Optionally add context7 MCP for live upstream PF docs:
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

### With GitHub Copilot
`.github/copilot-instructions.md` provides Copilot-specific rules.

### With Any AI Tool
Reference `AGENT.md` at the project root — it contains the complete
migration guide in a tool-agnostic format.
