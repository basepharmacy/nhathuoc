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
import { type SidebarData } from '../types'
import { useUser } from '@/client/provider'

const staticNavGroups = [
  {
    title: 'Truy cập nhanh',
    items: [
      {
        title: 'Tổng hợp',
        url: '/',
        icon: LayoutDashboard,
      },
      {
        title: 'Bán hàng',
        url: '/sale-orders',
        icon: ShoppingCart,
      },
      {
        title: 'Tồn kho',
        url: '/inventory',
        icon: Warehouse,
      },
      {
        title: 'Nhập hàng',
        url: '/purchase-orders',
        icon: ClipboardList,
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
      {
        title: 'Bán hàng',
        icon: Truck,
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
        ],
      },
      {
        title: 'Nhập hàng',
        icon: Truck,
        items: [
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
      },
      {
        title: 'Tài khoản thanh toán',
        url: '/bank-accounts',
        icon: BarChart3,
      },
    ],
  },
]

export function useSidebarData(): SidebarData {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return useMemo(
    () => ({
      user: {
        name: user?.profile?.name || 'Người dùng',
        email: user?.email || 'user@example.com',
        avatar: '/avatars/shadcn.jpg',
      },
      locations,
      navGroups: staticNavGroups,
    }),
    [user, locations]
  )
}
