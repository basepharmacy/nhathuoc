import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useUser } from '@/client/provider'
import { getProfilesQueryOptions } from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StaffInfoCard } from './components/staff-info-card'
import { StaffActivityHistoryTab } from './components/staff-activity-history-tab'

const route = getRouteApi('/_authenticated/staffs/$staffId')

export function StaffDetail() {
  const { staffId } = route.useParams()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const {
    data: staff,
    isLoading,
    isError,
    error,
  } = useQuery({
    ...getProfilesQueryOptions(staffId),
    enabled: !!staffId,
  })

  return (
    <>
      <Header fixed className='h-auto'>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Thông tin nhân viên</h2>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {isLoading ? (
          <div className='flex items-center justify-center py-12 text-muted-foreground'>
            Đang tải thông tin nhân viên...
          </div>
        ) : isError ? (
          <div className='flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-10 text-muted-foreground'>
            <p>Không thể tải nhân viên.</p>
            <p className='text-xs'>Vui lòng thử lại hoặc kiểm tra quyền truy cập.</p>
            {error && (
              <p className='text-xs text-destructive'>
                {error instanceof Error ? error.message : 'Lỗi không xác định.'}
              </p>
            )}
          </div>
        ) : !staff ? (
          <div className='flex items-center justify-center rounded-lg border border-dashed py-12 text-muted-foreground'>
            Không tìm thấy nhân viên.
          </div>
        ) : (
          <>
            <StaffInfoCard staff={staff} />
            <Tabs defaultValue='activity' className='gap-4'>
              <TabsList>
                <TabsTrigger value='activity'>Lịch sử hoạt động</TabsTrigger>
              </TabsList>
              <TabsContent value='activity'>
                <StaffActivityHistoryTab tenantId={tenantId} staffId={staffId} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </Main>
    </>
  )
}
