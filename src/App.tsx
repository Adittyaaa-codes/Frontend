import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'

import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import ChatApp from './pages/ChatApp'
import UploadPage from './pages/UploadPage'

export default function App() {
  return (
    <div className="flex bg-base h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat/:subjectId" element={<ChatApp />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </main>
    </div>
  )
}
