import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, Upload, LogOut, User, UserPlus, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface SidebarProps {
  mobileSidebarOpen: boolean
  onMobileClose: () => void
}

export default function Sidebar({ mobileSidebarOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    setIsLoggedIn(!!userStr)
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
