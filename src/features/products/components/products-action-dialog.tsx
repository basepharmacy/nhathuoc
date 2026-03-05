'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useUser } from '@/client/provider'
import { productsRepo, productMastersRepo } from '@/client'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover'
import { ChevronDown, Loader2, Plus, Trash2 } from 'lucide-react'
import { cn, formatCurrency, normalizeNumber } from '@/lib/utils'
import {
  type ProductForm,
  unitNamePresets,
  productStatusLabels,
  productTypeLabels,
  productFormSchema,
} from '../data/schema'
import { type ProductWithUnits, type Category } from '@/services/supabase'
import type { ProductMasterWithUnits } from '@/services/supabase/database/repo/productMastersRepo'

type ProductsActionDialogProps = {
  currentRow?: ProductWithUnits
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ProductFormInput = z.input<typeof productFormSchema>

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

const normalizeOptionalCategoryId = (value?: string) =>
  value && value.trim().length > 0 && value !== 'none' ? value.trim() : null

export function ProductsActionDialog({
  currentRow,
  categories,
  open,
  onOpenChange,
}: ProductsActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const defaultUnits = useMemo(
    () => [
      {
        unit_name: '',
        conversion_factor: 1,
        cost_price: 0,
        sell_price: 0,
        is_base_unit: true,
      },
    ],
    []
  )

  const form = useForm<ProductFormInput, unknown, ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEdit
      ? {
        product_name: currentRow.product_name,
        product_type: currentRow.product_type,
        status: currentRow.status,
        category_id: currentRow.category_id ?? 'none',
        min_stock: currentRow.min_stock ?? null,
        active_ingredient: currentRow.active_ingredient ?? '',
        regis_number: currentRow.regis_number ?? '',
        jan_code: currentRow.jan_code ?? '',
        made_company_name: currentRow.made_company_name ?? '',
        sale_company_name: currentRow.sale_company_name ?? '',
        description: currentRow.description ?? '',
        units: defaultUnits,
      }
      : {
        product_name: '',
        product_type: '1_OTC',
        status: '2_ACTIVE',
        category_id: 'none',
        min_stock: null,
        active_ingredient: '',
        regis_number: '',
        jan_code: '',
        made_company_name: '',
        sale_company_name: '',
        description: '',
        units: defaultUnits,
      },
  })

  const {
    fields: unitFields,
    append: appendUnit,
    remove: removeUnit,
  } = useFieldArray({
    control: form.control,
    name: 'units',
  })


  const unitsWatch = useWatch({
    control: form.control,
    name: 'units',
  })

  const isOpenRef = useRef(open)
  const defaultDetailsOpen = useMemo(() => {
    if (!isEdit || !currentRow) return false
    return Boolean(
      currentRow.active_ingredient ||
      currentRow.regis_number ||
      currentRow.made_company_name ||
      currentRow.sale_company_name ||
      currentRow.description
    )
  }, [currentRow, isEdit])
  const [detailsOpen, setDetailsOpen] = useState(defaultDetailsOpen)

  // Product master search state
  const [masterSearchOpen, setMasterSearchOpen] = useState(false)
  const [masterResults, setMasterResults] = useState<ProductMasterWithUnits[]>([])
  const [masterSearching, setMasterSearching] = useState(false)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchProductMasters = useCallback(
    (query: string) => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
      if (query.trim().length < 2) {
        setMasterResults([])
        setMasterSearchOpen(false)
        return
      }
      setMasterSearching(true)
      searchTimerRef.current = setTimeout(async () => {
        try {
          const results = await productMastersRepo.searchByName(query, 10)
          setMasterResults(results)
          setMasterSearchOpen(results.length > 0)
        } catch {
          setMasterResults([])
        } finally {
          setMasterSearching(false)
        }
      }, 300)
    },
    []
  )

  const fillFromMaster = useCallback(
    (master: ProductMasterWithUnits) => {
      form.setValue('product_name', master.product_name, { shouldDirty: true })
      form.setValue('product_type', master.product_type, { shouldDirty: true })
      if (master.active_ingredient)
        form.setValue('active_ingredient', master.active_ingredient, { shouldDirty: true })
      if (master.regis_number)
        form.setValue('regis_number', master.regis_number, { shouldDirty: true })
      if (master.jan_code)
        form.setValue('jan_code', master.jan_code, { shouldDirty: true })
      if (master.made_company_name)
        form.setValue('made_company_name', master.made_company_name, { shouldDirty: true })
      if (master.sale_company_name)
        form.setValue('sale_company_name', master.sale_company_name, { shouldDirty: true })
      if (master.description)
        form.setValue('description', master.description, { shouldDirty: true })

      // Fill units from product_master_units
      const masterUnits = master.product_master_units ?? []
      if (masterUnits.length > 0) {
        const sorted = [...masterUnits].sort(
          (a, b) => Number(b.is_base_unit) - Number(a.is_base_unit)
        )
        const units = sorted.map((u) => ({
          unit_name: u.unit_name,
          conversion_factor: u.is_base_unit ? 1 : Number(u.conversion_factor ?? 1),
          cost_price: 0,
          sell_price: 0,
          is_base_unit: u.is_base_unit,
        }))
        form.setValue('units', units, { shouldDirty: true })
      }

      // Open details section if master has detail fields
      if (
        master.active_ingredient ||
        master.regis_number ||
        master.made_company_name ||
        master.sale_company_name ||
        master.description
      ) {
        setDetailsOpen(true)
      }

      setMasterSearchOpen(false)
      setMasterResults([])
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form]
  )

  useEffect(() => {
    if (!isEdit || !currentRow?.id || !open) return
    const units = currentRow.product_units ?? []
    const normalizedUnits = units.length
      ? [...units]
        .sort(
          (left, right) =>
            Number(right.is_base_unit) - Number(left.is_base_unit)
        )
        .map((unit) => ({
          unit_name: unit.unit_name,
          conversion_factor: unit.is_base_unit ? 1 : Number(unit.conversion_factor ?? 1),
          cost_price: Number(unit.cost_price ?? 0),
          sell_price: Number(unit.sell_price ?? 0),
          is_base_unit: unit.is_base_unit,
        }))
      : defaultUnits

    form.setValue('units', normalizedUnits, { shouldDirty: false })
  }, [defaultUnits, form, isEdit, open, currentRow?.id, currentRow?.product_units])

  const autoCalcRef = useRef<{
    baseCost: number
    baseSell: number
    factors: number[]
  }>({ baseCost: 0, baseSell: 0, factors: [] })

  useEffect(() => {
    if (!unitsWatch?.length) return
    const baseUnit = unitsWatch[0]
    const baseCost = Number(baseUnit?.cost_price ?? 0)
    const baseSell = Number(baseUnit?.sell_price ?? 0)
    const factors = unitsWatch.map((unit) =>
      Number(unit?.conversion_factor ?? 0)
    )

    const prev = autoCalcRef.current
    const baseChanged = baseCost !== prev.baseCost || baseSell !== prev.baseSell
    const factorChanged = factors.some(
      (factor, index) => index > 0 && factor !== prev.factors[index]
    )

    if (!baseChanged && !factorChanged) {
      return
    }

    unitsWatch.forEach((unit, index) => {
      if (index === 0) return
      const factor = factors[index]
      if (!Number.isFinite(factor) || factor <= 0) return

      const nextCost = baseCost * factor
      const nextSell = baseSell * factor

      if (unit?.cost_price !== nextCost) {
        form.setValue(`units.${index}.cost_price`, nextCost, {
          shouldDirty: true,
          shouldValidate: false,
        })
      }

      if (unit?.sell_price !== nextSell) {
        form.setValue(`units.${index}.sell_price`, nextSell, {
          shouldDirty: true,
          shouldValidate: false,
        })
      }
    })

    autoCalcRef.current = { baseCost, baseSell, factors }
  }, [form, unitsWatch])

  const normalizeUnits = (units: ProductForm['units']) =>
    units.map((unit, index) => ({
      unit_name: unit.unit_name.trim(),
      conversion_factor: index === 0 ? 1 : Number(unit.conversion_factor ?? 1),
      cost_price: Number(unit.cost_price ?? 0),
      sell_price: Number(unit.sell_price ?? 0),
      is_base_unit: index === 0,
    }))

  const createMutation = useMutation({
    mutationFn: (values: ProductForm) =>
      productsRepo.createProductWithUnits({
        product: {
          tenant_id: tenantId,
          product_name: values.product_name,
          product_type: values.product_type,
          status: values.status,
          category_id: normalizeOptionalCategoryId(values.category_id),
          min_stock: values.min_stock ?? null,
          active_ingredient: normalizeOptionalText(values.active_ingredient),
          regis_number: normalizeOptionalText(values.regis_number),
          jan_code: normalizeOptionalText(values.jan_code),
          made_company_name: normalizeOptionalText(values.made_company_name),
          sale_company_name: normalizeOptionalText(values.sale_company_name),
          description: normalizeOptionalText(values.description),
        },
        units: normalizeUnits(values.units),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: ProductForm) =>
      productsRepo.updateProductWithUnits({
        productId: currentRow!.id,
        tenantId,
        product: {
          product_name: values.product_name,
          product_type: values.product_type,
          status: values.status,
          category_id: normalizeOptionalCategoryId(values.category_id),
          min_stock: values.min_stock ?? null,
          active_ingredient: normalizeOptionalText(values.active_ingredient),
          regis_number: normalizeOptionalText(values.regis_number),
          jan_code: normalizeOptionalText(values.jan_code),
          made_company_name: normalizeOptionalText(values.made_company_name),
          sale_company_name: normalizeOptionalText(values.sale_company_name),
          description: normalizeOptionalText(values.description),
        },
        units: normalizeUnits(values.units),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      createMutation.reset()
      updateMutation.reset()
      setDetailsOpen(defaultDetailsOpen)
      setMasterSearchOpen(false)
      setMasterResults([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: ProductForm) => {
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const submitWithStatus = (status: ProductForm['status']) =>
    form.handleSubmit((values) => {
      const payload = { ...values, status }
      if (isEdit) {
        updateMutation.mutate(payload)
      } else {
        createMutation.mutate(payload)
      }
    })()

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error
  const errorMessage =
    mutationError && typeof mutationError === 'object' && 'message' in mutationError
      ? String((mutationError as { message: string }).message)
      : mutationError
        ? 'Đã xảy ra lỗi, vui lòng thử lại.'
        : null

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-4xl max-h-[85vh] overflow-hidden'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin sản phẩm. ' : 'Tạo sản phẩm mới. '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='product-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex max-h-[70vh] flex-col'
          >
            <input type='hidden' {...form.register('product_type')} />
            <ScrollArea className='max-h-[60vh] pr-3'>
              <div className='space-y-6 pb-2'>
                <div className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='product_name'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Tên</FormLabel>
                        <Popover
                          open={masterSearchOpen && !isEdit}
                          onOpenChange={setMasterSearchOpen}
                        >
                          <PopoverAnchor asChild>
                            <FormControl>
                              <div className='col-span-4 relative'>
                                <Input
                                  placeholder='Tên sản phẩm...'
                                  autoComplete='off'
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    if (!isEdit) {
                                      searchProductMasters(e.target.value)
                                    }
                                  }}
                                />
                                {masterSearching && (
                                  <Loader2 className='absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground' />
                                )}
                              </div>
                            </FormControl>
                          </PopoverAnchor>
                          <PopoverContent
                            className='p-0'
                            style={{ width: 'var(--radix-popover-trigger-width)' }}
                            onOpenAutoFocus={(e) => e.preventDefault()}
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                          >
                            <Command>
                              <CommandList className='max-h-[200px] overflow-y-auto'>
                                <CommandEmpty>Không tìm thấy sản phẩm mẫu.</CommandEmpty>
                                <CommandGroup>
                                  {masterResults.map((master) => (
                                    <CommandItem
                                      key={master.id}
                                      value={master.product_name}
                                      onSelect={() => fillFromMaster(master)}
                                      className='cursor-pointer'
                                    >
                                      <div className='flex flex-col'>
                                        <span className='font-medium'>{master.product_name}</span>
                                        {(master.active_ingredient || master.made_company_name) && (
                                          <span className='text-xs text-muted-foreground'>
                                            {[master.active_ingredient, master.made_company_name]
                                              .filter(Boolean)
                                              .join(' • ')}
                                          </span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='jan_code'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Mã JAN</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Mã JAN...'
                            className='col-span-4'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='category_id'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Danh mục</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? 'none'}
                          >
                            <SelectTrigger className='col-span-4 w-full'>
                              <SelectValue placeholder='Chọn danh mục' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='none'></SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </div>

                <div className='space-y-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='text-sm font-semibold text-end'>
                      Đơn vị
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='gap-2'
                      onClick={() =>
                        appendUnit({
                          unit_name: '',
                          conversion_factor: 1,
                          cost_price: 0,
                          sell_price: 0,
                          is_base_unit: false,
                        })
                      }
                    >
                      <Plus className='size-4' />
                      Thêm đơn vị
                    </Button>
                  </div>
                  <div className='space-y-4'>
                    {unitFields.map((unitField, index) => {
                      const isBaseUnit = index === 0
                      return (
                        <div
                          key={unitField.id}
                          className='rounded-lg border bg-muted/30 p-4 shadow-sm'
                        >
                          <div className='mt-2 grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] md:items-center'>
                            <FormField
                              control={form.control}
                              name={`units.${index}.unit_name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      list='unit-name-options'
                                      placeholder='Tên đơn vị (ví dụ: Viên, Hộp...)'
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
                              name={`units.${index}.conversion_factor`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type='number'
                                      placeholder='Quy đổi'
                                      disabled={isBaseUnit}
                                      value={
                                        isBaseUnit
                                          ? 1
                                          : typeof field.value === 'number' ||
                                            typeof field.value === 'string'
                                            ? field.value
                                            : ''
                                      }
                                      onChange={(event) =>
                                        field.onChange(event.target.value)
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`units.${index}.cost_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder='Giá nhập'
                                      inputMode='numeric'
                                      {...field}
                                      value={formatCurrency(
                                        field.value as string | number | null | undefined,
                                        { fallback: '' }
                                      )}
                                      onChange={(event) => {
                                        const rawValue = event.target.value
                                        if (!rawValue) {
                                          field.onChange('')
                                          return
                                        }
                                        field.onChange(normalizeNumber(rawValue))
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`units.${index}.sell_price`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder='Giá bán'
                                      inputMode='numeric'
                                      {...field}
                                      value={formatCurrency(
                                        field.value as string | number | null | undefined,
                                        { fallback: '' }
                                      )}
                                      onChange={(event) => {
                                        const rawValue = event.target.value
                                        if (!rawValue) {
                                          field.onChange('')
                                          return
                                        }
                                        field.onChange(normalizeNumber(rawValue))
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className='flex items-center justify-end gap-2 md:justify-start'>
                              {isBaseUnit ? (
                                <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                                  Cơ sở
                                </span>
                              ) : null}
                              {!isBaseUnit && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='text-muted-foreground'
                                  onClick={() => removeUnit(index)}
                                  aria-label='Xóa đơn vị'
                                >
                                  <Trash2 className='size-4' />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <datalist id='unit-name-options'>
                    {unitNamePresets.map((unit) => (
                      <option key={unit} value={unit} />
                    ))}
                  </datalist>
                </div>

                <Collapsible open={detailsOpen} onOpenChange={setDetailsOpen}>
                  <div className='space-y-4'>
                    <CollapsibleTrigger asChild>
                      <button
                        type='button'
                        className='group flex w-full items-center justify-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                      >
                        {detailsOpen ? 'Ẩn thông tin chi tiết' : 'Thêm thông tin chi tiết'}
                        <ChevronDown className='size-4 transition-transform group-data-[state=open]:rotate-180' />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className='space-y-4'>
                      <div className='text-sm font-semibold text-muted-foreground'>
                        Thông tin chi tiết
                      </div>
                      <FormField
                        control={form.control}
                        name='product_type'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 pt-2 text-end'>Loại</FormLabel>
                            <FormControl>
                              <div className='col-span-4 flex flex-wrap gap-2'>
                                {Object.entries(productTypeLabels).map(
                                  ([value, label]) => (
                                    <button
                                      key={value}
                                      type='button'
                                      onClick={() => field.onChange(value)}
                                      className={cn(
                                        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                                        field.value === value
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-input bg-background text-foreground hover:bg-muted'
                                      )}
                                      aria-pressed={field.value === value}
                                    >
                                      {label}
                                    </button>
                                  )
                                )}
                              </div>
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='active_ingredient'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>Hoạt chất</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Hoạt chất...'
                                className='col-span-4'
                                autoComplete='off'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='regis_number'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>Số đăng ký</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Số đăng ký...'
                                className='col-span-4'
                                autoComplete='off'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='made_company_name'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>Nhà sản xuất</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Nhà sản xuất...'
                                className='col-span-4'
                                autoComplete='off'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='sale_company_name'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 text-end'>Nhà phân phối</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Nhà phân phối...'
                                className='col-span-4'
                                autoComplete='off'
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                            <FormLabel className='col-span-2 pt-2 text-end'>Mô tả</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Mô tả sản phẩm...'
                                className='col-span-4 resize-none'
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className='col-span-4 col-start-3' />
                          </FormItem>
                        )}
                      />
                      <div className='space-y-4'>
                        <div className='text-sm font-semibold text-muted-foreground'>
                          Thông tin tồn kho
                        </div>
                        <FormField
                          control={form.control}
                          name='status'
                          render={({ field }) => (
                            <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                              <FormLabel className='col-span-2 pt-2 text-end'>Tình trạng</FormLabel>
                              <FormControl>
                                <div className='col-span-4 flex flex-wrap gap-2'>
                                  {Object.entries(productStatusLabels)
                                    .filter(([value]) => value !== '4_ARCHIVED')
                                    .map(([value, label]) => (
                                      <button
                                        key={value}
                                        type='button'
                                        onClick={() => field.onChange(value)}
                                        className={cn(
                                          'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                                          field.value === value
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-input bg-background text-foreground hover:bg-muted'
                                        )}
                                        aria-pressed={field.value === value}
                                      >
                                        {label}
                                      </button>
                                    ))}
                                </div>
                              </FormControl>
                              <FormMessage className='col-span-4 col-start-3' />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='min_stock'
                          render={({ field }) => (
                            <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                              <FormLabel className='col-span-2 text-end'>Tồn tối thiểu</FormLabel>
                              <FormControl>
                                <Input
                                  type='number'
                                  placeholder='Số lượng tối thiểu...'
                                  className='col-span-4'
                                  autoComplete='off'
                                  value={
                                    typeof field.value === 'number' ||
                                      typeof field.value === 'string'
                                      ? field.value
                                      : ''
                                  }
                                  onChange={(event) => field.onChange(event.target.value)}
                                />
                              </FormControl>
                              <FormMessage className='col-span-4 col-start-3' />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>

                {errorMessage && (
                  <Alert variant='destructive'>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </form>
        </Form>
        <DialogFooter className='gap-2'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='button'
            variant='secondary'
            disabled={isPending}
            onClick={() => submitWithStatus('1_DRAFT')}
          >
            Lưu nháp
          </Button>
          <Button type='submit' form='product-form' disabled={isPending}>
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
