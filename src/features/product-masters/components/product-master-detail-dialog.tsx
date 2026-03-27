import { type UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { productTypeLabels } from '@/features/products/data/schema'
import type { ProductMasterWithUnits } from '@/services/supabase/'

type ProductMasterDetailDialogProps = {
  master: ProductMasterWithUnits | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdded: boolean
  addMutation: UseMutationResult<void, Error, ProductMasterWithUnits[]>
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className='grid grid-cols-3 gap-2 py-1.5'>
      <span className='text-sm text-muted-foreground'>{label}</span>
      <span className='col-span-2 text-sm'>{value || '--'}</span>
    </div>
  )
}

export function ProductMasterDetailDialog({
  master,
  open,
  onOpenChange,
  isAdded,
  addMutation,
}: ProductMasterDetailDialogProps) {
  if (!master) return null

  const units = master.product_master_units ?? []
  const baseUnit = units.find((u) => u.is_base_unit) ?? units[0]
  const baseUnitName = baseUnit?.unit_name ?? ''
  const typeLabel = productTypeLabels[master.product_type] ?? master.product_type

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-hidden'>
        <DialogHeader className='text-start'>
          <DialogTitle>Thông tin chi tiết thuốc</DialogTitle>
          <DialogDescription>Bạn có thể thêm thuốc vào danh sách thuốc của mình.</DialogDescription>
        </DialogHeader>

        <ScrollArea className='max-h-[60vh] pr-3'>
          <div className='space-y-4'>
            {/* Basic info */}
            <div className='rounded-lg border p-4 space-y-1'>
              <div className='text-sm font-semibold mb-2'>Thông tin cơ bản</div>
              <InfoRow label='Tên sản phẩm' value={master.product_name} />
              <InfoRow label='Số đăng ký' value={master.regis_number} />
              <InfoRow label='Mã JAN' value={master.jan_code} />
              <div className='grid grid-cols-3 gap-2 py-1.5'>
                <span className='text-sm text-muted-foreground'>Loại</span>
                <span className='col-span-2'>
                  <Badge variant='secondary'>{typeLabel}</Badge>
                </span>
              </div>
              <InfoRow label='Hoạt chất' value={master.active_ingredient} />
            </div>

            <Separator />

            {/* Units info */}
            <div className='space-y-4'>
              <div className='text-sm font-semibold'>Đơn vị</div>
              {units.length === 0 ? (
                <p className='text-sm text-muted-foreground'>Không có đơn vị nào.</p>
              ) : (
                <div className='space-y-4'>
                  {units.map((unit) => (
                    <div
                      key={unit.id}
                      className='rounded-lg border bg-muted/30 p-4 shadow-sm'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='text-sm font-medium'>{unit.unit_name}</span>
                        {unit.is_base_unit && (
                          <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                            Cơ sở
                          </span>
                        )}
                        {!unit.is_base_unit && (
                          <span className='text-sm text-muted-foreground'>
                            {unit.conversion_factor} {baseUnitName}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Additional info */}
            <div className='space-y-1'>
              <div className='text-sm font-semibold mb-2'>Thông tin thêm</div>
              <InfoRow label='Nhà sản xuất' value={master.made_company_name} />
              <InfoRow label='Nhà phân phối' value={master.sale_company_name} />
              <InfoRow label='Nguồn' value={master.source} />
              <div className='grid grid-cols-3 gap-2 py-1.5'>
                <span className='text-sm text-muted-foreground'>Mô tả</span>
                <span className='col-span-2 text-sm whitespace-pre-wrap'>{master.description || '--'}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          {isAdded ? (
            <Button disabled variant='outline'>
              <CheckCircle2 className='mr-1 h-4 w-4 text-green-600' />
              Đã thêm
            </Button>
          ) : (
            <Button
              onClick={() => addMutation.mutate([master], {
                onSuccess: () => {
                  toast.success('Đã thêm sản phẩm thành công')
                  onOpenChange(false)
                },
              })}
              disabled={addMutation.isPending}
            >
              <Plus className='mr-1 h-4 w-4' />
              {addMutation.isPending ? 'Đang thêm...' : 'Thêm vào sản phẩm'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
