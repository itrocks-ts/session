# Session dependency configuration

`@itrocks/session` delegates persistence to one `SessionStore`.

## Default

Without configuration, the package uses an empty in-memory store. Listing or revoking
sessions then returns an empty result and performs no external operation.

## Framework-agnostic configuration

Supply the store before the first session operation:

```ts
import { sessionDependsOn } from '@itrocks/session'

sessionDependsOn({ store })
```

The store must implement `list()` and `revoke(sessionId)`.

## it.rocks framework configuration

`@itrocks/framework` supplies the configured server-side store. Its default
`@itrocks/fastify-file-session-store` adapter implements both operations.
