const assert = require('node:assert/strict')

const test = require('node:test')

const { listSessions, revokeSessions, sessionDependsOn } = require('../cjs/session')

function storedSession(id, accountId, updatedAt)
{
	return { data: { accountId }, id, updatedAt: new Date(updatedAt) }
}

test('listSessions filters asynchronously and orders the newest sessions first', async () => {
	const sessions = [
		storedSession('older', 10, '2026-09-10T10:00:00Z'),
		storedSession('other', 20, '2026-09-12T10:00:00Z'),
		storedSession('newer', 10, '2026-09-11T10:00:00Z')
	]
	sessionDependsOn({ store: { list: async () => sessions, revoke: async () => undefined } })

	assert.deepEqual(
		(await listSessions(async session => session.data.accountId === 10)).map(session => session.id),
		['newer', 'older']
	)
})

test('revokeSessions awaits every matching revocation except the retained session', async () => {
	const revoked  = []
	const sessions = [
		storedSession('current', 10, '2026-09-12T10:00:00Z'),
		storedSession('second', 10, '2026-09-11T10:00:00Z'),
		storedSession('other', 20, '2026-09-10T10:00:00Z')
	]
	sessionDependsOn({
		store: {
			list:   async () => sessions,
			revoke: async sessionId => { revoked.push(sessionId) }
		}
	})

	assert.deepEqual(
		await revokeSessions(session => session.data.accountId === 10, 'current'),
		['second']
	)
	assert.deepEqual(revoked, ['second'])
})
