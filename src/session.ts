
type Dependencies = {
	store: SessionStore
}

export type SessionData = Record<string, unknown>

export type SessionPredicate = (session: StoredSession) => boolean | Promise<boolean>

export interface SessionStore
{
	list(): Promise<StoredSession[]>
	revoke(sessionId: string): Promise<void>
}

export type StoredSession = Readonly<{
	data:      SessionData
	id:        string
	updatedAt: Date
}>

const depends: Dependencies = {
	store: {
		list:   async () => [],
		revoke: async () => undefined
	}
}

export async function listSessions(predicate: SessionPredicate = () => true): Promise<StoredSession[]>
{
	const sessions = await depends.store.list()
	return Promise.all(sessions.map(predicate)).then(matches => sessions
		.filter((_session, index) => matches[index])
		.sort((first, second) => (
			second.updatedAt.getTime() - first.updatedAt.getTime()
			|| first.id.localeCompare(second.id)
		)))
}

export async function revokeSessions(predicate: SessionPredicate, exceptSessionId = ''): Promise<string[]>
{
	const sessions = (await listSessions(predicate)).filter(session => session.id !== exceptSessionId)
	await Promise.all(sessions.map(session => depends.store.revoke(session.id)))
	return sessions.map(session => session.id)
}

export function sessionDependsOn(dependencies: Partial<Dependencies>)
{
	Object.assign(depends, dependencies)
}
