import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CloudOff, Eye, Printer } from 'lucide-react'
import { type OfflineMutation } from '@/services/offline/mutation-queue'
import { getBankAccountsQueryOptions } from '@/client/queries'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VietQrImage } from '@/components/viet-qr-image'
import { formatCurrency } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type OfflineOrdersBannerProps = {
  mutations: OfflineMutation[]
  tenantId: string
}

type OrderItemPayload = {
  product_id: string
  product_unit_id: string | null
  quantity: number
  unit_price: number
  discount: number
  batch_id: string | null
  _display?: {
    productName: string
    unitName: string
    batchCode: string
    expiryDate: string
  }
}

type OrderPayload = {
  order: {
    sale_order_code?: string
    status?: string
    total_amount?: number
    location_id?: string
    discount?: number
    customer_paid_amount?: number
    notes?: string | null
    issued_at?: string
  }
  items?: OrderItemPayload[]
  orderId?: string
  tenantId?: string
  _display?: {
    customerName: string
    locationName: string
  }
}

const formatDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const formatShortDate = (value?: string) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

const getMutationLabel = (type: OfflineMutation['type']) => {
  switch (type) {
    case 'create-sale-order':
      return 'Tạo mới'
    case 'update-sale-order':
      return 'Cập nhật'
    default:
      return type
  }
}

const statusLabels: Record<string, string> = {
  '1_DRAFT': 'Nháp',
  '2_COMPLETE': 'Hoàn tất',
  '9_CANCELLED': 'Đã hủy',
}

function OfflineInvoice({ mutation, tenantId }: { mutation: OfflineMutation; tenantId: string }) {
  const { data: bankAccounts } = useQuery(getBankAccountsQueryOptions(tenantId))
  const defaultBankAccount = useMemo(
    () => bankAccounts?.find((a) => a.is_default) ?? bankAccounts?.[0] ?? null,
    [bankAccounts]
  )
  const payload = mutation.payload as OrderPayload
  const order = payload.order
  const items = payload.items ?? []
  const display = payload._display

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )
  const total = order?.total_amount ?? Math.max(0, subtotal - (order?.discount ?? 0))
  const cashPaid = order?.customer_paid_amount ?? 0
  const changeAmount = Math.max(0, cashPaid - total)

  return (
    <div
      className='mx-auto w-[80mm] bg-white p-4 text-black print:p-0'
      style={{ fontFamily: 'monospace', fontSize: '12px' }}
    >
      {/* Header */}
      <div className='mb-3 text-center'>
        {display?.locationName && (
          <h1 className='text-sm font-bold uppercase'>{display.locationName}</h1>
        )}
        <h2 className='mt-2 text-base font-bold'>HOA DON BAN HANG</h2>
        <p className='text-[11px]'>{order?.sale_order_code ?? '—'}</p>
        <p className='text-[11px]'>
          {order?.issued_at ? formatDate(order.issued_at) : formatDate(mutation.createdAt)}
        </p>
      </div>

      {display?.customerName && (
        <div className='mb-2 text-[11px]'>
          <span>Khach hang: </span>
          <span className='font-semibold'>{display.customerName}</span>
        </div>
      )}

      <div className='border-t border-dashed border-black' />

      <table className='mt-2 w-full text-[11px]'>
        <thead>
          <tr className='border-b border-dashed border-black'>
            <th className='py-1 text-left'>SP</th>
            <th className='py-1 text-center'>SL</th>
            <th className='py-1 text-right'>DG</th>
            <th className='py-1 text-right'>TT</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const lineTotal = item.quantity * item.unit_price - item.discount
            return (
              <tr key={idx} className='border-b border-dotted border-gray-400'>
                <td className='max-w-[120px] py-1 text-left'>
                  <div className='truncate'>
                    {idx + 1}. {item._display?.productName ?? item.product_id}
                  </div>
                  {item._display?.unitName && (
                    <div className='text-[10px] text-gray-600'>
                      ({item._display.unitName})
                    </div>
                  )}
                  {item.discount > 0 && (
                    <div className='text-[10px] text-gray-600'>
                      CK: -{formatCurrency(item.discount)}d
                    </div>
                  )}
                </td>
                <td className='py-1 text-center'>{item.quantity}</td>
                <td className='py-1 text-right whitespace-nowrap'>
                  {formatCurrency(item.unit_price)}
                </td>
                <td className='py-1 text-right whitespace-nowrap'>
                  {formatCurrency(lineTotal)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className='mt-1 border-t border-dashed border-black' />

      <div className='mt-2 space-y-1 text-[11px]'>
        <div className='flex justify-between'>
          <span>Tong tien:</span>
          <span>{formatCurrency(subtotal)}d</span>
        </div>
        <div className='flex justify-between'>
          <span>Chiet khau:</span>
          <span>-{formatCurrency(order?.discount ?? 0)}d</span>
        </div>
        <div className='flex justify-between text-sm font-bold'>
          <span>THANH TOAN:</span>
          <span>{formatCurrency(total)}d</span>
        </div>
      </div>

      {cashPaid > 0 && (
        <div className='mt-2 space-y-1 text-[11px]'>
          <div className='flex justify-between'>
            <span>Tien khach dua:</span>
            <span>{formatCurrency(cashPaid)}d</span>
          </div>
          <div className='flex justify-between'>
            <span>Tien thua:</span>
            <span>{formatCurrency(changeAmount)}d</span>
          </div>
        </div>
      )}

      {order?.notes && (
        <div className='mt-2 text-[11px]'>
          <span>Ghi chu: </span>
          <span>{order.notes}</span>
        </div>
      )}

      {/* QR Code */}
      {defaultBankAccount && (
        <div className='mt-3 flex flex-col items-center'>
          <div className='mb-1 border-t border-dashed border-black w-full' />
          <p className='mt-2 text-[11px] font-semibold'>Quet ma QR de thanh toan</p>
          <VietQrImage
            bankBin={defaultBankAccount.bank_bin}
            accountNumber={defaultBankAccount.account_number}
            accountHolder={defaultBankAccount.account_holder}
            size={180}
            className='mt-1 border-none'
          />
        </div>
      )}

      <div className='mt-4 border-t border-dashed border-black pt-2 text-center text-[11px]'>
        <p>Cam on quy khach!</p>
      </div>
    </div>
  )
}

function OfflineOrderDetailDialog({
  mutation,
  open,
  onOpenChange,
  tenantId,
}: {
  mutation: OfflineMutation
  open: boolean
  onOpenChange: (open: boolean) => void
  tenantId: string
}) {
  const [printOpen, setPrintOpen] = useState(false)
  const payload = mutation.payload as OrderPayload
  const order = payload.order
  const items = payload.items ?? []
  const display = payload._display

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <DialogTitle>
              Chi tiết đơn offline — {order?.sale_order_code ?? mutation.orderId ?? '—'}
            </DialogTitle>
            <DialogDescription>
              {getMutationLabel(mutation.type)} lúc {formatDate(mutation.createdAt)}
            </DialogDescription>
          </DialogHeader>

          <div className='grid grid-cols-2 gap-x-6 gap-y-2 text-sm'>
            <div>
              <span className='text-muted-foreground'>Khách hàng:</span>{' '}
              <span className='font-medium'>{display?.customerName || '—'}</span>
            </div>
            <div>
              <span className='text-muted-foreground'>Cửa hàng:</span>{' '}
              <span className='font-medium'>{display?.locationName || '—'}</span>
            </div>
            <div>
              <span className='text-muted-foreground'>Trạng thái:</span>{' '}
              <span className='font-medium'>
                {statusLabels[order?.status ?? ''] ?? order?.status ?? '—'}
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>Ngày bán:</span>{' '}
              <span className='font-medium'>
                {order?.issued_at ? formatShortDate(order.issued_at) : '—'}
              </span>
            </div>
            {order?.notes && (
              <div className='col-span-2'>
                <span className='text-muted-foreground'>Ghi chú:</span>{' '}
                <span className='font-medium'>{order.notes}</span>
              </div>
            )}
          </div>

          <div className='overflow-hidden rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-xs'>Sản phẩm</TableHead>
                  <TableHead className='text-xs'>Đơn vị</TableHead>
                  <TableHead className='text-right text-xs'>SL</TableHead>
                  <TableHead className='text-right text-xs'>Đơn giá</TableHead>
                  <TableHead className='text-right text-xs'>CK</TableHead>
                  <TableHead className='text-right text-xs'>Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unit_price - item.discount
                  return (
                    <TableRow key={idx}>
                      <TableCell className='text-sm'>
                        <div>{item._display?.productName ?? item.product_id}</div>
                        {item._display?.batchCode && (
                          <div className='text-xs text-muted-foreground'>
                            Lô: {item._display.batchCode}
                            {item._display.expiryDate &&
                              ` — HSD: ${formatShortDate(item._display.expiryDate)}`}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className='text-sm'>
                        {item._display?.unitName || '—'}
                      </TableCell>
                      <TableCell className='text-right text-sm'>
                        {item.quantity}
                      </TableCell>
                      <TableCell className='text-right text-sm text-nowrap'>
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className='text-right text-sm text-nowrap'>
                        {item.discount > 0 ? formatCurrency(item.discount) : '—'}
                      </TableCell>
                      <TableCell className='text-right text-sm font-medium text-nowrap'>
                        {formatCurrency(lineTotal)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className='flex flex-col items-end gap-1 text-sm'>
            <div>
              <span className='text-muted-foreground'>Tạm tính:</span>{' '}
              <span className='font-medium'>{formatCurrency(subtotal)}</span>
            </div>
            {(order?.discount ?? 0) > 0 && (
              <div>
                <span className='text-muted-foreground'>Chiết khấu:</span>{' '}
                <span className='font-medium'>
                  -{formatCurrency(order?.discount ?? 0)}
                </span>
              </div>
            )}
            <div className='text-base'>
              <span className='text-muted-foreground'>Tổng cộng:</span>{' '}
              <span className='font-bold'>
                {formatCurrency(order?.total_amount ?? 0)}
              </span>
            </div>
            {(order?.customer_paid_amount ?? 0) > 0 && (
              <div>
                <span className='text-muted-foreground'>Khách trả:</span>{' '}
                <span className='font-medium'>
                  {formatCurrency(order?.customer_paid_amount ?? 0)}
                </span>
              </div>
            )}
          </div>

          <div className='flex justify-end'>
            <Button
              variant='outline'
              className='gap-2'
              onClick={() => setPrintOpen(true)}
            >
              <Printer className='size-4' />
              In hoá đơn
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PrintPreviewDialog
        open={printOpen}
        onOpenChange={setPrintOpen}
        title='In hoá đơn offline'
        documentTitle={`Hoa don - ${order?.sale_order_code ?? ''}`}
      >
        <OfflineInvoice mutation={mutation} tenantId={tenantId} />
      </PrintPreviewDialog>
    </>
  )
}

export function OfflineOrdersBanner({ mutations, tenantId }: OfflineOrdersBannerProps) {
  const [selectedMutation, setSelectedMutation] = useState<OfflineMutation | null>(null)

  if (mutations.length === 0) return null

  return (
    <>
      <div className='rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'>
        <div className='flex items-center gap-2 border-b border-amber-200 px-4 py-3 dark:border-amber-800'>
          <CloudOff className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
            {mutations.length} đơn hàng chờ đồng bộ
          </span>
          <Badge
            variant='outline'
            className='border-amber-300 bg-amber-100 text-amber-700 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-300'
          >
            Offline
          </Badge>
        </div>
        <div className='overflow-hidden'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-amber-50 dark:hover:bg-amber-950/30'>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20'>
                  Mã đơn
                </TableHead>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20'>
                  Loại
                </TableHead>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20'>
                  Trạng thái
                </TableHead>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20'>
                  Số tiền
                </TableHead>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20'>
                  Thời gian tạo
                </TableHead>
                <TableHead className='bg-amber-50/50 text-xs dark:bg-amber-950/20' />
              </TableRow>
            </TableHeader>
            <TableBody>
              {mutations.map((mutation) => {
                const payload = mutation.payload as OrderPayload
                const order = payload.order
                const code =
                  order?.sale_order_code ?? mutation.orderId ?? '—'
                const status = order?.status ?? '—'
                const total = order?.total_amount ?? 0

                return (
                  <TableRow
                    key={mutation.id}
                    className='hover:bg-amber-50 dark:hover:bg-amber-950/30'
                  >
                    <TableCell className='text-sm font-medium'>
                      {code}
                    </TableCell>
                    <TableCell className='text-sm'>
                      {getMutationLabel(mutation.type)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant='outline'
                        className='border-amber-300 bg-amber-100/60 text-xs text-amber-700 dark:border-amber-600 dark:bg-amber-900/60 dark:text-amber-300'
                      >
                        {statusLabels[status] ?? status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-sm text-nowrap'>
                      {formatCurrency(total)}
                    </TableCell>
                    <TableCell className='text-sm text-muted-foreground'>
                      {formatDate(mutation.createdAt)}
                    </TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200'
                        onClick={() => setSelectedMutation(mutation)}
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {selectedMutation && (
        <OfflineOrderDetailDialog
          mutation={selectedMutation}
          open={!!selectedMutation}
          onOpenChange={(open) => {
            if (!open) setSelectedMutation(null)
          }}
          tenantId={tenantId}
        />
      )}
    </>
  )
}
