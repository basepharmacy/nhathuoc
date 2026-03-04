import { Crown, User } from 'lucide-react'

export const roles = [
  {
    label: 'Chủ hệ thống',
    value: 'OWNER',
    icon: Crown,
  },
  {
    label: 'Nhân viên',
    value: 'STAFF',
    icon: User,
  },
] as const
