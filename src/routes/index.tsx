import { createFileRoute, redirect } from '@tanstack/react-router'
import { supabaseAuth } from '@/services/supabase'
import { LandingHome } from '@/landing/pages/home'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await supabaseAuth.getSession()
    if (session) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingHome,
})
