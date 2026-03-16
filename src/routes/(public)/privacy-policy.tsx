import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '@/features/privacy-policy'

export const Route = createFileRoute('/(public)/privacy-policy')({
  component: PrivacyPolicy,
})
