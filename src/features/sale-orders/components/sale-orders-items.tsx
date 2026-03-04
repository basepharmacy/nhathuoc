import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { formatCurrency, normalizeNumber } from '@/lib/utils'
import { type SaleOrderItem } from '../data/types'
import { type ProductUnit } from '@/services/supabase/database/repo/productsRepo'

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50, 75]

function UnitPriceInput({
  originalPrice,
  value,
  onChange,
  disabled,
}: {
  originalPrice: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - value) / originalPrice) * 10000) / 100
      : 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1.5'>
          {discountPercent > 0 && (
            <span className='text-xs font-medium text-red-500 shrink-0'>
              -{discountPercent}%
            </span>
          )}
          <Input
            value={formatCurrency(value)}
            onChange={(e) => onChange(normalizeNumber(e.target.value))}
            onClick={() => !disabled && setOpen(true)}
            className='h-8 w-full rounded-full text-end text-xs'
            inputMode='numeric'
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
              setOpen(false)
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
                setOpen(false)
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
  items: SaleOrderItem[]
  onUpdateItem: (itemId: string, next: Partial<SaleOrderItem>) => void
  onQuantityChange: (itemId: string, nextQuantity: number) => void
  onRemoveItem: (itemId: string) => void
  readOnly?: boolean
}

const renderUnitLabel = (unit: ProductUnit) => `${unit.unit_name}`
const formatDateLabel = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function SaleOrdersItems({
  items,
  onUpdateItem,
  onQuantityChange,
  onRemoveItem,
  readOnly = false,
}: SaleOrdersItemsProps) {
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
                  <TableCell colSpan={7} className='h-24 text-center text-sm text-muted-foreground'>
                    Chưa có sản phẩm. Hãy tìm kiếm để thêm.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice - item.discount
                  const unitOptions = item.product.product_units ?? []
                  return (
                    <TableRow key={item.id}>
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
                        </div>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <select
                          value={item.productUnitId ?? ''}
                          onChange={(event) => {
                            if (readOnly) return
                            const value = event.target.value
                            const selectedUnit = unitOptions.find((unit) => unit.id === value)
                            onUpdateItem(item.id, {
                              productUnitId: value,
                              unitPrice: selectedUnit?.sell_price ?? item.unitPrice,
                            })
                          }}
                          className='h-8 w-full rounded-full border bg-background px-2 text-xs'
                          disabled={readOnly}
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
                          originalPrice={
                            unitOptions.find((u) => u.id === item.productUnitId)?.sell_price ??
                            item.unitPrice
                          }
                          value={item.unitPrice}
                          onChange={(price) => onUpdateItem(item.id, { unitPrice: price })}
                          disabled={readOnly}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => onQuantityChange(item.id, qty)}
                          disabled={readOnly}
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
                          onClick={() => {
                            if (readOnly) return
                            onRemoveItem(item.id)
                          }}
                          disabled={readOnly}
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
}
