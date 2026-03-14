import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { type ProfileWithRelations } from '@/services/supabase'
import { roles } from '@/features/staff/data/staff-data'
import { type StaffRole } from '@/features/staff/data/staff-schema'

type StaffInfoCardProps = {
  staff: ProfileWithRelations
}

export function StaffInfoCard({ staff }: StaffInfoCardProps) {
  const role = roles.find((r) => r.value === (staff.role as StaffRole))

  return (
    <Card className='gap-4'>
      <CardContent className='space-y-4'>
        <div className='grid gap-4 md:grid-cols-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Tên nhân viên</p>
            <p className='font-medium'>{staff.name}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Tài khoản</p>
            <p className='font-medium'>{staff.login_id ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Số điện thoại</p>
            <p className='font-medium'>{staff.phone ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Vai trò</p>
            <p className='font-medium'>{role?.label ?? '—'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Chi nhánh</p>
            <p className='font-medium'>{staff.location?.name ?? 'Toàn hệ thống'}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Địa chỉ</p>
            <p className='font-medium'>{staff.address ?? '—'}</p>
          </div>
        </div>
        {staff.description && (
          <>
            <Separator />
            <div>
              <p className='text-sm text-muted-foreground'>Mô tả</p>
              <p className='text-sm leading-relaxed'>{staff.description}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
