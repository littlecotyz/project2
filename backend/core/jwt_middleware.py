from urllib.parse import parse_qs
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.db import database_sync_to_async
from rest_framework_simplejwt.backends import TokenBackend

User = get_user_model()


@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return None


class JWTAuthMiddleware:
    """Custom middleware that takes JWT from the query string and authenticates the user.

    Usage: connect to ws://host/ws/tasks/<id>/?token=<ACCESS_TOKEN>
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        return JWTAuthMiddlewareInstance(scope, self.inner)


class JWTAuthMiddlewareInstance:
    def __init__(self, scope, inner):
        self.scope = dict(scope)
        self.inner = inner

    async def __call__(self, receive, send):
        # parse token from query string
        query_string = self.scope.get('query_string', b'').decode()
        qs = parse_qs(query_string)
        token = None
        if 'token' in qs:
            token = qs['token'][0]
        elif 'access_token' in qs:
            token = qs['access_token'][0]

        if token:
            try:
                signing_key = None
                algorithm = 'HS256'
                sjwt = getattr(settings, 'SIMPLE_JWT', None) or {}
                signing_key = sjwt.get('SIGNING_KEY', None) or settings.SECRET_KEY
                algorithm = sjwt.get('ALGORITHM', algorithm)
                token_backend = TokenBackend(signing_key=signing_key, algorithm=algorithm)
                validated = token_backend.decode(token, verify=True)
                user_id = validated.get('user_id') or validated.get('user')
                user = await get_user(user_id)
                self.scope['user'] = user
            except Exception:
                # leave scope user as AnonymousUser
                pass

        inner = self.inner(self.scope)
        return await inner(receive, send)


def TokenAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)
