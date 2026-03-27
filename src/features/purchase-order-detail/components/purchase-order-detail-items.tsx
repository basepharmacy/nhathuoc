import { useMemo, useState } from 'react'
import { SquarePen } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import type { PurchaseOrderItemWithRelation } from '@/services/supabase/database/model'
import { UnitPriceInput } from '@/components/unit-price-input'
import { BatchSelectDialog } from '@/features/purchase-orders/components/batch-select-dialog'

const formatDateLabel = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

type PurchaseOrderDetailItemsProps = {
  items: PurchaseOrderItemWithRelation[]
  tenantId: string
  locationId?: string | null
  isOrdered: boolean
  onBatchSave: (itemId: number, productId: string, batchCode: string, expiryDate: string) => void
}

export function PurchaseOrderDetailItems({
  items,
  tenantId,
  locationId,
  isOrdered,
  onBatchSave,
}: PurchaseOrderDetailItemsProps) {
  const [activeItemId, setActiveItemId] = useState<number | null>(null)

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
                <TableHead className='w-[35%]'>Tên sản phẩm</TableHead>
                <TableHead className='w-[15%] text-center'>Đơn vị</TableHead>
                <TableHead className='w-[15%] text-end'>Đơn giá</TableHead>
                <TableHead className='w-[10%] text-center'>Số lượng</TableHead>
                <TableHead className='w-[20%] text-end'>Thành tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center text-sm text-muted-foreground'>
                    Không có sản phẩm.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const lineTotal = item.quantity * item.unit_price - (item.discount ?? 0)

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
                          {item.batch_code ? (
                            <>
                              <span>Lô: {item.batch_code}</span>
                              {item.expiry_date ? (
                                <span>HSD: {formatDateLabel(item.expiry_date)}</span>
                              ) : null}
                              {isOrdered && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='h-5 w-5'
                                  onClick={() => setActiveItemId(item.id)}
                                >
                                  <SquarePen className='h-3 w-3' />
                                </Button>
                              )}
                            </>
                          ) : isOrdered ? (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              className='h-6 px-2 text-xs'
                              onClick={() => setActiveItemId(item.id)}
                            >
                              Chọn lô
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className='align-middle text-center text-sm'>
                        {item.product_unit?.unit_name ?? '—'}
                      </TableCell>
                      <TableCell className='align-middle text-end text-sm'>
                        <UnitPriceInput
                          originalPrice={item.unit_price + (item.discount ?? 0)}
                          value={item.unit_price}
                          disabled={true}
                          onChange={() => { }}
                        />
                      </TableCell>
                      <TableCell className='align-middle text-center text-sm font-medium'>
                        {item.quantity}
                      </TableCell>
                      <TableCell className='align-middle text-end text-sm font-semibold text-foreground'>
                        {formatCurrency(lineTotal)}đ
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
        initialBatchCode={activeItem?.batch_code ?? ''}
        initialExpiryDate={activeItem?.expiry_date ?? ''}
        productId={activeItem?.product.id ?? ''}
        tenantId={tenantId}
        locationId={locationId}
        open={!!activeItemId && isOrdered}
        onOpenChange={(open) => {
          if (!open) setActiveItemId(null)
        }}
        onSave={(batchCode, expiryDate) => {
          if (!activeItem) return
          onBatchSave(activeItem.id, activeItem.product.id, batchCode, expiryDate)
          setActiveItemId(null)
        }}
      />
    </div>
  )
}
