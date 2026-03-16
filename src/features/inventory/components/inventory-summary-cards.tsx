import { Boxes, Coins, Layers, Package } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

const formatQuantity = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value)

type InventorySummaryCardsProps = {
  summary: {
    totalBatches: number
    totalProducts: number
    totalQuantity: number
    totalValue: number
  }
}

export function InventorySummaryCards({ summary }: InventorySummaryCardsProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng số sản phẩm có tồn kho</CardDescription>
          <CardTitle className='text-2xl'>{summary.totalProducts}</CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Package className='size-4' />
            <span className='text-sm'>Sản phẩm đang còn hàng</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng số lượng tồn kho</CardDescription>
          <CardTitle className='text-2xl'>
            {formatQuantity(summary.totalQuantity)}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Boxes className='size-4 text-indigo-500' />
            <span className='text-sm'>Tổng số lượng đang có theo đơn vị cơ bản</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng số lô hàng</CardDescription>
          <CardTitle className='text-2xl'>
            {formatQuantity(summary.totalBatches)}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Layers className='size-4 text-amber-500' />
            <span className='text-sm'>Số lô còn tồn kho hiện tại</span>
          </div>
        </CardContent>
      </Card>
      <Card className='gap-3 py-4'>
        <CardHeader className='px-4 pb-0'>
          <CardDescription>Tổng giá trị tồn kho</CardDescription>
          <CardTitle className='text-2xl'>
            {formatCurrency(summary.totalValue, {
              style: 'currency',
              currency: 'VND',
              maximumFractionDigits: 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent className='px-4 pt-0'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Coins className='size-4 text-emerald-500' />
            <span className='text-sm'>Tính theo giá nhập</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
