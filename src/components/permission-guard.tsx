import type { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import type { Feature } from '@/lib/permissions'

type CanProps = {
  feature: Feature
  action?: 'view' | 'edit'
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Conditionally renders children based on the user's permission.
 *
 * @example
 * <Can feature="settings" action="edit">
 *   <Button>Thêm nhân viên</Button>
 * </Can>
 */
export function Can({ feature, action = 'view', children, fallback = null }: CanProps) {
  const { canView, canEdit } = usePermissions()
  const allowed = action === 'edit' ? canEdit(feature) : canView(feature)
  return allowed ? <>{children}</> : <>{fallback}</>
}
