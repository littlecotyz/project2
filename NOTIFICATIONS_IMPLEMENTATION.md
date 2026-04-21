# Django Real-Time Notifications Implementation

## Overview
Implemented a complete real-time notification system with:
1. **Django Channels + Redis** - WebSocket support for real-time notifications
2. **REST API** - Notification endpoints for listing and marking as read
3. **Signals** - Automatic notification creation on task assignment, commenting, and deadline approaching
4. **JWT Authentication** - WebSocket authentication via JWT token from query params

## Components Implemented

### 1. Notification Model (`core/models.py`)
```python
class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('task_assigned', 'Task Assigned'),
        ('comment_added', 'Comment Added'),
        ('deadline_approaching', 'Deadline Approaching'),
        ('task_updated', 'Task Updated'),
        ('member_added', 'Member Added'),
    )
    
    recipient = models.ForeignKey(User)  # Who gets the notification
    notification_type = models.CharField()  # Type of notification
    message = models.TextField()  # The message content
    is_read = models.BooleanField(default=False)
    task = models.ForeignKey(Task, null=True, blank=True)  # Related task
    created_at = models.DateTimeField()
```

### 2. NotificationConsumer WebSocket (`core/consumers.py`)
**Endpoint:** `ws://localhost:8000/ws/notifications/?token=<JWT_TOKEN>`

Features:
- Authenticates users via JWT token from query params
- Joins user-specific group: `notifications_{user_id}`
- Receives real-time notifications pushed by signals
- Handles ping/pong for connection keepalive

```python
class NotificationConsumer(AsyncJsonWebsocketConsumer):
    # - Extract JWT token from query params
    # - Authenticate user
    # - Join notifications_{user_id} group
    # - Receive notification messages
```

### 3. Notification Serializers (`core/serializers_notification.py`)
- `NotificationSerializer` - Full notification with related task
- `NotificationCreateSerializer` - For creating notifications

### 4. Notification REST API (`core/views.py`)
**Endpoints:**
- `GET /api/notifications/` - List user's notifications
- `GET /api/notifications/?is_read=false` - List unread only
- `PATCH /api/notifications/{id}/read/` - Mark single notification as read
- `PATCH /api/notifications/mark_all_as_read/` - Mark all as read
- `DELETE /api/notifications/{id}/` - Delete a notification

### 5. Django Channels Configuration (`taskmanager/settings.py`)
```python
INSTALLED_APPS = [
    'daphne',  # ASGI server
    'channels',
    # ... other apps
]

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [REDIS_URL],
        },
    },
}

ASGI_APPLICATION = 'taskmanager.asgi.application'
```

### 6. WebSocket Routing (`core/routing.py`)
```python
websocket_urlpatterns = [
    re_path(r'ws/tasks/(?P<task_id>[^/]+)/$', TaskCommentConsumer),
    re_path(r'ws/notifications/$', NotificationConsumer),
]
```

### 7. ASGI Application (`taskmanager/asgi.py`)
Configured for WebSocket + HTTP routing with JWT middleware

### 8. Notification Signals (`core/signals.py` + `tasks/signals.py`)

#### Trigger 1: Task Assignment
```python
@receiver(m2m_changed, sender=Task.assigned_to.through)
def task_assigned_to_changed(sender, instance, action, pk_set, **kwargs):
    # Notify each newly assigned user
    send_notification_to_user(
        user_id,
        'task_assigned',
        f'You have been assigned to task: {title}',
        task=task
    )
```

#### Trigger 2: Comment Added
```python
@receiver(post_save, sender=TaskComment)
def comment_added_to_task(sender, instance, created, **kwargs):
    # Notify task creator
    # Notify all task assignees (except comment author)
    send_notification_to_user(...)
```

#### Trigger 3: Deadline Approaching
```python
@receiver(post_save, sender=Task)
def task_deadline_approaching(sender, instance, created, **kwargs):
    # If deadline within 24 hours and task not done
    # Notify all assignees
    send_notification_to_user(
        user_id,
        'deadline_approaching',
        f'Deadline approaching for task: {title}',
        task=task
    )
```

### 9. TaskComment API (`tasks/views.py`)
**Nested Route:** `POST/GET /api/tasks/{id}/comments/`

Features:
- Automatic author assignment from request.user
- GET returns all comments for a task
- POST creates new comment with automatic task association

```python
@action(detail=True, methods=['get', 'post'])
def comments(self, request, pk=None):
    task = self.get_object()
    if request.method == 'GET':
        return comments list
    elif request.method == 'POST':
        create comment with author=request.user, task=task
```

## Required Dependencies

Added to `backend/requirements.txt`:
```
channels
channels-redis
daphne
PyJWT
```

All are compatible with existing `djangorestframework-simplejwt`.

## Architecture Flow

### WebSocket Notification Flow
```
1. Frontend connects: ws://localhost:8000/ws/notifications/?token=JWT
2. NotificationConsumer authenticates JWT token
3. Consumer joins group: notifications_{user_id}
4. Backend signal fires (e.g., task assigned)
5. Signal calls send_notification_to_user()
6. Function:
   a. Creates Notification object in DB
   b. Sends via async_to_sync channel_layer.group_send()
   c. Sends email notification
7. Consumer receives message in group
8. Consumer sends JSON to client: { type: 'notification', notification: {...} }
```

### REST API Flow
```
1. Frontend GETs /api/notifications/
2. Backend filters by recipient=request.user
3. Returns paginated list with is_read status
4. Frontend displays badge with unread count
5. On notification click: PATCH /api/notifications/{id}/read/
6. Backend updates is_read=True
7. Frontend removes from unread badge
```

## Frontend Integration Points

### WebSocket Connection
```javascript
const token = authStore.accessToken
const ws = new WebSocket(`ws://localhost:8000/ws/notifications/?token=${token}`)

ws.onmessage = (event) => {
    const { type, notification } = JSON.parse(event.data)
    if (type === 'notification') {
        // Show toast, play sound, update badge
        showNotification(notification)
    }
}
```

### REST API Polling (Fallback)
```javascript
// Every 30 seconds, sync unread notifications
setInterval(async () => {
    const response = await api.get('/notifications/?is_read=false')
    updateNotificationBadge(response.data.count)
}, 30000)
```

## Database Migrations Required

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

This will create:
- `core_notification` table with recipient, message, is_read, task FK, created_at, notification_type

## Docker Configuration

Ensure `docker-compose.yml` has:
- Redis service running (for channel layer)
- Daphne as ASGI server (instead of Gunicorn for WebSocket support)

Example:
```yaml
backend:
    image: taskmanager-backend:latest
    command: daphne -b 0.0.0.0 -p 8000 taskmanager.asgi:application
    environment:
        - REDIS_URL=redis://redis:6379/0
    ports:
        - "8000:8000"
```

## Testing Checklist

### 1. WebSocket Authentication
- [ ] Connect without token → connection refused (code 4001)
- [ ] Connect with invalid token → connection refused (code 4001)
- [ ] Connect with valid token → connection accepted

### 2. Notification Creation
- [ ] Create task and assign user → notification sent via WebSocket
- [ ] Add comment to task → notifications sent to creator and assignees
- [ ] Update task deadline to same hour → notification sent to assignees

### 3. REST API
- [ ] GET /api/notifications/ returns user's 10 most recent
- [ ] PATCH /api/notifications/{id}/read/ updates is_read
- [ ] PATCH /api/notifications/mark_all_as_read/ marks all as read
- [ ] DELETE /api/notifications/{id}/ removes notification

### 4. TaskComment Endpoint
- [ ] GET /api/tasks/{id}/comments/ returns all comments
- [ ] POST /api/tasks/{id}/comments/ creates comment with author from request.user
- [ ] Comment author automatically set (not from body)

### 5. Email Notifications
- [ ] EMAIL_HOST configured in .env
- [ ] Emails sent on assignment/comment (check logs)

## Performance Considerations

1. **Database Indexes** - Added on (recipient, is_read) and (created_at) for fast queries
2. **Redis Channel Layer** - Scales horizontally with multiple workers
3. **Notification Cleanup** - Consider adding a management command to delete old read notifications:
   ```python
   # Add a periodic task to delete old notifications
   # DELETE FROM core_notification WHERE is_read=True AND created_at < 30 days ago
   ```

## Security Considerations

1. **JWT Token Validation** - Verified on WebSocket connection (query param)
2. **User Scoping** - Notifications filtered to recipient only
3. **Rate Limiting** - Consider adding to notification creation (prevent spam)
4. **CSRF** - Not applicable to WebSocket (token-based auth)

## Troubleshooting

### WebSocket connections not working
- Check Redis is running: `docker exec redis redis-cli ping`
- Check Daphne is running: `ps aux | grep daphne`
- Check token is valid: Decode JWT in https://jwt.io/

### Notifications not being sent
- Check signals are registered in apps.py ready()
- Check Django logs for signal exceptions
- Verify recipient field is set correctly

### Duplicate notifications
- Check signal decorators aren't applied multiple times
- Verify signals.py imported only once per app

## Future Enhancements

1. **Notification Preferences** - User can choose notification types/channels
2. **Web Push** - Send notifications to browser even when not connected
3. **Email Digest** - Daily summary of notifications instead of per-event
4. **Notification Categories** - Filter UI by task, team, etc.
5. **Notification Expiry** - Auto-delete after 30 days
6. **Archive** - Mark as archived instead of deleted
