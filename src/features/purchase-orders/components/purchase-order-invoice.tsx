import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Barcode from 'react-barcode'
import { formatCurrency } from '@/lib/utils'

type InvoiceItem = {
  product: { product_name: string }
  product_unit?: { unit_name: string } | null
  quantity: number
  unit_price: number
  discount: number | null
}

type PurchaseOrderInvoiceProps = {
  orderCode: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
  supplierName?: string
  items: InvoiceItem[]
  totals: { subtotal: number; total: number }
  orderDiscount: number
  paidAmount: number
  notes?: string
}

export function PurchaseOrderInvoice({
  orderCode,
  storeName,
  storeAddress,
  storePhone,
  supplierName,
  items,
  totals,
  orderDiscount,
  paidAmount,
  notes,
}: PurchaseOrderInvoiceProps) {
  const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })
  const debt = Math.max(0, totals.total - paidAmount)

  return (
    <div
      className='mx-auto w-[80mm] bg-white p-4 text-black print:p-0'
      style={{ fontFamily: 'monospace', fontSize: '12px' }}
    >
      {/* Header */}
      <div className='mb-3 text-center'>
        {storeName && <h1 className='text-sm font-bold uppercase'>{storeName}</h1>}
        {storeAddress && <p className='text-[10px] text-gray-600'>{storeAddress}</p>}
        {storePhone && <p className='text-[10px] text-gray-600'>DT: {storePhone}</p>}
        <h2 className='mt-2 text-base font-bold'>PHIEU NHAP HANG</h2>
        <p className='text-[11px]'>{orderCode}</p>
        <div className='mt-1 flex justify-center'>
          <Barcode
            value={orderCode}
            width={1.2}
            height={30}
            fontSize={0}
            margin={0}
            displayValue={false}
          />
        </div>
        <p className='text-[11px]'>{now}</p>
      </div>

      {supplierName && (
        <div className='mb-2 text-[11px]'>
          <span>NCC: </span>
          <span className='font-semibold'>{supplierName}</span>
        </div>
      )}

      {/* Separator */}
      <div className='border-t border-dashed border-black' />

      {/* Items */}
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
          {items.map((item, index) => {
            const discount = item.discount ?? 0
            const lineTotal = item.quantity * item.unit_price - discount
            const unitName = item.product_unit?.unit_name ?? ''
            return (
              <tr className='border-b border-dotted border-gray-400'>
                <td className='max-w-[120px] py-1 text-left'>
                  <div className='truncate'>
                    {index + 1}. {item.product.product_name}
                  </div>
                  {unitName && (
                    <div className='text-[10px] text-gray-600'>({unitName})</div>
                  )}
                  {discount > 0 && (
                    <div className='text-[10px] text-gray-600'>CK: -{formatCurrency(discount)}d</div>
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

      {/* Separator */}
      <div className='mt-1 border-t border-dashed border-black' />

      {/* Totals */}
      <div className='mt-2 space-y-1 text-[11px]'>
        <div className='flex justify-between'>
          <span>Tong tien:</span>
          <span>{formatCurrency(totals.subtotal)}d</span>
        </div>
        <div className='flex justify-between'>
          <span>Chiet khau:</span>
          <span>-{formatCurrency(orderDiscount)}d</span>
        </div>
        <div className='flex justify-between font-bold text-sm'>
          <span>THANH TOAN:</span>
          <span>{formatCurrency(totals.total)}d</span>
        </div>
        <div className='flex justify-between'>
          <span>Da tra:</span>
          <span>{formatCurrency(paidAmount)}d</span>
        </div>
        {debt > 0 && (
          <div className='flex justify-between font-semibold'>
            <span>Con no:</span>
            <span>{formatCurrency(debt)}d</span>
          </div>
        )}
      </div>

      {notes && (
        <div className='mt-2 text-[11px]'>
          <span>Ghi chu: </span>
          <span>{notes}</span>
        </div>
      )}

      {/* Separator */}
      <div className='mt-4 border-t border-dashed border-black' />

      {/* Signatures */}
      <div className='mt-2 flex justify-between text-[11px]'>
        <div className='flex flex-col items-center'>
          <span className='font-semibold'>Nguoi nhap hang</span>
          <span className='text-[10px] text-gray-600'>(Chu ky)</span>
          <div className='mt-16' />
        </div>
        <div className='flex flex-col items-center'>
          <span className='font-semibold'>Nha cung cap</span>
          <span className='text-[10px] text-gray-600'>(Chu ky)</span>
          <div className='mt-16' />
        </div>
      </div>
    </div>
  )
}
