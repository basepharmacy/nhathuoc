import { Badge } from '@/components/ui/badge'
import { type Supplier } from '@/features/suppliers/data/schema'
import { PurchasePeriodSelector } from '@/components/purchase-period-selector'

type SupplierHeaderProps = {
  supplier: Supplier | null
  periodId: string
  onPeriodChange: (periodId: string) => void
}

export function SupplierHeader({ supplier, periodId, onPeriodChange }: SupplierHeaderProps) {
  return (
    <div className='flex w-full flex-wrap items-center gap-4'>
      <div className='flex min-w-0 items-center gap-3'>
        <h2 className='truncate text-xl font-bold tracking-tight sm:text-2xl'>
          {supplier?.name ?? 'Nhà cung cấp'}
        </h2>
        {supplier && supplier.is_active !== null && (
          <Badge variant={supplier.is_active ? 'secondary' : 'outline'}>
            {supplier.is_active ? 'Đang giao dịch' : 'Ngừng giao dịch'}
          </Badge>
        )}
      </div>
      <div className='ms-auto flex items-center gap-2'>
        <PurchasePeriodSelector
          periodId={periodId}
          onPeriodChange={onPeriodChange}
        />
      </div>
    </div>
  )
}
