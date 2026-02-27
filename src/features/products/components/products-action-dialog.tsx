'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { getCategoriesQueryOptions } from '@/client/queries'
import { productsRepo } from '@/client'
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
  type Product,
  productStatusValues,
  productTypeValues,
} from '../data/schema'

const formSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc.')
    .max(255, 'Tên sản phẩm không được vượt quá 255 ký tự.'),
  product_type: z.enum(productTypeValues),
  status: z.enum(productStatusValues),
  category_id: z.string().optional(),
  min_stock: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    z
      .number({ invalid_type_error: 'Tồn tối thiểu phải là số.' })
      .min(0, 'Tồn tối thiểu không được âm.')
      .nullable()
  ),
  active_ingredient: z
    .string()
    .max(255, 'Hoạt chất không được vượt quá 255 ký tự.')
    .optional(),
  regis_number: z
    .string()
    .max(255, 'Số đăng ký không được vượt quá 255 ký tự.')
    .optional(),
  jan_code: z
    .string()
    .max(255, 'Mã JAN không được vượt quá 255 ký tự.')
    .optional(),
  made_company_name: z
    .string()
    .max(255, 'Nhà sản xuất không được vượt quá 255 ký tự.')
    .optional(),
  sale_company_name: z
    .string()
    .max(255, 'Nhà phân phối không được vượt quá 255 ký tự.')
    .optional(),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự.')
    .optional(),
})

type ProductForm = z.infer<typeof formSchema>

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
    resolver: zodResolver(formSchema),
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
      }
      : {
        product_name: '',
        product_type: '1_OTC',
        status: '1_DRAFT',
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
      <DialogContent className='sm:max-w-2xl'>
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
            className='space-y-4'
          >
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
            <FormField
              control={form.control}
              name='product_type'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Loại</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='col-span-4 w-full'>
                        <SelectValue placeholder='Chọn loại sản phẩm' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1_OTC'>OTC</SelectItem>
                        <SelectItem value='2_PRESCRIPTION_REQUIRED'>Cần đơn</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Trạng thái</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className='col-span-4 w-full'>
                        <SelectValue placeholder='Chọn trạng thái' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1_DRAFT'>Nháp</SelectItem>
                        <SelectItem value='2_ACTIVE'>Đang bán</SelectItem>
                        <SelectItem value='3_INACTIVE'>Ngừng bán</SelectItem>
                        <SelectItem value='4_ARCHIVED'>Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
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
          <Button type='submit' form='product-form' disabled={isPending}>
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
