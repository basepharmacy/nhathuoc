import { memo } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UnitPriceInput } from '@/components/unit-price-input'
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
  const inventoryBatches = useSaleOrderStore((s) => s.inventoryBatches)
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
                  const selectedUnit = unitOptions.find((u) => u.id === item.productUnitId)
                  const originalPrice = selectedUnit?.sell_price ?? item.unitPrice
                  // Giá vốn lấy theo average_cost_price thực tế của lô đang chọn.
                  // average_cost_price là giá vốn trên đơn vị cơ bản, nhân conversion_factor
                  // để quy về đơn vị đang chọn (so sánh đúng với unitPrice).
                  const batch = inventoryBatches.find((b) => b.id === item.batchId)
                  const conversionFactor = selectedUnit?.conversion_factor ?? 1
                  const costPrice =
                    batch?.average_cost_price != null ? batch.average_cost_price * conversionFactor : null
                  const isBelowCost = costPrice != null && costPrice > 0 && item.unitPrice < costPrice
                  const belowCostSpacer = isBelowCost ? (
                    <p className='mt-1 text-xs invisible select-none' aria-hidden='true'>
                      &nbsp;
                    </p>
                  ) : null
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
                        {belowCostSpacer}
                      </TableCell>
                      <TableCell className='align-middle whitespace-normal'>
                        <span className='line-clamp-2 block w-full break-words text-sm font-semibold'>
                          {item.product.product_name}
                        </span>
                        <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
                          {item.batchCode ? <span>Lô: {item.batchCode}</span> : null}
                          <span>HSD: {formatDateLabel(item.expiryDate)}</span>
                          <span>SL: {item.stock}</span>
                        </div>
                        {belowCostSpacer}
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
                        {belowCostSpacer}
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
                        {isBelowCost && (
                          <div className='mt-1 flex items-center justify-center gap-1 text-xs text-destructive'>
                            <AlertTriangle className='h-3 w-3 shrink-0' />
                            <span>Giá bán dưới giá vốn ({formatCurrency(costPrice!)}đ)</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => onQuantityChange(item.id, qty)}
                        />
                        {belowCostSpacer}
                      </TableCell>
                      <TableCell className='align-middle text-end text-sm font-semibold text-foreground'>
                        {formatCurrency(lineTotal)}đ
                        {belowCostSpacer}
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
                        {belowCostSpacer}
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
