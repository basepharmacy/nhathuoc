import { MapPinPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocations } from './locations-provider'

export function LocationsPrimaryButtons() {
  const { setOpen } = useLocations()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm cửa hàng</span> <MapPinPlus size={18} />
    </Button>
  )
}
