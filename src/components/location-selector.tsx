import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Location } from '@/services/supabase/database/repo/locationsRepo'

type LocationSelectorProps = {
  locations: Location[]
  locationId: string
  onLocationChange: (locationId: string) => void
  disabled?: boolean
}

export function LocationSelector({
  locations,
  locationId,
  onLocationChange,
  disabled = false,
}: LocationSelectorProps) {
  const [inactiveAlertOpen, setInactiveAlertOpen] = useState(false)

  const handleValueChange = (value: string) => {
    const location = locations.find((l) => l.id === value)
    if (location?.status === '2_INACTIVE') {
      setInactiveAlertOpen(true)
      return
    }
    onLocationChange(value)
  }

  return (
    <>
      <Select value={locationId} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className='h-8 min-w-[180px] rounded-full'>
          <SelectValue placeholder='Chọn chi nhánh' />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => {
            const isInactive = location.status === '2_INACTIVE'
            return (
              <SelectItem key={location.id} value={location.id}>
                <span className='flex items-center gap-2'>
                  <span
                    className={`inline-block h-2 w-2 shrink-0 rounded-full ${
                      isInactive ? 'bg-red-500' : 'bg-emerald-500'
                    }`}
                  />
                  {location.name}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <AlertDialog open={inactiveAlertOpen} onOpenChange={setInactiveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chi nhánh đã ngừng hoạt động</AlertDialogTitle>
            <AlertDialogDescription>
              Chi nhánh này đã bị dừng hoạt động và không thể được chọn. Vui lòng chọn chi nhánh
              khác đang hoạt động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInactiveAlertOpen(false)}>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
