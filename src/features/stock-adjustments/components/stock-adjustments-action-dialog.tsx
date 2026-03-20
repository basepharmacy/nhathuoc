import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SquarePen } from 'lucide-react'
import { useUser } from '@/client/provider'
import { stockAdjustmentsRepo } from '@/client'
import { formatCurrency, formatDateLabel, formatQuantity, normalizeNumber } from '@/lib/utils'
import { DatePicker } from '@/components/date-picker'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuantityStepper } from '@/components/quantity-stepper'
import {
  getReasonCodeOptionsByQuantity,
  type StockAdjustmentReasonCode,
} from '../data/reason-code'

const formSchema = z.object({
  quantity: z
    .number()
    .refine((val) => val !== 0, 'Số lượng không được bằng 0.'),
  costPrice: z
    .number()
    .min(0, 'Giá nhập không được âm.'),
  reasonCode: z.enum(['1_FIRST_STOCK', '2_DAMAGED', '3_EXPIRED', '4_LOST', '9_OTHER']),
  reason: z.string().max(1000, 'Lý do không được vượt quá 1000 ký tự.').optional(),
})

type StockAdjustmentForm = z.infer<typeof formSchema>

export type StockAdjustmentInitialBatch = {
  productId: string
  productName: string
  locationId: string
  batchId: string
  batchCode: string
  expiryDate: string | null
  costPrice: number
  quantity: number
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  batch: StockAdjustmentInitialBatch
}

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

export function StockAdjustmentsActionDialog({ open, onOpenChange, batch }: Props) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const form = useForm<StockAdjustmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantity: 1,
      costPrice: batch.costPrice,
      reasonCode: '1_FIRST_STOCK',
      reason: '',
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        quantity: 1,
        costPrice: batch.costPrice,
        reasonCode: '1_FIRST_STOCK',
        reason: '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const isOpenRef = useRef(open)

  const createMutation = useMutation({
    mutationFn: (values: StockAdjustmentForm) =>
      stockAdjustmentsRepo.createStockAdjustment({
        tenant_id: tenantId,
        product_id: batch.productId,
        location_id: batch.locationId,
        batch_code: batch.batchCode,
        quantity: values.quantity,
        cost_price: values.costPrice,
        reason_code: values.reasonCode,
        reason: normalizeOptionalText(values.reason),
        expiry_date: expiryDate || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['dashboard-report', 'low-stock-products'],
      })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      createMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: StockAdjustmentForm) => {
    createMutation.mutate(values)
  }

  const mutationError = createMutation.error
  const errorMessage =
    mutationError && typeof mutationError === 'object' && 'message' in mutationError
      ? String((mutationError as { message: string }).message)
      : mutationError
        ? 'Đã xảy ra lỗi, vui lòng thử lại.'
        : null

  const quantity = form.watch('quantity')
  const isNegativeQty = quantity < 0
  const reasonCode = form.watch('reasonCode') as StockAdjustmentReasonCode
  const reasonCodeOptions = useMemo(
    () => getReasonCodeOptionsByQuantity(quantity),
    [quantity]
  )

  const minQuantity = -batch.quantity

  const [editingExpiry, setEditingExpiry] = useState(false)
  const [expiryDate, setExpiryDate] = useState<string | null>(batch.expiryDate)
  const [noExpiry, setNoExpiry] = useState(!batch.expiryDate)

  const expirySelected = useMemo(() => {
    if (!expiryDate) return undefined
    const parsed = new Date(expiryDate)
    if (Number.isNaN(parsed.getTime())) return undefined
    return parsed
  }, [expiryDate])

  useEffect(() => {
    if (open) {
      setEditingExpiry(false)
      setExpiryDate(batch.expiryDate)
      setNoExpiry(!batch.expiryDate)
    }
  }, [open, batch.expiryDate])

  const [showMinPopover, setShowMinPopover] = useState(false)
  const minPopoverTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const handleMinReached = () => {
    setShowMinPopover(true)
    if (minPopoverTimer.current) clearTimeout(minPopoverTimer.current)
    minPopoverTimer.current = setTimeout(() => setShowMinPopover(false), 3000)
  }

  // When quantity goes negative, set cost price to 0
  useEffect(() => {
    if (isNegativeQty) {
      form.setValue('costPrice', 0)
    }
  }, [isNegativeQty, form])

  useEffect(() => {
    const isCurrentReasonCodeAllowed = reasonCodeOptions.some((option) => option.value === reasonCode)
    if (!isCurrentReasonCodeAllowed) {
      form.setValue('reasonCode', reasonCodeOptions[0].value, { shouldValidate: true })
    }
  }, [reasonCode, reasonCodeOptions, form])

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Số lượng dương (+) để tăng, âm (-) để giảm tồn kho.
          </DialogDescription>
        </DialogHeader>

        {/* Batch info */}
        <div className={`rounded-md border p-3 ${quantity < 0 ? 'bg-destructive/10 border-destructive/30' : 'bg-muted/50'}`}>
          <div className='grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm'>
            <div>
              <span className='text-muted-foreground'>Sản phẩm</span>
              <p className='font-medium'>{batch.productName}</p>
            </div>
            <div>
              <span className='text-muted-foreground'>Mã lô</span>
              <p className='font-medium'>{batch.batchCode}</p>
            </div>
            <div>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>HSD</span>
                <button
                  type='button'
                  onClick={() => setEditingExpiry((prev) => !prev)}
                  className='text-muted-foreground hover:text-foreground'
                >
                  <SquarePen className='size-4' />
                </button>
              </div>
              <p className='font-medium'>{expiryDate ? formatDateLabel(expiryDate) : '-'}</p>
            </div>
            <div>
              <span className='text-muted-foreground'>Tồn kho</span>
              <p className='font-medium'>{formatQuantity(batch.quantity)}</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form
            id='stock-adjustment-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* Row: Quantity + Cost price */}
            <div className='grid grid-cols-2 gap-3'>
              {/* Quantity stepper */}
              <FormField
                control={form.control}
                name='quantity'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng</FormLabel>
                    <Popover open={showMinPopover && quantity <= minQuantity && minQuantity < 0} onOpenChange={setShowMinPopover}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className='flex justify-start'>
                            <QuantityStepper
                              value={field.value}
                              onChange={field.onChange}
                              min={minQuantity}
                              onMinReached={handleMinReached}
                            />
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent side='bottom' className='w-auto max-w-[240px] p-2 text-xs'>
                        Không được giảm vượt quá số lượng tồn kho của lô ({batch.quantity}).
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cost price */}
              <FormField
                control={form.control}
                name='costPrice'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giá nhập</FormLabel>
                    <FormControl>
                      <Input
                        value={formatCurrency(field.value, { clampZero: false })}
                        onChange={(e) => field.onChange(normalizeNumber(e.target.value))}
                        placeholder='0'
                        className='h-9 text-end text-sm'
                        autoComplete='off'
                        disabled={isNegativeQty}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Reason */}
            <FormField
              control={form.control}
              name='reasonCode'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn lý do...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonCodeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='reason'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Ghi chú điều chỉnh...'
                      className='resize-none'
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {editingExpiry && (
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label className='text-sm font-medium'>Hạn sử dụng</Label>
                  <div className='flex items-center gap-2'>
                    <Label htmlFor='sa-no-expiry' className='text-xs text-muted-foreground font-normal'>
                      Không có HSD
                    </Label>
                    <Switch
                      id='sa-no-expiry'
                      checked={noExpiry}
                      onCheckedChange={(checked) => {
                        setNoExpiry(checked)
                        if (checked) {
                          setExpiryDate(null)
                        } else {
                          const defaultDate = new Date()
                          defaultDate.setFullYear(defaultDate.getFullYear() + 1)
                          setExpiryDate(format(defaultDate, 'yyyy-MM-dd'))
                        }
                      }}
                    />
                  </div>
                </div>
                <DatePicker
                  selected={expirySelected}
                  onSelect={(date) => {
                    if (!date) {
                      setExpiryDate(null)
                      return
                    }
                    setExpiryDate(format(date, 'yyyy-MM-dd'))
                  }}
                  placeholder=''
                  className='w-full justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
                  disablePastDates={false}
                  disabled={noExpiry}
                />
                {!noExpiry && (
                  <div className='flex gap-2'>
                    <span
                      className='cursor-pointer rounded-md bg-secondary px-2 py-1 text-xs hover:bg-secondary/80'
                      onClick={() => {
                        const date = new Date()
                        date.setFullYear(date.getFullYear() + 1)
                        setExpiryDate(format(date, 'yyyy-MM-dd'))
                      }}
                    >
                      1 năm
                    </span>
                    <span
                      className='cursor-pointer rounded-md bg-secondary px-2 py-1 text-xs hover:bg-secondary/80'
                      onClick={() => {
                        const date = new Date()
                        date.setFullYear(date.getFullYear() + 2)
                        setExpiryDate(format(date, 'yyyy-MM-dd'))
                      }}
                    >
                      2 năm
                    </span>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <Alert variant='destructive'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type='submit' form='stock-adjustment-form' disabled={createMutation.isPending}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
