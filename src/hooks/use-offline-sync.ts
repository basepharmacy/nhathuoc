import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleOrdersRepo } from '@/client'
import {
  getOfflineMutations,
  removeOfflineMutation,
  type OfflineMutation,
} from '@/services/offline/mutation-queue'
import { useOnlineStatus } from './use-online-status'

async function replayMutation(mutation: OfflineMutation): Promise<void> {
  switch (mutation.type) {
    case 'create-sale-order': {
      const payload = mutation.payload as Parameters<
        typeof saleOrdersRepo.createSaleOrderWithItems
      >[0]
      await saleOrdersRepo.createSaleOrderWithItems(payload)
      break
    }
  }
}

export function useOfflineSync() {
  const { isOnline } = useOnlineStatus()
  const queryClient = useQueryClient()
  const isSyncingRef = useRef(false)

  useEffect(() => {
    if (!isOnline || isSyncingRef.current) return

    const sync = async () => {
      const queue = await getOfflineMutations()
      if (queue.length === 0) return

      isSyncingRef.current = true
      toast.info(`Đang đồng bộ ${queue.length} đơn hàng...`)

      let successCount = 0
      let failCount = 0

      for (const mutation of queue) {
        try {
          await replayMutation(mutation)
          await removeOfflineMutation(mutation.id)
          successCount++
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to sync offline mutation:', mutation.id, error)
          failCount++
          // Stop syncing on network error — we're probably still offline
          if (
            error instanceof TypeError &&
            error.message === 'Failed to fetch'
          ) {
            break
          }
          // For non-network errors (validation, conflict), remove from queue
          await removeOfflineMutation(mutation.id)
        }
      }

      if (successCount > 0) {
        toast.success(`Đã đồng bộ ${successCount} đơn hàng thành công.`)
        queryClient.invalidateQueries({ queryKey: ['sale-orders'] })
        queryClient.invalidateQueries({ queryKey: ['inventory-batches'] })
        queryClient.invalidateQueries({
          queryKey: ['dashboard-report'],
        })
      }

      if (failCount > 0) {
        toast.error(`${failCount} đơn hàng đồng bộ thất bại.`)
      }

      isSyncingRef.current = false
    }

    sync()
  }, [isOnline, queryClient])
}
