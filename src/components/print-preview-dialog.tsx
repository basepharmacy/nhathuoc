import { useCallback, useRef } from 'react'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type PrintPreviewDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  documentTitle?: string
  children: React.ReactNode
}

const PRINT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: monospace; font-size: 12px; color: #000; background: #fff; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 2px 0; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
  .font-semibold { font-weight: 600; }
  .border-dashed { border-top: 1px dashed #000; }
  .border-dotted { border-bottom: 1px dotted #999; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 120px; }
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 16px; }
  .mb-1 { margin-bottom: 4px; }
  .mb-2 { margin-bottom: 8px; }
  .mb-3 { margin-bottom: 12px; }
  .pt-2 { padding-top: 8px; }
  .py-1 { padding-top: 4px; padding-bottom: 4px; }
  .p-4 { padding: 16px; }
  .space-y-1 > * + * { margin-top: 4px; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .w-full { width: 100%; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 10px; }
  .text-gray { color: #666; }
  img { display: block; margin: 4px auto; }
  @media print { body { padding: 0; } }
`

export function PrintPreviewDialog({
  open,
  onOpenChange,
  title = 'Xem trước',
  documentTitle,
  children,
}: PrintPreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = useCallback(() => {
    const content = contentRef.current
    if (!content) return

    const printWindow = window.open('', '_blank', 'width=360,height=600')
    if (!printWindow) return

    printWindow.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${documentTitle ?? title}</title><style>${PRINT_STYLES}</style></head><body>${content.innerHTML}</body></html>`
    )
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }, [documentTitle, title])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={contentRef} className='max-h-[70vh] overflow-y-auto'>
          {children}
        </div>
        <div className='flex justify-end gap-2'>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handlePrint} className='gap-2'>
            <Printer className='size-4' />
            In
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
