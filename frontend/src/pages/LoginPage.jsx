import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const initialState = { username: '', password: '' }

export default function LoginPage() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    if (!form.username) nextErrors.username = 'Username is required.'
    if (!form.password) nextErrors.password = 'Password is required.'
    return nextErrors
  }

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setIsSubmitting(true)
    try {
      await login({ username: form.email, password: form.password })
      toast.success('Successfully logged in')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="text"
            autoComplete="username"
            required
          />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="password"
            autoComplete="current-password"
            required
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Need an account? <Link to="/register" className="font-semibold text-slate-900">Register</Link>
      </p>
    </div>
  )
}
