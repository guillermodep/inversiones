import Papa from 'papaparse'
import { PortfolioPosition } from '@/types'

interface ParsedRow {
  [key: string]: string
}

export async function parseCSV(file: File): Promise<PortfolioPosition[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const positions = mapToPositions(results.data as ParsedRow[])
          resolve(positions)
        } catch (error) {
          reject(error)
        }
      },
      error: (error) => {
        reject(error)
      },
    })
  })
}

function mapToPositions(rows: ParsedRow[]): PortfolioPosition[] {
  const positions: PortfolioPosition[] = []

  for (const row of rows) {
    const ticker = findValue(row, ['ticker', 'symbol', 'stock', 'accion'])
    const shares = findValue(row, ['shares', 'cantidad', 'acciones', 'qty', 'quantity'])
    const price = findValue(row, ['price', 'precio', 'purchase_price', 'precio_compra'])
    const date = findValue(row, ['date', 'fecha', 'purchase_date', 'fecha_compra'])

    if (!ticker || !shares) continue

    positions.push({
      ticker: ticker.toUpperCase(),
      shares: parseFloat(shares),
      purchasePrice: price ? parseFloat(price) : 0,
      purchaseDate: date || new Date().toISOString().split('T')[0],
    })
  }

  return positions
}

function findValue(row: ParsedRow, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()]
    if (value) return value
  }
  return undefined
}
