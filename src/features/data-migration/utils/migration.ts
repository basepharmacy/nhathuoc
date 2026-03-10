import type { FileUploadState, ProcessLog } from './types'
import { parseCSV, readFileAsText } from './csv-parser'

export function createFileSelectHandler(
  setter: React.Dispatch<React.SetStateAction<FileUploadState>>
) {
  return async (file: File) => {
    try {
      const content = await readFileAsText(file)
      const rows = parseCSV(content)
      setter({ file, fileName: file.name, rowCount: rows.length })
    } catch {
      setter({ file, fileName: file.name, rowCount: null })
    }
  }
}

export function createFileRemoveHandler(
  setter: React.Dispatch<React.SetStateAction<FileUploadState>>
) {
  return () => {
    setter({ file: null, fileName: '', rowCount: null })
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
