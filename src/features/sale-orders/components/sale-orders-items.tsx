import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
                <TableHead className='w-[12%]'>Đơn vị</TableHead>
                <TableHead className='w-[15%] text-end'>Đơn giá</TableHead>
                <TableHead className='w-[12%] text-end'>Số lượng</TableHead>
                <TableHead className='w-[18%] text-end'>Thành tiền</TableHead>
                <TableHead className='w-[8%] text-end' />
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
                        <div className='flex items-center justify-center'>
                          <Input
                            value={item.quantity}
                            onChange={(event) => {
                              if (readOnly) return
                              const nextQuantity = Math.max(1, Number(event.target.value || 1))
                              onQuantityChange(item.id, nextQuantity)
                            }}
                            className='h-7 w-16 rounded-full text-center text-xs'
                            disabled={readOnly}
                          />
                        </div>
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
