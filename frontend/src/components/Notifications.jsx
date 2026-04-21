import React, { useEffect, useState } from 'react'
import api from '../services/api'

export default function Notifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const res = await api.get('/notifications/')
        if (mounted) setItems(res.data)
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchNotifications()
    return () => { mounted = false }
  }, [])

  return (
    <div>
      <h2>Notifications</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{color:'red'}}>{error}</p>}
      {!loading && !error && (
        <ul>
          {items.length === 0 && <li>No notifications</li>}
          {items.map(n => (
            <li key={n.id}>{n.message || n.title || `#${n.id}`}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

