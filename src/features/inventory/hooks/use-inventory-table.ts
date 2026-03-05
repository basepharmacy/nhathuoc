import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { type InventoryBatchesListQueryInput } from '@/services/supabase/database/repo/inventoryBatchesRepo'

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

  const listQueryParams: InventoryBatchesListQueryInput = useMemo(() => ({
    tenantId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: searchValue,
    locationIds,
  }), [tenantId, pagination, searchValue, locationIds])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [columnFilters])

  useEffect(() => {
    if (!defaultLocationId) return
    if (locations.length > 0 && !locations.some((location) => location.id === defaultLocationId)) {
      return
    }

    const hasLocationFilter = columnFilters.some(
      (filter) => filter.id === 'location_id'
    )
    if (hasLocationFilter) return

    setColumnFilters((prev) => [
      ...prev,
      { id: 'location_id', value: [defaultLocationId] },
    ])
  }, [columnFilters, defaultLocationId, locations])

  // Filter options
  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations]
  )

  const filters = useMemo(
    () => [
      {
        columnId: 'location_id',
        title: 'Cửa hàng',
        options: locationOptions,
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
