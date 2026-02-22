import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  Search, 
  Upload, 
  Settings,
  Sparkles,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Brain
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/ai-advisor', icon: Brain, label: 'Asesor IA' },
    { path: '/market', icon: TrendingUp, label: 'Mercado' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/portfolio-builder', icon: Sparkles, label: 'Crear Portfolio' },
    { path: '/screener', icon: Search, label: 'Screener' },
    { path: '/upload', icon: Upload, label: 'Importar' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${sidebarOpen ? 'w-64' : 'w-20'}
          bg-card border-r border-border flex flex-col transition-all duration-300
          fixed lg:relative h-screen z-40
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 border-b border-border">
          {sidebarOpen ? (
            <>
              <h1 className="text-2xl font-bold text-blue-500">H&G Inversiones</h1>
              <p className="text-sm text-gray-400 mt-1">Análisis con IA</p>
            </>
          ) : (
            <h1 className="text-2xl font-bold text-blue-500 text-center">H&G</h1>
          )}
        </div>

        {/* Toggle Button (Desktop only) */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden lg:flex absolute -right-3 top-20 bg-card border border-border rounded-full p-1 hover:bg-gray-700 transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                } ${!sidebarOpen ? 'justify-center' : ''}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-border text-xs text-gray-500">
            <p>© 2026 Inversiones App</p>
            <p className="mt-1">No es asesoramiento financiero</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto w-full">
        <div className="max-w-7xl mx-auto p-4 lg:p-8 mt-16 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
