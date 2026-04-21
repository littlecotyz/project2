import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../utils/formatDate'
import { useNotifications } from '../hooks/useNotifications'

export default function NotificationBell() {
  const navigate = useNavigate()
  const { notifications, unreadCount, markAsRead } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id)
    }

    // Navigate to task if available
    if (notification.task?.id) {
      navigate(`/tasks/${notification.task.id}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 hover:bg-slate-100 transition"
      >
        <svg
          className="h-6 w-6 text-slate-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-semibold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 rounded-lg border border-slate-200 bg-white shadow-lg z-50">
          {/* Header */}
          <div className="border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {unreadCount} new
              </span>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-600">No notifications yet</div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full border-b border-slate-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    !notification.is_read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-sm font-medium ${
                          !notification.is_read ? 'text-slate-900' : 'text-slate-600'
                        }`}
                      >
                        {notification.notification_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {!notification.is_read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{notification.message}</p>
                    <span className="text-xs text-slate-400">{formatDate(notification.created_at)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-slate-200 px-4 py-3">
              <button
                onClick={() => navigate('/notifications')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
