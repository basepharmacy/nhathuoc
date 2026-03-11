import { useCallback, useRef, useState } from 'react'
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
import { InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'

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

  const handleOrderCompleted = useCallback(
    (tabId: string, createdOrderId: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) {
          // Last tab → navigate to the created order
          navigate({ search: { orderId: createdOrderId } })
          return prev
        }
        // Multiple tabs → close the completed tab
        const idx = prev.findIndex((t) => t.id === tabId)
        const next = prev.filter((t) => t.id !== tabId)
        if (tabId === activeTabId) {
          const newIdx = Math.min(idx, next.length - 1)
          setActiveTabId(next[newIdx].id)
        }
        return next
      })
    },
    [activeTabId, navigate]
  )

  // ── Shared queries (tenant-level) ──────────────────────────
  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const activeProducts = products.filter((p) => p.status === '2_ACTIVE')

  const { data: customers = [] } = useQuery({
    ...getCustomersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: bankAccounts = [] } = useQuery({
    ...getBankAccountsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: orderDetail } = useQuery({
    ...getSaleOrderDetailQueryOptions(tenantId, orderId ?? ''),
    enabled: !!tenantId && !!orderId,
  })

  const { data: inventoryBatches = EMPTY_BATCHES } = useQuery({
    ...getAllAvailableInventoryBatchesQueryOptions(tenantId),
    enabled: !!tenantId,
  })



  // ── Render ──────────────────────────────────────────────────
  return (
    <Tabs value={activeTabId} onValueChange={setActiveTabId} className='flex flex-1 flex-col'>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className='flex flex-1 flex-col data-[state=inactive]:hidden'
          forceMount
        >
          <SaleOrderTabContent
            orderId={tab === tabs[0] ? orderId : undefined}
            tenantId={tenantId}
            userId={userId}
            userLocationId={sidebarLocationId}
            products={activeProducts}
            customers={customers}
            bankAccounts={bankAccounts}
            locations={locations}
            navigate={navigate}
            onOrderCodeChange={(code) => updateTabLabel(tab.id, code)}
            onOrderCompleted={(createdOrderId) => handleOrderCompleted(tab.id, createdOrderId)}
            onAddTab={addTab}
            onCloseTab={() => closeTab(tab.id)}
            onCloseTabById={closeTab}
            tabCount={tabs.length}
            isActive={tab.id === activeTabId}
            tabs={tabs}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
