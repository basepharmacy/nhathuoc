import { useEffect, useMemo, useState } from 'react'
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
import { usePermissions } from '@/hooks/use-permissions'
import { useUser } from '@/client/provider'
import type { Location } from '@/services/supabase/'

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
  const { role } = usePermissions()
  const { user } = useUser()

  const currentLocation = locations.find((l) => l.id === locationId)
  useEffect(() => {
    if (currentLocation?.status === '2_INACTIVE') {
      onLocationChange('')
    }
  }, [currentLocation, onLocationChange])

  const isStaff = role === 'STAFF'
  const filteredLocations = useMemo(() => {
    if (isStaff && user?.location) {
      return locations.filter((l) => l.id === user.location!.id)
    }
    return locations
  }, [locations, isStaff, user?.location])

  const handleValueChange = (value: string) => {
    const location = filteredLocations.find((l) => l.id === value)
    if (location?.status === '2_INACTIVE') {
      setInactiveAlertOpen(true)
      return
    }
    onLocationChange(value)
  }

  return (
    <>
      <Select value={locationId} onValueChange={handleValueChange} disabled={disabled || isStaff}>
        <SelectTrigger className='h-8 min-w-[180px] rounded-full'>
          <SelectValue placeholder='Chọn chi nhánh' />
        </SelectTrigger>
        <SelectContent>
          {filteredLocations.map((location) => {
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
