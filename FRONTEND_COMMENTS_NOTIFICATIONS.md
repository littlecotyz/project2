# React Real-Time Comments & Notifications Frontend Implementation

## Overview
Implemented real-time commenting and notification features for the React frontend with:
1. **CommentSection Component** - Displays task comments with polling for updates
2. **NotificationBell Component** - Shows unread notifications with WebSocket integration
3. **useNotifications Hook** - Custom hook for WebSocket connection and notification management

## Components Implemented

### 1. CommentSection Component (`src/components/CommentSection.jsx`)

**Purpose:** Displays comments on a task with ability to add new comments

**Props:**
- `taskId` (number) - ID of the task to load comments for

**Features:**
- Fetches comments from `GET /api/tasks/{id}/comments/`
- Polls every 10 seconds for new comments (keeps list updated)
- Text input at bottom with "Send" button
- Displays comment author, avatar/initials, timestamp
- Optimistically adds new comments to list
- Shows loading state while fetching

**State:**
- `comments` - Array of comment objects
- `newComment` - Current text in input field
- `isLoading` - Loading state for initial fetch
- `isSubmitting` - Submitting state for new comment

**API Endpoints Used:**
- `GET /api/tasks/{taskId}/comments/` - List all comments
- `POST /api/tasks/{taskId}/comments/` - Create new comment

```jsx
<CommentSection taskId={taskId} />
```

### 2. NotificationBell Component (`src/components/NotificationBell.jsx`)

**Purpose:** Display notification bell in navbar with dropdown

**Features:**
- Bell icon with unread count badge
- Dropdown showing recent 10 notifications
- Click notification to mark as read and navigate to task
- Shows notification type, message, and timestamp
- "View all notifications" link
- Close on outside click
- Real-time updates from WebSocket

**State:**
- `isOpen` - Dropdown visibility
- Uses `useNotifications` hook for notifications data

**API Endpoints Used:**
- WebSocket: `ws://backend/ws/notifications/?token={JWT}`
- `PATCH /api/notifications/{id}/read/` - Mark as read
- (Fetching handled by hook)

```jsx
<NotificationBell />
```

### 3. useNotifications Hook (`src/hooks/useNotifications.js`)

**Purpose:** Manage WebSocket connection and notification state globally

**Returns:**
```javascript
{
  notifications,        // Array of notification objects
  unreadCount,         // Number of unread notifications
  isConnected,         // WebSocket connection status
  fetchNotifications,  // Function to manually fetch notifications
  markAsRead,          // Function to mark single notification as read
  markAllAsRead,       // Function to mark all as read
}
```

**Features:**
- Establishes WebSocket connection on hook initialization
- Authenticates with JWT token from query params
- Listens for real-time notification messages
- Polls REST API every 30s as fallback if WebSocket disconnected
- Handles reconnection logic
- Cleanup on unmount

**WebSocket Message Format:**
```javascript
// Incoming
{
  type: "notification",
  notification: {
    id: 123,
    recipient: 1,
    notification_type: "task_assigned",
    message: "You have been assigned to task: Fix bug",
    is_read: false,
    task: { id: 45, title: "Fix bug", ... },
    created_at: "2026-04-18T10:30:00Z"
  }
}
```

**Usage:**
```javascript
import { useNotifications } from '../hooks/useNotifications'

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  
  return (
    <div>
      <span>Unread: {unreadCount}</span>
      {notifications.map(n => (
        <div key={n.id}>
          {n.message}
          <button onClick={() => markAsRead(n.id)}>Mark Read</button>
        </div>
      ))}
    </div>
  )
}
```

## Files Created/Modified

| File | Change | Details |
|------|--------|---------|
| `src/components/CommentSection.jsx` | **NEW** | Comment list + input form |
| `src/components/NotificationBell.jsx` | **NEW** | Navbar notification bell |
| `src/hooks/useNotifications.js` | **NEW** | WebSocket + REST API hook |
| `src/pages/TaskDetailPage.jsx` | Modified | Replaced inline comments with CommentSection |
| `src/App.jsx` | Modified | Added NotificationBell, initialized useNotifications |

## How It Works

### Comment Flow
```
1. TaskDetailPage mounted with taskId
   ↓
2. CommentSection component renders
   ↓
3. useEffect fetches GET /api/tasks/{id}/comments/
   ↓
4. Comments displayed in list
   ↓
5. setInterval(10s) polls for updates
   ↓
6. User types comment and clicks "Send"
   ↓
7. POST /api/tasks/{id}/comments/ with content
   ↓
8. Comment added optimistically to list
   ↓
9. Backend signal fires, notification sent to task creator/assignees
```

### Notification Flow
```
1. App component initializes
   ↓
2. useNotifications hook called
   ↓
3. fetchNotifications() - GET /api/notifications/
   ↓
4. WebSocket connects: ws://backend/ws/notifications/?token=JWT
   ↓
5. Backend event triggers (task assigned, comment added, etc)
   ↓
6. Signal sends to channel_layer.group_send()
   ↓
7. NotificationConsumer receives in group notifications_{user_id}
   ↓
8. JSON sent through WebSocket
   ↓
9. useNotifications hook receives onmessage
   ↓
10. Updates state: notifications array, unreadCount
    ↓
11. NotificationBell re-renders with new notification
    ↓
12. User sees badge update in real-time
```

## Connection Details

### WebSocket Connection
**Endpoint:** `ws://localhost:8000/ws/notifications/?token={JWT_ACCESS_TOKEN}`

**Authentication:**
- JWT token passed as query parameter
- Token extracted by NotificationConsumer in backend
- If invalid/expired → connection refused (code 4001)

**Fallback Polling:**
- If WebSocket disconnected: falls back to REST API polling
- Polls every 30 seconds
- Automatic retry on reconnect

### REST API Endpoints

**Notification Endpoints:**
- `GET /api/notifications/` - List user's notifications (paginated)
- `PATCH /api/notifications/{id}/read/` - Mark single notification as read
- `PATCH /api/notifications/mark_all_as_read/` - Mark all as read
- `DELETE /api/notifications/{id}/` - Delete notification

**Comment Endpoints:**
- `GET /api/tasks/{taskId}/comments/` - List task comments
- `POST /api/tasks/{taskId}/comments/` - Create comment
  - Request body: `{ "content": "..." }`
  - Author auto-set to request.user

## Styling

All components use **Tailwind CSS** with consistent styling:
- Color scheme: slate/blue
- Rounded corners: rounded-lg (components), rounded-2xl (containers)
- Spacing: gap-3, gap-4, p-4, px-3, py-2
- Responsive: sm: breakpoints for mobile
- Hover effects: hover:bg-slate-50, hover:text-slate-900
- Disabled states: disabled:opacity-50

## Performance Optimizations

1. **Comment Polling:** 10-second interval balances freshness vs. API load
2. **Notification Fallback:** 30-second polling only if WebSocket disconnected
3. **Optimistic Updates:** New comments added immediately before server response
4. **Pagination:** Dropdown shows only top 10 notifications
5. **Memoization:** useCallback for handlers prevents re-renders

## Error Handling

**CommentSection:**
- Failed fetch shows error toast
- Failed POST shows error toast
- Validates comment not empty

**NotificationBell:**
- WebSocket connection errors handled silently
- Falls back to polling
- Failed REST calls logged to console

**useNotifications Hook:**
- JSON parse errors caught and logged
- WebSocket close handled gracefully
- No errors thrown to component

## Testing Checklist

### CommentSection
- [ ] Comments load on page mount
- [ ] Comments poll every ~10 seconds
- [ ] New comment POST works
- [ ] Author/timestamp display correctly
- [ ] Avatar shows for users with profile pics
- [ ] User initials show as fallback
- [ ] Empty comment blocked

### NotificationBell
- [ ] Bell icon appears in navbar when authenticated
- [ ] Badge shows unread count
- [ ] Dropdown opens/closes
- [ ] Notifications list displays
- [ ] Click notification marks as read
- [ ] Click notification navigates to task
- [ ] Dropdown closes on outside click
- [ ] Real-time updates appear

### useNotifications Hook
- [ ] Connects to WebSocket on init
- [ ] Receives real-time notifications
- [ ] Falls back to polling if WS disconnects
- [ ] markAsRead updates state
- [ ] markAllAsRead updates state
- [ ] Cleans up WebSocket on unmount

## Future Enhancements

1. **Live Comment Updates via WebSocket**
   - Currently polling every 10s
   - Could use `ws://backend/ws/tasks/{id}/?token=JWT` for live updates

2. **Notification Sound/Badge**
   - Audio notification on new notification
   - Browser tab title badge update

3. **Read Receipts for Comments**
   - Show who read each comment

4. **Notification Preferences UI**
   - Settings page to control notification types
   - Email vs in-app preferences

5. **Notification Grouping**
   - Group similar notifications
   - "5 people assigned you to tasks" instead of 5 separate

6. **Typing Indicators**
   - Show "User is typing..." while writing comment

7. **Comment Reactions/Emoji**
   - React to comments with emoji

8. **@mentions in Comments**
   - @username to tag people

## Browser Compatibility

- Modern browsers with WebSocket support (Chrome, Firefox, Safari, Edge)
- Fallback polling supports all browsers with fetch API
- Requires ES6+ (async/await, arrow functions)

## Environment Variables

Required in `.env`:
```
VITE_API_URL=http://localhost:8000/api
```

The hook automatically converts HTTP URL to WS protocol for WebSocket.
