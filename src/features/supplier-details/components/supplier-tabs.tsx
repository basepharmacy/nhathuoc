import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/features/purchase-orders/data/utils'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type SupplierPayment } from '@/services/supabase/database/repo/supplierPaymentsRepo'

type SupplierTabsProps = {
  orders: PurchaseOrderWithRelations[]
  payments: SupplierPayment[]
}

const orderStatusLabels: Record<PurchaseOrderWithRelations['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ORDERED': 'Đã đặt',
  '3_CHECKING': 'Đang kiểm',
  '4_STORED': 'Đã nhập kho',
  '9_CANCELLED': 'Đã hủy',
}

const formatDateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export function SupplierTabs({ orders, payments }: SupplierTabsProps) {
  return (
    <Tabs defaultValue='payments' className='gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <TabsList>
          <TabsTrigger value='payments'>Thanh toán</TabsTrigger>
          <TabsTrigger value='orders'>Lịch sử đặt hàng</TabsTrigger>
        </TabsList>
        <Button size='sm'>Thanh toán</Button>
      </div>

      <TabsContent value='payments'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã thanh toán</TableHead>
                  <TableHead>Ngày thanh toán</TableHead>
                  <TableHead>Số tiền thanh toán</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center text-muted-foreground'>
                      Chưa có dữ liệu thanh toán.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.reference_code ?? payment.id}</TableCell>
                      <TableCell>{formatDateLabel(payment.payment_date)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}đ</TableCell>
                      <TableCell>{payment.note ?? '—'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='orders'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center text-muted-foreground'>
                      Chưa có lịch sử đặt hàng.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const totalAmount = order.total_amount ?? 0
                    const discount = order.discount ?? 0
                    return (
                      <TableRow key={order.id}>
                        <TableCell>{order.purchase_order_code}</TableCell>
                        <TableCell>{formatDateLabel(order.issued_at ?? order.created_at)}</TableCell>
                        <TableCell>
                          {formatCurrency(Math.max(0, totalAmount - discount))}đ
                        </TableCell>
                        <TableCell>{orderStatusLabels[order.status] ?? '—'}</TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
