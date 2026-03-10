import { useCallback, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { Plus, X } from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getCustomersQueryOptions,
  getBankAccountsQueryOptions,
  getLocationsQueryOptions,
  getProductsQueryOptions,
} from '@/client/queries'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SaleOrderTabContent } from './components/sale-order-tab-content'

const route = getRouteApi('/_authenticated/sale-orders/')

type Tab = { id: string; label: string }

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
  const userLocationId = sidebarLocationId ?? null

  // ── Tab state ───────────────────────────────────────────────
  const initialTabRef = useRef<Tab | null>(null)
  if (!initialTabRef.current) {
    initialTabRef.current = createTab()
  }
  const [tabs, setTabs] = useState<Tab[]>([initialTabRef.current])
  const [activeTabId, setActiveTabId] = useState(initialTabRef.current.id)

  const addTab = useCallback(() => {
    const newTab = createTab()
    setTabs((prev) => [...prev, newTab])
    setActiveTabId(newTab.id)
  }, [])

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

  // ── Tab controls (shared across tabs) ──────────────────────
  const tabControls = (
    <div className='flex shrink-0 items-center gap-1'>
      <TabsList className='shrink-0'>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className='group relative gap-1 pr-6'
          >
            {tab.label}
            {tabs.length > 1 && (
              <button
                type='button'
                className='absolute right-1 top-1/2 -translate-y-1/2 rounded-sm p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 group-data-[state=active]:opacity-100'
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                aria-label={`Đóng ${tab.label}`}
              >
                <X className='size-3' />
              </button>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {!orderId && (
        <Button
          type='button'
          variant='ghost'
          size='icon'
          className='size-7 shrink-0'
          onClick={addTab}
          aria-label='Thêm đơn mới'
        >
          <Plus className='size-4' />
        </Button>
      )}
    </div>
  )

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
            userLocationId={userLocationId}
            products={activeProducts}
            customers={customers}
            bankAccounts={bankAccounts}
            locations={locations}
            navigate={navigate}
            onOrderCodeChange={(code) => updateTabLabel(tab.id, code)}
            onOrderCompleted={(createdOrderId) => handleOrderCompleted(tab.id, createdOrderId)}
            onAddTab={addTab}
            onCloseTab={() => closeTab(tab.id)}
            tabCount={tabs.length}
            isActive={tab.id === activeTabId}
            headerSlot={tabControls}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
