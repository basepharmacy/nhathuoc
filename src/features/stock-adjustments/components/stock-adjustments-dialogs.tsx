import { useStockAdjustments } from './stock-adjustments-provider'
import { StockAdjustmentsDeleteDialog } from './stock-adjustments-delete-dialog'

export function StockAdjustmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStockAdjustments()

  return (
    <>
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
