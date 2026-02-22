import { Portfolio, PortfolioPosition } from '@/types'
import { getStockQuote } from './marketDataService'

export async function calculatePortfolioValue(
  positions: PortfolioPosition[]
): Promise<{ totalValue: number; totalCost: number; totalPnL: number; positions: PortfolioPosition[] }> {
  const updatedPositions = await Promise.all(
    positions.map(async (position) => {
      const quote = await getStockQuote(position.ticker)
      return {
        ...position,
        currentPrice: quote?.price || position.purchasePrice,
      }
    })
  )

  const totalValue = updatedPositions.reduce(
    (sum, p) => sum + (p.currentPrice || 0) * p.shares,
    0
  )

  const totalCost = updatedPositions.reduce(
    (sum, p) => sum + p.purchasePrice * p.shares,
    0
  )

  const totalPnL = totalValue - totalCost

  return {
    totalValue,
    totalCost,
    totalPnL,
    positions: updatedPositions,
  }
}

export function calculatePositionPnL(position: PortfolioPosition): {
  pnl: number
  pnlPercent: number
} {
  const currentValue = (position.currentPrice || position.purchasePrice) * position.shares
  const costBasis = position.purchasePrice * position.shares
  const pnl = currentValue - costBasis
  const pnlPercent = (pnl / costBasis) * 100

  return { pnl, pnlPercent }
}

export function getSectorAllocation(positions: PortfolioPosition[]): Record<string, number> {
  const sectorMap: Record<string, string> = {
    AAPL: 'Technology',
    MSFT: 'Technology',
    GOOGL: 'Technology',
    AMZN: 'Consumer',
    TSLA: 'Automotive',
    JPM: 'Financial',
    BAC: 'Financial',
    JNJ: 'Healthcare',
    PFE: 'Healthcare',
    XOM: 'Energy',
    SPY: 'ETF',
    QQQ: 'ETF',
    TLT: 'Bonds',
  }

  const allocation: Record<string, number> = {}

  positions.forEach((position) => {
    const sector = sectorMap[position.ticker] || 'Other'
    const value = (position.currentPrice || position.purchasePrice) * position.shares
    allocation[sector] = (allocation[sector] || 0) + value
  })

  return allocation
}
