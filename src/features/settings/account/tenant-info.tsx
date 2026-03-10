import { useUser } from '@/client/provider'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
  '1_ACTIVE': { label: 'Đang hoạt động', variant: 'default' },
  '2_LICENSE_EXPIRED': { label: 'Hết hạn giấy phép', variant: 'destructive' },
  '3_CANCELLED': { label: 'Đã huỷ', variant: 'destructive' },
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='space-y-1'>
      <label className='text-sm font-medium'>{label}</label>
      {typeof value === 'string' || value === null || value === undefined ? (
        <Input value={value ?? ''} disabled />
      ) : (
        value
      )}
    </div>
  )
}

export function TenantInfo() {
  const { user } = useUser()
  const tenant = user?.tenant

  if (!tenant) {
    return <p className='text-muted-foreground'>Không có thông tin tenant.</p>
  }

  const status = STATUS_LABELS[tenant.status] ?? { label: tenant.status, variant: 'outline' as const }

  return (
    <div className='space-y-6'>
      <div className='grid gap-6 sm:grid-cols-2'>
        <Field label='Mã tenant' value={tenant.tenant_code} />
        <Field label='Tên hệ thống' value={tenant.name} />
      </div>

      <div className='grid gap-6 sm:grid-cols-2'>
        <Field label='Người đại diện' value={tenant.representative} />
        <Field label='Số điện thoại' value={tenant.phone} />
      </div>

      <Field label='Địa chỉ' value={tenant.address} />

      <Field
        label='Trạng thái'
        value={<Badge variant={status.variant} className='mt-1 ml-2'>{status.label}</Badge>}
      />

      <div className='grid gap-6 sm:grid-cols-3'>
        <Field label='Số chi nhánh tối đa' value={String(tenant.location_license)} />
        <Field label='Số nhân viên tối đa' value={String(tenant.staff_license)} />
        <Field label='Số sản phẩm tối đa' value={String(tenant.product_license)} />
      </div>

      <Field
        label='Ngày hết hạn giấy phép'
        value={tenant.license_expiration ? new Date(tenant.license_expiration).toLocaleDateString('vi-VN') : ''}
      />

      {tenant.description && (
        <div className='space-y-1'>
          <label className='text-sm font-medium'>Mô tả</label>
          <Textarea value={tenant.description} disabled className='resize-none' />
        </div>
      )}
    </div>
  )
}
