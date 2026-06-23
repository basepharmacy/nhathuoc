import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
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
import { cn, formatCurrency, normalizeSearchValue } from '@/lib/utils'
import { type ProductUnit, type ProductWithUnits } from '@/services/supabase/'

export type SaleOrdersSearchHandle = {
  focus: () => void
}

type SearchRow = {
  product: ProductWithUnits
  unit: ProductUnit
}

type SaleOrdersSearchProps = {
  products: ProductWithUnits[]
  onAddProduct: (product: ProductWithUnits, unitId?: string) => void
  readOnly?: boolean
  autoFocus?: boolean
}

export const SaleOrdersSearch = forwardRef<SaleOrdersSearchHandle, SaleOrdersSearchProps>(function SaleOrdersSearch({
  products,
  onAddProduct,
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

  const rowsFiltered = useMemo<SearchRow[]>(() => {
    const term = normalizeSearchValue(debouncedSearchTerm.trim())
    const matched = !term
      ? products
      : products.filter(
          (product) =>
            normalizeSearchValue(product.product_name).includes(term) ||
            normalizeSearchValue(product.active_ingredient || '').includes(term)
        )
    return matched
      .flatMap((product) => {
        const units = [...(product.product_units ?? [])].sort(
          (a, b) => Number(b.is_base_unit) - Number(a.is_base_unit)
        )
        return units.map((unit) => ({ product, unit }))
      })
      .slice(0, 10)
  }, [products, debouncedSearchTerm])

  useEffect(() => {
    if (rowsFiltered.length === 0) {
      setActiveIndex(0)
      return
    }
    setActiveIndex((current) => Math.min(current, rowsFiltered.length - 1))
  }, [rowsFiltered])

  useEffect(() => {
    itemRefs.current.get(activeIndex)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleAddProduct = (row: SearchRow) => {
    onAddProduct(row.product, row.unit.id)
    setSearchTerm('')
    setSearchOpen(false)
  }

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

  const shouldOpenSuggestions =
    !readOnly && searchOpen && rowsFiltered.length > 0

  return (
    <div className='w-full max-w-xl'>
      <Popover
        open={shouldOpenSuggestions}
        onOpenChange={(open) => {
          // Prevent Radix from closing when interacting with the anchor input
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
                if (event.key === 'ArrowDown' && rowsFiltered.length > 0) {
                  event.preventDefault()
                  setActiveIndex((current) =>
                    current + 1 >= rowsFiltered.length ? 0 : current + 1
                  )
                  return
                }
                if (event.key === 'ArrowUp' && rowsFiltered.length > 0) {
                  event.preventDefault()
                  setActiveIndex((current) =>
                    current - 1 < 0 ? rowsFiltered.length - 1 : current - 1
                  )
                  return
                }
                if (event.key === 'Escape') {
                  setSearchOpen(false)
                  return
                }
                if (event.key === 'Enter' && rowsFiltered.length > 0) {
                  event.preventDefault()
                  handleAddProduct(rowsFiltered[activeIndex] ?? rowsFiltered[0])
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
          <Command>
            <CommandList className='max-h-[220px] overflow-y-auto'>
              <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
              <CommandGroup>
                {rowsFiltered.map((row, index) => (
                  <CommandItem
                    key={`${row.product.id}-${row.unit.id}`}
                    ref={(el) => {
                      if (el) itemRefs.current.set(index, el)
                      else itemRefs.current.delete(index)
                    }}
                    value={`${row.product.product_name}-${row.unit.id}`}
                    onSelect={() => handleAddProduct(row)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'cursor-pointer data-[selected=true]:bg-transparent data-[selected=true]:text-inherit',
                      index === activeIndex && '!bg-accent !text-accent-foreground'
                    )}
                  >
                    <div className='flex w-full items-center justify-between gap-2'>
                      <div className='flex min-w-0 flex-col'>
                        <span className='truncate font-medium'>{row.product.product_name}</span>
                        {(row.product.active_ingredient || row.product.made_company_name) && (
                          <span className='truncate text-xs text-muted-foreground'>
                            {[row.product.active_ingredient, row.product.made_company_name]
                              .filter(Boolean)
                              .join(' • ')}
                          </span>
                        )}
                      </div>
                      <div className='flex shrink-0 flex-col items-end gap-0.5'>
                        <span className='rounded-full bg-muted px-2 py-0.5 text-xs font-medium'>
                          {row.unit.unit_name}
                        </span>
                        <span className='text-sm font-semibold'>
                          {formatCurrency(row.unit.sell_price ?? 0)}
                        </span>
                      </div>
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
