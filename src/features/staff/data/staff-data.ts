import { Crown, ShieldCheck, User } from 'lucide-react'

export const roles = [
  {
    label: 'Chủ hệ thống',
    value: 'OWNER',
    icon: Crown,
  },
  {
    label: 'Quản lý',
    value: 'MANAGER',
    icon: ShieldCheck,
  },
  {
    label: 'Nhân viên',
    value: 'STAFF',
    icon: User,
  },
] as const
