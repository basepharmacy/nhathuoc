import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Plus, SearchIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover'
import { cn, normalizeSearchValue } from '@/lib/utils'
import { type ProductWithUnits } from '@/services/supabase/'

export type PurchaseOrdersSearchHandle = {
  focus: () => void
}

type PurchaseOrdersSearchProps = {
  products: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits) => void
  onCreateProduct: (searchTerm: string) => void
  readOnly?: boolean
  autoFocus?: boolean
}

export const PurchaseOrdersSearch = forwardRef<PurchaseOrdersSearchHandle, PurchaseOrdersSearchProps>(function PurchaseOrdersSearch({
  products,
  onAddProduct,
  onCreateProduct,
  readOnly = false,
  autoFocus = false,
}, ref) {
  const inputRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }))
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
    itemRefs.current.get(activeIndex)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

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

  const handleCreateProduct = () => {
    onCreateProduct(searchTerm.trim())
    setSearchOpen(false)
  }

  // Index của mục "Thêm sản phẩm mới" (luôn là dòng cuối)
  const createItemIndex = productsFiltered.length

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [])

  // F2 global shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const shouldOpenSuggestions = !readOnly && searchOpen

  return (
    <div className='w-full max-w-xl'>
      <Popover
        open={shouldOpenSuggestions}
        onOpenChange={(open) => {
          if (!open && document.activeElement === inputRef.current) return
          setSearchOpen(open)
        }}
      >
        <PopoverAnchor asChild>
          <div className='relative'>
            <SearchIcon className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                if (!readOnly) {
                  setSearchOpen(true)
                }
              }}
              onFocus={() => {
                if (!readOnly) {
                  setSearchOpen(true)
                }
              }}
              onKeyDown={(event) => {
                if (readOnly) return
                const rowCount = productsFiltered.length + 1 // +1 cho mục "Thêm sản phẩm mới"
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((current) =>
                    current + 1 >= rowCount ? 0 : current + 1
                  )
                  return
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((current) =>
                    current - 1 < 0 ? rowCount - 1 : current - 1
                  )
                  return
                }
                if (event.key === 'Escape') {
                  setSearchOpen(false)
                  return
                }
                if (event.key === 'Enter') {
                  event.preventDefault()
                  if (activeIndex === createItemIndex || productsFiltered.length === 0) {
                    handleCreateProduct()
                    return
                  }
                  handleAddProduct(productsFiltered[activeIndex] ?? productsFiltered[0])
                }
              }}
              ref={inputRef}
              placeholder='Quét mã hoặc nhập để tìm kiếm (F2)'
              className='h-10 rounded-full pl-10 text-sm'
              disabled={readOnly}
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
          <Command shouldFilter={false}>
            <CommandList className='max-h-[220px] overflow-y-auto'>
              {productsFiltered.length === 0 && (
                <div className='px-3 py-2 text-sm text-muted-foreground'>
                  Không tìm thấy sản phẩm.
                </div>
              )}
              <CommandGroup>
                <CommandItem
                  ref={(el) => {
                    if (el) itemRefs.current.set(createItemIndex, el)
                    else itemRefs.current.delete(createItemIndex)
                  }}
                  value='__create_product__'
                  onSelect={handleCreateProduct}
                  onMouseEnter={() => setActiveIndex(createItemIndex)}
                  className={cn(
                    'cursor-pointer text-primary',
                    activeIndex === createItemIndex && 'bg-accent'
                  )}
                >
                  <Plus className='h-4 w-4' />
                  <span className='font-medium'>
                    Thêm sản phẩm mới
                    {searchTerm.trim() ? ` "${searchTerm.trim()}"` : ''}
                  </span>
                </CommandItem>
              </CommandGroup>

              {productsFiltered.length > 0 && <CommandSeparator />}

              <CommandGroup>
                {productsFiltered.map((product, index) => (
                  <CommandItem
                    key={product.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(index, el)
                      else itemRefs.current.delete(index)
                    }}
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
})
