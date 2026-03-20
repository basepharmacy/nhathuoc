import { useEffect, useMemo, useState } from 'react'
import { SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import { cn, normalizeSearchValue } from '@/lib/utils'
import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

type StockAdjustmentsAddSearchProps = {
  products: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits) => void
}

export function StockAdjustmentsAddSearch({
  products,
  onAddProduct,
}: StockAdjustmentsAddSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const productsFiltered = useMemo(() => {
    const term = normalizeSearchValue(debouncedSearchTerm.trim())
    if (!term) return products.slice(0, 10)
    return products
      .filter((product) =>
        normalizeSearchValue(product.product_name).includes(term)
      )
      .slice(0, 10)
  }, [products, debouncedSearchTerm])

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
    setSearchOpen(false)
  }

  const shouldOpenSuggestions = searchOpen && searchTerm.trim().length > 0

  return (
    <div className='w-full max-w-xl'>
      <Popover open={shouldOpenSuggestions} onOpenChange={setSearchOpen}>
        <PopoverAnchor asChild>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
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
                if (event.key === 'Escape') {
                  setSearchOpen(false)
                  return
                }
                if (event.key === 'Enter' && productsFiltered.length > 0) {
                  event.preventDefault()
                  handleAddProduct(productsFiltered[activeIndex] ?? productsFiltered[0])
                }
              }}
              placeholder='Quét mã hoặc nhập để tìm kiếm (F2)'
              className='h-10 rounded-full pl-10 text-sm'
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          className='p-0'
          style={{ width: 'var(--radix-popover-trigger-width)' }}
          onOpenAutoFocus={(event) => event.preventDefault()}
          onWheel={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
        >
          <Command>
            <CommandList className='max-h-[220px] overflow-y-auto'>
              <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
              <CommandGroup>
                {productsFiltered.map((product, index) => (
                  <CommandItem
                    key={product.id}
                    value={product.product_name}
                    onSelect={() => handleAddProduct(product)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn('cursor-pointer', index === activeIndex && 'bg-accent')}
                  >
                    <div className='flex w-full flex-col'>
                      <span className='font-medium'>{product.product_name}</span>
                      {(product.active_ingredient || product.made_company_name) && (
                        <span className='text-xs text-muted-foreground'>
                          {[product.active_ingredient, product.made_company_name]
                            .filter(Boolean)
                            .join(' • ')}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
