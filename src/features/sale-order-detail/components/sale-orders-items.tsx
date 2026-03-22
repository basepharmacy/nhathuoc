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
import { SaleOrderItemWithRelation } from '@/services/supabase'

type SaleOrdersItemsProps = {
  items: SaleOrderItemWithRelation[]
}

export function SaleOrdersItems({
  items
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className='h-21 text-center text-sm text-muted-foreground'>
                    Không có sản phẩm nào trong đơn hàng.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const lineTotal = item.quantity * item.unit_price
                  return (
                    <TableRow
                      key={item.id}
                      className={'cursor-pointer'}
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
                          {item.batch.batch_code ? <span>Lô: {item.batch.batch_code}</span> : null}
                          {item.batch.expiry_date ? (
                            <span>HSD: {formatDateLabel(item.batch.expiry_date)}</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <span className='text-sm'>
                          {item.product_unit?.unit_name}
                        </span>
                      </TableCell>
                      <TableCell className='align-middle'>
                        <UnitPriceInput
                          originalPrice={item.unit_price + item.discount}
                          onChange={() => { }}
                          value={item.unit_price}
                          disabled={true}
                        />
                      </TableCell>
                      <TableCell className='align-middle'>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={() => { }}
                          disabled={true}
                        />
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
    </div>
  )
}
