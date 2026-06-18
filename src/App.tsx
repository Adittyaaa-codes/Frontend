import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import ChatApp from './pages/ChatApp'
import UploadPage from './pages/UploadPage'

export default function App() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex bg-base h-screen overflow-hidden">
      {/* Mobile backdrop overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <main className="flex-1 overflow-y-auto min-w-0">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home onMenuOpen={() => setMobileSidebarOpen(true)} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:subjectId" element={<ChatApp onMenuOpen={() => setMobileSidebarOpen(true)} />} />
          <Route path="/upload" element={<UploadPage onMenuOpen={() => setMobileSidebarOpen(true)} />} />
        </Routes>
      </main>
    </div>
  )
}
