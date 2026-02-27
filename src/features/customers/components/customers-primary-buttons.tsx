import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomers } from './customers-provider'

export function CustomersPrimaryButtons() {
  const { setOpen } = useCustomers()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm khách hàng</span> <UserPlus size={18} />
    </Button>
  )
}
