import json
import jwt
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Task, Comment, Notification
from .serializers import CommentSerializer

User = get_user_model()

class TaskCommentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # URL path: /ws/tasks/<task_id>/
        self.task_id = self.scope['url_route']['kwargs'].get('task_id')
        self.group_name = f'task_{self.task_id}'

        # Accept connection
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Expect {'action':'comment','content':'...'}
        action = content.get('action')
        if action == 'comment':
            text = content.get('content', '').strip()
            if not text:
                return
            user = self.scope.get('user')
            if not user or user.is_anonymous:
                await self.send_json({'error': 'Authentication required'})
                return
            # create comment in DB
            comment = await self.create_comment(user.id, self.task_id, text)
            serialized = await self.serialize_comment(comment.id)
            # broadcast to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'comment.message',
                    'comment': serialized,
                }
            )

    async def comment_message(self, event):
        await self.send_json({'type': 'comment', 'comment': event['comment']})

    @database_sync_to_async
    def create_comment(self, user_id, task_id, text):
        user = User.objects.get(pk=user_id)
        task = Task.objects.get(pk=task_id)
        return Comment.objects.create(task=task, author=user, content=text)

    @database_sync_to_async
    def serialize_comment(self, comment_id):
        comment = Comment.objects.get(pk=comment_id)
        return CommentSerializer(comment).data


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Extract JWT token from query params
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        for param in query_string.split('&'):
            if param.startswith('token='):
                token = param.split('=', 1)[1]
                break
        
        if not token:
            await self.close(code=4001)
            return
        
        # Authenticate user from JWT token
        user = await self.authenticate_user(token)
        if not user:
            await self.close(code=4001)
            return
        
        self.user = user
        self.group_name = f'notifications_{user.id}'
        
        # Join the user's notification group
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Echo or handle incoming messages
        action = content.get('action')
        if action == 'ping':
            await self.send_json({'type': 'pong'})

    async def notification_message(self, event):
        """Receive notification from group and send to client"""
        notification_data = event.get('notification', {})
        await self.send_json({
            'type': 'notification',
            'notification': notification_data,
        })

    @database_sync_to_async
    def authenticate_user(self, token):
        """Authenticate user from JWT token"""
        try:
            decoded = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=['HS256']
            )
            user_id = decoded.get('user_id')
            if user_id:
                return User.objects.get(pk=user_id)
        except (jwt.DecodeError, jwt.ExpiredSignatureError, User.DoesNotExist):
            pass
        return None

