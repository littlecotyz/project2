import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import useAuthStore from '../store/authStore'

const initialState = { username: '', email: '', password: '', confirmPassword: '' }

export default function RegisterPage() {
  const [form, setForm] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const register = useAuthStore((state) => state.register)
  const navigate = useNavigate()

  const validate = () => {
    const nextErrors = {}
    if (!form.username) nextErrors.username = 'Username is required.'
    if (!form.email) nextErrors.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email.'
    if (!form.password) nextErrors.password = 'Password is required.'
    if (form.password && form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters.'
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.'
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
      await register({ username: form.username, email: form.email, password: form.password })
      toast.success('Account created successfully')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-semibold text-slate-900">Register</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Username</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="text"
            required
          />
          {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="email"
            required
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="password"
            required
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Confirm Password</span>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
            type="password"
            required
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account? <Link to="/login" className="font-semibold text-slate-900">Login</Link>
      </p>
    </div>
  )
}
