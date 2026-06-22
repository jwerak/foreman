# React App Root

This is the React application root for Foreman's frontend. Entry point is `Root/` which mounts the Redux store and React Router.

## Key Files
- `API.js` — Axios-based HTTP client; all API calls go through this
- `constants.js` — App-wide constants
- `history.js` — React Router history instance (shared with Redux)
- `permissions.js` — Permission checking utilities

## Directory Structure
- `components/` — All React components (290+ directories)
- `components/common/` — Shared reusable infrastructure (IndexPage, DetailPage, FormPage)
- `routes/` — SPA route definitions and page-level routing
- `redux/` — Redux store, reducers, middleware, actions
- `Root/` — App bootstrap, store creation, router setup
- `common/` — Shared utilities (I18n, date helpers, API helpers)

## Patterns
- All components are functional (no class components except ErrorBoundary)
- State management: Redux with hooks (useSelector, useDispatch), @reduxjs/toolkit
- UI framework: PatternFly 6.4.x exclusively — never use Bootstrap or PF3/5
- i18n: `translate as __` from `./common/I18n` for all user-visible strings
- Component registration: `componentRegistry.js` maps string names to React components for Rails mounting
- SCSS files co-located with components (ComponentName/ComponentName.scss)
- Tests co-located in `__tests__/` subdirectory using React Testing Library

## Adding a New Page
1. Create component in `components/XxxIndex/` (copy existing pattern)
2. Add route in `routes/IndexPages/index.js`
3. Add resource config in `routes/DetailPages/resourceConfigs.js`
See `components/common/` CLAUDE.md for IndexPage/DetailPage/FormPage usage.
