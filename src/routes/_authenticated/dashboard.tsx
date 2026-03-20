import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'
import type { DashboardTab } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/dashboard')({
  validateSearch: (search: Record<string, unknown>): { tab?: DashboardTab } => ({
    tab: (search.tab as DashboardTab) ?? 'report',
  }),
  component: Dashboard,
})
