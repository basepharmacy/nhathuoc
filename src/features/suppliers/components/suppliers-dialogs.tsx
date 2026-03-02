import { SuppliersActionDialog } from './suppliers-action-dialog'
import { SuppliersDeleteDialog } from './suppliers-delete-dialog'
import { SuppliersPaymentDialog } from './suppliers-payment-dialog'
import { useSuppliers } from './suppliers-provider'

export function SuppliersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSuppliers()
  return (
    <>
      <SuppliersActionDialog
        key='supplier-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
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
          />
        </>
      )}
    </>
  )
}
