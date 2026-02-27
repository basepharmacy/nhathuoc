import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

type PurchaseOrdersSearchProps = {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  productsFiltered: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits) => void
}

export function PurchaseOrdersSearch({
  searchTerm,
  onSearchTermChange,
  productsFiltered,
  onAddProduct,
}: PurchaseOrdersSearchProps) {
  return (
    <div className='relative w-full max-w-xl'>
      <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        value={searchTerm}
        onChange={(event) => onSearchTermChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && productsFiltered.length > 0) {
            event.preventDefault()
            onAddProduct(productsFiltered[0])
          }
        }}
        placeholder='Quét mã hoặc nhập để tìm kiếm (F2)'
        className='h-10 rounded-full pl-10 text-sm'
      />
      {productsFiltered.length > 0 && (
        <div className='absolute z-10 mt-2 w-full rounded-lg border bg-popover p-1 shadow-lg'>
          {productsFiltered.map((product) => (
            <button
              type='button'
              key={product.id}
              onMouseDown={(event) => {
                event.preventDefault()
                onAddProduct(product)
              }}
              className='flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent'
            >
              <span className='font-medium'>{product.product_name}</span>
              <span className='text-xs text-muted-foreground'>Nhấn để thêm</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
