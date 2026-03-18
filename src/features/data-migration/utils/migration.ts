import type { FileUploadState, MigrationType, ProcessLog } from './types'
import { REQUIRED_COLUMNS } from './constants'
import { parseFile } from './file-parser'

function validateColumns(
  rows: Record<string, string>[],
  type: MigrationType
): string | null {
  if (rows.length === 0) return null

  const requiredColumns = REQUIRED_COLUMNS[type]
  if (!requiredColumns) return null

  const fileColumns = Object.keys(rows[0])
  const missingColumns = requiredColumns.filter(
    (col) => !fileColumns.includes(col)
  )

  if (missingColumns.length > 0) {
    return 'File không đúng định dạng. Vui lòng kiểm tra lại file.'
  }

  return null
}

export function createFileSelectHandler(
  setter: React.Dispatch<React.SetStateAction<FileUploadState>>,
  type: MigrationType
) {
  return async (file: File) => {
    try {
      const rows = await parseFile(file)
      const error = validateColumns(rows, type)
      if (error) {
        setter({ file: null, fileName: '', rowCount: null, error })
      } else {
        setter({ file, fileName: file.name, rowCount: rows.length, error: null })
      }
    } catch {
      setter({ file: null, fileName: '', rowCount: null, error: 'Không thể đọc file. Vui lòng kiểm tra định dạng file.' })
    }
  }
}

export function createFileRemoveHandler(
  setter: React.Dispatch<React.SetStateAction<FileUploadState>>
) {
  return () => {
    setter({ file: null, fileName: '', rowCount: null, error: null })
  }
}

export function canGoNext(currentStep: number, sourceSystem: string) {
  switch (currentStep) {
    case 0:
      return !!sourceSystem
    default:
      return true
  }
}

export function getSourceSystemLabel(sourceSystem: string) {
  return sourceSystem === 'kiotviet' ? 'KiotViet' : 'hệ thống gốc'
}

export function simulateMigration(
  dummyLogs: { message: string; type: ProcessLog['type'] }[],
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setLogs: React.Dispatch<React.SetStateAction<ProcessLog[]>>
) {
  setIsProcessing(true)
  setProgress(0)
  setLogs([])

  dummyLogs.forEach((log, index) => {
    setTimeout(() => {
      setLogs((prev) => [...prev, { ...log, timestamp: new Date() }])
      setProgress(((index + 1) / dummyLogs.length) * 100)
      if (index === dummyLogs.length - 1) {
        setIsProcessing(false)
      }
    }, (index + 1) * 800)
  })
}
