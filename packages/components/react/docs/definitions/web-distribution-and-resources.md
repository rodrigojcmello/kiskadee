# Web distribution and resource recovery

## Component imports

Use component subpaths when structural CSS should follow the components in use:

```tsx
import { Text } from '@kiskadee/react-components/text';
import { Button } from '@kiskadee/react-components/button';
```

The root remains compatible and may retain structural styles for other components because CSS
imports have effects. Use `@kiskadee/react-components/resources` for providers and resource hooks
without importing component structural sheets. `@kiskadee/react-components/style.css` contains
shared infrastructure; import it explicitly.
Never mark CSS side-effect-free to reduce a bundle. Generated preset CSS follows the [component resources contract](../../../../web-builder/docs/definitions/component-resources.md)
with shared consumers deduplicated and ordering preserved.

After a build, run `pnpm --filter @kiskadee/react-components check:consumer-bundles`. It checks
public root/subpath entrypoints for Text, Badge, Card, Button and Switch, excludes dynamic imports
from the initial JS budget, rejects initial Zod and checks Text's structural CSS isolation. Budgets
are regression bounds for this fixture, not promises about application runtime or network latency.

## Resource states

A missing manifest entry is legitimate absence. A declared resource whose transport fails must
reject; hosts must not convert network, HTTP or JSON errors into resolved `undefined` values.
Failed promises are evicted. Successful absence remains cached until the artifact version changes.
Core and palette requests run concurrently; merged maps publish errors and notify mounted consumers.
A valid previous map can remain available during loading/error, but a completed absent result
clears that previous value.

`@kiskadee/react-components/resources` exposes `useComponentClassMapResolution` and
`useLoadedComponentArtifact` for hosts that need status/error and an explicit `retry()` action.
Class-map resolution retains its `pending` flag and adds error/retry. Metadata exposes
pending/ready/absent/error and reuses a shared client snapshot; hydration starts with the server
pending snapshot. Retry does not invalidate successful versioned resources or loop indefinitely.
A later subscription can retry a failed resource; changing artifactVersion creates a fresh cache key.

Optional module imports evict failed promises and handle hook rejection. Their fallback remains in
place. Re-enabling or remounting retries; deployment-invalidated chunks may still require a reload.

## Integration boundary

The host owns selection and transport. The Showcase prepares CSS, manifest, global metadata and the currently mounted components and Brand Packs
before publishing a requested selection, retains the previous valid selection on failure, and offers
retry. This is local host integration, not a reusable framework adapter. That proposed adapter and
broader runtime measurement remain future work in Linear.

SSR Brand Pack hosts must include the matching verified stylesheet with preloaded metadata. Valid
SSR content is immediately available under that contract. The CSR stylesheet loader keys readiness
by URL and expected hash and does not accept a loaded link with incompatible integrity.

The Showcase uses component subpaths for runtime values and true `import type` declarations for
root types. Mixed type-only specifiers must not leave a root side-effect import under verbatim module
syntax. The consumer bundle check verifies that the resources entrypoint emits no component CSS.
