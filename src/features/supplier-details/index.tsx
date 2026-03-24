import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import {
	getSupplierDetailQueryOptions,
	getPurchasesStatisticsV2QueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SuppliersDialogs } from '@/features/suppliers/components/suppliers-dialogs'
import { SuppliersProvider } from '@/features/suppliers/components/suppliers-provider'
import { SupplierHeader } from './components/supplier-header'
import { SupplierInfoCard } from './components/supplier-info-card'
import { SupplierSummaryCards } from './components/supplier-summary-cards'
import { SupplierTabs } from './components/supplier-tabs'

const route = getRouteApi('/_authenticated/suppliers/$supplierId')

function SupplierDetailContent() {
	const { supplierId } = route.useParams()
	const { user } = useUser()
	const tenantId = user?.profile?.tenant_id ?? ''
	const [selectedPeriodId, setSelectedPeriodId] = useState('')

	const purchasePeriodId = selectedPeriodId ? Number(selectedPeriodId) : undefined

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
		data: statistics,
		isLoading: isStatisticsLoading,
		isError: isStatisticsError,
		error: statisticsError,
	} = useQuery({
		...getPurchasesStatisticsV2QueryOptions({ supplierId, purchasePeriodId }),
		enabled: !!supplierId,
	})

	const isLoading = isSupplierLoading || isStatisticsLoading
	const isError = isSupplierError || isStatisticsError
	const error = supplierError ?? statisticsError

	const summary = {
		totalOrders: statistics?.totalOrders ?? 0,
		totalAmount: statistics?.totalOrderAmount ?? 0,
		totalPaid: statistics?.totalPaidAmount ?? 0,
		totalDebt: statistics?.totalDebt ?? 0,
	}

	return (
		<>
			<Header fixed className='h-auto'>
				<SupplierHeader
					supplier={supplier ?? null}
					periodId={selectedPeriodId}
					onPeriodChange={setSelectedPeriodId}
				/>
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
						<SupplierTabs
							tenantId={tenantId}
							supplierId={supplierId}
							supplier={supplier}
							purchasePeriodId={purchasePeriodId}
						/>
					</>
				)}
			</Main>

			<SuppliersDialogs />
		</>
	)
}

export function SupplierDetail() {
	return (
		<SuppliersProvider>
			<SupplierDetailContent />
		</SuppliersProvider>
	)
}
