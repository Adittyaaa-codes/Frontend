import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, Upload, LogOut, User, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem('user')
    setIsLoggedIn(!!user)
  }, [location])

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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 bg-surface border-r border-subtle flex flex-col font-sans transition-all duration-300 overflow-hidden`}>
      <div className="p-6 border-b border-subtle flex items-center justify-between">
        {!isCollapsed && (
          <Link to="/home" className="text-xl font-bold text-primary tracking-tight whitespace-nowrap">
            Study<span className="text-accent">Bot</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-base transition-colors ml-auto"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

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
  )
}
