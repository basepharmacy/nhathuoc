import { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { normalizeSearchValue } from '@/lib/utils'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

type SaleOrdersSearchProps = {
  products: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits) => void
  readOnly?: boolean
}

export function SaleOrdersSearch({
  products,
  onAddProduct,
  readOnly = false,
}: SaleOrdersSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const productsFiltered = useMemo(() => {
    const term = normalizeSearchValue(searchTerm.trim())
    if (!term) return []
    return products
      .filter((product) =>
        normalizeSearchValue(product.product_name).includes(term)
      )
      .slice(0, 6)
  }, [products, searchTerm])

  useEffect(() => {
    if (productsFiltered.length === 0) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((current) =>
      Math.min(current, productsFiltered.length - 1)
    )
  }, [productsFiltered])

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
          if (event.key === 'ArrowDown' && productsFiltered.length > 0) {
            event.preventDefault()
            setActiveIndex((current) =>
              current + 1 >= productsFiltered.length ? 0 : current + 1
            )
            return
          }
          if (event.key === 'ArrowUp' && productsFiltered.length > 0) {
            event.preventDefault()
            setActiveIndex((current) =>
              current - 1 < 0 ? productsFiltered.length - 1 : current - 1
            )
            return
          }
          if (event.key === 'Enter' && productsFiltered.length > 0) {
            event.preventDefault()
            handleAddProduct(productsFiltered[activeIndex] ?? productsFiltered[0])
          }
        }}
        placeholder='Quét mã hoặc nhập để tìm kiếm (F2)'
        className='h-10 rounded-full pl-10 text-sm'
        disabled={readOnly}
      />
      {!readOnly && productsFiltered.length > 0 && (
        <div className='absolute z-10 mt-2 w-full rounded-lg border bg-popover p-1 shadow-lg'>
          {productsFiltered.map((product, index) => (
            <button
              type='button'
              key={product.id}
              onMouseDown={(event) => {
                event.preventDefault()
                handleAddProduct(product)
              }}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent ${index === activeIndex ? 'bg-accent' : ''
                }`}
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
