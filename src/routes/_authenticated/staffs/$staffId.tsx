import { createFileRoute } from '@tanstack/react-router'
import { StaffDetail } from '@/features/staff-details'

export const Route = createFileRoute('/_authenticated/staffs/$staffId')({
  component: StaffDetail,
})
