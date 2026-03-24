import { useCallback } from 'react'
import { useUser } from '@/client/provider'
import {
  canView,
  canEdit,
  getLocationScope,
  type Feature,
  type StaffRole,
  type TenantType,
} from '@/lib/permissions'

export function usePermissions() {
  const { user } = useUser()
  const role: StaffRole = (user?.profile?.role as StaffRole) ?? 'STAFF'
  const tenantType = (user?.tenant?.type as TenantType) ?? '1_NORMAL'

  return {
    role,
    tenantType,
    locationScope: getLocationScope(role),
    canView: useCallback((feature: Feature) => canView(role, feature, tenantType), [role, tenantType]),
    canEdit: useCallback((feature: Feature) => canEdit(role, feature, tenantType), [role, tenantType]),
  }
}
