import { BankAccountsActionDialog } from './bank-accounts-action-dialog'
import { BankAccountsDeleteDialog } from './bank-accounts-delete-dialog'
import { useBankAccounts } from './bank-accounts-provider'

export function BankAccountsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBankAccounts()
  return (
    <>
      <BankAccountsActionDialog
        key='bank-account-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <BankAccountsActionDialog
            key={`bank-account-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <BankAccountsDeleteDialog
            key={`bank-account-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
