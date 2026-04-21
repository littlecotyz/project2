import React, { useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Dashboard from './pages/Dashboard'
import TaskBoardPage from './pages/TaskBoardPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TeamsPage from './pages/TeamsPage'
import TeamDetailPage from './pages/TeamDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationBell from './components/NotificationBell'
import { useAuth } from './contexts/AuthContext'
import { useNotifications } from './hooks/useNotifications'

export default function App() {
  const { user, isAuthenticated, logout } = useAuth()
  
  // Initialize notifications on app load
  useNotifications()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Toaster position="top-right" />
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <Link to="/" className="text-xl font-semibold text-slate-900">TaskManager</Link>
          </div>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            {isAuthenticated && <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>}
            {isAuthenticated && <Link to="/tasks" className="hover:text-slate-900">Tasks</Link>}
            {isAuthenticated && <Link to="/teams" className="hover:text-slate-900">Teams</Link>}
            {!isAuthenticated && <Link to="/login" className="hover:text-slate-900">Login</Link>}
            {!isAuthenticated && <Link to="/register" className="hover:text-slate-900">Register</Link>}
            {isAuthenticated && <NotificationBell />}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="rounded bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Routes>
          <Route path="/" element={<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">Welcome to TaskManager</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><TaskBoardPage /></ProtectedRoute>} />
          <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
          <Route path="/teams" element={<ProtectedRoute><TeamsPage /></ProtectedRoute>} />
          <Route path="/teams/:id" element={<ProtectedRoute><TeamDetailPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  )
}
