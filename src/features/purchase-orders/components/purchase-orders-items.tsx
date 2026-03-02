import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { type InventoryBatch } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QuantityStepper } from '@/components/quantity-stepper'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/date-picker'
import { formatCurrency, normalizeNumber } from '@/lib/utils'
import { type OrderItem } from '../data/types'
import { type ProductUnit } from '@/services/supabase/database/repo/productsRepo'

type PurchaseOrdersItemsProps = {
  items: OrderItem[]
  onUpdateItem: (itemId: string, next: Partial<OrderItem>) => void
  onRemoveItem: (itemId: string) => void
  batchesByProductId: Record<string, InventoryBatch[]>
  readOnly?: boolean
}

const renderUnitLabel = (unit: ProductUnit) => `${unit.unit_name}`
const toDateInputValue = (value?: string | null) => {
  if (!value) return ''
  if (value.length >= 10) return value.slice(0, 10)
  return value
}
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
  batchesByProductId,
  readOnly = false,
}: PurchaseOrdersItemsProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [batchCode, setBatchCode] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeItemId) ?? null,
    [activeItemId, items]
  )

  const activeBatches = useMemo(() => {
    if (!activeItem) return []
    return batchesByProductId[activeItem.product.id] ?? []
  }, [activeItem, batchesByProductId])

  const matchedBatch = useMemo(() => {
    const code = batchCode.trim()
    if (!code) return null
    return activeBatches.find((batch) => batch.batch_code === code) ?? null
  }, [activeBatches, batchCode])

  const expirySelected = useMemo(() => {
    if (!expiryDate) return undefined
    const parsed = new Date(expiryDate)
    if (Number.isNaN(parsed.getTime())) return undefined
    return parsed
  }, [expiryDate])

  const isExpiryLocked = Boolean(matchedBatch?.expiry_date)

  useEffect(() => {
    if (!activeItem) return
    setBatchCode(activeItem.batchCode ?? '')
    setExpiryDate(toDateInputValue(activeItem.expiryDate ?? ''))
  }, [activeItem])

  useEffect(() => {
    if (!matchedBatch) return
    if (matchedBatch.expiry_date) {
      setExpiryDate(toDateInputValue(matchedBatch.expiry_date))
    }
  }, [matchedBatch])

  const handleSaveBatch = () => {
    if (readOnly) return
    if (!activeItem) return
    onUpdateItem(activeItem.id, {
      batchCode: batchCode.trim(),
      expiryDate: expiryDate.trim(),
    })
    setActiveItemId(null)
  }
  return (
    <div className='flex h-full flex-col rounded-xl border bg-card shadow-sm'>
      <ScrollArea className='flex-1'>
        <div className='p-4'>
          <Table className='table-fixed w-full'>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[5%]'>No</TableHead>
                <TableHead className='w-[25%]'>Tên sản phẩm</TableHead>
                <TableHead className='w-[10%]'>Đơn vị</TableHead>
                <TableHead className='w-[14%] text-end'>Đơn giá</TableHead>
                <TableHead className='w-[18%] text-center'>Số lượng</TableHead>
                <TableHead className='w-[16%] text-end'>Thành tiền</TableHead>
                <TableHead className='w-[6%] text-end' />
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
                                size='sm'
                                className='h-6 px-2 text-xs'
                                onClick={() => {
                                  if (readOnly) return
                                  setActiveItemId(item.id)
                                }}
                                disabled={readOnly}
                              >
                                Đổi lô
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
                        <Input
                          value={formatCurrency(item.unitPrice)}
                          onChange={(event) => {
                            if (readOnly) return
                            onUpdateItem(item.id, {
                              unitPrice: normalizeNumber(event.target.value),
                            })
                          }}
                          className='h-8 w-full rounded-full text-end text-xs'
                          disabled={readOnly}
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
      <Dialog
        open={!!activeItemId && !readOnly}
        onOpenChange={(open) => {
          if (!open) {
            setActiveItemId(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chọn lô sản phẩm</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='batch-code'>Lô</Label>
              <Input
                id='batch-code'
                value={batchCode}
                onChange={(event) => {
                  if (readOnly) return
                  setBatchCode(event.target.value)
                }}
                placeholder='Nhập hoặc chọn lô'
                disabled={readOnly}
              />
              {activeBatches.length > 0 ? (
                <div className='flex flex-wrap gap-2'>
                  {activeBatches.map((batch) => (
                    <Button
                      key={batch.id}
                      type='button'
                      variant={batch.batch_code === batchCode.trim() ? 'default' : 'outline'}
                      size='sm'
                      className='h-7 px-3 text-xs'
                      onClick={() => {
                        if (readOnly) return
                        setBatchCode(batch.batch_code)
                        setExpiryDate(toDateInputValue(batch.expiry_date))
                      }}
                      disabled={readOnly}
                    >
                      {batch.batch_code}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className='text-xs text-muted-foreground'>Chưa có lô tồn kho.</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='expiry-date'>Hạn sử dụng</Label>
              <DatePicker
                selected={expirySelected}
                onSelect={(date) => {
                  if (readOnly) return
                  if (isExpiryLocked) return
                  if (!date) {
                    setExpiryDate('')
                    return
                  }
                  setExpiryDate(format(date, 'yyyy-MM-dd'))
                }}
                placeholder='Chọn hạn sử dụng'
                className='w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
                disabled={isExpiryLocked || readOnly}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setActiveItemId(null)}
            >
              Hủy
            </Button>
            <Button type='button' onClick={handleSaveBatch} disabled={readOnly}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
