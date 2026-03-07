import { useState } from 'react'
import { Link ,useNavigate} from 'react-router-dom'
import axios from 'axios'
import { api } from '../services/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface LoginResponseData {
  user: {
    _id: string
    username: string
    fullname: string
    email: string
  }
  accessToken: string
  refreshToken: string
}

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post<ApiResponse<LoginResponseData>>(
        '/users/login',
        { username, password }
      )

      if (!data.success) {
        setError(data.message || 'Login failed')
        return
      }

      localStorage.setItem('user', JSON.stringify(data.data.user))

      navigate('/home')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as any)?.message ||
          err.message ||
          'Login failed'
        setError(msg)
      } else {
        setError('Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base px-4 font-sans text-primary">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-primary tracking-tight">
            Sign in to your account
          </h1>
          <p className="mt-1 text-sm text-muted">
            Use your username and password
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-subtle rounded-2xl p-6 space-y-4"
        >
          {error && (
            <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted block" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="your_username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-sm font-medium text-white px-4 py-2.5 mt-2 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
