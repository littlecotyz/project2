from rest_framework import serializers
from .models import Notification, Task
from tasks.serializers import TaskSerializer


class NotificationSerializer(serializers.ModelSerializer):
    task = TaskSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ('id', 'recipient', 'notification_type', 'message', 'is_read', 'task', 'created_at')
        read_only_fields = ('recipient', 'created_at', 'task')


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('notification_type', 'message', 'task')
        read_only_fields = ('task',)

