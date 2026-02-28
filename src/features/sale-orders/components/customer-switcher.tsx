import { useMemo, useState } from 'react'
import { ChevronDown, UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { Customer } from '@/services/supabase/database/repo/customersRepo'

type CustomerSwitcherProps = {
  customers: Customer[]
  activeCustomerId: string
  onChange: (customerId: string) => void
  onAddCustomer?: () => void
  disabled?: boolean
}

export function CustomerSwitcher({
  customers,
  activeCustomerId,
  onChange,
  onAddCustomer,
  disabled = false,
}: CustomerSwitcherProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const activeCustomer =
    customers.find((customer) => customer.id === activeCustomerId) ?? null
  const filteredCustomers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return customers
    }

    return customers.filter((customer) => {
      const haystack = [
        customer.name,
        customer.address ?? '',
        customer.phone ?? '',
        customer.description ?? '',
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(query)
    })
  }, [searchTerm, customers])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='h-14 w-full justify-between rounded-xl px-4'
          disabled={disabled}
        >
          <div className='flex items-center gap-3 text-start'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Users className='size-4' />
            </div>
            <div className='grid text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {activeCustomer?.name ?? 'Chọn khách hàng'}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {activeCustomer?.address ?? '—'}
              </span>
            </div>
          </div>
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-64 rounded-lg'>
        <DropdownMenuLabel className='text-xs text-muted-foreground'>
          Khách hàng
        </DropdownMenuLabel>
        {onAddCustomer && (
          <>
            <DropdownMenuItem onClick={onAddCustomer} className='gap-2 p-2'>
              <div className='flex size-6 items-center justify-center rounded-sm border'>
                <UserPlus className='size-4 shrink-0' />
              </div>
              <div className='grid flex-1 text-sm leading-tight'>
                <span className='truncate font-medium'>Thêm khách hàng mới</span>
                <span className='truncate text-xs text-muted-foreground'>
                  Tạo khách hàng nhanh
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <div className='px-2 pb-2'>
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Tìm khách hàng...'
            className='h-8 rounded-md text-sm'
            onKeyDown={(event) => event.stopPropagation()}
          />
        </div>
        <DropdownMenuSeparator />
        {filteredCustomers.length === 0 ? (
          <div className='px-3 py-2 text-xs text-muted-foreground'>
            Không tìm thấy khách hàng phù hợp.
          </div>
        ) : null}
        {filteredCustomers.map((customer) => (
          <DropdownMenuItem
            key={customer.id}
            onClick={() => onChange(customer.id)}
            className='gap-2 p-2'
          >
            <div className='flex size-6 items-center justify-center rounded-sm border'>
              <Users className='size-4 shrink-0' />
            </div>
            <div className='grid flex-1 text-sm leading-tight'>
              <span className='truncate font-medium'>{customer.name}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {customer.address ?? '—'}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        {filteredCustomers.length > 1 && <DropdownMenuSeparator />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
