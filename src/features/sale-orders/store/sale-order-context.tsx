import { createContext, useContext, useEffect, useRef } from 'react'
import { useStore } from 'zustand'
import {
  createSaleOrderStore,
  type SaleOrderStore,
  type CreateSaleOrderStoreParams,
} from './sale-order-store'

type StoreInstance = ReturnType<typeof createSaleOrderStore>

const SaleOrderStoreContext = createContext<StoreInstance | null>(null)

type SaleOrderStoreProviderProps = CreateSaleOrderStoreParams & {
  children: React.ReactNode
}

export function SaleOrderStoreProvider({
  initialData,
  inventoryBatches,
  children,
}: SaleOrderStoreProviderProps) {
  const storeRef = useRef<StoreInstance | null>(null)
  if (!storeRef.current) {
    storeRef.current = createSaleOrderStore({ initialData, inventoryBatches })
  }

  // Sync inventoryBatches when React Query refetches
  useEffect(() => {
    storeRef.current?.getState().syncInventoryBatches(inventoryBatches)
  }, [inventoryBatches])

  return (
    <SaleOrderStoreContext.Provider value={storeRef.current}>
      {children}
    </SaleOrderStoreContext.Provider>
  )
}

export function useSaleOrderStore<T>(selector: (state: SaleOrderStore) => T): T {
  const store = useContext(SaleOrderStoreContext)
  if (!store) throw new Error('useSaleOrderStore must be used within SaleOrderStoreProvider')
  return useStore(store, selector)
}

export function useSaleOrderStoreApi() {
  const store = useContext(SaleOrderStoreContext)
  if (!store) throw new Error('useSaleOrderStoreApi must be used within SaleOrderStoreProvider')
  return store
}
