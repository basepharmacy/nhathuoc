import { Button } from '@/components/ui/button'
import { type Supplier } from '@/features/suppliers/data/schema'
import { useSuppliers } from '@/features/suppliers/components/suppliers-provider'

type SupplierActionsProps = {
  isActive: boolean | null
  supplier: Supplier | null
}

export function SupplierActions({ isActive, supplier }: SupplierActionsProps) {
  const { setOpen, setCurrentRow } = useSuppliers()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        variant='outline'
        className='border-destructive/40 text-destructive hover:bg-destructive/10'
        disabled={!supplier}
        onClick={() => {
          if (!supplier) return
          setCurrentRow(supplier)
        }}
      >
        {isActive === false ? 'Mở giao dịch' : 'Ngừng giao dịch'}
      </Button>
      <Button
        variant='destructive'
        disabled={!supplier}
        onClick={() => {
          if (!supplier) return
          setCurrentRow(supplier)
          setOpen('delete')
        }}
      >
        Xoá
      </Button>
      <Button
        disabled={!supplier}
        onClick={() => {
          if (!supplier) return
          setCurrentRow(supplier)
          setOpen('edit')
        }}
      >
        Chỉnh sửa
      </Button>
    </div>
  )
}
