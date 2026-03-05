import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Can } from '@/components/permission-guard'
import { useStaff } from './staff-provider'

export function StaffPrimaryButtons() {
  const { setOpen } = useStaff()
  return (
    <Can feature='settings' action='edit'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Thêm nhân viên</span> <UserPlus size={18} />
      </Button>
    </Can>
  )
}
