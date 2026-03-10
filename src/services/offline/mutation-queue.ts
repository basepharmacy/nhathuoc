import { get, set } from 'idb-keyval'

const IDB_KEY = 'basepharmacy-offline-mutations'

export type OfflineMutation = {
  id: string
  type: 'create-sale-order'
  payload: unknown
  createdAt: string
}

export async function getOfflineMutations(): Promise<OfflineMutation[]> {
  return (await get<OfflineMutation[]>(IDB_KEY)) ?? []
}

export async function addOfflineMutation(
  mutation: Omit<OfflineMutation, 'id' | 'createdAt'>
): Promise<void> {
  const queue = await getOfflineMutations()
  queue.push({
    ...mutation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  })
  await set(IDB_KEY, queue)
}

export async function removeOfflineMutation(id: string): Promise<void> {
  const queue = await getOfflineMutations()
  await set(
    IDB_KEY,
    queue.filter((m) => m.id !== id)
  )
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return true
  }
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof (error as { message: unknown }).message === 'string'
  ) {
    const msg = (error as { message: string }).message.toLowerCase()
    return (
      msg.includes('failed to fetch') ||
      msg.includes('network') ||
      msg.includes('err_internet_disconnected')
    )
  }
  return false
}
