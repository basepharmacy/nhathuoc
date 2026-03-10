import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type Supplier } from '@/features/suppliers/data/schema'

type SupplierInfoCardProps = {
  supplier: Supplier
}

export function SupplierInfoCard({ supplier }: SupplierInfoCardProps) {
  return (
    <Card className='gap-4'>
      <CardContent className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-2'>
          <div>
            <p className='text-sm text-muted-foreground'>Tên</p>
            <p className='font-medium'>{supplier.name}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Số điện thoại</p>
            <p className='font-medium'>{supplier.phone ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Người đại diện</p>
            <p className='font-medium'>{supplier.representative ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Địa chỉ</p>
            <p className='font-medium'>{supplier.address ?? '—'}</p>
          </div>
        </div>
        <Separator />
        <div>
          <p className='text-sm text-muted-foreground'>Mô tả</p>
          <p className='text-sm leading-relaxed'>
            {supplier.description ?? '—'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
