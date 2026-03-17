import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { Save, ArrowLeft } from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getLocationsQueryOptions,
  getProductsQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { StockAdjustmentsAddSearch } from '../components/stock-adjustments-add-search'
import { StockAdjustmentsAddMeta } from '../components/stock-adjustments-add-meta'
import { StockAdjustmentsAddItems } from '../components/stock-adjustments-add-items'
import { useStockAdjustment } from '../hooks/use-stock-adjustment'

const routeApi = getRouteApi('/_authenticated/inventory/adjustments/new')

export function StockAdjustmentsAddNew() {
  const navigate = useNavigate()
  const { productId: initialProductId } = routeApi.useSearch()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId: sidebarLocationId } = useLocationContext()
  const userLocationId = sidebarLocationId ?? null

  // ── Queries ─────────────────────────────────────────────────
  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const adjustment = useStockAdjustment({
    tenantId,
    userLocationId,
  })

  // ── Effects ─────────────────────────────────────────────────
  useEffect(() => {
    if (adjustment.selectedLocationId || locations.length === 0) return
    adjustment.setSelectedLocationId(sidebarLocationId ?? locations[0].id)
  }, [adjustment.selectedLocationId, locations, sidebarLocationId, adjustment.setSelectedLocationId])

  const [pendingBatchItemId, setPendingBatchItemId] = useState<string | null>(null)
  const [autoAdded, setAutoAdded] = useState(false)

  // Auto-add product from URL search param
  useEffect(() => {
    if (!initialProductId || autoAdded) return
    if (!adjustment.selectedLocationId) return
    if (products.length === 0) return

    const product = products.find((p) => p.id === initialProductId)
    if (!product) return

    const newItemId = adjustment.addProduct(product)
    if (newItemId) setPendingBatchItemId(newItemId)
    setAutoAdded(true)
  }, [initialProductId, autoAdded, adjustment.selectedLocationId, products, adjustment.addProduct])

  const handleAddProduct = (product: Parameters<typeof adjustment.addProduct>[0]) => {
    const newItemId = adjustment.addProduct(product)
    if (newItemId) setPendingBatchItemId(newItemId)
  }

  // ── Location change confirmation ───────────────────────────
  const [locationConfirmOpen, setLocationConfirmOpen] = useState(false)
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null)

  const handleLocationChange = (nextLocationId: string) => {
    if (nextLocationId === (adjustment.selectedLocationId ?? '')) return
    if (adjustment.items.length === 0) {
      adjustment.setSelectedLocationId(nextLocationId)
      return
    }
    setPendingLocationId(nextLocationId)
    setLocationConfirmOpen(true)
  }

  const handleConfirmLocationChange = () => {
    if (!pendingLocationId) return
    adjustment.setSelectedLocationId(pendingLocationId)
    adjustment.resetItems()
    setPendingBatchItemId(null)
    setPendingLocationId(null)
    setLocationConfirmOpen(false)
  }

  const handleLocationDialogChange = (open: boolean) => {
    setLocationConfirmOpen(open)
    if (!open) {
      setPendingLocationId(null)
    }
  }

  const handleSave = () => {
    adjustment.submit()
  }

  const handleBack = () => {
    navigate({ to: '/inventory/adjustments' })
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='shrink-0 gap-2'
            onClick={handleBack}
          >
            <ArrowLeft className='size-4' />
            Quay lại
          </Button>
          <StockAdjustmentsAddSearch
            products={products}
            onAddProduct={handleAddProduct}
          />
          <Button
            type='button'
            variant='default'
            size='sm'
            className='ml-auto shrink-0 gap-2'
            onClick={handleSave}
            disabled={adjustment.isSubmitting || adjustment.items.length === 0}
          >
            <Save className='size-4' />
            Lưu điều chỉnh
          </Button>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-col gap-4'>
          <StockAdjustmentsAddMeta
            locations={locations}
            locationId={adjustment.selectedLocationId ?? ''}
            onLocationChange={handleLocationChange}
          />

          <StockAdjustmentsAddItems
            items={adjustment.items}
            onUpdateItem={adjustment.updateItem}
            onRemoveItem={adjustment.removeItem}
            tenantId={tenantId}
            locationId={adjustment.selectedLocationId}
            pendingBatchItemId={pendingBatchItemId}
            onPendingBatchHandled={() => setPendingBatchItemId(null)}
          />
        </div>
      </Main>

      <ConfirmDialog
        open={locationConfirmOpen}
        onOpenChange={handleLocationDialogChange}
        title='Đổi cửa hàng'
        desc='Đổi cửa hàng sẽ xóa toàn bộ sản phẩm đã thêm trong danh sách. Bạn có chắc chắn muốn tiếp tục?'
        cancelBtnText='Hủy'
        confirmText='Xác nhận'
        handleConfirm={handleConfirmLocationChange}
      />
    </>
  )
}
