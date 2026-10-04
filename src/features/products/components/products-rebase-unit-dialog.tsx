'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { productsRepo } from '@/client'
import { useUser } from '@/client/provider'
import { getInventoryBatchesQueryOptions } from '@/client/queries'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { mapSupabaseError } from '@/lib/error-mapper'
import { formatCurrency, normalizeNumber } from '@/lib/utils'
import { type ProductWithUnits } from '@/services/supabase'
import {
  type RebaseBaseUnitForm,
  rebaseBaseUnitFormSchema,
  unitNamePresets,
} from '../data/schema'

// Zod preprocess khiến kiểu input (chuỗi từ ô nhập) khác kiểu output đã parse
type RebaseBaseUnitFormInput = z.input<typeof rebaseBaseUnitFormSchema>

type ProductsRebaseUnitDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProductWithUnits
  /** Gọi sau khi đổi thành công — dùng để đóng form sửa sản phẩm đang mở bên ngoài */
  onRebased?: () => void
}

export function ProductsRebaseUnitDialog({
  open,
  onOpenChange,
  currentRow,
  onRebased,
}: ProductsRebaseUnitDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()
  const { isOnline } = useOnlineStatus()
  const [confirmed, setConfirmed] = useState(false)

  const units = useMemo(() => currentRow.product_units ?? [], [currentRow])
  const baseUnit = useMemo(
    () => units.find((unit) => unit.is_base_unit),
    [units]
  )
  const otherUnits = useMemo(
    () => units.filter((unit) => !unit.is_base_unit),
    [units]
  )

  const form = useForm<RebaseBaseUnitFormInput, unknown, RebaseBaseUnitForm>({
    resolver: zodResolver(rebaseBaseUnitFormSchema),
    defaultValues: {
      unit_name: '',
      factor: '',
      cost_price: null,
      sell_price: null,
    },
  })

  const factorValue = useWatch({ control: form.control, name: 'factor' })
  const unitNameValue = useWatch({ control: form.control, name: 'unit_name' }) ?? ''
  const parsedFactor = Number(factorValue)
  const factor =
    factorValue !== '' && Number.isInteger(parsedFactor) && parsedFactor >= 2
      ? parsedFactor
      : null

  // Tồn kho hiện tại để hiển thị preview trước/sau khi quy đổi
  const batchesQuery = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, [currentRow.id]),
    enabled: open && Boolean(tenantId),
  })

  const totalQuantity = useMemo(
    () => (batchesQuery.data ?? []).reduce((sum, batch) => sum + (batch.quantity ?? 0), 0),
    [batchesQuery.data]
  )

  // Giá vốn bình quân toàn sản phẩm, có trọng số theo tồn của từng lô
  const weightedAvgCost = useMemo(() => {
    const batches = batchesQuery.data ?? []
    const totalValue = batches.reduce(
      (sum, batch) => sum + (batch.average_cost_price ?? 0) * (batch.quantity ?? 0),
      0
    )
    return totalQuantity > 0 ? Math.round(totalValue / totalQuantity) : null
  }, [batchesQuery.data, totalQuantity])

  // Gợi ý giá cho đơn vị mới dựa trên giá của đơn vị cơ bản hiện tại
  useEffect(() => {
    if (!factor || !baseUnit) return
    if (!form.getFieldState('cost_price').isDirty && baseUnit.cost_price != null) {
      form.setValue('cost_price', Math.round(baseUnit.cost_price / factor))
    }
    if (!form.getFieldState('sell_price').isDirty && baseUnit.sell_price != null) {
      form.setValue('sell_price', Math.round(baseUnit.sell_price / factor))
    }
  }, [baseUnit, factor, form])

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset()
      setConfirmed(false)
    }
    onOpenChange(next)
  }

  const rebaseMutation = useMutation({
    mutationFn: (values: RebaseBaseUnitForm) =>
      productsRepo.rebaseProductBaseUnit({
        productId: currentRow.id,
        unitName: values.unit_name.trim(),
        factor: values.factor,
        costPrice: values.cost_price,
        sellPrice: values.sell_price,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-products', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments', tenantId] })
      handleOpenChange(false)
      onRebased?.()
      toast.success(
        `Đã đổi đơn vị cơ bản sang "${result.new_unit_name}". Đã quy đổi ${result.affected_batches} lô tồn kho.`
      )
    },
    onError: (error) => {
      toast.error(mapSupabaseError(error))
    },
  })

  const onSubmit = (values: RebaseBaseUnitForm) => {
    const duplicated = units.some(
      (unit) =>
        unit.unit_name.trim().toLowerCase() === values.unit_name.trim().toLowerCase()
    )
    if (duplicated) {
      form.setError('unit_name', {
        message: 'Sản phẩm đã có đơn vị trùng tên này.',
      })
      return
    }
    rebaseMutation.mutate(values)
  }

  const newUnitLabel = unitNameValue.trim() || 'đơn vị mới'
  const canSubmit =
    Boolean(baseUnit) && confirmed && isOnline && !rebaseMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-2xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Đổi đơn vị cơ bản</DialogTitle>
          <DialogDescription>
            Thêm một đơn vị nhỏ hơn và lấy nó làm đơn vị cơ bản mới cho{' '}
            <span className='font-medium'>{currentRow.product_name}</span>. Tồn kho sẽ
            được quy đổi tự động.
          </DialogDescription>
        </DialogHeader>

        {!baseUnit ? (
          <Alert variant='destructive'>
            <AlertTriangle className='size-4' />
            <AlertDescription>
              Sản phẩm chưa có đơn vị cơ bản hợp lệ. Vui lòng kiểm tra lại danh sách đơn
              vị trong màn hình sửa sản phẩm trước khi đổi.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form
              id='product-rebase-unit-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <ScrollArea className='h-[26rem] w-full pe-4'>
                <div className='space-y-4'>
                  <div className='rounded-lg border bg-muted/30 p-4 text-sm'>
                    <div className='font-medium'>Đơn vị cơ bản hiện tại</div>
                    <div className='mt-1 text-muted-foreground'>
                      {baseUnit.unit_name}
                      {otherUnits.length > 0 && (
                        <>
                          {' · Đơn vị quy đổi: '}
                          {otherUnits
                            .map(
                              (unit) =>
                                `1 ${unit.unit_name} = ${unit.conversion_factor} ${baseUnit.unit_name}`
                            )
                            .join(', ')}
                        </>
                      )}
                    </div>
                  </div>

                  <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <FormField
                      control={form.control}
                      name='unit_name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Đơn vị cơ bản mới</FormLabel>
                          <FormControl>
                            <Input
                              list='rebase-unit-name-options'
                              placeholder='Ví dụ: Viên'
                              autoComplete='off'
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='factor'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            1 {baseUnit.unit_name} = ? {newUnitLabel}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              min={2}
                              placeholder='Ví dụ: 10'
                              value={
                                typeof field.value === 'number' ||
                                typeof field.value === 'string'
                                  ? field.value
                                  : ''
                              }
                              onChange={(event) => field.onChange(event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='cost_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá nhập / {newUnitLabel}</FormLabel>
                          <FormControl>
                            <Input
                              inputMode='numeric'
                              placeholder='Giá nhập'
                              {...field}
                              value={formatCurrency(
                                field.value as string | number | null | undefined,
                                { fallback: '' }
                              )}
                              onChange={(event) => {
                                const rawValue = event.target.value
                                field.onChange(rawValue ? normalizeNumber(rawValue) : '')
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='sell_price'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Giá bán / {newUnitLabel}</FormLabel>
                          <FormControl>
                            <Input
                              inputMode='numeric'
                              placeholder='Giá bán'
                              {...field}
                              value={formatCurrency(
                                field.value as string | number | null | undefined,
                                { fallback: '' }
                              )}
                              onChange={(event) => {
                                const rawValue = event.target.value
                                field.onChange(rawValue ? normalizeNumber(rawValue) : '')
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <div className='text-sm font-semibold'>Thay đổi sẽ áp dụng</div>
                    <div className='rounded-lg border'>
                      <PreviewRow
                        label='Tồn kho'
                        before={`${totalQuantity.toLocaleString('vi-VN')} ${baseUnit.unit_name}`}
                        after={
                          factor
                            ? `${(totalQuantity * factor).toLocaleString('vi-VN')} ${newUnitLabel}`
                            : null
                        }
                        loading={batchesQuery.isLoading}
                      />
                      <PreviewRow
                        label='Giá vốn trung bình'
                        before={
                          weightedAvgCost != null
                            ? `${formatCurrency(weightedAvgCost)} đ / ${baseUnit.unit_name}`
                            : '—'
                        }
                        after={
                          factor && weightedAvgCost != null
                            ? `${formatCurrency(Math.round(weightedAvgCost / factor))} đ / ${newUnitLabel}`
                            : null
                        }
                        loading={batchesQuery.isLoading}
                      />
                      <PreviewRow
                        label='Tồn tối thiểu'
                        before={`${(currentRow.min_stock ?? 0).toLocaleString('vi-VN')} ${baseUnit.unit_name}`}
                        after={
                          factor
                            ? `${((currentRow.min_stock ?? 0) * factor).toLocaleString('vi-VN')} ${newUnitLabel}`
                            : null
                        }
                      />
                      <PreviewRow
                        label={`Đơn vị ${baseUnit.unit_name}`}
                        before={`1 ${baseUnit.unit_name} = 1 ${baseUnit.unit_name}`}
                        after={
                          factor ? `1 ${baseUnit.unit_name} = ${factor} ${newUnitLabel}` : null
                        }
                      />
                      {otherUnits.map((unit) => (
                        <PreviewRow
                          key={unit.id}
                          label={`Đơn vị ${unit.unit_name}`}
                          before={`1 ${unit.unit_name} = ${unit.conversion_factor} ${baseUnit.unit_name}`}
                          after={
                            factor
                              ? `1 ${unit.unit_name} = ${unit.conversion_factor * factor} ${newUnitLabel}`
                              : null
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <Alert variant='destructive'>
                    <AlertTriangle className='size-4' />
                    <AlertDescription>
                      <ul className='list-disc space-y-1 ps-4'>
                        <li>Thao tác này không thể hoàn tác.</li>
                        <li>
                          Đơn bán và đơn nhập cũ vẫn giữ nguyên đơn vị đã chọn nên số liệu
                          lịch sử không đổi.
                        </li>
                        <li>
                          Giá vốn trung bình của từng lô có thể lệch tối đa 1 đ do làm tròn
                          khi chia cho hệ số quy đổi.
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  {!isOnline && (
                    <Alert>
                      <AlertTriangle className='size-4' />
                      <AlertDescription>
                        Thao tác này cần kết nối mạng và không thể lưu offline. Vui lòng
                        thử lại khi có mạng.
                      </AlertDescription>
                    </Alert>
                  )}

                  <label className='flex items-start gap-2 text-sm'>
                    <Checkbox
                      checked={confirmed}
                      onCheckedChange={(checked) => setConfirmed(checked === true)}
                      className='mt-0.5'
                    />
                    <span>
                      Tôi đã kiểm tra số liệu ở trên và xác nhận đổi đơn vị cơ bản của sản
                      phẩm này.
                    </span>
                  </label>
                </div>
              </ScrollArea>

              <datalist id='rebase-unit-name-options'>
                {unitNamePresets.map((unit) => (
                  <option key={unit} value={unit} />
                ))}
              </datalist>
            </form>
          </Form>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => handleOpenChange(false)}
            disabled={rebaseMutation.isPending}
          >
            Hủy
          </Button>
          <Button
            type='submit'
            form='product-rebase-unit-form'
            disabled={!canSubmit}
          >
            {rebaseMutation.isPending && (
              <Loader2 className='me-2 size-4 animate-spin' />
            )}
            Đổi đơn vị cơ bản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type PreviewRowProps = {
  label: string
  before: string
  after: string | null
  loading?: boolean
}

function PreviewRow({ label, before, after, loading }: PreviewRowProps) {
  return (
    <div className='grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b px-3 py-2 text-sm last:border-b-0'>
      <span className='text-muted-foreground'>{label}</span>
      <span className='truncate'>{loading ? '…' : before}</span>
      <ArrowRight className='size-3.5 text-muted-foreground' />
      <span className='truncate font-medium'>
        {loading ? '…' : (after ?? <span className='text-muted-foreground'>—</span>)}
      </span>
    </div>
  )
}
