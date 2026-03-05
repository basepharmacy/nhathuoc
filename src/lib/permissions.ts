import type { Enums } from '@/services/supabase/database.types'

export type StaffRole = Enums<'staff_role'>

export type Permission = 'full' | 'view' | 'none'

export type Feature =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'purchase'
  | 'settings'

/**
 * Ma trận quyền:
 * - OWNER: toàn quyền
 * - MANAGER: full quản lý, view thiết lập, full tất cả location
 * - STAFF: full bán hàng, view sản phẩm, none nhập hàng & thiết lập, chỉ location của mình
 */
const PERMISSIONS: Record<Feature, Record<StaffRole, Permission>> = {
  dashboard: { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  sales: { OWNER: 'full', MANAGER: 'full', STAFF: 'full' },
  products: { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  purchase: { OWNER: 'full', MANAGER: 'full', STAFF: 'none' },
  settings: { OWNER: 'full', MANAGER: 'view', STAFF: 'none' },
}

/**
 * Map route path segments to features.
 * Matches the first segment of the pathname (e.g. /sale-orders → sales)
 */
const ROUTE_FEATURE_MAP: Record<string, Feature> = {
  '/': 'dashboard',
  '/sale-orders': 'sales',
  '/customers': 'products',
  '/categories': 'products',
  '/products': 'products',
  '/inventory': 'products',
  '/suppliers': 'purchase',
  '/purchase-orders': 'purchase',
  '/locations': 'settings',
  '/staffs': 'settings',
  '/bank-accounts': 'settings',
}

export function getPermission(role: StaffRole, feature: Feature): Permission {
  return PERMISSIONS[feature]?.[role] ?? 'none'
}

export function canView(role: StaffRole, feature: Feature): boolean {
  return getPermission(role, feature) !== 'none'
}

export function canEdit(role: StaffRole, feature: Feature): boolean {
  return getPermission(role, feature) === 'full'
}

export function getLocationScope(role: StaffRole): 'all' | 'own' {
  return role === 'STAFF' ? 'own' : 'all'
}

/**
 * Resolve a pathname (e.g. /staffs, /sale-orders/history) to a Feature.
 * Tries exact match first, then prefix match on first segment.
 */
export function getFeatureFromPath(pathname: string): Feature | null {
  // Exact match
  if (pathname in ROUTE_FEATURE_MAP) {
    return ROUTE_FEATURE_MAP[pathname]
  }
  // Prefix match: /sale-orders/history → /sale-orders
  const prefix = '/' + pathname.split('/').filter(Boolean)[0]
  return ROUTE_FEATURE_MAP[prefix] ?? null
}

export function canAccessRoute(role: StaffRole, pathname: string): boolean {
  const feature = getFeatureFromPath(pathname)
  if (!feature) return true // unknown routes are allowed (e.g. /settings/appearance)
  return canView(role, feature)
}
