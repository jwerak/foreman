# Plugin Extension Points

Foreman plugins extend the UI through three mechanisms.

## Fill/Slot System

Foreman defines extension points with `<Slot>`. Plugins fill them with `<Fill>`.

**Core (defining a slot):**
```javascript
import Slot from '../common/Slot';
<Slot id="host-details-tab" multi />
```

**Plugin (filling a slot):**
```javascript
import { addGlobalFill } from 'foremanReact/components/common/Fill/GlobalFill';

addGlobalFill('host-details-tab', 'my-plugin-tab', <MyTabContent />, 100);
```

Weight determines render order (higher = first).

**Migration note:** Fill content MUST render PF6 components to match core.

## Route Registration

Plugins add SPA routes via `registerRoutes`:

```javascript
import { registerRoutes } from 'foremanReact/routes/RoutingService';

registerRoutes('my-plugin', [
  { path: '/my-plugin/items', component: ItemsIndex, exact: true },
  { path: '/my-plugin/items/:id', component: ItemDetail },
]);
```

Routes are merged with core routes in the React Router config.

## Component Registry

For Rails ERB mounting, plugins register React components:

```javascript
import componentRegistry from 'foremanReact/components/componentRegistry';

componentRegistry.register({
  name: 'MyPluginComponent',
  type: MyPluginComponent,
});
```

Rails then mounts via:
```erb
<%= react_component('MyPluginComponent', { prop1: value1 }) %>
```

## Module Federation

Plugins compile as separate Webpack federated modules:
- Entry: `webpack/index.js`
- Output: `{pluginName}_remoteEntry.js`
- Shared deps (React, PF, Redux) are singletons from core

Plugin imports from core use the `foremanReact/` alias:
```javascript
import { translate as __ } from 'foremanReact/common/I18n';
import API from 'foremanReact/redux/API/API';
```

## Migration Impact

When Foreman core upgrades to PF6:
1. `@theforeman/vendor` must provide PF6 shared deps
2. Plugin webpack builds must not bundle their own PF
3. All `foremanReact/` import targets may have changed API
4. Fill content must match PF6 styling
