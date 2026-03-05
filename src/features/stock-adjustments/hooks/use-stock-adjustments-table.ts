import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
} from '@tanstack/react-table'
import { type StockAdjustmentsListQueryInput } from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import { ALL_REASON_CODE_OPTIONS } from '../data/reason-code'

type Location = { id: string; name: string }

export type UseStockAdjustmentsTableInput = {
  tenantId: string
  locations: Location[]
  selectedLocationId?: string | null
}

export function useStockAdjustmentsTable({
  tenantId,
  locations,
  selectedLocationId,
}: UseStockAdjustmentsTableInput) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    selectedLocationId
      ? [
        {
          id: 'location_id',
          value: [selectedLocationId],
        },
      ]
      : []
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ['search']: false,
    ['location_id']: false,
    ['adjustment_type']: false,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

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

  const reasonCodes = useMemo<NonNullable<StockAdjustmentsListQueryInput['reasonCodes']>>(() => {
    const reasonCodeFilter = columnFilters.find(
      (filter) => filter.id === 'reason_code'
    )
    return Array.isArray(reasonCodeFilter?.value)
      ? (reasonCodeFilter.value as NonNullable<StockAdjustmentsListQueryInput['reasonCodes']>)
      : []
  }, [columnFilters])

  const adjustmentTypes = useMemo<NonNullable<StockAdjustmentsListQueryInput['adjustmentTypes']>>(() => {
    const adjustmentTypeFilter = columnFilters.find(
      (filter) => filter.id === 'adjustment_type'
    )
    return Array.isArray(adjustmentTypeFilter?.value)
      ? (adjustmentTypeFilter.value as NonNullable<StockAdjustmentsListQueryInput['adjustmentTypes']>)
      : []
  }, [columnFilters])

  const listQueryParams: StockAdjustmentsListQueryInput = useMemo(() => ({
    tenantId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: searchValue,
    locationIds,
    reasonCodes,
    adjustmentTypes,
  }), [tenantId, pagination, searchValue, locationIds, reasonCodes, adjustmentTypes])

  useEffect(() => {
    if (!selectedLocationId) return
    setColumnFilters((prev) => {
      const hasLocationFilter = prev.some((filter) => filter.id === 'location_id')
      if (hasLocationFilter) return prev
      return [
        ...prev,
        {
          id: 'location_id',
          value: [selectedLocationId],
        },
      ]
    })
  }, [selectedLocationId])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [columnFilters])

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
      {
        columnId: 'reason_code',
        title: 'Lý do',
        options: ALL_REASON_CODE_OPTIONS,
      },
      {
        columnId: 'adjustment_type',
        title: 'Loại điều chỉnh',
        options: [
          { label: 'Điều chỉnh tăng', value: 'increase' },
          { label: 'Điều chỉnh giảm', value: 'decrease' },
        ],
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
