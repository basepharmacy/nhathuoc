import { type Customer } from '@/features/customers/data/schema'
import { CustomerActions } from './customer-actions'

type CustomerHeaderProps = {
  customer: Customer | null
}

export function CustomerHeader({ customer }: CustomerHeaderProps) {
  return (
    <div className='flex w-full flex-wrap items-center gap-4'>
      <div className='flex min-w-0 items-center gap-3'>
        <h2 className='truncate text-xl font-bold tracking-tight sm:text-2xl'>
          {customer?.name ?? 'Khách hàng'}
        </h2>
      </div>
      <div className='ms-auto'>
        <CustomerActions customer={customer} />
      </div>
    </div>
  )
}
