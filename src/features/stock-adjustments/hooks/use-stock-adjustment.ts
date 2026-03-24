import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { stockAdjustmentsRepo } from '@/client'
import { mapSupabaseError } from '@/lib/error-mapper'
import { type ProductWithUnits } from '@/services/supabase'
import { type AdjustmentItem, getDefaultUnit } from '../data/types'

type UseStockAdjustmentParams = {
  tenantId: string
  userLocationId: string | null
}

export function useStockAdjustment({
  tenantId,
  userLocationId,
}: UseStockAdjustmentParams) {
  const queryClient = useQueryClient()

  // ── Form state ──────────────────────────────────────────────
  const [items, setItems] = useState<AdjustmentItem[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(userLocationId)

  // ── Validation ──────────────────────────────────────────────
  const validateAdjustment = () => {
    if (!tenantId) throw new Error('Thiếu thông tin người dùng.')
    if (!selectedLocationId) throw new Error('Vui lòng chọn cửa hàng.')
    if (items.length === 0) throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')

    const itemsWithoutBatch = items.filter((item) => !item.batchCode.trim())
    if (itemsWithoutBatch.length > 0) {
      throw new Error('Tất cả sản phẩm phải được nhập lô hàng.')
    }

    const zeroQtyItems = items.filter((item) => item.quantity === 0)
    if (zeroQtyItems.length > 0) {
      throw new Error('Số lượng không được bằng 0.')
    }
  }

  // ── Mutation ────────────────────────────────────────────────
  const handleMutationError = (error: unknown) => {
    toast.error(mapSupabaseError(error))
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      validateAdjustment()

      await stockAdjustmentsRepo.createBatchStockAdjustments(
        items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          location_id: selectedLocationId!,
          batch_code: item.batchCode.trim(),
          quantity: item.quantity,
          cost_price: item.costPrice,
          reason_code: item.reasonCode,
          reason: item.reason.trim().length > 0 ? item.reason.trim() : null,
          expiry_date: item.expiryDate ? item.expiryDate.trim() : null,
        }))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId, 'all', 'all-available'] })
      toast.success('Đã tạo điều chỉnh tồn kho.')
      // Reset form
      setItems([])
    },
    onError: handleMutationError,
  })

  // ── Item actions ────────────────────────────────────────────
  const addProduct = (product: ProductWithUnits): string => {
    if (!selectedLocationId) {
      toast.error('Bạn cần phải chọn cửa hàng.')
      return ''
    }

    // Check if product already exists
    const productExists = items.some((item) => item.product.id === product.id)
    if (productExists) {
      toast.error('Sản phẩm này đã có trong danh sách.')
      return ''
    }

    const defaultUnit = getDefaultUnit(product)
    const costPrice = defaultUnit?.cost_price ?? 0
    const newId = `${product.id}-${Date.now()}`

    setItems((prev) => [
      ...prev,
      {
        id: newId,
        product,
        productUnitId: defaultUnit?.id ?? null,
        quantity: 1,
        costPrice,
        batchId: null,
        batchCode: '',
        expiryDate: '',
        reasonCode: '1_FIRST_STOCK',
        reason: '',
      },
    ])
    return newId
  }

  const updateItem = (itemId: string, next: Partial<AdjustmentItem>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const resetItems = useCallback(() => {
    setItems([])
  }, [])

  // ── Derived ─────────────────────────────────────────────────
  const isSubmitting = createMutation.isPending

  const submit = () => createMutation.mutate()

  const totals = useMemo(() => {
    const total = items.reduce((sum, item) => sum + Math.abs(item.quantity) * item.costPrice, 0)
    return { total }
  }, [items])

  return {
    // Data
    items,
    totals,
    isSubmitting,

    // Form state + setters
    selectedLocationId,
    setSelectedLocationId,

    // Actions
    addProduct,
    updateItem,
    removeItem,
    resetItems,
    submit,
  }
}
