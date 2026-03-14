import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { saleOrdersRepo } from '@/client'
import { getSaleOrdersHistoryQueryOptions } from '@/client/queries'
import { SaleOrdersHistoryTable } from '@/features/sale-orders-history/components/sale-orders-history-table.tsx'
import { type SaleOrderWithRelations } from '@/services/supabase/'
import { getCustomerOrdersHistoryColumns } from './customer-orders-history-columns'

type CustomerTabsProps = {
  tenantId: string
  customerId: string
}

export function CustomerTabs({ tenantId, customerId }: CustomerTabsProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [orderFilters, setOrderFilters] = useState<ColumnFiltersState>([])
  const [orderSorting, setOrderSorting] = useState<SortingState>([])
  const [orderPagination, setOrderPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteTarget, setDeleteTarget] = useState<SaleOrderWithRelations | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin đơn bán hàng.')
      }
      await saleOrdersRepo.deleteSaleOrder({
        orderId: deleteTarget.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-orders', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['sale-orders', tenantId, 'history'],
      })
      queryClient.invalidateQueries({
        queryKey: ['sale-orders', tenantId, 'customer', customerId],
      })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa đơn bán hàng.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleEdit = useCallback(
    (order: SaleOrderWithRelations) => {
      navigate({
        to: '/sale-orders',
        search: {
          orderCode: order.sale_order_code,
        },
      })
    },
    [navigate]
  )

  const handleDelete = useCallback((order: SaleOrderWithRelations) => {
    if (order.status !== '1_DRAFT') {
      toast.error('Chỉ có thể xóa đơn nháp.')
      return
    }
    setDeleteTarget(order)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () =>
      getCustomerOrdersHistoryColumns({
        onEdit: handleEdit,
        onDelete: handleDelete,
      }),
    [handleEdit, handleDelete]
  )

  const orderSearchValue = useMemo(() => {
    const searchFilter = orderFilters.find(
      (filter) => filter.id === 'sale_order_code'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [orderFilters])

  const statusFilters = useMemo(() => {
    const statusFilter = orderFilters.find((filter) => filter.id === 'status')
    return Array.isArray(statusFilter?.value)
      ? (statusFilter?.value as SaleOrderWithRelations['status'][])
      : []
  }, [orderFilters])

  const { data: ordersResult, isLoading } = useQuery({
    ...getSaleOrdersHistoryQueryOptions({
      tenantId,
      pageIndex: orderPagination.pageIndex,
      pageSize: orderPagination.pageSize,
      search: orderSearchValue,
      customerIds: customerId ? [customerId] : [],
      statuses: statusFilters,
      sorting: orderSorting,
    }),
    enabled: !!tenantId && !!customerId,
  })

  const orders = ordersResult?.data ?? []
  const total = ordersResult?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / orderPagination.pageSize))

  useEffect(() => {
    setOrderPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [orderFilters, orderSorting])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<SaleOrderWithRelations>({
    data: orders,
    columns,
    state: {
      pagination: orderPagination,
      columnFilters: orderFilters,
      sorting: orderSorting,
    },
    onPaginationChange: setOrderPagination,
    onColumnFiltersChange: setOrderFilters,
    onSortingChange: setOrderSorting,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    pageCount,
    rowCount: total,
  })

  const orderFiltersConfig = useMemo(
    () => [
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: [
          { label: 'Nháp', value: '1_DRAFT' },
          { label: 'Hoàn tất', value: '2_COMPLETE' },
          { label: 'Đã hủy', value: '9_CANCELLED' },
        ],
      },
    ],
    []
  )

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setDeleteOpen(open)
    if (!open) {
      setDeleteTarget(null)
    }
  }, [])

  const deleteState = useMemo(() => {
    if (!deleteTarget) return null
    return {
      target: deleteTarget,
      open: deleteOpen,
      onOpenChange: handleDeleteDialogOpenChange,
      disabled: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(),
    }
  }, [deleteTarget, deleteOpen, handleDeleteDialogOpenChange, deleteMutation])

  return (
    <Tabs defaultValue='orders' className='gap-4'>
      <TabsList>
        <TabsTrigger value='orders'>Lịch sử bán hàng</TabsTrigger>
      </TabsList>

      <TabsContent value='orders'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            <SaleOrdersHistoryTable
              table={table}
              isLoading={isLoading}
              searchKey='sale_order_code'
              filters={orderFiltersConfig}
              deleteState={deleteState}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
