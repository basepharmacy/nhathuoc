'use client'

import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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

  const form = useForm<ProductActionFormInput, unknown, ProductActionForm>({
    resolver: zodResolver(productActionFormSchema),
    defaultValues: defaultProductActionFormValues,
  })
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'units',
  })

  const onSubmit = (_values: ProductActionForm) => {
    // Submit flow will be added in the next tasks.
  }

  const parseNumericInput = (value: string) => {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset(defaultProductActionFormValues)
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-3xl'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</DialogTitle>
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
                        <Input
                          placeholder='Paracetamol 500mg'
                          autoComplete='off'
                          {...field}
                        />
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
                    })}
                >
                  Thêm đơn vị
                </Button>
              </div>

              <div className='space-y-3'>
                {fields.map((field, index) => (
                  <div key={field.id} className='space-y-3 rounded-md border p-3'>
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
                                  field.onChange(parseNumericInput(event.target.value))}
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
                                  field.onChange(parseNumericInput(event.target.value))}
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
                                  field.onChange(parseNumericInput(event.target.value))}
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
          </form>
        </Form>

        <DialogFooter>
          <Button type='submit' form='product-action-form' disabled>
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
