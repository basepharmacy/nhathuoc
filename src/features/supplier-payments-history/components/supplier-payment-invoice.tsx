import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Barcode from 'react-barcode'
import { formatCurrency } from '@/lib/utils'

type SupplierPaymentInvoiceProps = {
  referenceCode: string
  tenantName?: string
  tenantAddress?: string
  tenantPhone?: string
  storeName?: string
  storeAddress?: string
  storePhone?: string
  supplierName?: string
  amount: number
  paymentDate?: string | null
  note?: string | null
}

export function SupplierPaymentInvoice({
  referenceCode,
  tenantName,
  tenantAddress,
  tenantPhone,
  storeName,
  storeAddress,
  storePhone,
  supplierName,
  amount,
  paymentDate,
  note,
}: SupplierPaymentInvoiceProps) {
  const now = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: vi })

  const formattedPaymentDate = paymentDate
    ? format(new Date(paymentDate), 'dd/MM/yyyy', { locale: vi })
    : '—'

  return (
    <div
      className='mx-auto w-[80mm] bg-white p-4 text-black print:p-0'
      style={{ fontFamily: 'monospace', fontSize: '12px' }}
    >
      {/* Tenant info */}
      {(tenantName || tenantAddress || tenantPhone) && (
        <div className='mb-2 text-center'>
          {tenantName && <h1 className='text-sm font-bold uppercase'>{tenantName}</h1>}
          {tenantAddress && <p className='text-[10px] text-gray-600'>{tenantAddress}</p>}
          {tenantPhone && <p className='text-[10px] text-gray-600'>DT: {tenantPhone}</p>}
        </div>
      )}

      {/* Header */}
      <div className='mb-3 text-center'>
        {storeName && <h1 className='text-sm font-bold uppercase'>{storeName}</h1>}
        {storeAddress && <p className='text-[10px] text-gray-600'>{storeAddress}</p>}
        {storePhone && <p className='text-[10px] text-gray-600'>DT: {storePhone}</p>}
        <h2 className='mt-2 text-base font-bold'>PHIEU THANH TOAN NCC</h2>
        <p className='text-[11px]'>Ma tham chieu: {referenceCode}</p>
        <div className='mt-1 flex justify-center'>
          <Barcode
            value={referenceCode}
            width={1.2}
            height={30}
            fontSize={0}
            margin={0}
            displayValue={false}
          />
        </div>
        <p className='text-[11px]'>Ngay in: {now}</p>
      </div>

      {/* Separator */}
      <div className='border-t border-dashed border-black' />

      {/* Details */}
      <div className='mt-2 space-y-1 text-[11px]'>
        {supplierName && (
          <div className='flex justify-between'>
            <span>NCC:</span>
            <span className='font-semibold'>{supplierName}</span>
          </div>
        )}
        <div className='flex justify-between'>
          <span>Ngay thanh toan:</span>
          <span>{formattedPaymentDate}</span>
        </div>
      </div>

      {/* Separator */}
      <div className='mt-2 border-t border-dashed border-black' />

      {/* Amount */}
      <div className='mt-2 space-y-1 text-[11px]'>
        <div className='flex justify-between font-bold text-sm'>
          <span>SO TIEN:</span>
          <span>{formatCurrency(amount)}d</span>
        </div>
      </div>

      {note && (
        <div className='mt-2 text-[11px]'>
          <span>Ghi chu: </span>
          <span>{note}</span>
        </div>
      )}

      {/* Separator */}
      <div className='mt-4 border-t border-dashed border-black' />

      {/* Signatures */}
      <div className='mt-2 flex justify-between text-[11px]'>
        <div className='flex flex-col items-center'>
          <span className='font-semibold'>Nguoi thanh toan</span>
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
