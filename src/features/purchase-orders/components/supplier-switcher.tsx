import { Building2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Supplier } from '@/services/supabase/database/repo/suppliersRepo'

type SupplierSwitcherProps = {
  suppliers: Supplier[]
  activeSupplierId: string
  onChange: (supplierId: string) => void
  disabled?: boolean
}

export function SupplierSwitcher({
  suppliers,
  activeSupplierId,
  onChange,
  disabled = false,
}: SupplierSwitcherProps) {
  const activeSupplier =
    suppliers.find((supplier) => supplier.id === activeSupplierId) ?? null

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
              <Building2 className='size-4' />
            </div>
            <div className='grid text-sm leading-tight'>
              <span className='truncate font-semibold'>
                {activeSupplier?.name ?? 'Chọn nhà cung cấp'}
              </span>
              <span className='truncate text-xs text-muted-foreground'>
                {activeSupplier?.address ?? '—'}
              </span>
            </div>
          </div>
          <ChevronDown className='h-4 w-4 text-muted-foreground' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='min-w-64 rounded-lg'>
        <DropdownMenuLabel className='text-xs text-muted-foreground'>
          Nhà cung cấp
        </DropdownMenuLabel>
        {suppliers.map((supplier) => (
          <DropdownMenuItem
            key={supplier.id}
            onClick={() => onChange(supplier.id)}
            className='gap-2 p-2'
          >
            <div className='flex size-6 items-center justify-center rounded-sm border'>
              <Building2 className='size-4 shrink-0' />
            </div>
            <div className='grid flex-1 text-sm leading-tight'>
              <span className='truncate font-medium'>{supplier.name}</span>
              <span className='truncate text-xs text-muted-foreground'>
                {supplier.address ?? '—'}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
        {suppliers.length > 1 && <DropdownMenuSeparator />}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
