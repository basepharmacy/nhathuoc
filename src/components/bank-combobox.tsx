'use client'

import { useState } from 'react'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import vietQrBanks from '@/lib/viet-qr-banks.json'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export const bankByBin = new Map(vietQrBanks.map((bank) => [bank.bin, bank]))

const bankOptions = [...vietQrBanks].sort((a, b) =>
  (a.shortName || a.name).localeCompare(b.shortName || b.name, 'vi')
)

export function BankCombobox({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
        >
          {value
            ? bankByBin.get(value)?.shortName
              ?? bankByBin.get(value)?.name
              ?? 'Chọn ngân hàng'
            : 'Chọn ngân hàng'}
          <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-[280px] p-0 max-h-[320px] overflow-hidden'
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder='Tìm ngân hàng...' />
          <CommandEmpty>Không tìm thấy.</CommandEmpty>
          <CommandGroup>
            <CommandList className='max-h-[240px] overflow-y-auto'>
              {bankOptions.map((bank) => (
                <CommandItem
                  key={bank.bin}
                  value={`${bank.shortName || bank.name} ${bank.code}`}
                  onSelect={() => {
                    onChange(bank.bin)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'size-4',
                      bank.bin === value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {bank.shortName || bank.name}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
