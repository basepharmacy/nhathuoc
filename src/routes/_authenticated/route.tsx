import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { supabaseAuth } from '@/services/supabase'
import { canAccessRoute, type StaffRole } from '@/lib/permissions'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const session = await supabaseAuth.getSession()
    if (!session) {
      throw redirect({
        to: '/',
        search: { redirect: location.href },
      })
    }

    const role = (session.user.app_metadata?.role as StaffRole) ?? 'STAFF'
    if (!canAccessRoute(role, location.pathname)) {
      throw redirect({ to: '/403' })
    }
  },
  component: AuthenticatedLayout,
})
