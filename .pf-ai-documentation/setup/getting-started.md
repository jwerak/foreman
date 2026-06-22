# Getting Started with Foreman Frontend

## Project Structure

Foreman's frontend lives at `webpack/assets/javascripts/react_app/`:
- `Root/` — App bootstrap (store, router, entry point)
- `components/` — 65+ component directories (~700 JS files)
- `components/common/` — Shared infrastructure (IndexPage, DetailPage, FormPage)
- `routes/` — SPA routing definitions
- `redux/` — Redux store, reducers, API middleware
- `common/` — Utilities (I18n, API client, custom hooks)

## Tech Stack

| Layer | Current | Target (PF6) |
|-------|---------|-------------|
| React | 16.9 | 18.2 |
| PatternFly | 5.4.x | 6.4.x |
| Redux | react-redux 7.1 | react-redux 8.1 |
| Testing | Enzyme + RTL | RTL only |
| Build | Webpack 5 | Webpack 5 |
| Plugin isolation | Module Federation | Module Federation |

## Build System

- `config/webpack.config.js` — main webpack config
- `@theforeman/builder` — shared build tooling for core + plugins
- Module Federation Plugin — each plugin compiles a separate `remoteEntry.js`
- Shared dependencies are singletons: React, Redux, PF (not bundled per plugin)

## Running Tests

```bash
npx jest --no-coverage                    # all tests
npx jest ComponentName --no-coverage      # single component
npx jest --updateSnapshot                 # update snapshots
```

## Development

```bash
npm install                               # install dependencies
npx webpack --config config/webpack.config.js  # build frontend
bundle exec rails server                  # start Rails (or use podman-compose)
```
