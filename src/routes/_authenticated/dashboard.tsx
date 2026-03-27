import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/dashboard'
import type { DashboardTab } from '@/features/dashboard'
import type { AdvancedTab } from '@/features/dashboard/tabs/advanced-report'

export const Route = createFileRoute('/_authenticated/dashboard')({
  validateSearch: (search: Record<string, unknown>): { tab?: DashboardTab; subtab?: AdvancedTab } => ({
    tab: (search.tab as DashboardTab) ?? 'report',
    subtab: search.subtab as AdvancedTab | undefined,
  }),
  component: Dashboard,
})
