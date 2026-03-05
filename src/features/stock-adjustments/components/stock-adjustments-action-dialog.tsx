import { useEffect, useMemo, useRef, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { stockAdjustmentsRepo } from '@/client'
import {
  getProductsQueryOptions,
  getLocationsQueryOptions,
  getInventoryBatchesQueryOptions,
} from '@/client/queries'
import { cn, formatCurrency, normalizeNumber, formatDateLabel } from '@/lib/utils'
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { QuantityStepper } from '@/components/quantity-stepper'
import { DatePicker } from '@/components/date-picker'
import type { ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import {
  getReasonCodeOptionsByQuantity,
  type StockAdjustmentReasonCode,
} from '../data/reason-code'

const formSchema = z.object({
  productId: z.string().min(1, 'Sản phẩm là bắt buộc.'),
  locationId: z.string().min(1, 'Cửa hàng là bắt buộc.'),
  productUnitId: z.string().optional(),
  batchCode: z.string().min(1, 'Mã lô là bắt buộc.'),
  quantity: z
    .number()
    .refine((val) => val !== 0, 'Số lượng không được bằng 0.'),
  costPrice: z
    .number()
    .min(0, 'Giá nhập không được âm.'),
  reasonCode: z.enum(['1_FIRST_STOCK', '2_DAMAGED', '3_EXPIRED', '4_LOST', '9_OTHER']),
  reason: z.string().max(1000, 'Lý do không được vượt quá 1000 ký tự.').optional(),
  expiryDate: z.string().optional(),
})

type StockAdjustmentForm = z.infer<typeof formSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]

export function StockAdjustmentsActionDialog({ open, onOpenChange }: Props) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()
  const queryClient = useQueryClient()

  const { data: products = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const form = useForm<StockAdjustmentForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productId: '',
      locationId: selectedLocationId ?? '',
      productUnitId: '',
      batchCode: '',
      quantity: 1,
      costPrice: 0,
      reasonCode: '1_FIRST_STOCK',
      reason: '',
      expiryDate: '',
    },
  })

  const productId = form.watch('productId')
  const locationId = form.watch('locationId')

  const { data: inventoryBatches = [] } = useQuery({
    ...getInventoryBatchesQueryOptions(tenantId, productId ? [productId] : [], locationId || null),
    enabled: !!tenantId && !!productId && open,
  })

  const validBatches = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return inventoryBatches.filter((batch) => {
      if (!batch.expiry_date) return true
      const expiry = new Date(batch.expiry_date)
      return expiry >= today
    })
  }, [inventoryBatches])

  const currentStock = useMemo(() => {
    if (!productId) return null
    const batches = locationId
      ? inventoryBatches.filter((b) => b.location_id === locationId)
      : inventoryBatches
    return batches.reduce((sum, b) => sum + b.quantity, 0)
  }, [productId, locationId, inventoryBatches])

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId) ?? null,
    [products, productId]
  )

  const [productOpen, setProductOpen] = useState(false)

  const handleSelectProduct = (product: ProductWithUnits) => {
    form.setValue('productId', product.id, { shouldValidate: true })
    form.setValue('batchCode', '')
    form.setValue('expiryDate', '')
    const defaultUnit = getDefaultUnit(product)
    form.setValue('productUnitId', defaultUnit?.id ?? '')
    form.setValue('costPrice', defaultUnit?.cost_price ?? 0)
    setProductOpen(false)
  }

  const handleSelectBatch = (batch: (typeof validBatches)[0]) => {
    form.setValue('batchCode', batch.batch_code, { shouldValidate: true })
    if (batch.expiry_date) {
      form.setValue('expiryDate', batch.expiry_date.slice(0, 10))
    }
    if (batch.average_cost_price) {
      form.setValue('costPrice', batch.average_cost_price)
    }
  }

  const isOpenRef = useRef(open)

  const createMutation = useMutation({
    mutationFn: (values: StockAdjustmentForm) =>
      stockAdjustmentsRepo.createStockAdjustment({
        tenant_id: tenantId,
        product_id: values.productId,
        location_id: values.locationId,
        batch_code: values.batchCode.trim(),
        quantity: values.quantity,
        cost_price: values.costPrice,
        reason_code: values.reasonCode,
        reason: normalizeOptionalText(values.reason),
        expiry_date: normalizeOptionalText(values.expiryDate),
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

  const batchCode = form.watch('batchCode')
  const quantity = form.watch('quantity')
  const productUnitId = form.watch('productUnitId')
  const isNegativeQty = quantity < 0
  const reasonCode = form.watch('reasonCode') as StockAdjustmentReasonCode
  const reasonCodeOptions = useMemo(
    () => getReasonCodeOptionsByQuantity(quantity),
    [quantity]
  )

  // Determine if the entered batch code matches an existing batch
  const selectedBatch = useMemo(
    () => validBatches.find((b) => b.batch_code === batchCode.trim()) ?? null,
    [validBatches, batchCode]
  )

  // If existing batch: can decrease up to batch quantity. If new batch: no decrease limit (min=0)
  const minQuantity = selectedBatch ? -selectedBatch.quantity : 0

  const [showMinPopover, setShowMinPopover] = useState(false)
  const minPopoverTimer = useRef<ReturnType<typeof setTimeout>>(null)

  const handleMinReached = () => {
    setShowMinPopover(true)
    if (minPopoverTimer.current) clearTimeout(minPopoverTimer.current)
    minPopoverTimer.current = setTimeout(() => setShowMinPopover(false), 3000)
  }

  // Clamp quantity when min changes (e.g. switching from existing batch to new batch)
  useEffect(() => {
    if (quantity < minQuantity) {
      form.setValue('quantity', minQuantity)
    }
  }, [minQuantity, quantity, form])

  // When unit changes, update cost price from unit's cost_price
  useEffect(() => {
    if (!selectedProduct || !productUnitId) return
    const unit = selectedProduct.product_units?.find((u) => u.id === productUnitId)
    if (unit) {
      form.setValue('costPrice', unit.cost_price)
    }
  }, [productUnitId, selectedProduct, form])

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
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>Thêm điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Số lượng dương (+) để tăng, âm (-) để giảm tồn kho.
            <br />
            Bạn chỉ có thể giảm tồn kho khi đã chọn lô hiện có, và không được vượt quá số lượng trong lô đó.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='stock-adjustment-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* Location */}
            <FormField
              control={form.control}
              name='locationId'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cửa hàng</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Chọn cửa hàng...' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Row: Product + Unit + Quantity + Cost price */}
            <div className='grid grid-cols-12 gap-3'>
              {/* Product combobox */}
              <div className='col-span-4'>
                <FormField
                  control={form.control}
                  name='productId'
                  render={() => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>Sản phẩm</FormLabel>
                      <Popover open={productOpen} onOpenChange={setProductOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant='outline'
                              role='combobox'
                              className={cn(
                                'h-9 w-full justify-between font-normal',
                                !selectedProduct && 'text-muted-foreground'
                              )}
                            >
                              <span className='truncate'>
                                {selectedProduct
                                  ? selectedProduct.product_name
                                  : 'Chọn sản phẩm...'}
                              </span>
                              <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-[320px] p-0'
                          onWheel={(e) => e.stopPropagation()}
                          onTouchMove={(e) => e.stopPropagation()}
                        >
                          <Command>
                            <CommandInput placeholder='Tìm sản phẩm...' />
                            <CommandEmpty>Không tìm thấy sản phẩm.</CommandEmpty>
                            <CommandGroup>
                              <CommandList className='max-h-[240px] overflow-y-auto'>
                                {products.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={product.product_name}
                                    onSelect={() => handleSelectProduct(product)}
                                  >
                                    <CheckIcon
                                      className={cn(
                                        'mr-2 size-4',
                                        product.id === productId ? 'opacity-100' : 'opacity-0'
                                      )}
                                    />
                                    {product.product_name}
                                  </CommandItem>
                                ))}
                              </CommandList>
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {/* Current stock text */}
                      {selectedProduct && currentStock !== null && (
                        <p className='text-xs text-muted-foreground'>
                          Tồn kho: <span className='font-semibold text-foreground'>{currentStock}</span>
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Unit selectbox (replaces old batch code position) */}
              <div className='col-span-2'>
                <FormField
                  control={form.control}
                  name='productUnitId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Đơn vị</FormLabel>
                      <Select
                        key={productId}
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!selectedProduct}
                      >
                        <FormControl>
                          <SelectTrigger className='h-9'>
                            <SelectValue placeholder='Đơn vị' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectedProduct?.product_units?.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              {unit.unit_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quantity stepper */}
              <div className='col-span-3'>
                <FormField
                  control={form.control}
                  name='quantity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số lượng</FormLabel>
                      <Popover open={showMinPopover && quantity <= minQuantity && minQuantity < 0} onOpenChange={setShowMinPopover}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div>
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
                          Bạn chỉ có thể giảm tồn kho khi đã chọn lô hiện có, và không được vượt quá số lượng trong lô đó.
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Cost price */}
              <div className='col-span-3'>
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
            </div>

            {/* Batch code */}
            <div className='space-y-1.5'>
              <FormField
                control={form.control}
                name='batchCode'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã lô</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Nhập mã lô'
                        className='h-9 text-sm'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Existing batches as quick-select buttons */}
              {selectedProduct && validBatches.length > 0 && (
                <div className='flex flex-wrap gap-2 pt-1'>
                  {validBatches.map((batch) => (
                    <Button
                      key={batch.id}
                      type='button'
                      variant={batch.batch_code === batchCode.trim() ? 'default' : 'outline'}
                      size='sm'
                      className='h-7 px-3 text-xs'
                      onClick={() => handleSelectBatch(batch)}
                    >
                      {batch.batch_code}
                      {batch.expiry_date ? ` - ${formatDateLabel(batch.expiry_date)}` : ''}
                      {' '}({batch.quantity})
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry date */}
            <FormField
              control={form.control}
              name='expiryDate'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hạn sử dụng</FormLabel>
                  <FormControl>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          const year = date.getFullYear()
                          const month = String(date.getMonth() + 1).padStart(2, '0')
                          const day = String(date.getDate()).padStart(2, '0')
                          field.onChange(`${year}-${month}-${day}`)
                        } else {
                          field.onChange('')
                        }
                      }}
                      placeholder='Chọn hạn sử dụng'
                      className='h-9 w-full justify-start text-start text-sm font-normal data-[empty=true]:text-muted-foreground'
                      disablePastDates={false}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            Thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
