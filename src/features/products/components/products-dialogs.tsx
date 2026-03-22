import { ProductsActionDialog } from './products-action-dialog'
import { ProductsDeactivateDialog } from './products-deactivate-dialog'
import { ProductsDeleteDialog } from './products-delete-dialog'
import { useProducts } from './products-provider'
import { type Category } from '@/services/supabase'

type ProductsDialogsProps = {
  categories: Category[]
}

export function ProductsDialogs({ categories }: ProductsDialogsProps) {
  const { open, setOpen, currentRow, setCurrentRow } = useProducts()
  return (
    <>
      <ProductsActionDialog
        key='product-add'
        categories={categories}
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />

      {currentRow && (
        <>
          <ProductsActionDialog
            key={`product-edit-${currentRow.id}`}
            categories={categories}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ProductsDeactivateDialog
            key={`product-deactivate-${currentRow.id}`}
            open={open === 'deactivate'}
            onOpenChange={() => {
              setOpen('deactivate')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />

          <ProductsDeleteDialog
            key={`product-delete-${currentRow.id}`}
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
