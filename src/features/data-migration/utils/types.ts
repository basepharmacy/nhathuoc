export interface FileUploadState {
  file: File | null
  fileName: string
  rowCount: number | null
  error: string | null
}

export type MigrationType = 'products' | 'suppliers' | 'customers'

export interface ProcessLog {
  message: string
  timestamp: Date
  type: 'info' | 'success' | 'error'
}
