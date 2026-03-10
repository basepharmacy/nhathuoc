import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileUploadZone } from './file-upload-zone'
import type { FileUploadState } from '../utils/types'
import { getSourceSystemLabel } from '../utils/migration'

export function StepContent({
  currentStep,
  sourceSystem,
  onSourceSystemChange,
  products,
  suppliers,
  customers,
  onFileSelect,
  onFileRemove,
}: {
  currentStep: number
  sourceSystem: string
  onSourceSystemChange: (value: string) => void
  products: FileUploadState
  suppliers: FileUploadState
  customers: FileUploadState
  onFileSelect: (type: 'products' | 'suppliers' | 'customers') => (file: File) => void
  onFileRemove: (type: 'products' | 'suppliers' | 'customers') => () => void
}) {
  const systemLabel = getSourceSystemLabel(sourceSystem)

  return (
    <div className='mx-auto w-full max-w-2xl'>
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
                onValueChange={onSourceSystemChange}
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

      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload danh sách sản phẩm</CardTitle>
            <CardDescription>
              Tải lên file CSV chứa danh sách sản phẩm được xuất từ{' '}
              {systemLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              label='sản phẩm'
              state={products}
              onFileSelect={onFileSelect('products')}
              onRemove={onFileRemove('products')}
            />
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload danh sách nhà cung cấp</CardTitle>
            <CardDescription>
              Tải lên file CSV chứa danh sách nhà cung cấp được xuất từ{' '}
              {systemLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              label='nhà cung cấp'
              state={suppliers}
              onFileSelect={onFileSelect('suppliers')}
              onRemove={onFileRemove('suppliers')}
            />
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload danh sách khách hàng</CardTitle>
            <CardDescription>
              Tải lên file CSV chứa danh sách khách hàng được xuất từ{' '}
              {systemLabel}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUploadZone
              label='khách hàng'
              state={customers}
              onFileSelect={onFileSelect('customers')}
              onRemove={onFileRemove('customers')}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
