from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Task, TaskComment, TaskAttachment
from .serializers import (
    TaskSerializer,
    TaskCreateUpdateSerializer,
    TaskCommentSerializer,
    TaskAttachmentSerializer,
)
from .permissions import IsTaskOwnerOrAssigned
from .filters import TaskFilter


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = TaskFilter
    ordering_fields = ['created_at', 'deadline', 'priority']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TaskCreateUpdateSerializer
        return TaskSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = Task.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                models.Q(created_by=self.request.user) |
                models.Q(assigned_to=self.request.user) |
                models.Q(team__members=self.request.user)
            ).distinct()
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def assign(self, request, pk=None):
        task = self.get_object()
        user_ids = request.data.get('user_ids', [])
        
        if not user_ids:
            return Response(
                {'detail': 'user_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.assigned_to.set(user_ids)
        serializer = self.get_serializer(task)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_tasks(self, request):
        queryset = self.get_queryset().filter(assigned_to=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def comments(self, request, pk=None):
        """GET /api/tasks/{id}/comments/ - list comments for task
        POST /api/tasks/{id}/comments/ - create comment for task"""
        task = self.get_object()
        
        if request.method == 'GET':
            comments = task.comments.all()
            serializer = TaskCommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = TaskCommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(author=request.user, task=task)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaskCommentViewSet(viewsets.ModelViewSet):
    queryset = TaskComment.objects.all()
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def perform_create(self, serializer):
        task_id = self.request.data.get('task')
        task = Task.objects.get(pk=task_id)
        serializer.save(author=self.request.user, task=task)

    def get_queryset(self):
        queryset = TaskComment.objects.all()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task__id=task_id)
        return queryset


class TaskAttachmentViewSet(viewsets.ModelViewSet):
    queryset = TaskAttachment.objects.all()
    serializer_class = TaskAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']
    http_method_names = ['get', 'post', 'delete']

    def perform_create(self, serializer):
        task_id = self.request.data.get('task')
        task = Task.objects.get(pk=task_id)
        serializer.save(uploaded_by=self.request.user, task=task)

    def get_queryset(self):
        queryset = TaskAttachment.objects.all()
        task_id = self.request.query_params.get('task')
        if task_id:
            queryset = queryset.filter(task__id=task_id)
        return queryset
