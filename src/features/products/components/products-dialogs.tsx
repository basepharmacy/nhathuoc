import { ProductsActionDialog } from './products-action-dialog'
import { useProducts } from './products-provider'

export function ProductsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()

  return (
    <>
      <ProductsActionDialog
        open={open === 'add'}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null)
          }
        }}
      />

      <ProductsActionDialog
        currentRow={currentRow ?? undefined}
        open={open === 'edit'}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null)
            setCurrentRow(null)
          }
        }}
      />
    </>
  )
}
