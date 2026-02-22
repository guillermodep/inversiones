import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard/Dashboard'
import MarketAnalysis from './components/MarketAnalysis/MarketAnalysis'
import StockDetail from './components/StockDetail/StockDetail'
import Portfolio from './components/Portfolio/Portfolio'
import PortfolioBuilder from './components/PortfolioBuilder/PortfolioBuilder'
import Screener from './components/Screener/Screener'
import Upload from './components/Upload/Upload'
import Settings from './components/Settings/Settings'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/market" element={<MarketAnalysis />} />
          <Route path="/stock/:ticker" element={<StockDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio-builder" element={<PortfolioBuilder />} />
          <Route path="/screener" element={<Screener />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
