from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TaskCommentViewSet, TaskAttachmentViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', TaskCommentViewSet, basename='comment')
router.register(r'attachments', TaskAttachmentViewSet, basename='attachment')

urlpatterns = [
    path('', include(router.urls)),
]
