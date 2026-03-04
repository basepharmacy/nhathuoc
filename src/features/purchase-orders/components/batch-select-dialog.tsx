import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AlertTriangle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getInventoryBatchesQueryOptions } from '@/client/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { DatePicker } from '@/components/date-picker'
import { formatDateLabel } from '@/lib/utils'

const toDateInputValue = (value?: string | null) => {
  if (!value) return ''
  if (value.length >= 10) return value.slice(0, 10)
  return value
}

type BatchSelectDialogProps = {
  title?: string
  initialBatchCode?: string
  initialExpiryDate?: string
  productId: string
  tenantId: string
  locationId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (batchCode: string, expiryDate: string) => void
  saveLabel?: string
  readOnly?: boolean
}

export function BatchSelectDialog({
  title = 'Chọn lô sản phẩm',
  initialBatchCode = '',
  initialExpiryDate = '',
  productId,
  tenantId,
  locationId,
  open,
  onOpenChange,
  onSave,
  saveLabel = 'Lưu',
  readOnly = false,
}: BatchSelectDialogProps) {
  const [batchCode, setBatchCode] = useState('')
  const [expiryDate, setExpiryDate] = useState('')

  const { data: allBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productId ? [productId] : [], locationId),
    enabled: !!tenantId && !!productId && open,
  })

  const todayStart = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  }, [])

  const batches = useMemo(() => {
    return allBatches.filter((batch) => {
      if (!batch.expiry_date) return true
      const expiry = new Date(batch.expiry_date)
      return expiry >= todayStart
    })
  }, [allBatches, todayStart])

  const selectedBatch = useMemo(() => {
    const code = batchCode.trim()
    if (!code) return null
    return allBatches.find((batch) => batch.batch_code === code) ?? null
  }, [allBatches, batchCode])

  const expiredBatch = useMemo(() => {
    if (!selectedBatch?.expiry_date) return null
    const expiry = new Date(selectedBatch.expiry_date)
    return expiry < todayStart ? selectedBatch : null
  }, [selectedBatch, todayStart])

  const expirySelected = useMemo(() => {
    if (!expiryDate) return undefined
    const parsed = new Date(expiryDate)
    if (Number.isNaN(parsed.getTime())) return undefined
    return parsed
  }, [expiryDate])

  const isExpiryLocked = Boolean(selectedBatch?.expiry_date)

  useEffect(() => {
    if (!open) return
    setBatchCode(initialBatchCode)
    setExpiryDate(toDateInputValue(initialExpiryDate))
  }, [open, initialBatchCode, initialExpiryDate])

  useEffect(() => {
    if (!selectedBatch) return
    if (selectedBatch.expiry_date) {
      setExpiryDate(toDateInputValue(selectedBatch.expiry_date))
    }
  }, [selectedBatch])

  const handleSave = () => {
    if (readOnly) return
    onSave(batchCode.trim(), expiryDate.trim())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='batch-code'>Lô</Label>
            <Input
              id='batch-code'
              value={batchCode}
              onChange={(event) => {
                if (readOnly) return
                setBatchCode(event.target.value)
              }}
              placeholder='Nhập hoặc chọn lô'
              disabled={readOnly}
            />
            {expiredBatch ? (
              <div className='flex items-center gap-2 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'>
                <AlertTriangle className='size-3.5 text-orange-500 dark:text-orange-300' />
                <span>Lô này đã hết hạn.</span>
              </div>
            ) : null}
            {batches.length > 0 ? (
              <div className='flex flex-wrap gap-2'>
                {batches.map((batch) => (
                  <Button
                    key={batch.id}
                    type='button'
                    variant={batch.batch_code === batchCode.trim() ? 'default' : 'outline'}
                    size='sm'
                    className='h-7 px-3 text-xs'
                    onClick={() => {
                      if (readOnly) return
                      setBatchCode(batch.batch_code)
                      setExpiryDate(toDateInputValue(batch.expiry_date))
                    }}
                    disabled={readOnly}
                  >
                    {batch.batch_code}
                    {batch.expiry_date ? ` - ${formatDateLabel(batch.expiry_date)}` : ''}
                  </Button>
                ))}
              </div>
            ) : (
              <p className='text-xs text-muted-foreground'>Chưa có lô tồn kho.</p>
            )}
          </div>
          <div className='space-y-2'>
            <Label htmlFor='expiry-date'>Hạn sử dụng</Label>
            <DatePicker
              selected={expirySelected}
              onSelect={(date) => {
                if (readOnly) return
                if (isExpiryLocked) return
                if (!date) {
                  setExpiryDate('')
                  return
                }
                setExpiryDate(format(date, 'yyyy-MM-dd'))
              }}
              placeholder='Chọn hạn sử dụng'
              className='w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
              disabled={isExpiryLocked || readOnly}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button type='button' onClick={handleSave} disabled={readOnly}>
            {saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
