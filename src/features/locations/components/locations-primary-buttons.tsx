import { MapPinPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Can } from '@/components/permission-guard'
import { useLocations } from './locations-provider'

export function LocationsPrimaryButtons() {
  const { setOpen } = useLocations()
  return (
    <Can feature='settings' action='edit'>
      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Thêm cửa hàng</span> <MapPinPlus size={18} />
      </Button>
    </Can>
  )
}
