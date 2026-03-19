import type { Enums } from '@/services/supabase/database.types'

export type StaffRole = Enums<'staff_role'>

export type Permission = 'full' | 'view' | 'none'

export type Feature =
  // Truy cập nhanh
  | 'dashboard'
  // Bán hàng
  | 'sale_orders'
  | 'customers'
  | 'sale_orders_history'
  // Sản phẩm
  | 'categories'
  | 'products'
  | 'inventory'
  | 'stock_adjustments'
  // Nhập hàng
  | 'purchase_orders'
  | 'suppliers'
  | 'purchase_orders_history'
  | 'supplier_payments'
  // Thiết lập
  | 'locations'
  | 'staffs'
  | 'bank_accounts'
  | 'data_migration'

/**
 * Ma trận quyền:
 * - OWNER: toàn quyền (trừ suppliers: view, supplier_payments: none)
 * - MANAGER: full quản lý, view thiết lập, full tất cả location
 * - STAFF: full bán hàng, view sản phẩm & khách hàng, none nhập hàng & thiết lập, chỉ location của mình
 */
const PERMISSIONS: Record<Feature, Record<StaffRole, Permission>> = {
  // Truy cập nhanh
  dashboard:              { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  // Bán hàng
  sale_orders:            { OWNER: 'full', MANAGER: 'full', STAFF: 'full' },
  customers:              { OWNER: 'full', MANAGER: 'full', STAFF: 'full' },
  sale_orders_history:    { OWNER: 'full', MANAGER: 'full', STAFF: 'full' },
  // Sản phẩm
  categories:             { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  products:               { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  inventory:              { OWNER: 'full', MANAGER: 'full', STAFF: 'view' },
  stock_adjustments:      { OWNER: 'full', MANAGER: 'full', STAFF: 'none' },
  // Nhập hàng
  purchase_orders:        { OWNER: 'full', MANAGER: 'full', STAFF: 'none' },
  suppliers:              { OWNER: 'full', MANAGER: 'view', STAFF: 'none' },
  purchase_orders_history:{ OWNER: 'full', MANAGER: 'full', STAFF: 'none' },
  supplier_payments:      { OWNER: 'full', MANAGER: 'none', STAFF: 'none' },
  // Thiết lập
  locations:              { OWNER: 'full', MANAGER: 'view', STAFF: 'none' },
  staffs:                 { OWNER: 'full', MANAGER: 'view', STAFF: 'none' },
  bank_accounts:          { OWNER: 'full', MANAGER: 'view', STAFF: 'none' },
  data_migration:         { OWNER: 'full', MANAGER: 'none', STAFF: 'none' },
}

/**
 * Map route path segments to features.
 * Matches the first segment of the pathname (e.g. /sale-orders → sales)
 */
const ROUTE_FEATURE_MAP: Record<string, Feature> = {
  '/': 'dashboard',
  // Bán hàng
  '/sale-orders': 'sale_orders',
  '/sale-orders/history': 'sale_orders_history',
  '/customers': 'customers',
  // Sản phẩm
  '/categories': 'categories',
  '/products': 'products',
  '/inventory': 'inventory',
  '/inventory/adjustments': 'stock_adjustments',
  // Nhập hàng
  '/purchase-orders': 'purchase_orders',
  '/purchase-orders/history': 'purchase_orders_history',
  '/suppliers': 'suppliers',
  '/supplier-payments': 'supplier_payments',
  // Thiết lập
  '/locations': 'locations',
  '/staffs': 'staffs',
  '/bank-accounts': 'bank_accounts',
  '/data-migration': 'data_migration',
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
 * Tries longest match first (e.g. /inventory/adjustments before /inventory).
 */
export function getFeatureFromPath(pathname: string): Feature | null {
  // Try longest prefix match first
  const sortedRoutes = Object.keys(ROUTE_FEATURE_MAP).sort(
    (a, b) => b.length - a.length
  )
  for (const route of sortedRoutes) {
    if (pathname === route || pathname.startsWith(route + '/')) {
      return ROUTE_FEATURE_MAP[route]
    }
  }
  return null
}

export function canAccessRoute(role: StaffRole, pathname: string): boolean {
  const feature = getFeatureFromPath(pathname)
  if (!feature) return true // unknown routes are allowed
  return canView(role, feature)
}
