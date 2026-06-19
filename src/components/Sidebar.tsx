import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, Upload, LogOut, User, UserPlus, ChevronLeft, ChevronRight, X, Zap } from 'lucide-react'
import { api } from '../services/api'

interface SidebarProps {
  mobileSidebarOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileSidebarOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [tokensUsed, setTokensUsed] = useState(0)
  const [tokenLimit, setTokenLimit] = useState(500000)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    setIsLoggedIn(!!userStr)

    if (userStr) {
      const fetchTokens = async () => {
        try {
          const { data } = await api.get('/users/me')
          if (data?.data) {
            setTokensUsed(data.data.tokensUsed || 0)
            setTokenLimit(data.data.tokenLimit || 500000)
          }
        } catch (error) {
          console.error("Failed to fetch token usage", error)
        }
      }
      fetchTokens()
    }
  }, [location.pathname])

  // Close mobile sidebar on route change
  useEffect(() => {
    onMobileClose()
  }, [location.pathname])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    setIsLoggedIn(false)
    navigate('/login')
  }

  const navItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Upload', path: '/upload', icon: Upload },
  ]

  return (
    <>
      {/* ── Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex
          ${isCollapsed ? 'w-20' : 'w-64'}
          h-screen sticky top-0 bg-surface border-r border-subtle flex-col font-sans
          transition-all duration-300 overflow-hidden flex-shrink-0
        `}
      >
        {/* Logo + Collapse toggle */}
        <div className="p-6 border-b border-subtle flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/home" className="text-xl font-bold text-primary tracking-tight whitespace-nowrap">
              Study<span className="text-accent">Bot</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-primary hover:bg-base'
                }`}
              >
                <Icon size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Token Progress Section (Desktop) */}
        {isLoggedIn && !isCollapsed && (
          <div className="px-5 py-4 border-t border-subtle bg-base/30">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-2">
              <Zap size={14} className="text-accent" />
              <span>AI Token Usage</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted mb-1.5 font-medium">
              <span>{tokensUsed.toLocaleString()}</span>
              <span>{tokenLimit.toLocaleString()}</span>
            </div>
            <div className="h-1.5 w-full bg-surface rounded-full overflow-hidden border border-subtle">
              <div 
                className={`h-full transition-all duration-500 ${tokensUsed >= tokenLimit ? 'bg-red-500' : 'bg-accent'}`}
                style={{ width: `${Math.min((tokensUsed / tokenLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Auth section */}
        <div className="p-4 border-t border-subtle space-y-2">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              >
                <User size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Sign In</span>}
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-3 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
              >
                <UserPlus size={18} className="flex-shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">Sign Up</span>}
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* ── Mobile Drawer (slide in from left) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-surface border-r border-subtle
          flex flex-col font-sans transform transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile header */}
        <div className="p-5 border-b border-subtle flex items-center justify-between">
          <Link to="/home" className="text-xl font-bold text-primary tracking-tight">
            Study<span className="text-accent">Bot</span>
          </Link>
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile nav items */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-muted hover:text-primary hover:bg-base'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Token Progress Section (Mobile) */}
        {isLoggedIn && (
          <div className="px-5 py-4 border-t border-subtle bg-base/30">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-2">
              <Zap size={16} className="text-accent" />
              <span>AI Token Usage</span>
            </div>
            <div className="flex justify-between text-xs text-muted mb-2 font-medium">
              <span>{tokensUsed.toLocaleString()} used</span>
              <span>{tokenLimit.toLocaleString()} max</span>
            </div>
            <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-subtle">
              <div 
                className={`h-full transition-all duration-500 ${tokensUsed >= tokenLimit ? 'bg-red-500' : 'bg-accent'}`}
                style={{ width: `${Math.min((tokensUsed / tokenLimit) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Mobile auth section */}
        <div className="p-4 border-t border-subtle space-y-2">
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut size={20} className="flex-shrink-0" />
              <span>Logout</span>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-accent hover:bg-accent/10 transition-colors"
              >
                <User size={20} className="flex-shrink-0" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
              >
                <UserPlus size={20} className="flex-shrink-0" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
