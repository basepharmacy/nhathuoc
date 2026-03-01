import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supplierBankAccountsRepo, supplierPaymentsRepo, suppliersRepo } from '@/client'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getSuppliersQueryOptions, getVietQrBanksQueryOptions } from '@/client/queries'
import { SuppliersDialogs } from './components/suppliers-dialogs'
import { SuppliersPrimaryButtons } from './components/suppliers-primary-buttons'
import { SuppliersProvider } from './components/suppliers-provider'
import { SuppliersTable } from './components/suppliers-table'
import { useSuppliers } from './components/suppliers-provider'

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

function SuppliersContent() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { open, currentRow } = useSuppliers()
  const queryClient = useQueryClient()

  const { data: suppliers = [], isLoading } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
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
    mutationFn: (supplierId: string) => suppliersRepo.deleteSupplier(supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
    },
  })

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhà cung cấp</h2>
            <p className='text-muted-foreground'>
              Quản lý nhà cung cấp tại đây.
            </p>
          </div>
          <SuppliersPrimaryButtons />
        </div>
        <SuppliersTable data={suppliers} isLoading={isLoading} />
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

export function Suppliers() {
  return (
    <SuppliersProvider>
      <SuppliersContent />
    </SuppliersProvider>
  )
}
