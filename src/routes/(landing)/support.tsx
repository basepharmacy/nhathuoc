import { createFileRoute } from '@tanstack/react-router'
import { LandingSupport } from '@/landing/pages/support'

export const Route = createFileRoute('/(landing)/support')({
  component: LandingSupport,
})
