import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Barcode from 'react-barcode'
import { formatCurrency } from '@/lib/utils'
import { VietQrImage } from '@/components/viet-qr-image'
import { type SaleOrderItem } from '../data/types'
import type { BankAccount } from '@/services/supabase/database/repo/bankAccountsRepo'

type SaleOrderInvoiceProps = {
  orderCode: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
  items: SaleOrderItem[]
  totals: { subtotal: number; total: number }
  orderDiscount: number
  customerName?: string
  paymentMethod: 'CASH' | 'TRANSFER'
  cashReceived?: number
  changeAmount?: number
  bankAccount?: BankAccount | null
  notes?: string
}

export function SaleOrderInvoice({
  orderCode,
  storeName,
  storeAddress,
  storePhone,
  items,
  totals,
  orderDiscount,
  customerName,
  paymentMethod,
  cashReceived,
  changeAmount,
  bankAccount,
  notes,
}: SaleOrderInvoiceProps) {
  const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })

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
        <h2 className='mt-2 text-base font-bold'>HOA DON BAN HANG</h2>
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

      {customerName && (
        <div className='mb-2 text-[11px]'>
          <span>Khach hang: </span>
          <span className='font-semibold'>{customerName}</span>
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
            const lineTotal = item.quantity * item.unitPrice - item.discount
            const unitName =
              item.product.product_units?.find(
                (u) => u.id === item.productUnitId
              )?.unit_name ?? ''
            return (
              <tr key={item.id} className='border-b border-dotted border-gray-400'>
                <td className='max-w-[120px] py-1 text-left'>
                  <div className='truncate'>
                    {index + 1}. {item.product.product_name}
                  </div>
                  {unitName && (
                    <div className='text-[10px] text-gray-600'>({unitName})</div>
                  )}
                  {item.discount > 0 && (
                    <div className='text-[10px] text-gray-600'>CK: -{formatCurrency(item.discount)}d</div>
                  )}
                </td>
                <td className='py-1 text-center'>{item.quantity}</td>
                <td className='py-1 text-right whitespace-nowrap'>
                  {formatCurrency(item.unitPrice)}
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
      </div>

      {/* Payment method */}
      <div className='mt-2 space-y-1 text-[11px]'>
        <div>
          <span>PT thanh toan: </span>
          <span className='font-semibold'>
            {paymentMethod === 'CASH' ? 'Tien mat' : 'Chuyen khoan'}
          </span>
        </div>
        {paymentMethod === 'CASH' && (
          <>
            <div className='flex justify-between'>
              <span>Tien khach dua:</span>
              <span>{formatCurrency(cashReceived ?? 0)}d</span>
            </div>
            <div className='flex justify-between'>
              <span>Tien thua:</span>
              <span>{formatCurrency(changeAmount ?? 0)}d</span>
            </div>
          </>
        )}
      </div>

      {notes && (
        <div className='mt-2 text-[11px]'>
          <span>Ghi chu: </span>
          <span>{notes}</span>
        </div>
      )}

      {/* QR Code */}
      {bankAccount && (
        <div className='mt-3 flex flex-col items-center'>
          <div className='mb-1 border-t border-dashed border-black w-full' />
          <p className='mt-2 text-[11px] font-semibold'>Quet ma QR de thanh toan</p>
          <VietQrImage
            bankBin={bankAccount.bank_bin}
            accountNumber={bankAccount.account_number}
            accountHolder={bankAccount.account_holder}
            amount={totals.total}
            note={orderCode}
            size={180}
            className='mt-1 border-none'
          />
        </div>
      )}

      {/* Footer */}
      <div className='mt-4 border-t border-dashed border-black pt-2 text-center text-[11px]'>
        <p>Cam on quy khach!</p>
      </div>
    </div>
  )
}
