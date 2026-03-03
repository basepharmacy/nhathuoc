import { useStockAdjustments } from './stock-adjustments-provider'
import { StockAdjustmentsActionDialog } from './stock-adjustments-action-dialog'
import { StockAdjustmentsDeleteDialog } from './stock-adjustments-delete-dialog'

export function StockAdjustmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStockAdjustments()

  return (
    <>
      <StockAdjustmentsActionDialog
        key='stock-adjustment-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <StockAdjustmentsDeleteDialog
          key={`stock-adjustment-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )}
    </>
  )
}
