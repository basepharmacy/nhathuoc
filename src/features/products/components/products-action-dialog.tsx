'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { getCategoriesQueryOptions } from '@/client/queries'
import { productsRepo } from '@/client'
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
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type ProductForm,
  type Product,
  productFormSchema,
} from '../data/schema'

type ProductsActionDialogProps = {
  currentRow?: Product
  open: boolean
  onOpenChange: (open: boolean) => void
}

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

const normalizeOptionalCategoryId = (value?: string) =>
  value && value.trim().length > 0 && value !== 'none' ? value.trim() : null

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
    enabled: !!tenantId,
  })

  const form = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEdit
      ? {
        product_name: currentRow.product_name,
        product_type: currentRow.product_type,
        status: currentRow.status === '1_DRAFT' ? '2_ACTIVE' : currentRow.status,
        category_id: currentRow.category_id ?? 'none',
        min_stock: currentRow.min_stock ?? null,
        active_ingredient: currentRow.active_ingredient ?? '',
        regis_number: currentRow.regis_number ?? '',
        jan_code: currentRow.jan_code ?? '',
        made_company_name: currentRow.made_company_name ?? '',
        sale_company_name: currentRow.sale_company_name ?? '',
        description: currentRow.description ?? '',
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
      },
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

  const createMutation = useMutation({
    mutationFn: (values: ProductForm) =>
      productsRepo.createProduct({
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
      productsRepo.updateProduct(currentRow!.id, {
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
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-hidden'>
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
                  <div className='text-sm font-semibold text-muted-foreground'>
                    Thông tin cơ bản
                  </div>
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
                              <SelectItem value='none'>Không chọn</SelectItem>
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
                    name='product_name'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Tên</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Tên sản phẩm...'
                            className='col-span-4'
                            autoComplete='off'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
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
                                  {[
                                    { value: '2_ACTIVE', label: 'Đang bán' },
                                    { value: '3_INACTIVE', label: 'Ngừng bán' },
                                    { value: '4_ARCHIVED', label: 'Lưu trữ' },
                                  ].map((option) => (
                                    <button
                                      key={option.value}
                                      type='button'
                                      onClick={() => field.onChange(option.value)}
                                      className={cn(
                                        'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                                        field.value === option.value
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-input bg-background text-foreground hover:bg-muted'
                                      )}
                                      aria-pressed={field.value === option.value}
                                    >
                                      {option.label}
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
                                  value={field.value ?? ''}
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
