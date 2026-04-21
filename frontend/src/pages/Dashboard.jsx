import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/my-tasks/')
      const tasks = response.data.results || response.data
      setStats({
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in_progress').length,
        done: tasks.filter((t) => t.status === 'done').length,
      })
    } catch (error) {
      console.error('Failed to load stats', error)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Welcome, {user?.username || 'User'}!</h1>
        <p className="mt-2 text-slate-600">Here's your task management overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Total Tasks</h3>
          <p className="mt-2 text-3xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">To Do</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.todo}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">In Progress</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500">Done</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.done}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            to="/tasks"
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-100"
          >
            View Task Board
          </Link>
          <Link
            to="/tasks?filter=my-tasks"
            className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-center font-medium text-slate-900 transition hover:bg-slate-100"
          >
            My Tasks
          </Link>
        </div>
      </div>
    </div>
  )
}
