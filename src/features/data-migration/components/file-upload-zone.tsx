import { useRef } from 'react'
import { AlertCircle, FileSpreadsheet, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { FileUploadState } from '../utils/types'
import { isSupportedFile } from '../utils/file-parser'

export function FileUploadZone({
  label,
  state,
  onFileSelect,
  onRemove,
}: {
  label: string
  state: FileUploadState
  onFileSelect: (file: File) => void
  onRemove: () => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && isSupportedFile(file.name)) {
      onFileSelect(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
  }

  if (state.error) {
    return (
      <div className='space-y-3'>
        <div className='flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900'>
              <AlertCircle className='size-5 text-red-600 dark:text-red-400' />
            </div>
            <div>
              <p className='text-sm font-medium text-red-700 dark:text-red-300'>
                File không hợp lệ
              </p>
              <p className='text-xs text-red-600 dark:text-red-400'>
                {state.error}
              </p>
            </div>
          </div>
          <Button variant='ghost' size='icon' onClick={onRemove}>
            <X className='size-4' />
          </Button>
        </div>
      </div>
    )
  }

  if (state.file) {
    return (
      <div className='flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950'>
        <div className='flex items-center gap-3'>
          <div className='flex size-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900'>
            <FileSpreadsheet className='size-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <p className='text-sm font-medium'>{state.fileName}</p>
            {state.rowCount !== null && (
              <p className='text-xs text-muted-foreground'>
                {state.rowCount} dòng dữ liệu
              </p>
            )}
          </div>
        </div>
        <Button variant='ghost' size='icon' onClick={onRemove}>
          <X className='size-4' />
        </Button>
      </div>
    )
  }

  return (
    <div
      className='flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-muted-foreground/50 hover:bg-muted/50'
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className='flex size-12 items-center justify-center rounded-full bg-muted'>
        <Upload className='size-5 text-muted-foreground' />
      </div>
      <div className='text-center'>
        <p className='text-sm font-medium'>
          Kéo thả file CSV/Excel {label} vào đây
        </p>
        <p className='text-xs text-muted-foreground'>
          hoặc nhấn để chọn file từ máy tính
        </p>
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='.csv,.xlsx,.xls'
        className='hidden'
        onChange={handleChange}
      />
    </div>
  )
}
