import { createFileRoute } from '@tanstack/react-router'
import { LandingTrial } from '@/landing/pages/trial'

export const Route = createFileRoute('/(landing)/trial')({
  component: LandingTrial,
})
