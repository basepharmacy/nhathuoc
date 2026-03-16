import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'
import type { DashboardTab } from '@/features/dashboard'

export const Route = createFileRoute('/_authenticated/')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as DashboardTab) ?? 'report',
  }),
  component: Dashboard,
})
