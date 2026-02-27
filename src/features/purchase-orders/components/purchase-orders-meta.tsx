import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PurchaseOrdersMetaProps = {
  userName: string
  orderCode: string
}

export function PurchaseOrdersMeta({ userName, orderCode }: PurchaseOrdersMetaProps) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 text-sm'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Người tạo:
          <Button variant='outline' size='sm' className='h-8 gap-1 rounded-full'>
            <span className='font-medium text-foreground'>{userName}</span>
            <ChevronDown className='h-3.5 w-3.5 text-muted-foreground' />
          </Button>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Đơn nhập hàng:
          <span className='font-medium text-foreground'>{orderCode}</span>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          {new Date().toLocaleDateString('vi-VN')}{' '}
          {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>
    </div>
  )
}
