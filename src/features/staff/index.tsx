import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { getLocationsQueryOptions, getStaffUsersQueryOptions } from '@/client/queries'
import { StaffDialogs } from './components/staff-dialogs'
import { StaffPrimaryButtons } from './components/staff-primary-buttons'
import { StaffProvider } from './components/staff-provider'
import { StaffTable } from './components/staff-table'
import type { StaffUser } from './data/staff-schema'

export function Staff() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: profiles = [], isLoading, isError } = useQuery({
    ...getStaffUsersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const staffUsers = useMemo<StaffUser[]>(() => {
    return profiles.map((profile) => ({
      ...profile,
      role: profile.id === user?.id ? (user?.role as StaffUser['role']) : 'STAFF',
    }))
  }, [profiles, user?.id, user?.role])

  return (
    <StaffProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Nhân viên</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý nhân viên tại đây.
            </p>
          </div>
          <StaffPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <StaffTable
          data={staffUsers}
          locations={locations}
          isLoading={isLoading}
          isError={isError}
        />
      </Main>

      <StaffDialogs />
    </StaffProvider>
  )
}
