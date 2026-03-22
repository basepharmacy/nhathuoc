import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import type { Supplier } from '@/services/supabase'
import { SupplierSwitcher } from './supplier-switcher'

type PurchaseOrdersSummaryProps = {
  suppliers: Supplier[]
  supplierId: string
  onSupplierChange: (supplierId: string) => void
  totals: {
    subtotal: number
    total: number
  }
  orderDiscount: number
  onOrderDiscountChange: (value: number) => void
  notes: string
  onNotesChange: (value: string) => void
  onSaveDraft: () => void
  onSubmit: () => void
  isSubmitting: boolean
  onAddSupplier?: () => void
}

export function PurchaseOrdersSummary({
  suppliers,
  supplierId,
  onSupplierChange,
  totals,
  orderDiscount,
  onOrderDiscountChange,
  notes,
  onNotesChange,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  onAddSupplier,
}: PurchaseOrdersSummaryProps) {
  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      <SupplierSwitcher
        suppliers={suppliers}
        activeSupplierId={supplierId}
        onChange={onSupplierChange}
        onAddSupplier={onAddSupplier}
      />

      <Separator />

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.subtotal)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={totals.subtotal}
            value={orderDiscount}
            onChange={onOrderDiscountChange}
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2 text-center'>
        <div className='text-sm text-muted-foreground'>Cần thanh toán</div>
        <div className='text-3xl font-bold text-foreground'>
          {formatCurrency(totals.total)}đ
        </div>
      </div>

      <Separator />

      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          className='h-9 flex-1 rounded-xl'
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          Lưu nháp (F1)
        </Button>
        <Button
          type='button'
          className='h-9 flex-1 rounded-xl'
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Đặt hàng (F9)
        </Button>
      </div>

      <Textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder='Ghi chú đơn nhập hàng'
        className='min-h-[120px] rounded-xl'
      />
    </div>
  )
}
