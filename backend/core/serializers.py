from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, Comment, Team

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Task, Comment, Team, Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    provider = serializers.SerializerMethodField()
    provider_id = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'provider', 'provider_id', 'avatar_url')

    def get_provider(self, obj):
        return getattr(getattr(obj, 'profile', None), 'provider', None)

    def get_provider_id(self, obj):
        return getattr(getattr(obj, 'profile', None), 'provider_id', None)

    def get_avatar_url(self, obj):
        return getattr(getattr(obj, 'profile', None), 'avatar_url', None)


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'task', 'author', 'content', 'created_at')
        read_only_fields = ('author', 'created_at')


class TaskSerializer(serializers.ModelSerializer):
    creator = UserSerializer(read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'creator', 'assignees', 'team', 'priority', 'due_date', 'completed', 'created_at', 'comments')
        read_only_fields = ('creator', 'created_at', 'comments')


class TeamSerializer(serializers.ModelSerializer):
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ('id', 'name', 'members')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username'),
            email=validated_data.get('email'),
            password=validated_data.get('password')
        )
        return user
