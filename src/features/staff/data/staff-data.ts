import { Crown, ShieldCheck, User } from 'lucide-react'

export const roles = [
  {
    label: 'Chủ hệ thống',
    value: 'OWNER',
    icon: Crown,
    description:
      'Toàn quyền trên tất cả tính năng, bao gồm thiết lập chi nhánh, nhân viên, tài khoản ngân hàng, nhập liệu và thanh toán nhà cung cấp.',
  },
  {
    label: 'Quản lý',
    value: 'MANAGER',
    icon: ShieldCheck,
    description:
      'Toàn quyền bán hàng, nhập hàng và điều chỉnh tồn kho tất cả chi nhánh. Các thông tin cơ bản khác chỉ có quyền xem',
  },
  {
    label: 'Nhân viên',
    value: 'STAFF',
    icon: User,
    description:
      'Toàn quyền bán hàng và kiểm tra tồn kho đối với chi nhánh được chỉ định'
  },
] as const
