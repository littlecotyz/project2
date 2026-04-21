import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function TaskList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch (err) {
      setError(err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Tasks</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {!loading && !error && (
        <ul>
          {tasks.length === 0 && <li>No tasks yet</li>}
          {tasks.map(t => (
            <li key={t.id}>
              {t.title} - {t.status} - Assigned to: {t.assignedTo?.name || 'None'}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
