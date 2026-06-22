# Routes Directory

SPA route definitions for React Router v5. All routes are defined in `routes.js` and composed in `index.js`.

## Key Files
- `routes.js` — Master route list, combines IndexPages + DetailPages + special routes
- `index.js` — Route rendering with React Router Switch
- `RouterSelector.js` — Chooses between SPA router and legacy Rails page rendering
- `RoutingService.js` — Navigation utilities

## Subdirectories

### IndexPages/
- `index.js` — Array of 22 route definitions using `route(path, Component, indexProps, title)`
- `IndexPageRoute.js` — Wrapper that provides document title and breadcrumbs
- Each route maps a URL path to an IndexPage component with resource-specific props

### DetailPages/
- `index.js` — Route rendering for detail pages at `/:resource/:id`
- `resourceConfigs.js` — Array of 21 resource configuration objects
- Each config: `{ indexPath, apiUrl, controller, resourceName, title, nameField, fieldsUrl, customTabs? }`

### Special Routes
- `Dashboard/` — `/` root dashboard
- `Hosts/` — `/new/hosts` with full host management
- `Topology/` — `/topology` visualization
- `RegistrationCommands/` — `/registration_commands`
- `Audits/` — `/audits`
- `RailsPage/` — Fallback for unmigrated pages (full page reload)

## Adding a New SPA Route
For a standard CRUD resource, add entries to IndexPages/index.js and DetailPages/resourceConfigs.js.
For a custom page, add a route object directly to routes.js.
