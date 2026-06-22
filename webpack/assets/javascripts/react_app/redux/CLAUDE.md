# Redux Directory

Redux store configuration, reducers, middleware, and action patterns.

## Key Files
- `index.js` — Store creation with `configureStore` from @reduxjs/toolkit
- `consts.js` — Action type constants

## Subdirectories
- `actions/` — Shared action creators (e.g., common API actions)
- `reducers/` — Combined reducers for all app state
- `middlewares/` — Custom middleware (API, notifications, etc.)
- `API/` — API middleware for declarative data fetching

## Patterns
- **Hooks only**: Use `useSelector` and `useDispatch` — never `connect()`
- **Slices**: Use `createSlice` from @reduxjs/toolkit for new state
- **API calls**: Use the API middleware pattern — dispatch action with `API_OPERATIONS` type
- **Selectors**: Co-locate selectors with their slice, use `reselect` for memoization
- **No class components**: All Redux consumers are functional with hooks

## API Middleware Pattern
```js
import { API_OPERATIONS, get } from '../../redux/API';

const fetchData = (url) => get({
  type: API_OPERATIONS,
  key: 'UNIQUE_KEY',
  url,
  payload: { /* additional params */ },
});
```

## Store Shape
The store is flat with keys per feature. Each feature owns its slice of state. The API middleware manages request/success/failure states automatically.
