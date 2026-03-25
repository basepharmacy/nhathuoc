import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { productsRepo, saleOrdersRepo } from '@/client'
import { type SaleOrder } from '@/services/supabase'
import { addOfflineMutation, isNetworkError } from '@/services/offline/mutation-queue'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { mapSupabaseError } from '@/lib/error-mapper'
import { useSaleOrderStoreApi } from '../store/sale-order-context'
import { selectTotal, selectIsEdit } from '../store/sale-order-selectors'

type UseSaleOrderMutationsParams = {
  tenantId: string
  userId: string
  customerName?: string
  locationName?: string
  onComplete?: (orderCode: string, status: SaleOrder['status']) => void
}

export function useSaleOrderMutations({
  tenantId,
  userId,
  customerName,
  locationName,
  onComplete,
}: UseSaleOrderMutationsParams) {
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()
  const store = useSaleOrderStoreApi()

  const buildOrderItems = () => {
    const { items } = store.getState()
    return items.map((item) => ({
      tenant_id: tenantId,
      product_id: item.product.id,
      product_unit_id: item.productUnitId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount: item.discount,
      batch_id: item.batchId ?? null,
      // Display-only fields for offline viewing
      _display: {
        productName: item.product.product_name,
        unitName: item.product.product_units?.find((u) => u.id === item.productUnitId)?.unit_name ?? '',
        batchCode: item.batchCode,
        expiryDate: item.expiryDate,
      },
    }))
  }

  const validateOrder = () => {
    const { selectedLocationId, items } = store.getState()
    if (!tenantId || !userId) throw new Error('Thiếu thông tin người dùng.')
    if (!selectedLocationId) throw new Error('Vui lòng chọn cửa hàng.')
    if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')
  }

  const handleMutationError = (error: unknown) => {
    toast.error(mapSupabaseError(error))
  }

  const updateSellPricesForNullItems = async (): Promise<boolean> => {
    const { items } = store.getState()
    const updates: Array<{ unitId: string; sellPrice: number }> = []

    for (const item of items) {
      if (!item.productUnitId || item.unitPrice <= 0) continue
      const units = item.product.product_units ?? []
      const orderedUnit = units.find((u) => u.id === item.productUnitId)
      if (!orderedUnit || orderedUnit.sell_price !== null) continue

      const orderedCF = orderedUnit.conversion_factor || 1
      for (const u of units) {
        if (u.sell_price === null) {
          const sellPrice = Math.round(item.unitPrice * (u.conversion_factor || 1) / orderedCF)
          updates.push({ unitId: u.id, sellPrice })
        }
      }
    }

    if (updates.length === 0) return false

    await Promise.all(
      updates.map((u) => productsRepo.updateProductUnitSellPrice(u.unitId, u.sellPrice))
    )
    return true
  }

  const createMutation = useMutation({
    mutationFn: async (status: SaleOrder['status']) => {
      validateOrder()
      const state = store.getState()
      const total = selectTotal(state)
      const saleCompletedTime = status === '2_COMPLETE'
        ? Math.round((Date.now() - state.startedAt) / 1000)
        : null
      const payload = {
        order: {
          sale_order_code: state.orderCode,
          customer_id: state.customerId || null,
          tenant_id: tenantId,
          user_id: userId,
          location_id: state.selectedLocationId,
          issued_at: new Date().toISOString(),
          status,
          payment_method: state.paymentMethod,
          customer_paid_amount: state.paymentMethod === '1_CASH' ? state.cashReceived : 0,
          discount: state.orderDiscount,
          total_amount: total,
          notes: state.notes.trim().length > 0 ? state.notes.trim() : null,
          sale_completed_time: saleCompletedTime,
        },
        items: buildOrderItems(),
        _display: {
          customerName: customerName ?? '',
          locationName: locationName ?? '',
        },
      }

      if (!isOnline) {
        await addOfflineMutation({ type: 'create-sale-order', payload })
        return { id: `offline-${Date.now()}`, _offline: true } as SaleOrder & { _offline?: boolean }
      }

      try {
        const order = await saleOrdersRepo.createSaleOrderWithItemsV2(payload)
        const didUpdateSellPrice = await updateSellPricesForNullItems()
        return Object.assign(order, { _didUpdateSellPrice: didUpdateSellPrice })
      } catch (error) {
        if (isNetworkError(error)) {
          await addOfflineMutation({ type: 'create-sale-order', payload })
          return { id: `offline-${Date.now()}`, _offline: true } as SaleOrder & { _offline?: boolean }
        }
        throw error
      }
    },
    onSuccess: (order, status) => {
      const isOfflineQueued = (order as SaleOrder & { _offline?: boolean })._offline
      if (isOfflineQueued) {
        toast.success('Đã lưu đơn hàng offline. Sẽ tự đồng bộ khi có mạng.')
        onComplete?.(order.sale_order_code ?? order.id, status)
        return
      }

      if ((order as any)._didUpdateSellPrice) {
        queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      }
      if (status === '2_COMPLETE') {
        queryClient.invalidateQueries({ queryKey: ['dashboard-report', 'sales-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-report', 'low-stock-products'] })
        queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId, 'all', 'all-available'] })
      }
      toast.success('Đã tạo đơn bán hàng.')
      onComplete?.(order.sale_order_code ?? '', status)
    },
    onError: handleMutationError,
  })

  const updateMutation = useMutation({
    mutationFn: async (status: SaleOrder['status']) => {
      const { initialData } = store.getState()
      if (!initialData.id) throw new Error('Không tìm thấy đơn bán hàng.')
      validateOrder()

      const state = store.getState()
      const total = selectTotal(state)
      const saleCompletedTime = status === '2_COMPLETE'
        ? Math.round((Date.now() - state.startedAt) / 1000)
        : null
      const createPayload = {
        order: {
          sale_order_code: state.orderCode,
          customer_id: state.customerId || null,
          tenant_id: tenantId,
          user_id: userId,
          location_id: state.selectedLocationId,
          issued_at: new Date().toISOString(),
          status,
          payment_method: state.paymentMethod,
          customer_paid_amount: state.paymentMethod === '1_CASH' ? state.cashReceived : 0,
          discount: state.orderDiscount,
          total_amount: total,
          notes: state.notes.trim().length > 0 ? state.notes.trim() : null,
          sale_completed_time: saleCompletedTime,
        },
        items: buildOrderItems(),
        _display: {
          customerName: customerName ?? '',
          locationName: locationName ?? '',
        },
      }
      const offlinePayload = { orderId: initialData.id, ...createPayload }

      if (!isOnline) {
        await addOfflineMutation({ type: 'update-sale-order', payload: offlinePayload, orderId: initialData.id })
        return { _offline: true } as { _offline: boolean }
      }

      try {
        await saleOrdersRepo.deleteSaleOrder({ orderId: initialData.id })
        const order = await saleOrdersRepo.createSaleOrderWithItemsV2({ ...createPayload, isOffline: false })
        const didUpdateSellPrice = await updateSellPricesForNullItems()
        return Object.assign(order, { _didUpdateSellPrice: didUpdateSellPrice })
      } catch (error) {
        if (isNetworkError(error)) {
          await addOfflineMutation({ type: 'update-sale-order', payload: offlinePayload, orderId: initialData.id })
          return { _offline: true } as { _offline: boolean }
        }
        throw error
      }
    },
    onSuccess: (result, status) => {
      const state = store.getState()
      const isOfflineQueued = result && typeof result === 'object' && '_offline' in result

      if (isOfflineQueued) {
        toast.success('Đã lưu cập nhật offline. Sẽ tự đồng bộ khi có mạng.')
        onComplete?.(state.orderCode ?? '', status)
        return
      }

      if ((result as any)?._didUpdateSellPrice) {
        queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      }

      if (state.orderCode) {
        queryClient.invalidateQueries({ queryKey: ['sale-orders', tenantId, 'detail', state.orderCode] })
      }

      if (status === '2_COMPLETE') {
        queryClient.invalidateQueries({ queryKey: ['dashboard-report', 'sales-statistics'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-report', 'low-stock-products'] })
        queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId, 'all', 'all-available'] })
      }

      toast.success('Đã cập nhật đơn bán hàng.')
      onComplete?.(state.orderCode ?? '', status)
    },
    onError: handleMutationError,
  })

  const isEdit = selectIsEdit(store.getState())
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const saveDraft = useCallback(() => {
    if (isEdit) updateMutation.mutate('1_DRAFT')
    else createMutation.mutate('1_DRAFT')
  }, [isEdit, updateMutation, createMutation])

  const submit = useCallback(() => {
    if (isEdit) updateMutation.mutate('2_COMPLETE')
    else createMutation.mutate('2_COMPLETE')
  }, [isEdit, updateMutation, createMutation])

  return { saveDraft, submit, isSubmitting }
}
