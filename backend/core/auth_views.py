from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class GoogleAuthView(APIView):
    """Expects POST {'id_token': '<google-id-token>'} from client.

    Verifies token with Google, creates or retrieves a local user, and
    returns a JWT pair (access + refresh).
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')
        if not id_token:
            return Response({'detail': 'id_token required'}, status=status.HTTP_400_BAD_REQUEST)

        from google.oauth2 import id_token as google_id_token
        from google.auth.transport import requests as grequests

        try:
            # Verify the token and get user info
            idinfo = google_id_token.verify_oauth2_token(id_token, grequests.Request())
        except Exception as e:
            return Response({'detail': 'Invalid token', 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # idinfo contains 'email', 'sub' (google id), 'name', 'aud', etc.
        email = idinfo.get('email')
        if not email:
            return Response({'detail': 'Email not available in token'}, status=status.HTTP_400_BAD_REQUEST)

        # Validate audience/client id if configured
        from django.conf import settings
        aud = idinfo.get('aud')
        allowed = getattr(settings, 'GOOGLE_OAUTH_CLIENT_IDS', []) or []
        if allowed and aud not in allowed:
            return Response({'detail': 'Token audience not allowed'}, status=status.HTTP_400_BAD_REQUEST)

        # Get or create user and save profile info
        name = idinfo.get('name') or ''
        first_name = ''
        last_name = ''
        if name:
            parts = name.split()
            first_name = parts[0]
            last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

        user, created = User.objects.get_or_create(
            username=email,
            defaults={'email': email, 'first_name': first_name, 'last_name': last_name}
        )
        if not created:
            # ensure profile fields are filled
            updated = False
            if not user.first_name and first_name:
                user.first_name = first_name
                updated = True
            if not user.last_name and last_name:
                user.last_name = last_name
                updated = True
            if updated:
                user.save()

        # Save provider/profile info
        provider = 'google'
        provider_id = idinfo.get('sub')
        avatar = idinfo.get('picture')
        try:
            profile = getattr(user, 'profile', None)
            if not profile:
                from .models import Profile
                profile = Profile.objects.create(user=user)
            changed = False
            if profile.provider != provider:
                profile.provider = provider
                changed = True
            if provider_id and profile.provider_id != provider_id:
                profile.provider_id = provider_id
                changed = True
            if avatar and profile.avatar_url != avatar:
                profile.avatar_url = avatar
                changed = True
            if changed:
                profile.save()
        except Exception:
            pass

        # Issue JWTs
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'created': created,
        })
