import { get, set, del } from 'idb-keyval'
import type { PersistedClient, Persister } from '@tanstack/react-query-persist-client'
import { OFFLINE_MUTATIONS_IDB_KEY } from './mutation-queue'

const IDB_KEY = 'basepharmacy-query-cache'

export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(IDB_KEY, client)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(IDB_KEY)
    },
    removeClient: async () => {
      await del(IDB_KEY)
    },
  }
}

export async function clearAllOfflineData(): Promise<void> {
  await Promise.all([
    del(IDB_KEY),
    del(OFFLINE_MUTATIONS_IDB_KEY),
  ])
}
