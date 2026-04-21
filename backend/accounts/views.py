from django.contrib.auth import get_user_model
from django.db import models
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from core.models import Team, Task
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    TeamSerializer,
    TeamCreateUpdateSerializer,
    TeamDetailSerializer,
    TeamMemberSerializer,
)
from .permissions import IsTeamOwner, IsTeamOwnerOrReadOnly

User = get_user_model()


class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        data = {
            'user': serializer.data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
        headers = self.get_success_headers(serializer.data)
        return Response(data, status=status.HTTP_201_CREATED, headers=headers)


class LoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logout successful.'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as exc:
            return Response({'detail': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated, IsTeamOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TeamCreateUpdateSerializer
        elif self.action == 'retrieve':
            return TeamDetailSerializer
        return TeamSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Team.objects.all()
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                models.Q(owner=self.request.user) |
                models.Q(members=self.request.user)
            ).distinct()
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated, IsTeamOwner])
    def add_member(self, request, pk=None):
        team = self.get_object()
        email = request.data.get('email')
        
        if not email:
            return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        team.members.add(user)
        serializer = self.get_serializer(team)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated, IsTeamOwner])
    def remove_member(self, request, pk=None):
        team = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({'detail': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({'detail': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if user == team.owner:
            return Response({'detail': 'Cannot remove team owner'}, status=status.HTTP_400_BAD_REQUEST)
        
        team.members.remove(user)
        serializer = self.get_serializer(team)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def members(self, request, pk=None):
        team = self.get_object()
        members = team.members.all()
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def tasks(self, request, pk=None):
        team = self.get_object()
        tasks = Task.objects.filter(team=team)
        from tasks.serializers import TaskSerializer
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)
