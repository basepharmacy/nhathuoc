import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useLocationContext } from '@/context/location-provider'
import type { Feature } from '@/lib/permissions'

type CanProps = {
  feature: Feature
  action?: 'view' | 'edit'
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on the user's permission.
 * Edit actions are also blocked when the selected location is inactive (2_INACTIVE).
 *
 * @example
 * <Can feature="staffs" action="edit">
 *   <Button>Thêm nhân viên</Button>
 * </Can>
 */
export function Can({ feature, action = 'view', children, fallback = null }: CanProps) {
  const { canView, canEdit } = usePermissions()
  const { selectedLocation } = useLocationContext()
  const isLocationInactive = selectedLocation?.status === '2_INACTIVE'
  const allowed = action === 'edit'
    ? canEdit(feature) && !isLocationInactive
    : canView(feature)
  return allowed ? <>{children}</> : <>{fallback}</>
}
