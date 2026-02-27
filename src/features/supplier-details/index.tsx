import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import {
	getPurchaseOrdersBySupplierIdQueryOptions,
	getSupplierDetailQueryOptions,
	getSupplierPaymentsBySupplierIdQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SuppliersDialogs } from '@/features/suppliers/components/suppliers-dialogs'
import { SuppliersProvider } from '@/features/suppliers/components/suppliers-provider'
import { SupplierHeader } from './components/supplier-header'
import { SupplierInfoCard } from './components/supplier-info-card'
import { SupplierSummaryCards } from './components/supplier-summary-cards'
import { SupplierTabs } from './components/supplier-tabs'
import { type SupplierSummary } from './data/schema'

const route = getRouteApi('/_authenticated/suppliers/$supplierId')

export function SupplierDetail() {
	const { supplierId } = route.useParams()
	const { user } = useUser()
	const tenantId = user?.profile?.tenant_id ?? ''

	const {
		data: supplier,
		isLoading: isSupplierLoading,
		isError: isSupplierError,
		error: supplierError,
	} = useQuery({
		...getSupplierDetailQueryOptions(tenantId, supplierId),
		enabled: !!tenantId && !!supplierId,
	})

	const {
		data: orders = [],
		isLoading: isOrdersLoading,
		isError: isOrdersError,
		error: ordersError,
	} = useQuery({
		...getPurchaseOrdersBySupplierIdQueryOptions(tenantId, supplierId),
		enabled: !!tenantId && !!supplierId,
	})

	const {
		data: payments = [],
		isLoading: isPaymentsLoading,
		isError: isPaymentsError,
		error: paymentsError,
	} = useQuery({
		...getSupplierPaymentsBySupplierIdQueryOptions(tenantId, supplierId),
		enabled: !!tenantId && !!supplierId,
	})

	const isLoading = isSupplierLoading || isOrdersLoading || isPaymentsLoading
	const isError = isSupplierError || isOrdersError || isPaymentsError
	const error = supplierError ?? ordersError ?? paymentsError

	const summary = useMemo<SupplierSummary>(
		() => {
			const totalAmount = orders.reduce((sum, order) => {
				const orderTotal = order.total_amount ?? 0
				const discount = order.discount ?? 0
				return sum + Math.max(0, orderTotal - discount)
			}, 0)
			const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0)
			return {
				totalOrders: orders.length,
				totalAmount,
				totalPaid,
				totalDebt: Math.max(0, totalAmount - totalPaid),
			}
		},
		[orders, payments]
	)

	return (
		<SuppliersProvider>
			<Header fixed className='h-auto'>
				<SupplierHeader supplier={supplier ?? null} />
			</Header>

			<Main className='flex flex-1 flex-col gap-6'>
				{isLoading ? (
					<div className='flex items-center justify-center py-12 text-muted-foreground'>
						Đang tải thông tin nhà cung cấp...
					</div>
				) : isError ? (
					<div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground'>
						<p>Không thể tải nhà cung cấp.</p>
						<p className='text-xs'>Vui lòng thử lại hoặc kiểm tra quyền truy cập.</p>
						{error && (
							<p className='text-xs text-destructive'>
								{error instanceof Error ? error.message : 'Lỗi không xác định.'}
							</p>
						)}
					</div>
				) : !supplier ? (
					<div className='flex items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground'>
						Không tìm thấy nhà cung cấp.
					</div>
				) : (
					<>
						<SupplierSummaryCards summary={summary} />
						<SupplierInfoCard supplier={supplier} />
						<SupplierTabs orders={orders} payments={payments} />
					</>
				)}
			</Main>

			<SuppliersDialogs />
		</SuppliersProvider>
	)
}
