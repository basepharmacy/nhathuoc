import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { type InventoryBatchesListQueryInput, type InventoryBatchStockStatus } from '@/services/supabase/database/repo/inventoryBatchesRepo'

type Location = { id: string; name: string }

export type UseInventoryTableInput = {
  tenantId: string
  locations: Location[]
  defaultLocationId?: string | null
}

export function useInventoryTable({
  tenantId,
  locations,
  defaultLocationId,
}: UseInventoryTableInput) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ['search']: false,
    ['location_id']: false,
    ['stock_status']: false,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  // Extract filter values from columnFilters for server-side query
  const searchValue = useMemo(() => {
    const searchFilter = columnFilters.find(
      (filter) => filter.id === 'search'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [columnFilters])

  const locationIds = useMemo(() => {
    const locationFilter = columnFilters.find(
      (filter) => filter.id === 'location_id'
    )
    return Array.isArray(locationFilter?.value)
      ? (locationFilter?.value as string[])
      : []
  }, [columnFilters])

  const stockStatus = useMemo(() => {
    const stockFilter = columnFilters.find(
      (filter) => filter.id === 'stock_status'
    )
    if (Array.isArray(stockFilter?.value) && stockFilter.value.length === 1) {
      return stockFilter.value[0] as InventoryBatchStockStatus
    }
    return undefined
  }, [columnFilters])

  const listQueryParams: InventoryBatchesListQueryInput = useMemo(() => ({
    tenantId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: searchValue,
    locationIds,
    stockStatus,
  }), [tenantId, pagination, searchValue, locationIds, stockStatus])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [columnFilters])

  useEffect(() => {
    if (!defaultLocationId) {
      setColumnFilters((prev) => {
        if (!prev.some((f) => f.id === 'location_id')) return prev
        return prev.filter((filter) => filter.id !== 'location_id')
      })
      return
    }
    if (locations.length > 0 && !locations.some((location) => location.id === defaultLocationId)) {
      return
    }

    setColumnFilters((prev) => {
      const current = prev.find((f) => f.id === 'location_id')
      if (
        current &&
        Array.isArray(current.value) &&
        current.value.length === 1 &&
        current.value[0] === defaultLocationId
      ) {
        return prev
      }
      const withoutLocation = prev.filter((filter) => filter.id !== 'location_id')
      return [...withoutLocation, { id: 'location_id', value: [defaultLocationId] }]
    })
  }, [defaultLocationId, locations])

  // Filter options
  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations]
  )

  const stockStatusOptions = [
    { label: 'Còn tồn kho', value: 'in_stock' },
    { label: 'Hết tồn kho', value: 'out_of_stock' },
  ]

  const filters = useMemo(
    () => [
      {
        columnId: 'location_id',
        title: 'Cửa hàng',
        options: locationOptions,
      },
      {
        columnId: 'stock_status',
        title: 'Trạng thái tồn kho',
        options: stockStatusOptions,
      },
    ],
    [locationOptions]
  )

  const tableState = {
    pagination,
    columnFilters,
    columnVisibility,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  }

  return { tableState, filters, listQueryParams }
}
