import { useState, useRef } from 'react'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Loader2,
  SkipForward,
  Upload,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const steps = [
  { title: 'Chọn hệ thống', description: 'Chọn hệ thống gốc' },
  { title: 'Sản phẩm', description: 'Upload danh sách sản phẩm' },
  { title: 'Nhà cung cấp', description: 'Upload nhà cung cấp' },
  { title: 'Khách hàng', description: 'Upload khách hàng' },
]

interface FileUploadState {
  file: File | null
  fileName: string
  rowCount: number | null
}

interface ProcessLog {
  message: string
  timestamp: Date
  type: 'info' | 'success' | 'error'
}

function FileUploadZone({
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
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileSelect(file)
    }
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
          Kéo thả file CSV {label} vào đây
        </p>
        <p className='text-xs text-muted-foreground'>
          hoặc nhấn để chọn file từ máy tính
        </p>
      </div>
      <input
        ref={inputRef}
        type='file'
        accept='.csv'
        className='hidden'
        onChange={handleChange}
      />
    </div>
  )
}

function ProcessArea({
  isProcessing,
  progress,
  logs,
}: {
  isProcessing: boolean
  progress: number
  logs: ProcessLog[]
}) {
  const [isOpen, setIsOpen] = useState(false)
  const latestLog = logs[logs.length - 1]

  if (!isProcessing && logs.length === 0) return null

  return (
    <div className='mx-auto w-full max-w-2xl'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-base'>
            {isProcessing && (
              <Loader2 className='size-4 animate-spin' />
            )}
            {!isProcessing && progress >= 100 && (
              <Check className='size-4 text-green-600' />
            )}
            {isProcessing ? 'Đang xử lý...' : 'Hoàn tất'}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          {/* Progress bar */}
          <div className='space-y-1.5'>
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>Tiến trình</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progress >= 100 ? 'bg-green-500' : 'bg-primary'
                )}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          {/* Latest log + expandable details */}
          {logs.length > 0 && (
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <div className='flex items-center justify-between rounded-md bg-muted/50 px-3 py-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <span
                    className={cn(
                      'size-1.5 rounded-full',
                      latestLog.type === 'success' && 'bg-green-500',
                      latestLog.type === 'info' && 'bg-blue-500',
                      latestLog.type === 'error' && 'bg-red-500'
                    )}
                  />
                  <span className='text-muted-foreground'>
                    {latestLog.message}
                  </span>
                </div>
                {logs.length > 1 && (
                  <CollapsibleTrigger asChild>
                    <Button variant='ghost' size='sm' className='h-auto px-2 py-1 text-xs'>
                      {isOpen ? 'Ẩn bớt' : 'Xem chi tiết'}
                      <ChevronDown
                        className={cn(
                          'size-3 transition-transform',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                )}
              </div>
              <CollapsibleContent>
                <div className='mt-1 max-h-48 space-y-0.5 overflow-y-auto rounded-md border bg-muted/30 p-2'>
                  {logs
                    .slice(0, -1)
                    .reverse()
                    .map((log, i) => (
                      <div
                        key={i}
                        className='flex items-center gap-2 px-1 py-0.5 text-xs text-muted-foreground'
                      >
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            log.type === 'success' && 'bg-green-500',
                            log.type === 'info' && 'bg-blue-500',
                            log.type === 'error' && 'bg-red-500'
                          )}
                        />
                        <span>{log.message}</span>
                      </div>
                    ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function DataMigration() {
  const [currentStep, setCurrentStep] = useState(0)
  const [sourceSystem, setSourceSystem] = useState('')
  const [products, setProducts] = useState<FileUploadState>({
    file: null,
    fileName: '',
    rowCount: null,
  })
  const [suppliers, setSuppliers] = useState<FileUploadState>({
    file: null,
    fileName: '',
    rowCount: null,
  })
  const [customers, setCustomers] = useState<FileUploadState>({
    file: null,
    fileName: '',
    rowCount: null,
  })

  // Dummy process state
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<ProcessLog[]>([])

  const handleFileSelect =
    (setter: React.Dispatch<React.SetStateAction<FileUploadState>>) =>
    (file: File) => {
      const dummyRowCount = Math.floor(Math.random() * 500) + 50
      setter({ file, fileName: file.name, rowCount: dummyRowCount })
    }

  const handleFileRemove =
    (setter: React.Dispatch<React.SetStateAction<FileUploadState>>) => () => {
      setter({ file: null, fileName: '', rowCount: null })
    }

  const canGoNext = () => {
    switch (currentStep) {
      case 0:
        return !!sourceSystem
      default:
        return true
    }
  }

  const handleStartMigration = () => {
    // Dummy process simulation
    setIsProcessing(true)
    setProgress(0)
    setLogs([])

    const dummyLogs: { message: string; type: ProcessLog['type'] }[] = [
      { message: 'Đang đọc file CSV sản phẩm...', type: 'info' },
      { message: 'Đã đọc xong file sản phẩm', type: 'success' },
      { message: 'Đang khởi tạo danh mục sản phẩm...', type: 'info' },
      { message: 'Đã khởi tạo 24 danh mục sản phẩm', type: 'success' },
      { message: 'Đang nhập sản phẩm vào hệ thống...', type: 'info' },
      { message: 'Đã nhập 156 sản phẩm thành công', type: 'success' },
      { message: 'Đang đọc file CSV nhà cung cấp...', type: 'info' },
      { message: 'Đã nhập 32 nhà cung cấp thành công', type: 'success' },
      { message: 'Đang đọc file CSV khách hàng...', type: 'info' },
      { message: 'Đã nhập 89 khách hàng thành công', type: 'success' },
      { message: 'Chuyển đổi dữ liệu hoàn tất!', type: 'success' },
    ]

    dummyLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          { ...log, timestamp: new Date() },
        ])
        setProgress(((index + 1) / dummyLogs.length) * 100)
        if (index === dummyLogs.length - 1) {
          setIsProcessing(false)
        }
      }, (index + 1) * 800)
    })
  }

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <Database className='size-5' />
            <h2 className='text-2xl font-bold tracking-tight'>
              Chuyển đổi dữ liệu
            </h2>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Stepper */}
        <div className='flex items-center justify-center gap-2'>
          {steps.map((step, index) => (
            <div key={step.title} className='flex items-center gap-2'>
              <button
                onClick={() => {
                  if (index < currentStep && !isProcessing)
                    setCurrentStep(index)
                }}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  index === currentStep &&
                    'bg-primary text-primary-foreground',
                  index < currentStep &&
                    'cursor-pointer bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300',
                  index > currentStep && 'bg-muted text-muted-foreground'
                )}
              >
                <span
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full text-xs font-bold',
                    index === currentStep &&
                      'bg-primary-foreground text-primary',
                    index < currentStep && 'bg-green-600 text-white',
                    index > currentStep &&
                      'bg-muted-foreground/20 text-muted-foreground'
                  )}
                >
                  {index < currentStep ? (
                    <Check className='size-3.5' />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className='hidden sm:inline'>{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-px w-8 sm:w-12',
                    index < currentStep ? 'bg-green-400' : 'bg-border'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className='mx-auto w-full max-w-2xl'>
          {/* Step 1: Chọn hệ thống gốc */}
          {currentStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Chọn hệ thống gốc</CardTitle>
                <CardDescription>
                  Chọn hệ thống quản lý bán hàng bạn đang sử dụng để chuyển
                  đổi dữ liệu sang hệ thống mới.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Hệ thống</label>
                  <Select
                    value={sourceSystem}
                    onValueChange={setSourceSystem}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Chọn hệ thống gốc' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='kiotviet'>KiotViet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Upload sản phẩm */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload danh sách sản phẩm</CardTitle>
                <CardDescription>
                  Tải lên file CSV chứa danh sách sản phẩm được xuất từ{' '}
                  {sourceSystem === 'kiotviet'
                    ? 'KiotViet'
                    : 'hệ thống gốc'}
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  label='sản phẩm'
                  state={products}
                  onFileSelect={handleFileSelect(setProducts)}
                  onRemove={handleFileRemove(setProducts)}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 3: Upload nhà cung cấp */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload danh sách nhà cung cấp</CardTitle>
                <CardDescription>
                  Tải lên file CSV chứa danh sách nhà cung cấp được xuất từ{' '}
                  {sourceSystem === 'kiotviet'
                    ? 'KiotViet'
                    : 'hệ thống gốc'}
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  label='nhà cung cấp'
                  state={suppliers}
                  onFileSelect={handleFileSelect(setSuppliers)}
                  onRemove={handleFileRemove(setSuppliers)}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 4: Upload khách hàng */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload danh sách khách hàng</CardTitle>
                <CardDescription>
                  Tải lên file CSV chứa danh sách khách hàng được xuất từ{' '}
                  {sourceSystem === 'kiotviet'
                    ? 'KiotViet'
                    : 'hệ thống gốc'}
                  .
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  label='khách hàng'
                  state={customers}
                  onFileSelect={handleFileSelect(setCustomers)}
                  onRemove={handleFileRemove(setCustomers)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Process Area */}
        <ProcessArea
          isProcessing={isProcessing}
          progress={progress}
          logs={logs}
        />

        {/* Navigation Buttons */}
        <div className='mx-auto flex w-full max-w-2xl items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => setCurrentStep((s) => s - 1)}
            disabled={currentStep === 0 || isProcessing}
          >
            <ChevronLeft className='size-4' />
            Quay lại
          </Button>

          <div className='flex items-center gap-2'>
            {/* Nút bỏ qua - chỉ hiện ở step upload (1, 2, 3) */}
            {currentStep >= 1 && currentStep < steps.length - 1 && (
              <Button
                variant='ghost'
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={isProcessing}
              >
                Bỏ qua
                <SkipForward className='size-4' />
              </Button>
            )}

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep((s) => s + 1)}
                disabled={!canGoNext() || isProcessing}
              >
                Tiếp theo
                <ChevronRight className='size-4' />
              </Button>
            ) : (
              <Button
                onClick={handleStartMigration}
                disabled={isProcessing}
              >
                {isProcessing && (
                  <Loader2 className='size-4 animate-spin' />
                )}
                Bắt đầu chuyển đổi
              </Button>
            )}
          </div>
        </div>
      </Main>
    </>
  )
}
