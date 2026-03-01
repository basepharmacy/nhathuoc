import { AlertTriangle, BadgeCheck, ClipboardList, Receipt } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { type SupplierSummary } from '../data/schema'

type SupplierSummaryCardsProps = {
  summary: SupplierSummary
}

export function SupplierSummaryCards({ summary }: SupplierSummaryCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng số đơn hàng</CardDescription>
          <CardTitle className='text-2xl'>{summary.totalOrders}</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <ClipboardList className='size-4' />
            <span className='text-sm'>Đơn nhập hàng</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng tiền đặt hàng</CardDescription>
          <CardTitle className='text-2xl'>
            {formatCurrency(summary.totalAmount, {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Receipt className='size-4' />
            <span className='text-sm'>Giá trị đơn</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Đã thanh toán</CardDescription>
          <CardTitle className='text-2xl'>
            {formatCurrency(summary.totalPaid, {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <BadgeCheck className='size-4 text-emerald-500' />
            <span className='text-sm'>Đã tất toán</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Ghi nợ</CardDescription>
          <CardTitle className='text-2xl'>
            {formatCurrency(summary.totalDebt, {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <AlertTriangle className='size-4 text-rose-500' />
            <span className='text-sm'>Còn nợ</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
