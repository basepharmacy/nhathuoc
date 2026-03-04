import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStaff } from './staff-provider'

export function StaffPrimaryButtons() {
  const { setOpen } = useStaff()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm nhân viên</span> <UserPlus size={18} />
    </Button>
  )
}
