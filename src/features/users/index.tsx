import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getStaffUsersQueryOptions } from '@/client/queries'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import type { StaffUser } from './data/schema'

export function Users() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: profiles = [], isLoading, isError } = useQuery({
    ...getStaffUsersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const staffUsers = useMemo<StaffUser[]>(() => {
    return profiles.map((profile) => ({
      ...profile,
      role: profile.id === user?.id ? (user?.role as StaffUser['role']) : 'STAFF',
    }))
  }, [profiles, user?.id, user?.role])

  return (
    <UsersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhân viên</h2>
            <p className='text-muted-foreground'>Quản lý nhân viên tại đây.</p>
          </div>
          <UsersPrimaryButtons />
        </div>
        <UsersTable data={staffUsers} isLoading={isLoading} isError={isError} />
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
