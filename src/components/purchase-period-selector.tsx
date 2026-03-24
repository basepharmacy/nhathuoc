import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePermissions } from '@/hooks/use-permissions'
import { useUser } from '@/client/provider'
import { getPurchasePeriodsQueryOptions } from '@/client/queries'
import { purchasePeriodsRepo } from '@/client'

const CREATE_NEW_VALUE = '__CREATE_NEW_PERIOD__'

type PurchasePeriodSelectorProps = {
  periodId: string
  onPeriodChange: (periodId: string) => void
  disabled?: boolean
}

export function PurchasePeriodSelector({
  periodId,
  onPeriodChange,
  disabled = false,
}: PurchasePeriodSelectorProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { role } = usePermissions()
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { data: periods = [] } = useQuery({
    ...getPurchasePeriodsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      purchasePeriodsRepo.createPurchasePeriod({
        tenantId,
        fromDate: new Date().toISOString().split('T')[0],
      }),
    onSuccess: (newPeriod) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-periods', tenantId] })
      onPeriodChange(String(newPeriod.id))
      toast.success('Đã tách sang kì mới thành công')
    },
    onError: () => {
      toast.error('Có lỗi khi tạo kì mới, vui lòng thử lại')
    },
  })

  const handleValueChange = (value: string) => {
    if (value === CREATE_NEW_VALUE) {
      setConfirmOpen(true)
      return
    }
    onPeriodChange(value)
  }

  const handleConfirmCreate = () => {
    setConfirmOpen(false)
    createMutation.mutate()
  }

  const isOwner = role === 'OWNER'

  const formatPeriodLabel = (period: { number: number; from_date: string; to_date: string; name: string | null }) => {
    const from = period.from_date
    const to = period.to_date === '9999-12-31' ? 'nay' : period.to_date
    return period.name ?? `Kì ${period.number} (${from} - ${to})`
  }

  return (
    <>
      <Select value={periodId} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger className='h-8 min-w-[220px] rounded-full'>
          <SelectValue placeholder='Chọn kì nhập hàng' />
        </SelectTrigger>
        <SelectContent>
          {isOwner && (
            <SelectItem value={CREATE_NEW_VALUE} className='font-medium text-primary'>
              + Tách sang kì mới
            </SelectItem>
          )}
          {periods.map((period) => (
            <SelectItem key={period.id} value={String(period.id)}>
              {formatPeriodLabel(period)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Xác nhận tách kì mới'
        desc='Bạn có chắc muốn tách sang kì nhập hàng mới? Kì mới sẽ bắt đầu từ ngày hôm nay.'
        confirmText='Đồng ý'
        cancelBtnText='Hủy'
        handleConfirm={handleConfirmCreate}
        isLoading={createMutation.isPending}
      />
    </>
  )
}
