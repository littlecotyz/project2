from rest_framework import routers
from django.urls import path, include
from .views import TaskViewSet, CommentViewSet, TeamViewSet, NotificationViewSet

router = routers.DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'teams', TeamViewSet, basename='team')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
