import { useCallback, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getCustomersQueryOptions,
  getBankAccountsQueryOptions,
  getLocationsQueryOptions,
  getProductsQueryOptions,
  getSaleOrderDetailQueryOptions,
  getAllAvailableInventoryBatchesQueryOptions,
} from '@/client/queries'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { SaleOrderTabContent } from './components/sale-order-tab-content'
import { type Tab } from './components/sale-order-tab-controls'
import { toast } from 'sonner'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { createNewSaleOrder } from './data/types'
import { mapOrderToSaleOrderInCreate } from './data/sale-order-helper'

const route = getRouteApi('/_authenticated/sale-orders/')
const EMPTY_BATCHES: InventoryBatch[] = []

let tabCounter = 1

function createTab(): Tab {
  const id = `tab-${tabCounter++}`
  return { id, label: `Đơn ${tabCounter - 1}` }
}

export function SaleOrders() {
  const { orderId } = route.useSearch()
  const navigate = route.useNavigate()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const userId = user?.profile?.id ?? ''
  const { selectedLocationId: sidebarLocationId } = useLocationContext()

  // ── Tab state ───────────────────────────────────────────────
  const initialTabRef = useRef<Tab | null>(null)
  // Chuyển khởi tạo tab sau khi đã loading xong dữ liệu order nếu đang ở chế độ
  if (!initialTabRef.current) {
    initialTabRef.current = createTab()
  }
  const [tabs, setTabs] = useState<Tab[]>([initialTabRef.current])
  const [activeTabId, setActiveTabId] = useState(initialTabRef.current.id)

  const MAX_TABS = 4

  const addTab = useCallback(() => {
    if (tabs.length >= MAX_TABS) {
      toast.error(`Chỉ được mở tối đa ${MAX_TABS} đơn hàng cùng lúc`)
      return
    }
    const newTab = createTab()
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [tabs])
  const updateTabLabel = useCallback((tabId: string, label: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, label } : t))
    )
  }, [])

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev
        const idx = prev.findIndex((t) => t.id === tabId)
        const next = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          const newIdx = Math.min(idx, next.length - 1)
          setActiveTabId(next[newIdx].id)
        }
        return next
      })
    },
    [activeTabId]
  )

  const handleOrderSaved = useCallback(
    (tabId: string, savedOrderId: string, status: string) => {
      if (tabs.length <= 1) {
        if (status === '2_COMPLETE') {
          navigate({
            to: '/sale-orders/detail',
            search: { orderId: savedOrderId },
          })
        } else {
          // DRAFT: close current tab and create a new one
          const newTab = createTab()
          setTabs([newTab])
          setActiveTabId(newTab.id)
          navigate({ search: {} })
        }
        return
      }
      setTabs((prev) => {
        const idx = prev.findIndex((t) => t.id === tabId)
        const next = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          const newIdx = Math.min(idx, next.length - 1)
          setActiveTabId(next[newIdx].id)
        }
        return next
      })
    },
    [activeTabId, tabs.length, navigate]
  )

  // ── Shared queries (tenant-level) ──────────────────────────
  const {
    data: products = [],
    isLoading: isProductsLoading,
    isError: isProductsError
  } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const activeProducts = products.filter((p) => p.status === '2_ACTIVE')

  const {
    data: customers = [],
    isLoading: isCustomersLoading,
    isError: isCustomersError
  } = useQuery({
    ...getCustomersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const {
    data: bankAccounts = []
  } = useQuery({
    ...getBankAccountsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const {
    data: locations = [],
    isLoading: isLocationsLoading,
    isError: isLocationsError
  } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const {
    data: orderWithItems,
    isLoading: isOrderDetailLoading,
    isError: isOrderDetailError
  } = useQuery({
    ...getSaleOrderDetailQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const {
    data: inventoryBatches = EMPTY_BATCHES,
    isLoading: isInventoryBatchesLoading,
    isError: isInventoryBatchesError
  } = useQuery({
    ...getAllAvailableInventoryBatchesQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const isLoading = isProductsLoading || isCustomersLoading || isLocationsLoading || isOrderDetailLoading || isInventoryBatchesLoading
  const isError = isProductsError || isCustomersError || isLocationsError || isOrderDetailError || isInventoryBatchesError

  // TODO: xử lý lỗi cho trường hợp không get được bank accounts
  // Có thể vẫn cho phép tạo đơn hàng nhưng sẽ không hiển thị được phần chọn tài khoản ngân hàng

  // ── Build SaleOrderInCreate for edit mode ─────────────────
  const editOrderData = useMemo(() => {
    if (!orderId || !orderWithItems) return undefined
    return mapOrderToSaleOrderInCreate(orderWithItems, products, inventoryBatches, sidebarLocationId)
  }, [orderId, orderWithItems, products, inventoryBatches, sidebarLocationId])

  if (isError) {
    return (
      <div className='flex items-center justify-center py-10 text-muted-foreground'>
        Đã có lỗi xảy ra. Vui lòng thử lại.
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-10 text-muted-foreground'>
        Đang tải...
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <Tabs value={activeTabId} onValueChange={setActiveTabId} className='flex flex-1 flex-col'>
      {tabs.map((tab) => {
        const isFirstTab = tab === tabs[0]
        const initialData = isFirstTab && editOrderData
          ? editOrderData
          : createNewSaleOrder(sidebarLocationId ?? locations[0]?.id ?? '')
        const tabKey = isFirstTab && orderId ? `${tab.id}-edit-${orderId}` : tab.id

        return (
          <TabsContent
            key={tabKey}
            value={tab.id}
            className='flex flex-1 flex-col data-[state=inactive]:hidden'
            forceMount
          >
            <SaleOrderTabContent
              initialData={initialData}
              tenantId={tenantId}
              userId={userId}
              products={activeProducts}
              customers={customers}
              bankAccounts={bankAccounts}
              locations={locations}
              inventoryBatches={inventoryBatches}
              onOrderCompleted={(orderId, status) => handleOrderSaved(tab.id, orderId, status)}
              onAddTab={addTab}
              onCloseTab={() => closeTab(tab.id)}
              onCloseTabById={closeTab}
              tabCount={tabs.length}
              isActive={tab.id === activeTabId}
              tabs={tabs}
              onOrderCodeChange={(code) => updateTabLabel(tab.id, code)}
            />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
