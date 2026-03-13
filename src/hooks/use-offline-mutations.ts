import { useCallback, useEffect, useState } from 'react'
import { getOfflineMutations, type OfflineMutation } from '@/services/offline/mutation-queue'

/**
 * Hook to read offline mutations from IndexedDB.
 * Polls periodically to stay in sync when mutations are added/removed.
 */
export function useOfflineMutations() {
  const [mutations, setMutations] = useState<OfflineMutation[]>([])

  const refresh = useCallback(async () => {
    const queue = await getOfflineMutations()
    setMutations(queue)
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [refresh])

  return { mutations, refresh }
}
