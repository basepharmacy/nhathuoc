import { useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

type PurchaseOrdersSearchProps = {
  products: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits) => void
  readOnly?: boolean
}

export function PurchaseOrdersSearch({
  products,
  onAddProduct,
  readOnly = false,
}: PurchaseOrdersSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const productsFiltered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return []
    return products
      .filter((product) => product.product_name.toLowerCase().includes(term))
      .slice(0, 6)
  }, [products, searchTerm])

  const handleAddProduct = (product: ProductWithUnits) => {
    onAddProduct(product)
    setSearchTerm('')
  }

  return (
    <div className='relative w-full max-w-xl'>
      <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
      <Input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        onKeyDown={(event) => {
          if (readOnly) return
          if (event.key === 'Enter' && productsFiltered.length > 0) {
            event.preventDefault()
            handleAddProduct(productsFiltered[0])
          }
        }}
        placeholder='Quét mã hoặc nhập để tìm kiếm (F2)'
        className='h-10 rounded-full pl-10 text-sm'
        disabled={readOnly}
      />
      {!readOnly && productsFiltered.length > 0 && (
        <div className='absolute z-10 mt-2 w-full rounded-lg border bg-popover p-1 shadow-lg'>
          {productsFiltered.map((product) => (
            <button
              type='button'
              key={product.id}
              onMouseDown={(event) => {
                event.preventDefault()
                handleAddProduct(product)
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
