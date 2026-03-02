import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { getBankAccountsQueryOptions } from '@/client/queries'
import { BankAccountsDialogs } from './components/bank-accounts-dialogs'
import { BankAccountsPrimaryButtons } from './components/bank-accounts-primary-buttons'
import { BankAccountsProvider } from './components/bank-accounts-provider'
import { BankAccountsTable } from './components/bank-accounts-table'

export function BankAccounts() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: bankAccounts = [], isLoading, isError } = useQuery({
    ...getBankAccountsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const hasShownError = useRef(false)

  useEffect(() => {
    if (isError && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isError])

  return (
    <BankAccountsProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>
              Tài khoản thanh toán
            </h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý tài khoản ngân hàng của cửa hàng.
            </p>
          </div>
          <BankAccountsPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <BankAccountsTable data={bankAccounts} isLoading={isLoading} />
      </Main>

      <BankAccountsDialogs />
    </BankAccountsProvider>
  )
}
