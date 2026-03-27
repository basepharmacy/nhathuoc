import { queryOptions } from "@tanstack/react-query"
import { bankAccountsRepo } from '..'

export type VietQrBank = {
  id: number | string
  name: string
  code: string
  bin: string
  shortName?: string
  logo?: string
}

export const getBankAccountsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['bank-accounts', tenantId],
    queryFn: () => bankAccountsRepo.getBankAccountsByTenantId(tenantId),
    staleTime: 5 * 60 * 1000, // 5 min — stable data, critical for offline sale-order
  })

export const getVietQrBanksQueryOptions = () =>
  queryOptions({
    queryKey: ['vietqr-banks'],
    queryFn: async () => {
      const response = await fetch('https://api.vietqr.io/v2/banks')
      if (!response.ok) {
        throw new Error('Không thể tải danh sách ngân hàng.')
      }
      const payload = (await response.json()) as { data?: VietQrBank[] }
      return payload?.data ?? []
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
