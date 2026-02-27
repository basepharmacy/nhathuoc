import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import {
  getInventoryBatchesQueryOptions,
  getProductsQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { purchaseOrdersRepo } from '@/client'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { type OrderItem, type PaymentStatus, getDefaultUnit } from './data/types'
import { PurchaseOrdersItems } from './components/purchase-orders-items'
import { PurchaseOrdersMeta } from './components/purchase-orders-meta'
import { PurchaseOrdersSearch } from './components/purchase-orders-search'
import { PurchaseOrdersSummary } from './components/purchase-orders-summary'

export function PurchaseOrders() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const locationId = user?.location?.id ?? null

  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<OrderItem[]>([])
  const [supplierId, setSupplierId] = useState('')
  const [orderDiscount, setOrderDiscount] = useState(0)
  const [paidAmount, setPaidAmount] = useState(0)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('1_UNPAID')
  const [notes, setNotes] = useState('')

  const orderCode = useMemo(() => {
    const now = new Date()
    const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}`
    const random = Math.floor(100 + Math.random() * 900)
    return `PN-${stamp}-${random}`
  }, [])

  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: suppliers = [] } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const productIds = useMemo(
    () => Array.from(new Set(items.map((item) => item.product.id))).sort(),
    [items]
  )

  const { data: inventoryBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productIds, locationId),
    enabled: !!tenantId && productIds.length > 0,
  })

  const batchesByProductId = useMemo(() => {
    return inventoryBatches.reduce<Record<string, InventoryBatch[]>>((acc, batch) => {
      if (!acc[batch.product_id]) {
        acc[batch.product_id] = []
      }
      acc[batch.product_id].push(batch)
      return acc
    }, {})
  }, [inventoryBatches])

  const productsFiltered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []
    return products
      .filter((product) => product.product_name.toLowerCase().includes(term))
      .slice(0, 6)
  }, [products, searchTerm])

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice - item.discount,
      0
    )
    const total = Math.max(0, subtotal - orderDiscount)
    const debt = Math.max(0, total - paidAmount)
    return { subtotal, total, debt }
  }, [items, orderDiscount, paidAmount])

  const createMutation = useMutation({
    mutationFn: async (status: '1_DRAFT' | '2_ORDERED') => {
      if (!tenantId || !userId) {
        throw new Error('Thiếu thông tin người dùng.')
      }
      if (!supplierId) {
        throw new Error('Vui lòng chọn nhà cung cấp.')
      }
      if (items.length === 0) {
        throw new Error('Vui lòng thêm ít nhất 1 sản phẩm.')
      }

      const normalizedPaid = Math.min(paidAmount, totals.total)
      const normalizedStatus: PaymentStatus =
        normalizedPaid <= 0
          ? '1_UNPAID'
          : normalizedPaid >= totals.total
            ? '3_PAID'
            : '2_PARTIALLY_PAID'

      await purchaseOrdersRepo.createPurchaseOrderWithItems({
        order: {
          purchase_order_code: orderCode,
          supplier_id: supplierId,
          tenant_id: tenantId,
          user_id: userId,
          location_id: locationId,
          issued_at: new Date().toISOString(),
          status,
          payment_status: normalizedStatus,
          paid_amount: normalizedPaid,
          discount: orderDiscount,
          total_amount: totals.total,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
        items: items.map((item) => ({
          tenant_id: tenantId,
          product_id: item.product.id,
          product_unit_id: item.productUnitId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount: item.discount,
          batch_code: item.batchCode || undefined,
          expiry_date: item.expiryDate || undefined,
        })),
      })
    },
    onSuccess: () => {
      toast.success('Đã tạo đơn nhập hàng.')
      setItems([])
      setSupplierId('')
      setOrderDiscount(0)
      setPaidAmount(0)
      setPaymentStatus('1_UNPAID')
      setNotes('')
      setSearchTerm('')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const addProduct = (product: ProductWithUnits) => {
    const defaultUnit = getDefaultUnit(product)
    const unitPrice = defaultUnit?.cost_price ?? 0

    setItems((prev) => [
      ...prev,
      {
        id: `${product.id}-${Date.now()}`,
        product,
        productUnitId: defaultUnit?.id ?? null,
        quantity: 1,
        unitPrice,
        discount: 0,
        batchCode: '',
        expiryDate: '',
      },
    ])
    setSearchTerm('')
  }

  const updateItem = (itemId: string, next: Partial<OrderItem>) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...next } : item)))
  }

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handlePaymentStatusChange = (value: PaymentStatus) => {
    setPaymentStatus(value)
    if (value === '1_UNPAID') {
      setPaidAmount(0)
    }
    if (value === '3_PAID') {
      setPaidAmount(totals.total)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center gap-4'>
          <PurchaseOrdersSearch
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            productsFiltered={productsFiltered}
            onAddProduct={addProduct}
          />
          <div className='ms-auto flex items-center space-x-4'>
            <ThemeSwitch />
            <ConfigDrawer />
            <ProfileDropdown />
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='grid min-h-[calc(100svh-200px)] gap-4 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <div className='flex flex-col gap-4'>
            <PurchaseOrdersMeta
              userName={user?.profile?.name ?? 'Nhân viên'}
              orderCode={orderCode}
            />

            <PurchaseOrdersItems
              items={items}
              onUpdateItem={updateItem}
              onRemoveItem={removeItem}
              batchesByProductId={batchesByProductId}
            />
          </div>

          <PurchaseOrdersSummary
            suppliers={suppliers}
            supplierId={supplierId}
            onSupplierChange={setSupplierId}
            totals={totals}
            orderDiscount={orderDiscount}
            onOrderDiscountChange={setOrderDiscount}
            paymentStatus={paymentStatus}
            onPaymentStatusChange={handlePaymentStatusChange}
            paidAmount={paidAmount}
            onPaidAmountChange={setPaidAmount}
            notes={notes}
            onNotesChange={setNotes}
            onSaveDraft={() => createMutation.mutate('1_DRAFT')}
            onSubmit={() => createMutation.mutate('2_ORDERED')}
            isSubmitting={createMutation.isPending}
          />
        </div>
      </Main>
    </>
  )
}
