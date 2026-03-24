import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLocationsQueryOptions } from '@/client/queries'
import {
  BarChart3,
  Box,
  Boxes,
  Building2,
  ClipboardList,
  Database,
  Folder,
  MapPin,
  Users,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Warehouse,
  CreditCard,
  Pill,
} from 'lucide-react'
import { type NavGroup, type SidebarData } from '../types'
import { useUser } from '@/client/provider'
import { canView, type Feature, type StaffRole, type TenantType } from '@/lib/permissions'

const staticNavGroups: NavGroup[] = [
  {
    title: 'Truy cập nhanh',
    items: [
      {
        title: 'Tổng hợp',
        url: '/dashboard',
        icon: LayoutDashboard,
        feature: 'dashboard',
      },
      {
        title: 'Bán hàng',
        url: '/sale-orders',
        icon: ShoppingCart,
        feature: 'sale_orders',
      },
      {
        title: 'Tồn kho',
        url: '/inventory',
        icon: Warehouse,
        feature: 'inventory',
      },
      {
        title: 'Nhập hàng',
        url: '/purchase-orders',
        icon: ClipboardList,
        feature: 'purchase_orders',
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        title: 'Bán hàng',
        icon: Truck,
        feature: 'sale_orders',
        items: [
          {
            title: 'Đơn bán hàng',
            url: '/sale-orders',
            icon: ShoppingCart,
            feature: 'sale_orders',
          },
          {
            title: 'Khách hàng',
            url: '/customers',
            icon: Users,
            feature: 'customers',
          },
          {
            title: 'Lịch sử bán hàng',
            url: '/sale-orders/history',
            icon: ClipboardList,
            feature: 'sale_orders_history',
          },
        ],
      },
      {
        title: 'Sản phẩm',
        icon: Boxes,
        feature: 'products',
        items: [
          {
            title: 'Quản lý danh mục',
            url: '/categories',
            icon: Folder,
            feature: 'categories',
          },
          {
            title: 'Quản lý sản phẩm',
            url: '/products',
            icon: Box,
            feature: 'products',
          },
          {
            title: 'Quản lý tồn kho',
            url: '/inventory',
            icon: Warehouse,
            feature: 'inventory',
          },
          {
            title: 'Điều chỉnh tồn kho',
            url: '/inventory/adjustments',
            icon: Warehouse,
            feature: 'stock_adjustments',
          },
        ],
      },
      {
        title: 'Nhập hàng',
        icon: Truck,
        feature: 'purchase_orders',
        items: [
          {
            title: 'Nhập hàng',
            url: '/purchase-orders',
            icon: ClipboardList,
            feature: 'purchase_orders',
          },
          {
            title: 'Nhà cung cấp',
            url: '/suppliers',
            icon: Building2,
            feature: 'suppliers',
          },
          {
            title: 'Lịch sử nhập hàng',
            url: '/purchase-orders/history',
            icon: ClipboardList,
            feature: 'purchase_orders_history',
          },
          {
            title: 'Thanh toán',
            url: '/supplier-payments/history',
            icon: CreditCard,
            feature: 'supplier_payments',
          },
        ],
      },
    ],
  },
  {
    title: 'Thiết lập',
    items: [
      {
        title: 'Quản lý cửa hàng',
        url: '/locations',
        icon: MapPin,
        feature: 'locations',
      },
      {
        title: 'Quản lý nhân viên',
        url: '/staffs',
        icon: Users,
        feature: 'staffs',
      },
      {
        title: 'Tài khoản thanh toán',
        url: '/bank-accounts',
        icon: BarChart3,
        feature: 'bank_accounts',
      },
      {
        title: 'Chuyển đổi dữ liệu',
        url: '/data-migration',
        icon: Database,
        feature: 'data_migration',
      },
      {
        title: 'Danh sách thuốc BYT',
        url: '/product-masters',
        icon: Pill,
        feature: 'product_masters',
      },
    ],
  },
]

/** Features cần gắn badge "PRO" khi tenant là gói 1_NORMAL */
const PRO_BADGE_FEATURES: Feature[] = ['locations', 'staffs']

function filterNavByRole(navGroups: NavGroup[], role: StaffRole, tenantType?: TenantType): NavGroup[] {
  const isNormal = tenantType === '1_NORMAL'

  return navGroups
    .map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          const feature = item.feature as Feature | undefined
          if (feature && !canView(role, feature, tenantType)) return null

          const badge = isNormal && feature && PRO_BADGE_FEATURES.includes(feature) ? 'PRO' : item.badge

          // Filter sub-items by their own feature
          if (item.items) {
            const filteredSubItems = item.items.filter((sub) => {
              const subFeature = (sub as { feature?: Feature }).feature
              if (!subFeature) return true
              return canView(role, subFeature, tenantType)
            })
            if (filteredSubItems.length === 0) return null
            return { ...item, badge, items: filteredSubItems }
          }

          return { ...item, badge }
        })
        .filter(Boolean) as NavGroup['items'],
    }))
    .filter((group) => group.items.length > 0)
}

export function useSidebarData(): SidebarData {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const role = (user?.profile?.role as StaffRole) ?? 'STAFF'
  const tenantType = (user?.tenant?.type as TenantType) ?? '1_NORMAL'

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return useMemo(
    () => ({
      user: {
        name: user?.profile?.name || 'Người dùng',
        role,
        avatar: '/avatars/shadcn.jpg',
      },
      locations,
      navGroups: filterNavByRole(staticNavGroups, role, tenantType),
    }),
    [user, locations, role, tenantType]
  )
}
