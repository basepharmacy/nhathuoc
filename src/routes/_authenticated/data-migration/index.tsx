import { createFileRoute } from '@tanstack/react-router'
import { DataMigration } from '@/features/data-migration'

export const Route = createFileRoute('/_authenticated/data-migration/')({
  component: DataMigration,
})
