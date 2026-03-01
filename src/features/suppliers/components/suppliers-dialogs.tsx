import { type VietQrBank } from '@/client/queries'
import { type SupplierBankAccount } from '@/services/supabase'
import { SuppliersActionDialog } from './suppliers-action-dialog'
import { SuppliersDeleteDialog } from './suppliers-delete-dialog'
import { SuppliersPaymentDialog } from './suppliers-payment-dialog'
import { useSuppliers } from './suppliers-provider'

type MutationOptions = {
  onSuccess?: () => void
}

type SupplierActionMutation = {
  mutate: (values: unknown, options?: MutationOptions) => void
  isPending: boolean
  error: unknown
  reset: () => void
}

type SupplierPaymentMutation = {
  mutate: (values: unknown, options?: MutationOptions) => void
  isPending: boolean
  reset: () => void
}

type SupplierDeleteMutation = {
  mutate: (supplierId: string, options?: MutationOptions) => void
  isPending: boolean
}

type SuppliersDialogsProps = {
  banks: VietQrBank[]
  isBanksLoading: boolean
  supplierBankAccounts: SupplierBankAccount[]
  isBankAccountsLoading: boolean
  createSupplierMutation: SupplierActionMutation
  updateSupplierMutation: SupplierActionMutation
  createSupplierPaymentMutation: SupplierPaymentMutation
  deleteSupplierMutation: SupplierDeleteMutation
}

export function SuppliersDialogs({
  banks,
  isBanksLoading,
  supplierBankAccounts,
  isBankAccountsLoading,
  createSupplierMutation,
  updateSupplierMutation,
  createSupplierPaymentMutation,
  deleteSupplierMutation,
}: SuppliersDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useSuppliers()
  return (
    <>
      <SuppliersActionDialog
        key='supplier-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
        banks={banks}
        isBanksLoading={isBanksLoading}
        supplierBankAccounts={supplierBankAccounts}
        isBankAccountsLoading={isBankAccountsLoading}
        createMutation={createSupplierMutation}
        updateMutation={updateSupplierMutation}
      />

      {currentRow && (
        <>
          <SuppliersPaymentDialog
            key={`supplier-payment-${currentRow.id}`}
            open={open === 'payment'}
            onOpenChange={() => {
              setOpen('payment')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            createMutation={createSupplierPaymentMutation}
          />
          <SuppliersActionDialog
            key={`supplier-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            banks={banks}
            isBanksLoading={isBanksLoading}
            supplierBankAccounts={supplierBankAccounts}
            isBankAccountsLoading={isBankAccountsLoading}
            createMutation={createSupplierMutation}
            updateMutation={updateSupplierMutation}
          />

          <SuppliersDeleteDialog
            key={`supplier-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
            deleteMutation={deleteSupplierMutation}
          />
        </>
      )}
    </>
  )
}
