import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../store/authStore'
import api from '../api/axios'

export function useNotifications() {
  const { accessToken } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [ws, setWs] = useState(null)

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await api.get('/notifications/')
      const data = response.data.results || response.data
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    } catch (error) {
      console.error('Failed to fetch notifications', error)
    }
  }, [])

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!accessToken) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    const wsUrl = backendUrl.replace(/^https?/, (match) => (match === 'https' ? 'wss' : 'ws')).replace('/api', '')
    
    const socket = new WebSocket(`${wsUrl}/ws/notifications/?token=${accessToken}`)

    socket.onopen = () => {
      console.log('[WS] Connected to notifications')
      setIsConnected(true)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'notification') {
          // New notification received
          const newNotification = data.notification
          setNotifications((prev) => [newNotification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message', error)
      }
    }

    socket.onerror = (error) => {
      console.error('[WS] Error:', error)
      setIsConnected(false)
    }

    socket.onclose = () => {
      console.log('[WS] Disconnected from notifications')
      setIsConnected(false)
    }

    setWs(socket)
  }, [accessToken])

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await api.patch(`/notifications/${notificationId}/read/`)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (error) {
        console.error('Failed to mark notification as read', error)
      }
    },
    []
  )

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/mark_all_as_read/')
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read', error)
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    fetchNotifications()
    connectWebSocket()

    // Fallback polling every 30s if WebSocket not connected
    const pollInterval = setInterval(() => {
      if (!isConnected) {
        fetchNotifications()
      }
    }, 30000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [])

  // Cleanup WebSocket on unmount or token change
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [ws])

  return {
    notifications,
    unreadCount,
    isConnected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
