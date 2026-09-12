[![npm version](https://img.shields.io/npm/v/@itrocks/session?logo=npm)](https://www.npmjs.org/package/@itrocks/session)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/session)](https://www.npmjs.org/package/@itrocks/session)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/session?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/session)
[![issues](https://img.shields.io/github/issues/itrocks-ts/session)](https://github.com/itrocks-ts/session/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# session

Lists and revokes server-side sessions through a transport-neutral store contract.

The package does not create cookies or choose a persistence adapter. It operates on the
session store supplied by the application or its framework.

## Requirements

- Node.js 24 or newer.
- A store implementing the [`SessionStore`](#sessionstore) contract.

## Installation

```bash
npm i @itrocks/session
```

## Usage

```ts
import { listSessions }     from '@itrocks/session'
import { revokeSessions }   from '@itrocks/session'
import { sessionDependsOn } from '@itrocks/session'

sessionDependsOn({ store })

const accountSessions = await listSessions(session => session.data.accountId === account.id)
await revokeSessions(session => session.data.accountId === account.id, currentSessionId)
```

`listSessions` returns matching sessions newest first. `revokeSessions` waits until every
matching session has been removed and can preserve one session identifier.

## API

### `SessionStore`

```ts
interface SessionStore {
	list(): Promise<StoredSession[]>
	revoke(sessionId: string): Promise<void>
}
```

Defines the minimal persistence contract required to inspect and revoke sessions.

### `StoredSession`

```ts
type StoredSession = Readonly<{
	data:      Record<string, unknown>
	id:        string
	updatedAt: Date
}>
```

Represents one stored session. `updatedAt` is persistence metadata used for deterministic
newest-first ordering.

### `listSessions`

```ts
listSessions(predicate?: SessionPredicate): Promise<StoredSession[]>
```

Returns sessions accepted by the synchronous or asynchronous predicate, ordered by
`updatedAt` descending and then by identifier. Omitting the predicate lists every session.

### `revokeSessions`

```ts
revokeSessions(predicate: SessionPredicate, exceptSessionId?: string): Promise<string[]>
```

Revokes every matching session except the optional retained identifier. It returns the
identifiers only after all removals succeed and propagates store errors.

## Dependencies

See [dependency configuration](docs/dependencies.md) for store binding and framework
integration.
