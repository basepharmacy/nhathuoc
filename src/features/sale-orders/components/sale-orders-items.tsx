import { memo, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { QuantityStepper } from '@/components/quantity-stepper'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateLabel } from '@/lib/utils'
import { type ProductUnit } from '@/services/supabase'
import { useSaleOrderStore } from '../store/sale-order-context'

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50, 75]

function UnitPriceInput({
  originalPrice,
  value,
  onChange,
  disabled,
  forceOpen,
  onOpenChange,
}: {
  originalPrice: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  forceOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - value) / originalPrice) * 10000) / 100
      : 0

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1.5'>
          {discountPercent > 0 && (
            <span className='text-xs font-medium text-red-500 shrink-0'>
              -{discountPercent}%
            </span>
          )}
          <CurrencyInput
            value={value}
            onValueChange={onChange}
            onClick={() => !disabled && handleOpenChange(true)}
            className='h-8 w-full rounded-full text-end text-xs'
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-2'
        align='end'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className='flex flex-wrap gap-1.5'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-7 rounded-full px-2.5 text-xs'
            onClick={() => {
              onChange(originalPrice)
              handleOpenChange(false)
            }}
          >
            Giá gốc
          </Button>
          {DISCOUNT_PRESETS.map((p) => (
            <Button
              key={p}
              type='button'
              variant='outline'
              size='sm'
              className='h-7 rounded-full px-2.5 text-xs'
              onClick={() => {
                onChange(Math.round(originalPrice * (1 - p / 100)))
                handleOpenChange(false)
              }}
            >
              -{p}%
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

type SaleOrdersItemsProps = {
  selectedItemIndex?: number
  onSelectedItemIndexChange?: (index: number) => void
  editingPriceItemId?: string | null
  onEditingPriceItemIdChange?: (itemId: string | null) => void
}

const renderUnitLabel = (unit: ProductUnit) => `${unit.unit_name}`

export const SaleOrdersItems = memo(function SaleOrdersItems({
  selectedItemIndex = -1,
  onSelectedItemIndexChange,
  editingPriceItemId,
  onEditingPriceItemIdChange,
}: SaleOrdersItemsProps) {
  const items = useSaleOrderStore((s) => s.items)
  const onUpdateItem = useSaleOrderStore((s) => s.updateItem)
  const onQuantityChange = useSaleOrderStore((s) => s.handleQuantityChange)
  const onUnitChange = useSaleOrderStore((s) => s.handleUnitChange)
  const onRemoveItem = useSaleOrderStore((s) => s.removeItem)

  return (
    <div className='flex h-full flex-col rounded-xl border bg-card shadow-sm'>
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          <Table className='table-fixed w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[5%]'>No</TableHead>
                <TableHead className='w-[30%]'>Tên sản phẩm</TableHead>
                <TableHead className='w-[15%] text-center'>Đơn vị</TableHead>
                <TableHead className='w-[18%] text-center'>Đơn giá</TableHead>
                <TableHead className='w-[15%] text-center'>Số lượng</TableHead>
                <TableHead className='w-[12%] text-center'>Thành tiền</TableHead>
                <TableHead className='w-[5%] text-center' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-21 text-center text-sm text-muted-foreground'>
                    Chưa có sản phẩm. Hãy tìm kiếm để thêm.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice
                  const unitOptions = item.product.product_units ?? []
                  const isSelected = index === selectedItemIndex
                  const isEditingPrice = editingPriceItemId === item.id
                  const originalPrice = unitOptions.find((u) => u.id === item.productUnitId)?.sell_price ?? item.unitPrice
                  return (
                    <TableRow
                      key={item.id}
                      data-item-id={item.id}
                      className={isSelected ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : 'cursor-pointer'}
                      onClick={() => onSelectedItemIndexChange?.(index)}
                    >
                      <TableCell className='align-middle'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary'>
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className='align-middle whitespace-normal'>
                        <span className='line-clamp-2 block w-full break-words text-sm font-semibold'>
                          {item.product.product_name}
                        </span>
                        <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          {item.batchCode ? <span>Lô: {item.batchCode}</span> : null}
                          {item.expiryDate ? (
                            <span>HSD: {formatDateLabel(item.expiryDate)}</span>
                          ) : null}
                          <span>SL: {item.stock}</span>
                        </div>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <select
                          value={item.productUnitId ?? ''}
                          onChange={(event) => {
                            const value = event.target.value
                            onUnitChange(item.id, value)
                          }}
                          className='h-8 w-full rounded-full border bg-background px-2 text-xs'
                        >
                          <option value='' disabled>
                            Đơn vị
                          </option>
                          {unitOptions.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {renderUnitLabel(unit)}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <UnitPriceInput
                          originalPrice={originalPrice}
                          value={item.unitPrice}
                          onChange={(price) => onUpdateItem(item.id, { unitPrice: price, discount: Math.max(0, originalPrice - price) })}
                          forceOpen={isEditingPrice}
                          onOpenChange={(open) => {
                            if (!open && isEditingPrice) onEditingPriceItemIdChange?.(null)
                          }}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => onQuantityChange(item.id, qty)}
                        />
                      </TableCell>
                      <TableCell className='align-middle text-end text-sm font-semibold text-foreground'>
                        {formatCurrency(lineTotal)}đ
                      </TableCell>
                      <TableCell className='align-middle text-end pr-4'>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-muted-foreground'
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </div>
  )
})
