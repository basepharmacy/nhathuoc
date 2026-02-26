import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLocationsQueryOptions } from '@/client/queries'
import {
  BarChart3,
  Box,
  Boxes,
  Building2,
  ClipboardList,
  FileText,
  Folder,
  LayoutDashboard,
  LineChart,
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
        url: '/tasks',
        icon: ShoppingCart,
      },
      {
        title: 'Tồn kho',
        url: '/apps',
        icon: Warehouse,
      },
    ],
  },
  {
    title: 'Quản lý',
    items: [
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
            title: 'Quản lý nhà cung cấp',
            url: '/suppliers',
            icon: Building2,
          },
          {
            title: 'Đơn nhập hàng',
            url: '/purchase-orders',
            icon: ClipboardList,
          },
        ],
      },
    ],
  },
  {
    title: 'Báo cáo chi tiết',
    items: [
      {
        title: 'Bán hàng',
        icon: BarChart3,
        items: [
          {
            title: 'Doanh thu - Lợi nhuận',
            url: '/reports/sales',
            icon: LineChart,
          },
        ],
      },
      {
        title: 'Nhập hàng',
        icon: FileText,
        items: [
          {
            title: 'Nhập hàng',
            url: '/reports/purchase',
            icon: ClipboardList,
          },
        ],
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
