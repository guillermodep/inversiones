import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  Search, 
  Upload, 
  Settings,
  Sparkles
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/market', icon: TrendingUp, label: 'Mercado' },
    { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
    { path: '/portfolio-builder', icon: Sparkles, label: 'Crear Portfolio' },
    { path: '/screener', icon: Search, label: 'Screener' },
    { path: '/upload', icon: Upload, label: 'Importar' },
    { path: '/settings', icon: Settings, label: 'Configuración' },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-blue-500">H&G Inversiones</h1>
          <p className="text-sm text-gray-400 mt-1">Análisis con IA</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border text-xs text-gray-500">
          <p>© 2024 Inversiones App</p>
          <p className="mt-1">No es asesoramiento financiero</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
