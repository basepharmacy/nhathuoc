import { createFileRoute } from '@tanstack/react-router'
import { BankAccounts } from '@/features/bank-accounts'

export const Route = createFileRoute('/_authenticated/bank-accounts/')({
  component: BankAccounts,
})
