import { useEffect, useMemo, useState } from 'react'
import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { QuantityStepper } from '@/components/quantity-stepper'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { type OrderItem } from '../data/types'
import { type ProductUnit } from '@/services/supabase/database/repo/productsRepo'
import { BatchSelectDialog } from './batch-select-dialog'

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
          <Input
            value={formatCurrency(value)}
            onChange={(e) => onChange(normalizeNumber(e.target.value))}
            onClick={() => !disabled && handleOpenChange(true)}
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

type PurchaseOrdersItemsProps = {
  items: OrderItem[]
  onUpdateItem: (itemId: string, next: Partial<OrderItem>) => void
  onRemoveItem: (itemId: string) => void
  tenantId: string
  locationId?: string | null
  pendingBatchItemId: string | null
  onPendingBatchHandled: () => void
  readOnly?: boolean
  selectedItemIndex?: number
  onSelectedItemIndexChange?: (index: number) => void
  editingPriceItemId?: string | null
  onEditingPriceItemIdChange?: (itemId: string | null) => void
}

const renderUnitLabel = (unit: ProductUnit) => `${unit.unit_name}`
const formatDateLabel = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function PurchaseOrdersItems({
  items,
  onUpdateItem,
  onRemoveItem,
  tenantId,
  locationId,
  pendingBatchItemId,
  onPendingBatchHandled,
  readOnly = false,
  selectedItemIndex = -1,
  onSelectedItemIndexChange,
  editingPriceItemId,
  onEditingPriceItemIdChange,
}: PurchaseOrdersItemsProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  useEffect(() => {
    if (pendingBatchItemId) {
      setActiveItemId(pendingBatchItemId)
      onPendingBatchHandled()
    }
  }, [pendingBatchItemId, onPendingBatchHandled])

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, items]
  )

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
                <TableHead className='w-[15%] text-center'>Đơn giá</TableHead>
                <TableHead className='w-[15%] text-center'>Số lượng</TableHead>
                <TableHead className='w-[15%] text-center'>Thành tiền</TableHead>
                <TableHead className='w-[5%] text-end' />
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
                  const isSelected = index === selectedItemIndex
                  const isEditingPrice = editingPriceItemId === item.id
                  return (
                    <TableRow
                      key={item.id}
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
                        <div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
                          {item.batchCode ? (
                            <>
                              <span>Lô: {item.batchCode}</span>
                              {item.expiryDate ? (
                                <span>HSD: {formatDateLabel(item.expiryDate)}</span>
                              ) : null}
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-5 w-5'
                                onClick={() => {
                                  if (readOnly) return
                                  setActiveItemId(item.id)
                                }}
                                disabled={readOnly}
                              >
                                <SquarePen className='h-3 w-3' />
                              </Button>
                            </>
                          ) : (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-6 px-2 text-xs'
                              onClick={() => {
                                if (readOnly) return
                                setActiveItemId(item.id)
                              }}
                              disabled={readOnly}
                            >
                              Chọn lô
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <Select
                          value={item.productUnitId ?? undefined}
                          onValueChange={(value) => {
                            if (readOnly) return
                            const selectedUnit = unitOptions.find((unit) => unit.id === value)
                            onUpdateItem(item.id, {
                              productUnitId: value,
                              unitPrice: selectedUnit?.cost_price ?? item.unitPrice,
                            })
                          }}
                          disabled={readOnly}
                        >
                          <SelectTrigger
                            className='h-8 w-full rounded-full text-xs'
                            disabled={readOnly}
                          >
                            <SelectValue placeholder='Đơn vị' />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {renderUnitLabel(unit)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <UnitPriceInput
                          originalPrice={
                            unitOptions.find((u) => u.id === item.productUnitId)?.cost_price ??
                            item.unitPrice
                          }
                          value={item.unitPrice}
                          onChange={(price) => onUpdateItem(item.id, { unitPrice: price })}
                          disabled={readOnly}
                          forceOpen={isEditingPrice}
                          onOpenChange={(open) => {
                            if (!open && isEditingPrice) onEditingPriceItemIdChange?.(null)
                          }}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => onUpdateItem(item.id, { quantity: qty })}
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
      <BatchSelectDialog
        title={activeItem ? `Chọn lô - ${activeItem.product.product_name}` : 'Chọn lô sản phẩm'}
        initialBatchCode={activeItem?.batchCode ?? ''}
        initialExpiryDate={activeItem?.expiryDate ?? ''}
        productId={activeItem?.product.id ?? ''}
        tenantId={tenantId}
        locationId={locationId}
        open={!!activeItemId && !readOnly}
        onOpenChange={(open) => {
          if (!open) setActiveItemId(null)
        }}
        onSave={(batchCode, expiryDate) => {
          if (!activeItemId) return
          onUpdateItem(activeItemId, { batchCode, expiryDate })
          setActiveItemId(null)
        }}
        readOnly={readOnly}
      />
    </div>
  )
}
