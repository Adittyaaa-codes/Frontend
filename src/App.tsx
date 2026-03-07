import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import ChatApp from './pages/ChatApp'

export default function App() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/chat" element={<ChatApp/>} />
    </Routes>
  )
}
