import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBankAccounts } from './bank-accounts-provider'

export function BankAccountsPrimaryButtons() {
  const { setOpen } = useBankAccounts()
  return (
    <Button className='space-x-1' onClick={() => setOpen('add')}>
      <span>Thêm tài khoản</span> <Plus size={18} />
    </Button>
  )
}
