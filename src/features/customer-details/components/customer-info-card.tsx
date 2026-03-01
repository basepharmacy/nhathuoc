import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type Customer } from '@/features/customers/data/schema'

type CustomerInfoCardProps = {
  customer: Customer
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
  return (
    <Card className='gap-4'>
      <CardHeader className='pb-2'>
        <CardTitle>Thông tin khách hàng</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <p className='text-sm text-muted-foreground'>Tên</p>
            <p className='font-medium'>{customer.name}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Số điện thoại</p>
            <p className='font-medium'>{customer.phone ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Địa chỉ</p>
            <p className='font-medium'>{customer.address ?? '—'}</p>
          </div>
        </div>
        <Separator />
        <div>
          <p className='text-sm text-muted-foreground'>Mô tả</p>
          <p className='text-sm leading-relaxed'>{customer.description ?? '—'}</p>
        </div>
      </CardContent>
    </Card>
  )
}
