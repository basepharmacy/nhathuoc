import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import {
  getInventoryBatchesListQueryOptions,
  getInventoryBatchesSummaryQueryOptions,
  getLocationsQueryOptions,
} from '@/client/queries'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  INVENTORY_LOCATION_COLUMN_ID,
  INVENTORY_SEARCH_COLUMN_ID,
  InventoryTable,
  formatDateLabel,
  formatDateTimeLabel,
  formatQuantity,
  type InventoryProductRow,
} from './components/inventory-tables'
import { type InventoryBatchWithRelations } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { InventorySummaryCards } from './components/inventory-summary-cards'

type InventoryViewMode = 'product' | 'batch'

const buildProductRows = (
  batches: InventoryBatchWithRelations[]
): InventoryProductRow[] => {
  const grouped = new Map<
    string,
    {
      row: InventoryProductRow
      locations: Set<string>
    }
  >()

  batches.forEach((batch) => {
    const productId = batch.product_id
    const productName = batch.products?.product_name ?? 'Không rõ'
    const quantity = batch.quantity ?? 0
    const locationName = batch.locations?.name ?? ''
    const expiryDate = batch.expiry_date

    const existing = grouped.get(productId)
    if (!existing) {
      const locations = new Set<string>()
      if (locationName) {
        locations.add(locationName)
      }
      grouped.set(productId, {
        row: {
          productId,
          productName,
          totalQuantity: quantity,
          batchCount: 1,
          locations: [],
          earliestExpiry: expiryDate ?? null,
        },
        locations,
      })
      return
    }

    existing.row.totalQuantity += quantity
    existing.row.batchCount += 1
    if (locationName) {
      existing.locations.add(locationName)
    }

    if (expiryDate) {
      const current = existing.row.earliestExpiry
      if (!current || new Date(expiryDate) < new Date(current)) {
        existing.row.earliestExpiry = expiryDate
      }
    }
  })

  return Array.from(grouped.values()).map(({ row, locations }) => ({
    ...row,
    locations: Array.from(locations),
  }))
}

export function Inventory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const [viewMode, setViewMode] = useState<InventoryViewMode>('product')
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    [INVENTORY_SEARCH_COLUMN_ID]: false,
    [INVENTORY_LOCATION_COLUMN_ID]: false,
  })
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const searchValue = useMemo(() => {
    const searchFilter = columnFilters.find(
      (filter) => filter.id === INVENTORY_SEARCH_COLUMN_ID
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [columnFilters])

  const locationIds = useMemo(() => {
    const locationFilter = columnFilters.find(
      (filter) => filter.id === INVENTORY_LOCATION_COLUMN_ID
    )
    return Array.isArray(locationFilter?.value)
      ? (locationFilter?.value as string[])
      : []
  }, [columnFilters])

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: listResult, isLoading } = useQuery({
    ...getInventoryBatchesListQueryOptions({
      tenantId,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: searchValue,
      locationIds,
    }),
    enabled: !!tenantId,
  })

  const { data: summaryResult } = useQuery({
    ...getInventoryBatchesSummaryQueryOptions({
      tenantId,
      search: searchValue,
      locationIds,
    }),
    enabled: !!tenantId,
  })

  const batches = listResult?.data ?? []
  const total = listResult?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))
  const summary = summaryResult ?? {
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
  }

  const productRows = useMemo(() => buildProductRows(batches), [batches])

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
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
        columnId: INVENTORY_LOCATION_COLUMN_ID,
        title: 'Kho',
        options: locationOptions,
      },
    ],
    [locationOptions]
  )

  const productColumns = useMemo<ColumnDef<InventoryProductRow>[]>(
    () => [
      {
        id: INVENTORY_SEARCH_COLUMN_ID,
        accessorFn: (row) => row.productName,
        header: () => null,
        cell: () => null,
        enableHiding: true,
      },
      {
        id: INVENTORY_LOCATION_COLUMN_ID,
        accessorFn: () => '',
        header: () => null,
        cell: () => null,
        enableHiding: true,
      },
      {
        accessorKey: 'productName',
        header: 'Sản phẩm',
        cell: ({ row }) => (
          <span className='font-medium'>{row.original.productName}</span>
        ),
      },
      {
        accessorKey: 'totalQuantity',
        header: 'Tồn kho',
        cell: ({ row }) => formatQuantity(row.original.totalQuantity),
        meta: { className: 'text-end', thClassName: 'text-end' },
      },
      {
        accessorKey: 'batchCount',
        header: 'Số lô',
        cell: ({ row }) => row.original.batchCount,
        meta: { className: 'text-end', thClassName: 'text-end' },
      },
      {
        accessorKey: 'locations',
        header: 'Kho',
        cell: ({ row }) => row.original.locations.join(', ') || '-',
      },
      {
        accessorKey: 'earliestExpiry',
        header: 'HSD gần nhất',
        cell: ({ row }) => formatDateLabel(row.original.earliestExpiry),
      },
    ],
    []
  )

  const batchColumns = useMemo<ColumnDef<InventoryBatchWithRelations>[]>(
    () => [
      {
        id: INVENTORY_SEARCH_COLUMN_ID,
        accessorFn: (row) => `${row.batch_code} ${row.products?.product_name ?? ''}`,
        header: () => null,
        cell: () => null,
        enableHiding: true,
      },
      {
        id: INVENTORY_LOCATION_COLUMN_ID,
        accessorFn: (row) => row.location_id ?? '',
        header: () => null,
        cell: () => null,
        enableHiding: true,
      },
      {
        id: 'product_name',
        header: 'Sản phẩm',
        cell: ({ row }) => (
          <span className='font-medium'>
            {row.original.products?.product_name ?? 'Không rõ'}
          </span>
        ),
      },
      {
        accessorKey: 'batch_code',
        header: 'Lô',
      },
      {
        accessorKey: 'expiry_date',
        header: 'HSD',
        cell: ({ row }) => formatDateLabel(row.original.expiry_date),
      },
      {
        accessorKey: 'quantity',
        header: 'Tồn kho',
        cell: ({ row }) => formatQuantity(row.original.quantity),
        meta: { className: 'text-end', thClassName: 'text-end' },
      },
      {
        id: 'location_name',
        header: 'Kho',
        cell: ({ row }) => row.original.locations?.name ?? '-',
      },
      {
        accessorKey: 'updated_at',
        header: 'Cập nhật',
        cell: ({ row }) => formatDateTimeLabel(row.original.updated_at),
      },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const productTable = useReactTable({
    data: productRows,
    columns: productColumns,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    rowCount: total,
  })

  // eslint-disable-next-line react-hooks/incompatible-library
  const batchTable = useReactTable({
    data: batches,
    columns: batchColumns,
    state: {
      pagination,
      columnFilters,
      columnVisibility,
    },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    rowCount: total,
  })

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tồn kho</h2>
            <p className='text-muted-foreground'>Quản lý danh sách tồn kho.</p>
          </div>
        </div>

        <InventorySummaryCards summary={summary} />

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as InventoryViewMode)}>
          <div className='flex flex-wrap items-center gap-2'>
            <TabsList>
              <TabsTrigger value='product'>Theo sản phẩm</TabsTrigger>
              <TabsTrigger value='batch'>Theo lô</TabsTrigger>
            </TabsList>
          </div>

          {isLoading ? (
            <div className='flex items-center justify-center py-10 text-muted-foreground'>
              Đang tải...
            </div>
          ) : (
            <>
              <TabsContent value='product'>
                <InventoryTable
                  table={productTable}
                  isLoading={isLoading}
                  searchKey={INVENTORY_SEARCH_COLUMN_ID}
                  searchPlaceholder='Tìm sản phẩm hoặc mã lô...'
                  filters={filters}
                  emptyMessage='Chưa có dữ liệu tồn kho.'
                />
              </TabsContent>
              <TabsContent value='batch'>
                <InventoryTable
                  table={batchTable}
                  isLoading={isLoading}
                  searchKey={INVENTORY_SEARCH_COLUMN_ID}
                  searchPlaceholder='Tìm sản phẩm hoặc mã lô...'
                  filters={filters}
                  emptyMessage='Chưa có dữ liệu tồn kho.'
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Main>
    </>
  )
}
