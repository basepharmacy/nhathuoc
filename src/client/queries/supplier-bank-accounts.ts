import { queryOptions } from "@tanstack/react-query"
import { supplierBankAccountsRepo } from '..'

export const getSupplierBankAccountsQueryOptions = (supplierId: string) =>
  queryOptions({
    queryKey: ['supplier-bank-accounts', supplierId],
    queryFn: () =>
      supplierBankAccountsRepo.getSupplierBankAccountsBySupplierId(supplierId),
  })
