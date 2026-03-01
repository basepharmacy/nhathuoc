import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { toast } from 'sonner'
import { supplierBankAccountsRepo, supplierPaymentsRepo, suppliersRepo } from '@/client'
import { useUser } from '@/client/provider'
import {
	getPurchaseOrdersBySupplierIdQueryOptions,
	getSupplierDetailQueryOptions,
	getSupplierPaymentsBySupplierIdQueryOptions,
	getVietQrBanksQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SuppliersDialogs } from '@/features/suppliers/components/suppliers-dialogs'
import { SuppliersProvider } from '@/features/suppliers/components/suppliers-provider'
import { useSuppliers } from '@/features/suppliers/components/suppliers-provider'
import { SupplierHeader } from './components/supplier-header'
import { SupplierInfoCard } from './components/supplier-info-card'
import { SupplierSummaryCards } from './components/supplier-summary-cards'
import { SupplierTabs } from './components/supplier-tabs'
import { type SupplierSummary } from './data/schema'

const route = getRouteApi('/_authenticated/suppliers/$supplierId')

type SupplierActionFormValues = {
	name: string
	phone?: string
	representative?: string
	address?: string
	description?: string
	is_active: boolean
	bank_accounts?: Array<{
		bank_bin: string
		account_number: string
		account_holder: string
		is_default?: boolean
	}>
}

type SupplierPaymentFormValues = {
	amount: string
	payment_date: string
	reference_code?: string
	note?: string
}

const normalizeOptionalText = (value?: string) =>
	value && value.trim().length > 0 ? value.trim() : null

const normalizeBankAccounts = (
	accounts?: SupplierActionFormValues['bank_accounts']
) =>
	(() => {
		const normalized = (accounts ?? []).map((account) => ({
			bank_bin: account.bank_bin.trim(),
			account_number: account.account_number.replace(/\s+/g, ''),
			account_holder: account.account_holder.trim(),
			is_default: Boolean(account.is_default),
		}))

		if (!normalized.length) return []

		let defaultIndex = normalized.findIndex((account) => account.is_default)
		if (defaultIndex < 0) defaultIndex = 0

		return normalized.map((account, index) => ({
			...account,
			is_default: index === defaultIndex,
		}))
	})()

function SupplierDetailContent() {
	const { supplierId } = route.useParams()
	const { user } = useUser()
	const tenantId = user?.profile?.tenant_id ?? ''
	const { open, currentRow } = useSuppliers()
	const queryClient = useQueryClient()

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

	const { data: banks = [], isLoading: isBanksLoading } = useQuery({
		...getVietQrBanksQueryOptions(),
	})

	const { data: supplierBankAccounts = [], isLoading: isBankAccountsLoading } =
		useQuery({
			queryKey: ['supplier-bank-accounts', currentRow?.id],
			queryFn: () =>
				supplierBankAccountsRepo.getSupplierBankAccountsBySupplierId(
					currentRow?.id as string
				),
			enabled: open === 'edit' && !!currentRow?.id,
		})

	const createSupplierMutation = useMutation({
		mutationFn: async (values: SupplierActionFormValues) => {
			const supplier = await suppliersRepo.createSupplier({
				tenant_id: tenantId,
				name: values.name,
				phone: normalizeOptionalText(values.phone),
				representative: normalizeOptionalText(values.representative),
				address: normalizeOptionalText(values.address),
				description: normalizeOptionalText(values.description),
				is_active: values.is_active,
			})

			const accounts = normalizeBankAccounts(values.bank_accounts)
			await supplierBankAccountsRepo.replaceSupplierBankAccounts({
				supplierId: supplier.id,
				tenantId,
				accounts,
			})

			return supplier
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
			queryClient.invalidateQueries({ queryKey: ['supplier-bank-accounts'] })
		},
	})

	const updateSupplierMutation = useMutation({
		mutationFn: async (values: SupplierActionFormValues) => {
			if (!currentRow) {
				throw new Error('Không tìm thấy nhà cung cấp.')
			}
			const supplier = await suppliersRepo.updateSupplier(currentRow.id, {
				name: values.name,
				phone: normalizeOptionalText(values.phone),
				representative: normalizeOptionalText(values.representative),
				address: normalizeOptionalText(values.address),
				description: normalizeOptionalText(values.description),
				is_active: values.is_active,
			})

			const accounts = normalizeBankAccounts(values.bank_accounts)
			await supplierBankAccountsRepo.replaceSupplierBankAccounts({
				supplierId: currentRow.id,
				tenantId,
				accounts,
			})

			return supplier
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
			queryClient.invalidateQueries({
				queryKey: ['suppliers', tenantId, 'detail', supplierId],
			})
			queryClient.invalidateQueries({ queryKey: ['supplier-bank-accounts'] })
		},
	})

	const createSupplierPaymentMutation = useMutation({
		mutationFn: (values: SupplierPaymentFormValues) => {
			if (!tenantId) {
				throw new Error('Không tìm thấy tenant.')
			}
			if (!currentRow) {
				throw new Error('Không tìm thấy nhà cung cấp.')
			}
			return supplierPaymentsRepo.createSupplierPayment({
				tenant_id: tenantId,
				supplier_id: currentRow.id,
				amount: Number(values.amount),
				payment_date: values.payment_date,
				reference_code: normalizeOptionalText(values.reference_code),
				note: normalizeOptionalText(values.note),
				is_payment_on_purchase_order: false,
			})
		},
		onSuccess: () => {
			if (!currentRow) return
			queryClient.invalidateQueries({
				queryKey: ['supplier-payments', tenantId, currentRow.id],
			})
			queryClient.invalidateQueries({
				queryKey: ['supplier-payments', tenantId, currentRow.id, 'history'],
			})
			queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
			queryClient.invalidateQueries({
				queryKey: ['suppliers', tenantId, 'detail', supplierId],
			})
		},
		onError: (error) => {
			const message =
				error && typeof error === 'object' && 'message' in error
					? String((error as { message: string }).message)
					: 'Đã xảy ra lỗi, vui lòng thử lại.'
			toast.error(message)
		},
	})

	const deleteSupplierMutation = useMutation({
		mutationFn: (supplierIdToDelete: string) =>
			suppliersRepo.deleteSupplier(supplierIdToDelete),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
			queryClient.invalidateQueries({
				queryKey: ['suppliers', tenantId, 'detail', supplierId],
			})
		},
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
		<>
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
						<SupplierTabs
							tenantId={tenantId}
							supplierId={supplierId}
							supplier={supplier}
						/>
					</>
				)}
			</Main>

			<SuppliersDialogs
				banks={banks}
				isBanksLoading={isBanksLoading}
				supplierBankAccounts={supplierBankAccounts}
				isBankAccountsLoading={isBankAccountsLoading}
				createSupplierMutation={createSupplierMutation}
				updateSupplierMutation={updateSupplierMutation}
				createSupplierPaymentMutation={createSupplierPaymentMutation}
				deleteSupplierMutation={deleteSupplierMutation}
			/>
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
