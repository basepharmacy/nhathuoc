import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from '@tanstack/react-router'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabaseAuth } from '@/services/supabase'
import { mapSupabaseError } from '@/lib/error-mapper'
import { getOfflineMutations } from '@/services/offline/mutation-queue'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoading, setIsLoading] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    if (open) {
      getOfflineMutations().then((mutations) => setPendingCount(mutations.length))
    }
  }, [open])

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      await supabaseAuth.signOut()
      onOpenChange(false)

      // Preserve current location for redirect after sign-in
      const currentPath = location.href
      navigate({
        to: '/sign-in',
        search: { redirect: currentPath },
        replace: true,
      })
    } catch (error) {
      toast.error(mapSupabaseError(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Đăng xuất'
      desc={
        pendingCount > 0 ? (
          <div className='space-y-3'>
            <p>Bạn có chắc chắn muốn đăng xuất?</p>
            <div className='flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3'>
              <AlertTriangle className='mt-0.5 size-5 shrink-0 text-destructive' />
              <div className='text-sm font-medium text-destructive'>
                Có {pendingCount} đơn bán hàng chưa được đồng bộ lên server.
                Nếu đăng xuất, dữ liệu này sẽ <strong>bị mất vĩnh viễn</strong> và không thể khôi phục!
              </div>
            </div>
          </div>
        ) : (
          'Bạn có chắc chắn muốn đăng xuất? Bạn sẽ cần đăng nhập lại để truy cập tài khoản của mình.'
        )
      }
      confirmText='Đăng xuất'
      destructive
      handleConfirm={handleSignOut}
      isLoading={isLoading}
      className='sm:max-w-sm'
    />
  )
}
