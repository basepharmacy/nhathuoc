import { Button } from '@/components/ui/button'
import { type Customer } from '@/features/customers/data/schema'
import { useCustomers } from '@/features/customers/components/customers-provider'

type CustomerActionsProps = {
  customer: Customer | null
}

export function CustomerActions({ customer }: CustomerActionsProps) {
  const { setOpen, setCurrentRow } = useCustomers()

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Button
        variant='destructive'
        disabled={!customer}
        onClick={() => {
          if (!customer) return
          setCurrentRow(customer)
          setOpen('delete')
        }}
      >
        Xoá
      </Button>
      <Button
        disabled={!customer}
        onClick={() => {
          if (!customer) return
          setCurrentRow(customer)
          setOpen('edit')
        }}
      >
        Chỉnh sửa
      </Button>
    </div>
  )
}
