import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'
import type { Location } from '@/services/supabase/database/repo/locationsRepo'

type LocationSelectProps = {
  locations: Location[]
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function LocationSelect({
  locations,
  value,
  onValueChange,
  disabled = false,
  className,
}: LocationSelectProps) {
  const [inactiveWarningOpen, setInactiveWarningOpen] = useState(false)
  const [pendingLocationName, setPendingLocationName] = useState('')

  const handleValueChange = (locationId: string) => {
    const location = locations.find((l) => l.id === locationId)
    if (location?.status === '2_INACTIVE') {
      setPendingLocationName(location.name)
      setInactiveWarningOpen(true)
      return
    }
    onValueChange(locationId)
  }

  return (
    <>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className={className ?? 'h-8 min-w-[180px] rounded-full'}>
          <SelectValue placeholder='Chọn chi nhánh' />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              <span className='flex items-center gap-2'>
                {location.status === '2_INACTIVE' && (
                  <span className='inline-block size-2 shrink-0 rounded-full bg-red-500' />
                )}
                {location.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AlertDialog open={inactiveWarningOpen} onOpenChange={setInactiveWarningOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Chi nhánh đang ngừng hoạt động</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingLocationName}</strong> đang ngừng hoạt động, không thể thực hiện
              thao tác tại chi nhánh này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Đã hiểu</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
