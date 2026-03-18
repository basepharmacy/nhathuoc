import type { ProcessLog } from './types'

export const steps = [
  { title: 'Chọn hệ thống', description: 'Chọn hệ thống gốc' },
  { title: 'Sản phẩm', description: 'Upload danh sách sản phẩm' },
  { title: 'Nhà cung cấp', description: 'Upload nhà cung cấp' },
  { title: 'Khách hàng', description: 'Upload khách hàng' },
]

export const dummyLogs: { message: string; type: ProcessLog['type'] }[] = [
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

export const defaultFileUploadState = {
  file: null,
  fileName: '',
  rowCount: null,
  error: null,
} as const

/**
 * Required columns for each migration type (KiotViet format).
 * These are the minimum columns the file must have.
 */
export const REQUIRED_COLUMNS: Record<string, string[]> = {
  products: ['Tên hàng', 'ĐVT', 'Giá vốn', 'Giá bán', 'Quy đổi'],
  suppliers: ['Tên nhà cung cấp'],
  customers: ['Tên khách hàng'],
}
