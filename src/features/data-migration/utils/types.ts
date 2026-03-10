export interface FileUploadState {
  file: File | null
  fileName: string
  rowCount: number | null
}

export interface ProcessLog {
  message: string
  timestamp: Date
  type: 'info' | 'success' | 'error'
}
