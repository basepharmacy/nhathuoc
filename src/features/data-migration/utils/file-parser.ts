import * as XLSX from 'xlsx'

const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls']

export function isSupportedFile(fileName: string): boolean {
  return SUPPORTED_EXTENSIONS.some((ext) => fileName.toLowerCase().endsWith(ext))
}

export function isExcelFile(fileName: string): boolean {
  return fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')
}

/**
 * Parse a file (CSV or XLSX) into an array of objects.
 * All values are converted to strings for consistency.
 */
export async function parseFile(file: File): Promise<Record<string, string>[]> {
  if (isExcelFile(file.name)) {
    return parseExcel(file)
  }
  const content = await readFileAsText(file)
  return parseCSV(content)
}

function parseExcel(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' })

        // Convert all values to strings
        const rows: Record<string, string>[] = jsonData.map((row) => {
          const stringRow: Record<string, string> = {}
          for (const [key, value] of Object.entries(row)) {
            if (value instanceof Date) {
              const d = value.getDate().toString().padStart(2, '0')
              const m = (value.getMonth() + 1).toString().padStart(2, '0')
              const y = value.getFullYear()
              stringRow[key.trim()] = `${d}/${m}/${y}`
            } else {
              stringRow[key.trim()] = String(value ?? '').trim()
            }
          }
          return stringRow
        })

        resolve(rows)
      } catch {
        reject(new Error('Không thể đọc file Excel'))
      }
    }
    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Parse a CSV file content into an array of objects.
 * Handles quoted fields and commas within quotes.
 */
export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter((line) => line.trim() !== '')
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = (values[index] ?? '').trim()
    })
    rows.push(row)
  }

  return rows
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Không thể đọc file'))
    reader.readAsText(file)
  })
}
