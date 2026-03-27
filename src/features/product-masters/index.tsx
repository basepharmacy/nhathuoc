import { useEffect, useRef, useState } from 'react'
import { type PaginationState } from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Input } from '@/components/ui/input'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useUser } from '@/client/provider'
import { productsRepo } from '@/client'
import { getProductMastersBySourceQueryOptions } from '@/client/queries'
import type { ProductMasterWithUnits } from '@/services/supabase/'
import { ProductMastersTable } from './components/product-masters-table'

export function ProductMasters() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Reset page when search changes
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch])

  const { data, isLoading, isError } = useQuery({
    ...getProductMastersBySourceQueryOptions({
      source: '1_DAVE',
      search: debouncedSearch,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
    }),
  })

  const addMutation = useMutation({
    mutationFn: async (masters: ProductMasterWithUnits[]) => {
      const productRows = masters.map((master) => ({
        id: crypto.randomUUID(),
        tenant_id: tenantId,
        product_name: master.product_name,
        product_type: master.product_type,
        status: '1_DRAFT' as const,
        active_ingredient: master.active_ingredient ?? null,
        regis_number: master.regis_number ?? null,
        jan_code: master.jan_code ?? null,
        made_company_name: master.made_company_name ?? null,
        sale_company_name: master.sale_company_name ?? null,
        description: master.description ?? null,
      }))

      const createdProducts = await productsRepo.createBatchProducts(productRows)

      const unitRows = createdProducts.flatMap((product, i) => {
        const master = masters[i]
        const masterUnits = master.product_master_units ?? []
        const sorted = [...masterUnits].sort(
          (a, b) => Number(b.is_base_unit) - Number(a.is_base_unit)
        )
        const units = sorted.length > 0
          ? sorted.map((u) => ({
            product_id: product.id,
            tenant_id: tenantId,
            unit_name: u.unit_name,
            conversion_factor: u.is_base_unit ? 1 : Number(u.conversion_factor ?? 1),
            cost_price: null as number | null,
            sell_price: null as number | null,
            is_base_unit: u.is_base_unit,
          }))
          : [{
            product_id: product.id,
            tenant_id: tenantId,
            unit_name: 'Đơn vị',
            conversion_factor: 1,
            cost_price: null as number | null,
            sell_price: null as number | null,
            is_base_unit: true,
          }]
        return units
      })

      await productsRepo.createBatchProductUnits(unitRows)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
    },
    onError: (err) => {
      if (err.message === 'MAX_PRODUCT_LIMIT_REACHED') {
        toast.error('Đã đạt giới hạn sản phẩm tối đa.')
      } else {
        toast.error('Có lỗi xảy ra khi thêm sản phẩm.')
      }
    },
  })

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      toast.error('Co loi khi lay du lieu tu server, vui long thu lai')
      hasShownError.current = true
    }
  }, [isError])

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Danh sách thuốc từ bộ Y tế</h2>
            <p className='text-sm text-muted-foreground'>
              Chọn thuốc từ danh mục BYT để thêm vào sản phẩm của bạn.
            </p>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-center gap-2'>
          <Input
            placeholder='Tìm tên, số đăng ký, hoạt chất...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='h-8 w-[150px] lg:w-[300px]'
          />
        </div>
        <ProductMastersTable
          data={data?.data ?? []}
          total={data?.total ?? 0}
          isLoading={isLoading}
          pagination={pagination}
          onPaginationChange={setPagination}
          addMutation={addMutation}
        />
      </Main>
    </>
  )
}
