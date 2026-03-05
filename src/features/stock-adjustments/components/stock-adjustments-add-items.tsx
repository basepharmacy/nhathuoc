import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { getInventoryBatchesQueryOptions } from '@/client/queries'
import { BatchSelectDialog } from '@/features/purchase-orders/components/batch-select-dialog'
import { type AdjustmentItem } from '../data/types'
import { type ProductUnit } from '@/services/supabase/database/repo/productsRepo'
import { ALL_REASON_CODE_OPTIONS } from '../data/reason-code'
import { type StockAdjustmentReasonCode } from '../data/reason-code'

type StockAdjustmentsAddItemsProps = {
  items: AdjustmentItem[]
  onUpdateItem: (itemId: string, next: Partial<AdjustmentItem>) => void
  onRemoveItem: (itemId: string) => void
  tenantId: string
  locationId?: string | null
  pendingBatchItemId: string | null
  onPendingBatchHandled: () => void
}

const renderUnitLabel = (unit: ProductUnit) => `${unit.unit_name}`
const formatDateLabel = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function StockAdjustmentsAddItems({
  items,
  onUpdateItem,
  onRemoveItem,
  tenantId,
  locationId,
  pendingBatchItemId,
  onPendingBatchHandled,
}: StockAdjustmentsAddItemsProps) {
  const [activeItemId, setActiveItemId] = useState<string | null>(null)

  // Fetch inventory batches for all products in the list
  const productIds = useMemo(() => items.map((item) => item.product.id), [items])

  const { data: inventoryBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productIds, locationId),
    enabled: !!tenantId && productIds.length > 0,
  })

  // Build a lookup: productId+batchCode → batch quantity
  const batchQuantityMap = useMemo(() => {
    const map = new Map<string, number>()
    for (const batch of inventoryBatches) {
      const key = `${batch.product_id}::${batch.batch_code}`
      map.set(key, (map.get(key) ?? 0) + batch.quantity)
    }
    return map
  }, [inventoryBatches])

  const getMinQuantity = (item: AdjustmentItem) => {
    if (!item.batchCode.trim()) return 0
    const key = `${item.product.id}::${item.batchCode.trim()}`
    const batchQty = batchQuantityMap.get(key)
    // Existing batch → allow decrease up to batch quantity; new batch → min 0
    return batchQty != null ? -batchQty : 0
  }

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
                <TableHead className='w-[4%]'>No</TableHead>
                <TableHead className='w-[25%]'>Tên sản phẩm</TableHead>
                <TableHead className='w-[10%] text-center'>Đơn vị</TableHead>
                <TableHead className='w-[10%] text-center'>Đơn giá</TableHead>
                <TableHead className='w-[12%] text-center'>Số lượng</TableHead>
                <TableHead className='w-[12%] text-center'>Lý do</TableHead>
                <TableHead className='w-[20%] text-center'>Ghi chú</TableHead>
                <TableHead className='w-[4%] text-end' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center text-sm text-muted-foreground'>
                    Chưa có sản phẩm. Hãy tìm kiếm để thêm.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const unitOptions = item.product.product_units ?? []
                  const isDecrease = item.quantity < 0
                  return (
                    <TableRow key={item.id} className={isDecrease ? 'bg-red-50 dark:bg-red-950/20' : undefined}>
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
                              <span>Tồn kho: {batchQuantityMap.get(`${item.product.id}::${item.batchCode.trim()}`) ?? 0}</span>
                              <Button
                                type='button'
                                variant='ghost'
                                size='icon'
                                className='h-5 w-5'
                                onClick={() => setActiveItemId(item.id)}
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
                              onClick={() => setActiveItemId(item.id)}
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
                            const selectedUnit = unitOptions.find((unit) => unit.id === value)
                            onUpdateItem(item.id, {
                              productUnitId: value,
                              costPrice: selectedUnit?.cost_price ?? item.costPrice,
                            })
                          }}
                        >
                          <SelectTrigger className='h-8 w-full rounded-full text-xs'>
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
                          value={formatCurrency(item.costPrice, { clampZero: false })}
                          onChange={(e) =>
                            onUpdateItem(item.id, { costPrice: normalizeNumber(e.target.value) })
                          }
                          className='h-8 w-full rounded-full text-end text-xs'
                          inputMode='numeric'
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => onUpdateItem(item.id, { quantity: qty })}
                          min={getMinQuantity(item)}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <Select
                          value={item.reasonCode}
                          onValueChange={(value) =>
                            onUpdateItem(item.id, { reasonCode: value as StockAdjustmentReasonCode })
                          }
                        >
                          <SelectTrigger className='h-8 w-full rounded-full text-xs'>
                            <SelectValue placeholder='Chọn lý do' />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_REASON_CODE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <Input
                          value={item.reason}
                          onChange={(e) =>
                            onUpdateItem(item.id, { reason: e.target.value })
                          }
                          placeholder='Ghi chú...'
                          className='h-8 w-full rounded-full text-xs'
                          autoComplete='off'
                        />
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
      <BatchSelectDialog
        title={activeItem ? `Chọn lô - ${activeItem.product.product_name}` : 'Chọn lô sản phẩm'}
        initialBatchCode={activeItem?.batchCode ?? ''}
        initialExpiryDate={activeItem?.expiryDate ?? ''}
        productId={activeItem?.product.id ?? ''}
        tenantId={tenantId}
        locationId={locationId}
        open={!!activeItemId}
        onOpenChange={(open) => {
          if (!open) setActiveItemId(null)
        }}
        onSave={(batchCode, expiryDate) => {
          if (!activeItemId) return
          onUpdateItem(activeItemId, { batchCode, expiryDate })
          setActiveItemId(null)
        }}
      />
    </div>
  )
}
