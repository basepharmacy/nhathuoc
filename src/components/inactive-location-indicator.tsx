import { PauseCircle } from 'lucide-react'
import { useLocationContext } from '@/context/location-provider'

export function InactiveLocationIndicator() {
  const { selectedLocation } = useLocationContext()

  if (selectedLocation?.status !== '2_INACTIVE') return null

  return (
    <div className='sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm dark:bg-amber-600'>
      <PauseCircle className='h-4 w-4 shrink-0' />
      <span>
        Chi nhánh <strong>{selectedLocation.name}</strong> đang ngừng hoạt động — Chỉ xem, không thể thao tác
      </span>
    </div>
  )
}
