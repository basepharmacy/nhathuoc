import {
  AudioWaveform,
  BarChart3,
  Box,
  Boxes,
  Building2,
  ClipboardList,
  Command,
  FileText,
  Folder,
  GalleryVerticalEnd,
  LayoutDashboard,
  LineChart,
  ShoppingCart,
  Truck,
  Warehouse,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
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
              url: '/sign-in',
              icon: Folder,
            },
            {
              title: 'Quản lý sản phẩm',
              url: '/forgot-password',
              icon: Box,
            },
            {
              title: 'Quản lý tồn kho',
              url: '/otp',
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
              url: '/errors/unauthorized',
              icon: Building2,
            },
            {
              title: 'Đơn nhập hàng',
              url: '/errors/forbidden',
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
          title: 'Báo cáo bán hàng',
          icon: BarChart3,
          items: [
            {
              title: 'Doanh thu - Lợi nhuận',
              url: '/settings',
              icon: LineChart,
            },
          ],
        },
        {
          title: 'Báo cáo nhập hàng',
          icon: FileText,
          items: [
            {
              title: 'Nhập hàng',
              url: '/settings',
              icon: ClipboardList,
            },
          ],
        },
      ],
    },
  ],
}
