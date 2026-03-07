import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLocationsQueryOptions } from '@/client/queries'
import {
  BarChart3,
  Box,
  Boxes,
  Building2,
  ClipboardList,
  Folder,
  MapPin,
  Users,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react'
import { type NavGroup, type SidebarData } from '../types'
import { useUser } from '@/client/provider'
import { canView, type Feature, type StaffRole } from '@/lib/permissions'

const staticNavGroups: NavGroup[] = [
  {
    title: 'Truy cập nhanh',
    items: [
      {
        title: 'Tổng hợp',
        url: '/',
        icon: LayoutDashboard,
        feature: 'dashboard',
      },
      {
        title: 'Bán hàng',
        url: '/sale-orders',
        icon: ShoppingCart,
        feature: 'sales',
      },
      {
        title: 'Tồn kho',
        url: '/inventory',
        icon: Warehouse,
        feature: 'products',
      },
      {
        title: 'Nhập hàng',
        url: '/purchase-orders',
        icon: ClipboardList,
        feature: 'purchase',
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        title: 'Bán hàng',
        icon: Truck,
        feature: 'sales',
        items: [
          {
            title: 'Đơn bán hàng',
            url: '/sale-orders',
            icon: ShoppingCart,
          },
          {
            title: 'Khách hàng',
            url: '/customers',
            icon: Users,
          },
          {
            title: 'Lịch sử bán hàng',
            url: '/sale-orders/history',
            icon: ClipboardList,
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
          },
          {
            title: 'Quản lý sản phẩm',
            url: '/products',
            icon: Box,
          },
          {
            title: 'Quản lý tồn kho',
            url: '/inventory',
            icon: Warehouse,
          },
          {
            title: 'Điều chỉnh tồn kho',
            url: '/inventory/adjustments',
            icon: Warehouse,
          },
        ],
      },
      {
        title: 'Nhập hàng',
        icon: Truck,
        feature: 'purchase',
        items: [
          {
            title: 'Nhập hàng',
            url: '/purchase-orders',
            icon: ClipboardList,
          },
          {
            title: 'Nhà cung cấp',
            url: '/suppliers',
            icon: Building2,
          },
          {
            title: 'Lịch sử nhập hàng',
            url: '/purchase-orders/history',
            icon: ClipboardList,
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
        feature: 'settings',
      },
      {
        title: 'Quản lý nhân viên',
        url: '/staffs',
        icon: Users,
        feature: 'settings',
      },
      {
        title: 'Tài khoản thanh toán',
        url: '/bank-accounts',
        icon: BarChart3,
        feature: 'settings',
      },
    ],
  },
]

function filterNavByRole(navGroups: NavGroup[], role: StaffRole): NavGroup[] {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        const feature = item.feature as Feature | undefined
        if (!feature) return true
        return canView(role, feature)
      }),
    }))
    .filter((group) => group.items.length > 0)
}

export function useSidebarData(): SidebarData {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const role = (user?.profile?.role as StaffRole) ?? 'STAFF'

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
      navGroups: filterNavByRole(staticNavGroups, role),
    }),
    [user, locations, role]
  )
}
