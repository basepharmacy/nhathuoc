'use client'

import { type KeyboardEvent, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productsRepo } from '@/client'
import { useUser } from '@/client/provider'
import { getCategoriesQueryOptions } from '@/client/queries'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { type Product } from '../data/schema'

const productStatusSchema = z.enum([
  '1_DRAFT',
  '2_ACTIVE',
  '3_INACTIVE',
  '4_ARCHIVED',
])

const productActionUnitSchema = z.object({
  unit_name: z.string().min(1, 'Đơn vị là bắt buộc.'),
  sell_price: z.number().nonnegative('Giá bán không được âm.'),
  cost_price: z.number().nonnegative('Giá vốn không được âm.'),
  conversion_factor: z.number().positive('Số lượng quy đổi phải lớn hơn 0.'),
})

export const productActionFormSchema = z.object({
  product_name: z.string().min(1, 'Tên sản phẩm là bắt buộc.'),
  jan_code: z.string().optional(),
  description: z.string().optional(),
  status: productStatusSchema.default('2_ACTIVE'),
  min_stock: z.number().int().nonnegative().nullable(),
  category_id: z.string().uuid('Danh mục không hợp lệ.').nullable(),
  units: z.array(productActionUnitSchema).min(1, 'Cần ít nhất một đơn vị.'),
})

export type ProductActionForm = z.output<typeof productActionFormSchema>
export type ProductActionFormInput = z.input<typeof productActionFormSchema>

export const defaultProductActionFormValues: ProductActionFormInput = {
  product_name: '',
  jan_code: '',
  description: '',
  status: '2_ACTIVE',
  min_stock: null,
  category_id: null,
  units: [
    {
      unit_name: '',
      sell_price: 0,
      cost_price: 0,
      conversion_factor: 1,
    },
  ],
}

type ProductsActionDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: ProductsActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const { data: categories = [] } = useQuery({
    ...getCategoriesQueryOptions(tenantId),
    enabled: open && !!tenantId,
  })

  const form = useForm<ProductActionFormInput, unknown, ProductActionForm>({
    resolver: zodResolver(productActionFormSchema),
    defaultValues: defaultProductActionFormValues,
  })
  const isOpenRef = useRef(open)
  const productNameDebounceRef = useRef<number | null>(null)
  const [debouncedProductName, setDebouncedProductName] = useState('')
  const [isSearchingByName, setIsSearchingByName] = useState(false)
  const [searchResults, setSearchResults] = useState<
    Awaited<ReturnType<typeof productsRepo.searchByName>>
  >([])
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
  const [searchByNameError, setSearchByNameError] = useState<string | null>(
    null
  )

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'units',
  })

  const handleProductNameInputChange = (
    value: string,
    onChange: (value: string) => void
  ) => {
    onChange(value)

    if (productNameDebounceRef.current) {
      window.clearTimeout(productNameDebounceRef.current)
    }

    productNameDebounceRef.current = window.setTimeout(() => {
      setDebouncedProductName(value)
    }, 350)

    if (value.trim().length === 0) {
      setIsSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
      setSearchResults([])
      return
    }

    setIsSuggestionsOpen(true)
    setActiveSuggestionIndex(-1)
  }

  const handleSuggestionSelect = (
    suggestion: Awaited<ReturnType<typeof productsRepo.searchByName>>[number],
    onChange: (value: string) => void
  ) => {
    const currentUnits = form.getValues('units')
    const firstSuggestedUnit = suggestion.product_units[0]
    const firstCurrentUnit = currentUnits[0]
    const hasSingleDefaultUnitRow =
      currentUnits.length === 1 &&
      !!firstCurrentUnit &&
      firstCurrentUnit.unit_name.trim().length === 0 &&
      firstCurrentUnit.sell_price === 0 &&
      firstCurrentUnit.cost_price === 0 &&
      firstCurrentUnit.conversion_factor === 1

    onChange(suggestion.product_name)
    form.setValue('jan_code', suggestion.jan_code ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('description', suggestion.description ?? '', {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('status', suggestion.status ?? '2_ACTIVE', {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('min_stock', suggestion.min_stock ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    })
    form.setValue('category_id', suggestion.category_id ?? null, {
      shouldDirty: true,
      shouldValidate: true,
    })

    if (currentUnits.length === 0 && firstSuggestedUnit) {
      append({
        unit_name: firstSuggestedUnit.unit_name,
        sell_price: firstSuggestedUnit.sell_price,
        cost_price: firstSuggestedUnit.cost_price,
        conversion_factor: firstSuggestedUnit.conversion_factor,
      })
    } else if (hasSingleDefaultUnitRow && firstSuggestedUnit) {
      form.setValue('units.0.unit_name', firstSuggestedUnit.unit_name, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('units.0.sell_price', firstSuggestedUnit.sell_price, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue('units.0.cost_price', firstSuggestedUnit.cost_price, {
        shouldDirty: true,
        shouldValidate: true,
      })
      form.setValue(
        'units.0.conversion_factor',
        firstSuggestedUnit.conversion_factor,
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      )
    }

    setDebouncedProductName(suggestion.product_name)
    setIsSuggestionsOpen(false)
    setActiveSuggestionIndex(-1)
  }

  const handleProductNameInputKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    if (!isSuggestionsOpen || searchResults.length === 0) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveSuggestionIndex((prev) =>
        prev >= searchResults.length - 1 ? 0 : prev + 1
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveSuggestionIndex((prev) =>
        prev <= 0 ? searchResults.length - 1 : prev - 1
      )
      return
    }

    if (event.key === 'Enter') {
      if (
        activeSuggestionIndex < 0 ||
        activeSuggestionIndex >= searchResults.length
      ) {
        return
      }

      event.preventDefault()
      handleSuggestionSelect(searchResults[activeSuggestionIndex], onChange)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setIsSuggestionsOpen(false)
      setActiveSuggestionIndex(-1)
    }
  }

  const createMutation = useMutation({
    mutationFn: (values: ProductActionForm) =>
      productsRepo.createProductWithUnits({
        tenant_id: tenantId,
        product: {
          product_name: values.product_name,
          jan_code: values.jan_code?.trim() ? values.jan_code : null,
          description: values.description?.trim() ? values.description : null,
          category_id: values.category_id,
          min_stock: values.min_stock,
          status: values.status,
        },
        units: values.units.map((unit) => ({
          unit_name: unit.unit_name,
          sell_price: unit.sell_price,
          cost_price: unit.cost_price,
          conversion_factor: unit.conversion_factor,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      if (!isOpenRef.current) return
      form.reset(defaultProductActionFormValues)
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

  useEffect(() => {
    return () => {
      if (productNameDebounceRef.current) {
        window.clearTimeout(productNameDebounceRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const searchKeyword = debouncedProductName.trim()

    if (!open || !tenantId || searchKeyword.length === 0) {
      if (!cancelled) {
        setSearchResults([])
        setIsSuggestionsOpen(false)
        setActiveSuggestionIndex(-1)
        setSearchByNameError(null)
        setIsSearchingByName(false)
      }
      return
    }

    const searchProducts = async () => {
      setIsSearchingByName(true)
      setSearchByNameError(null)

      try {
        const products = await productsRepo.searchByName(
          tenantId,
          searchKeyword,
          10
        )

        if (!cancelled) {
          setSearchResults(products)
          setActiveSuggestionIndex(products.length > 0 ? 0 : -1)
          setIsSuggestionsOpen(products.length > 0)
        }
      } catch (error) {
        if (!cancelled) {
          setSearchResults([])
          setIsSuggestionsOpen(false)
          setActiveSuggestionIndex(-1)
          setSearchByNameError(
            error && typeof error === 'object' && 'message' in error
              ? String((error as { message: string }).message)
              : 'Không thể tải gợi ý sản phẩm.'
          )
        }
      } finally {
        if (!cancelled) {
          setIsSearchingByName(false)
        }
      }
    }

    void searchProducts()

    return () => {
      cancelled = true
    }
  }, [debouncedProductName, open, tenantId])

  const onSubmit = (values: ProductActionForm) => {
    if (isEdit || !tenantId) {
      return
    }

    createMutation.mutate(values)
  }

  const errorMessage =
    (createMutation.error &&
    typeof createMutation.error === 'object' &&
    'message' in createMutation.error
      ? String((createMutation.error as { message: string }).message)
      : createMutation.error
        ? 'Đã xảy ra lỗi, vui lòng thử lại.'
        : null) ?? searchByNameError

  const parseNumericInput = (value: string) => {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const parseNullableIntegerInput = (value: string) => {
    if (value.trim() === '') return null
    const parsed = Number.parseInt(value, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        setDebouncedProductName('')
        setSearchResults([])
        setIsSuggestionsOpen(false)
        setActiveSuggestionIndex(-1)
        setSearchByNameError(null)
        form.reset(defaultProductActionFormValues)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </DialogTitle>
          <DialogDescription>
            Hoàn thiện thông tin sản phẩm và nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='product-action-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='space-y-3 rounded-md border p-4'>
              <p className='text-sm font-medium'>Thông tin cơ bản</p>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='jan_code'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Jancode</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='4901777018685'
                          autoComplete='off'
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='product_name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên sản phẩm</FormLabel>
                      <FormControl>
                        <div className='relative'>
                          <Input
                            placeholder='Paracetamol 500mg'
                            autoComplete='off'
                            {...field}
                            aria-busy={isSearchingByName}
                            aria-expanded={isSuggestionsOpen}
                            aria-autocomplete='list'
                            onChange={(event) =>
                              handleProductNameInputChange(
                                event.target.value,
                                field.onChange
                              )
                            }
                            onKeyDown={(event) =>
                              handleProductNameInputKeyDown(
                                event,
                                field.onChange
                              )
                            }
                          />

                          {isSuggestionsOpen && searchResults.length > 0 && (
                            <div className='absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md'>
                              {searchResults.map((suggestion, index) => {
                                const isActive = index === activeSuggestionIndex
                                return (
                                  <button
                                    key={suggestion.id}
                                    type='button'
                                    className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm ${
                                      isActive
                                        ? 'bg-accent text-accent-foreground'
                                        : 'hover:bg-accent/60'
                                    }`}
                                    onMouseEnter={() =>
                                      setActiveSuggestionIndex(index)
                                    }
                                    onMouseDown={(event) => {
                                      event.preventDefault()
                                      handleSuggestionSelect(
                                        suggestion,
                                        field.onChange
                                      )
                                    }}
                                  >
                                    <span className='truncate'>
                                      {suggestion.product_name}
                                    </span>
                                    <span className='ml-2 shrink-0 text-xs text-muted-foreground'>
                                      {suggestion.jan_code ?? 'Không có mã'}
                                    </span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <div className='space-y-3 rounded-md border p-4'>
              <div className='flex items-center justify-between gap-2'>
                <p className='text-sm font-medium'>Đơn vị tính</p>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() =>
                    append({
                      unit_name: '',
                      sell_price: 0,
                      cost_price: 0,
                      conversion_factor: 1,
                    })
                  }
                >
                  Thêm đơn vị
                </Button>
              </div>

              <div className='space-y-3'>
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className='space-y-3 rounded-md border p-3'
                  >
                    <div className='flex items-center justify-between'>
                      <p className='text-sm font-medium'>Đơn vị #{index + 1}</p>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        Xóa
                      </Button>
                    </div>

                    <div className='grid gap-3 sm:grid-cols-2'>
                      <FormField
                        control={form.control}
                        name={`units.${index}.unit_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Đơn vị</FormLabel>
                            <FormControl>
                              <Input
                                placeholder='Viên'
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
                        name={`units.${index}.sell_price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Giá bán</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                step='any'
                                value={field.value}
                                onChange={(event) =>
                                  field.onChange(
                                    parseNumericInput(event.target.value)
                                  )
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
                            <FormLabel>Giá vốn</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                step='any'
                                value={field.value}
                                onChange={(event) =>
                                  field.onChange(
                                    parseNumericInput(event.target.value)
                                  )
                                }
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
                            <FormLabel>Số lượng quy đổi</FormLabel>
                            <FormControl>
                              <Input
                                type='number'
                                min={0}
                                step='any'
                                value={field.value}
                                onChange={(event) =>
                                  field.onChange(
                                    parseNumericInput(event.target.value)
                                  )
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name='units'
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='space-y-3 rounded-md border p-4'>
              <p className='text-sm font-medium'>Thông tin bổ sung</p>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn trạng thái' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='1_DRAFT'>Nháp</SelectItem>
                          <SelectItem value='2_ACTIVE'>
                            Đang hoạt động
                          </SelectItem>
                          <SelectItem value='3_INACTIVE'>Tạm ngưng</SelectItem>
                          <SelectItem value='4_ARCHIVED'>Lưu trữ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='min_stock'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tồn kho tối thiểu</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          min={0}
                          step={1}
                          value={field.value ?? ''}
                          onChange={(event) =>
                            field.onChange(
                              parseNullableIntegerInput(event.target.value)
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='category_id'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục</FormLabel>
                      <Select
                        value={field.value ?? '__none__'}
                        onValueChange={(value) =>
                          field.onChange(value === '__none__' ? null : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Chọn danh mục' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='__none__'>Chưa chọn</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='sm:col-span-2'>
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Mô tả sản phẩm...'
                            className='resize-none'
                            rows={3}
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {errorMessage && (
              <Alert variant='destructive'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>

        <DialogFooter>
          <Button
            type='submit'
            form='product-action-form'
            disabled={!tenantId || createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
