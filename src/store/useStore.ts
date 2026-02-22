import { create } from 'zustand'
import { Portfolio, StockData } from '@/types'

interface AppState {
  portfolios: Portfolio[]
  watchlist: string[]
  selectedPortfolio: string | null
  marketIndices: StockData[]
  
  setPortfolios: (portfolios: Portfolio[]) => void
  addPortfolio: (portfolio: Portfolio) => void
  updatePortfolio: (id: string, portfolio: Partial<Portfolio>) => void
  deletePortfolio: (id: string) => void
  setSelectedPortfolio: (id: string | null) => void
  
  addToWatchlist: (ticker: string) => void
  removeFromWatchlist: (ticker: string) => void
  
  setMarketIndices: (indices: StockData[]) => void
}

export const useStore = create<AppState>((set) => ({
  portfolios: JSON.parse(localStorage.getItem('portfolios') || '[]'),
  watchlist: JSON.parse(localStorage.getItem('watchlist') || '[]'),
  selectedPortfolio: null,
  marketIndices: [],

  setPortfolios: (portfolios) => {
    localStorage.setItem('portfolios', JSON.stringify(portfolios))
    set({ portfolios })
  },

  addPortfolio: (portfolio) => set((state) => {
    const newPortfolios = [...state.portfolios, portfolio]
    localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
    return { portfolios: newPortfolios }
  }),

  updatePortfolio: (id, updates) => set((state) => {
    const newPortfolios = state.portfolios.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
    return { portfolios: newPortfolios }
  }),

  deletePortfolio: (id) => set((state) => {
    const newPortfolios = state.portfolios.filter(p => p.id !== id)
    localStorage.setItem('portfolios', JSON.stringify(newPortfolios))
    return { portfolios: newPortfolios }
  }),

  setSelectedPortfolio: (id) => set({ selectedPortfolio: id }),

  addToWatchlist: (ticker) => set((state) => {
    if (state.watchlist.includes(ticker)) return state
    const newWatchlist = [...state.watchlist, ticker]
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist))
    return { watchlist: newWatchlist }
  }),

  removeFromWatchlist: (ticker) => set((state) => {
    const newWatchlist = state.watchlist.filter(t => t !== ticker)
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist))
    return { watchlist: newWatchlist }
  }),

  setMarketIndices: (indices) => set({ marketIndices: indices }),
}))
