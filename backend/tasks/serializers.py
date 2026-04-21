from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, TaskComment, TaskAttachment

User = get_user_model()


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')


class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserMinimalSerializer(read_only=True)

    class Meta:
        model = TaskComment
        fields = ('id', 'task', 'author', 'content', 'created_at')
        read_only_fields = ('author', 'created_at', 'task')


class TaskAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserMinimalSerializer(read_only=True)

    class Meta:
        model = TaskAttachment
        fields = ('id', 'task', 'file', 'uploaded_by', 'uploaded_at')
        read_only_fields = ('uploaded_by', 'uploaded_at', 'task')


class TaskSerializer(serializers.ModelSerializer):
    created_by = UserMinimalSerializer(read_only=True)
    assigned_to = UserMinimalSerializer(many=True, read_only=True)
    comments = TaskCommentSerializer(many=True, read_only=True)
    attachments = TaskAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'priority',
            'deadline', 'created_by', 'assigned_to', 'team',
            'created_at', 'updated_at', 'comments', 'attachments'
        )
        read_only_fields = ('created_by', 'created_at', 'updated_at')


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        required=False
    )

    class Meta:
        model = Task
        fields = (
            'title', 'description', 'status', 'priority',
            'deadline', 'assigned_to', 'team'
        )
