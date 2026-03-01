import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import {
  getCustomerDetailQueryOptions,
  getSaleOrdersByCustomerIdQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { CustomersDialogs } from '@/features/customers/components/customers-dialogs'
import { CustomersProvider } from '@/features/customers/components/customers-provider'
import { CustomerHeader } from './components/customer-header'
import { CustomerInfoCard } from './components/customer-info-card'
import { CustomerSummaryCards } from './components/customer-summary-cards'
import { CustomerTabs } from './components/customer-tabs'
import { type CustomerSummary } from './data/schema'

const route = getRouteApi('/_authenticated/customers/$customerId')

export function CustomerDetail() {
  const { customerId } = route.useParams()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError: isCustomerError,
    error: customerError,
  } = useQuery({
    ...getCustomerDetailQueryOptions(tenantId, customerId),
    enabled: !!tenantId && !!customerId,
  })

  const {
    data: orders = [],
    isLoading: isOrdersLoading,
    isError: isOrdersError,
    error: ordersError,
  } = useQuery({
    ...getSaleOrdersByCustomerIdQueryOptions(tenantId, customerId),
    enabled: !!tenantId && !!customerId,
  })

  const isLoading = isCustomerLoading || isOrdersLoading
  const isError = isCustomerError || isOrdersError
  const error = customerError ?? ordersError

  const summary = useMemo<CustomerSummary>(
    () => {
      const totalAmount = orders.reduce((sum, order) => {
        const orderTotal = order.total_amount ?? 0
        const discount = order.discount ?? 0
        return sum + Math.max(0, orderTotal - discount)
      }, 0)
      const totalPaid = orders.reduce(
        (sum, order) => sum + (order.customer_paid_amount ?? 0),
        0
      )
      return {
        totalOrders: orders.length,
        totalAmount,
        totalPaid,
        totalDebt: Math.max(0, totalAmount - totalPaid),
      }
    },
    [orders]
  )

  return (
    <CustomersProvider>
      <Header fixed className='h-auto'>
        <CustomerHeader customer={customer ?? null} />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12 text-muted-foreground'>
            Đang tải thông tin khách hàng...
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground'>
            <p>Không thể tải khách hàng.</p>
            <p className='text-xs'>Vui lòng thử lại hoặc kiểm tra quyền truy cập.</p>
            {error && (
              <p className='text-xs text-destructive'>
                {error instanceof Error ? error.message : 'Lỗi không xác định.'}
              </p>
            )}
          </div>
        ) : !customer ? (
          <div className='flex items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground'>
            Không tìm thấy khách hàng.
          </div>
        ) : (
          <>
            <CustomerSummaryCards summary={summary} />
            <CustomerInfoCard customer={customer} />
            <CustomerTabs tenantId={tenantId} customerId={customerId} />
          </>
        )}
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}
