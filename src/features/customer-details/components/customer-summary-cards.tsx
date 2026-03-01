import { ClipboardList, Receipt } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type CustomerSummary } from '../data/schema'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

type CustomerSummaryCardsProps = {
  summary: CustomerSummary
}

export function CustomerSummaryCards({ summary }: CustomerSummaryCardsProps) {
  return (
    <div className='mx-auto grid w-full max-w-3xl gap-4 md:grid-cols-2'>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng số đơn hàng</CardDescription>
          <CardTitle className='text-2xl'>{summary.totalOrders}</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <ClipboardList className='size-4' />
            <span className='text-sm'>Đơn bán hàng</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng tiền bán hàng</CardDescription>
          <CardTitle className='text-2xl'>
            {formatCurrency(summary.totalAmount)}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Receipt className='size-4' />
            <span className='text-sm'>Giá trị đơn</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
