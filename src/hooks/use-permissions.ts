import { useCallback } from 'react'
import { useUser } from '@/client/provider'
import {
  canView,
  canEdit,
  getLocationScope,
  type Feature,
  type StaffRole,
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useUser()
  const role: StaffRole = (user?.profile?.role as StaffRole) ?? 'STAFF'

  return {
    role,
    locationScope: getLocationScope(role),
    canView: useCallback((feature: Feature) => canView(role, feature), [role]),
    canEdit: useCallback((feature: Feature) => canEdit(role, feature), [role]),
  }
}
