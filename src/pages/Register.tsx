import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { api } from '../services/api'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface UserData {
  _id: string
  username: string
  fullname: string
  email: string
}

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { username, fullname, email, password, confirmPassword } = form

    if (!username || !fullname || !email || !password || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post<ApiResponse<UserData>>(
        '/users/register',
        {
          username,
          fullname,
          email,
          password,
        }
      )

      if (!data.success) {
        setError(data.message || 'Registration failed')
        return
      }

      navigate('/login')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          (err.response?.data as any)?.message ||
          err.message ||
          'Registration failed'
        setError(msg)
      } else {
        setError('Registration failed')
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
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sign up with your details
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
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="your_username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted block" htmlFor="fullname">
              Full name
            </label>
            <input
              id="fullname"
              name="fullname"
              type="text"
              value={form.fullname}
              onChange={handleChange}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted block" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="********"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-sm font-medium text-muted block"
              htmlFor="confirmPassword"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-md bg-base border border-subtle px-3 py-2 text-sm text-primary focus:border-accent outline-none transition-colors"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-60 text-sm font-medium text-white px-4 py-2.5 mt-2 transition-colors"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent hover:text-accent-hover font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
